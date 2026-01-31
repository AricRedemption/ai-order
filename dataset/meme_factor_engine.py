#!/usr/bin/env python3
"""
MEME币多因子评分系统 v1.0
基于OKX DEX API数据，计算：
1. 资金净流入强度因子 (NIS)
2. 热度因子 (VIBE Score)
3. 币龄衰竭因子 (Age Decay)
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from dataclasses import dataclass
from typing import Dict, List, Optional
import json
import sys

@dataclass
class TimeWindowData:
    """时间窗口数据"""
    window: str          # '5min', '1h', '4h', '24h'
    net_volume: float    # 净成交额 (买入-卖出)
    total_volume: float  # 总成交额
    buy_value: float     # 买入总额
    sell_value: float    # 卖出总额
    price_change: float  # 价格变动率
    
    @property
    def nis(self) -> float:
        """计算该时间窗口的NIS"""
        if self.total_volume <= 0:
            return 0.0
        # NIS = (净成交额/总成交额) * log(总成交额+1)
        ratio = self.net_volume / self.total_volume
        volume_scale = np.log1p(self.total_volume)  # log(Total_Volume + 1)
        return ratio * volume_scale


class MemeFactorCalculator:
    """MEME币因子计算器"""
    
    # 时间权重配置
    TIME_WEIGHTS = {
        '5min': 0.4,
        '1h': 0.3,
        '4h': 0.2,
        '24h': 0.1
    }
    
    # 币龄衰竭系数
    AGE_DECAY_MAP = [
        (5/60, 1.5),        # < 5分钟
        (1, 1.3),           # < 1小时
        (3, 1.0),           # < 3小时
        (24, 0.7),          # < 24小时
        (24*7, 0.5),        # < 1周
        (float('inf'), 0.3) # >= 1周
    ]
    
    # 过滤阈值配置
    MIN_TOTAL_VOLUME = 10000  # 最低总成交额过滤 (USD)
    
    def __init__(self, min_volume: float = 10000):
        self.min_volume = min_volume
    
    def calculate_age_decay(self, age_hours: float) -> float:
        """
        计算币龄衰竭因子
        age_hours: 币龄（小时）
        """
        for threshold, factor in self.AGE_DECAY_MAP:
            if age_hours <= threshold:
                return factor
        return 0.3
    
    def calculate_composite_nis(self, windows: Dict[str, TimeWindowData]) -> float:
        """
        计算复合NIS（多时间加权）
        """
        composite = 0.0
        for window_name, weight in self.TIME_WEIGHTS.items():
            if window_name in windows:
                composite += windows[window_name].nis * weight
        return composite
    
    def calculate_final_score(self, 
                            vibe_score: float, 
                            composite_nis: float, 
                            age_decay: float,
                            total_volume: float) -> Optional[Dict]:
        """
        计算最终评分
        Total = (X_hot + 复合NIS) * Age_Decay
        """
        # 过滤低成交额币种
        if total_volume < self.min_volume:
            return None
            
        # 热度因子标准化到0-100范围（假设原始已经是0-100）
        x_hot = vibe_score
        
        # 复合评分
        combined = (x_hot + composite_nis) * age_decay
        
        return {
            'vibe_score': round(x_hot, 2),
            'composite_nis': round(composite_nis, 4),
            'age_decay': round(age_decay, 2),
            'total_volume': round(total_volume, 2),
            'final_score': round(combined, 4),
            'passed_filter': True
        }
    
    def process_token(self, token_data: Dict) -> Optional[Dict]:
        """处理单个币种数据"""
        # 提取基础信息
        address = token_data.get('address', '')
        symbol = token_data.get('symbol', 'UNKNOWN')
        age_hours = token_data.get('age_hours', 0)
        vibe_score = token_data.get('vibe_score', 1)
        current_price = token_data.get('current_price', 0)
        
        # 构建时间窗口数据
        windows = {}
        total_24h_volume = 0.0
        
        for window_key in ['5min', '1h', '4h', '24h']:
            prefix = f'{window_key}_'
            buy = token_data.get(f'{prefix}buy_value', 0)
            sell = token_data.get(f'{prefix}sell_value', 0)
            net = buy - sell
            total_vol = buy + sell
            
            if window_key == '24h':
                total_24h_volume = total_vol
                
            windows[window_key] = TimeWindowData(
                window=window_key,
                net_volume=net,
                total_volume=total_vol,
                buy_value=buy,
                sell_value=sell,
                price_change=token_data.get(f'{prefix}price_change', 0)
            )
        
        # 计算各因子
        composite_nis = self.calculate_composite_nis(windows)
        age_decay = self.calculate_age_decay(age_hours)
        
        # 使用24h总成交额作为过滤基准
        result = self.calculate_final_score(
            vibe_score=vibe_score,
            composite_nis=composite_nis,
            age_decay=age_decay,
            total_volume=total_24h_volume
        )
        
        if result:
            result.update({
                'address': address,
                'symbol': symbol,
                'age_hours': round(age_hours, 2),
                'current_price': current_price
            })
            # 添加各时间窗口NIS详情
            for wk, wd in windows.items():
                result[f'nis_{wk}'] = round(wd.nis, 4)
                
        return result


class MemeScoringPipeline:
    """评分流水线"""
    
    def __init__(self, min_volume: float = 10000):
        self.calculator = MemeFactorCalculator(min_volume)
        
    def run(self, csv_path: str, top_n: int = 20) -> pd.DataFrame:
        """
        运行评分流程
        """
        print(f"读取数据: {csv_path}")
        df = pd.read_csv(csv_path)
        print(f"原始数据量: {len(df)} 个币种")
        
        results = []
        skipped = []
        
        for _, row in df.iterrows():
            token_data = row.to_dict()
            score_result = self.calculator.process_token(token_data)
            
            if score_result:
                results.append(score_result)
            else:
                skipped.append({
                    'symbol': token_data.get('symbol', 'UNKNOWN'),
                    'volume_24h': token_data.get('24h_buy_value', 0) + token_data.get('24h_sell_value', 0),
                    'reason': '成交额过低 (<10k)'
                })
        
        if not results:
            print("警告：没有币种通过过滤条件")
            return pd.DataFrame()
            
        result_df = pd.DataFrame(results)
        
        # 排序：按最终评分降序
        result_df = result_df.sort_values('final_score', ascending=False).reset_index(drop=True)
        result_df['rank'] = range(1, len(result_df) + 1)
        
        # 结果展示
        print(f"\n通过过滤: {len(results)} 个 | 过滤掉: {len(skipped)} 个")
        print(f"\n{'='*80}")
        print("TOP 热门MEME币评分结果")
        print(f"{'='*80}")
        
        display_cols = ['rank', 'symbol', 'final_score', 'age_decay', 'vibe_score', 
                       'composite_nis', 'total_volume', 'age_hours']
        
        print(result_df[display_cols].head(top_n).to_string(index=False))
        
        # 保存详细结果
        output_path = 'scoring_result.csv'
        result_df.to_csv(output_path, index=False)
        print(f"\n详细结果已保存: {output_path}")
        
        if skipped:
            print(f"\n被过滤的币种（前5个）:")
            for s in skipped[:5]:
                print(f"  - {s['symbol']}: 24h成交额 ${s['volume_24h']:,.2f} | {s['reason']}")
                
        return result_df


def main():
    """主入口"""
    print("="*80)
    print("MEME币多因子评分系统 v1.0")
    print("时间: 2026-01-31")
    print("="*80)
    
    # 支持命令行参数
    csv_file = sys.argv[1] if len(sys.argv) > 1 else 'mock_meme_data.csv'
    
    pipeline = MemeScoringPipeline(min_volume=10000)  # 设置10k USD过滤阈值
    result = pipeline.run(csv_file, top_n=15)
    
    print(f"\n因子说明:")
    print(f"  • NIS (Net Inflow Strength): 资金净流入强度，正数代表资金流入")
    print(f"  • Age Decay: 币龄衰竭，新币有溢价(1.5x)，老币衰减(0.3x)")
    print(f"  • VIBE Score: OKX热度评分 (0-100)")
    print(f"  • Final Score = (VIBE + Composite NIS) × Age Decay")


if __name__ == '__main__':
    main()