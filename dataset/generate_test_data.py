#!/usr/bin/env python3
"""
测试数据生成器：模拟OKX DEX API返回的MEME币多周期数据
生成不同币龄、不同资金流的样本，用于验证因子计算逻辑
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import string

def generate_token_symbol():
    """生成随机MEME币符号"""
    prefixes = ['DOGE', 'PEPE', 'SHIB', 'FLOKI', 'BONK', 'WIF', 'BOME', 'POPCAT', 
                'MOG', 'WOJAK', 'NPC', 'TURBO', ' MEME', 'PEW', 'ZUZALU', 'SPX']
    suffix = ''.join(random.choices(string.ascii_uppercase, k=2))
    return f"{random.choice(prefixes)}{suffix}"

def generate_age_and_decay_scenarios():
    """
    生成不同币龄场景，覆盖所有衰减区间：
    - 极新币 (<5min): 应该是投机热点
    - 新币 (5min-1h): 早期进场
    - 成熟币 (1-24h): 稳定交易
    - 老币 (>24h): 应该衰减
    """
    scenarios = []
    
    # < 5分钟 (Decay 1.5)
    for i in range(3):
        scenarios.append(random.uniform(0.01, 0.08))  # 0.01-0.08小时 (36秒-5分钟)
    
    # 5分钟-1小时 (Decay 1.3)
    for i in range(4):
        scenarios.append(random.uniform(0.1, 0.9))
    
    # 1-3小时 (Decay 1.0)
    for i in range(4):
        scenarios.append(random.uniform(1.0, 3.0))
    
    # 3-24小时 (Decay 0.7)
    for i in range(4):
        scenarios.append(random.uniform(3.5, 20.0))
    
    # 24小时-1周 (Decay 0.5)
    for i in range(3):
        scenarios.append(random.uniform(25.0, 100.0))
    
    # >1周 (Decay 0.3)
    for i in range(2):
        scenarios.append(random.uniform(200.0, 500.0))
        
    return scenarios

def generate_flow_pattern(age_hours: float, pattern_type: str):
    """
    生成不同资金流模式
    pattern_type: 'rocket'(火箭), 'pump_dump'(拉高出货), 'steady'(稳定), 'dying'(衰退)
    """
    base_volume = random.uniform(5000, 500000)
    
    # 币龄影响基础成交额（新币通常更活跃）
    if age_hours < 1:
        base_volume *= random.uniform(2.0, 5.0)  # 新币成交量放大
    elif age_hours > 24:
        base_volume *= random.uniform(0.3, 0.8)  # 老币成交量萎缩
    
    if pattern_type == 'rocket':
        # 火箭币：5分钟极强流入，但可能伴随出货
        recent_boost = random.uniform(3.0, 8.0)
        return {
            '5min_buy': base_volume * recent_boost * 0.5,
            '5min_sell': base_volume * recent_boost * 0.1,
            '1h_buy': base_volume * 0.8,
            '1h_sell': base_volume * 0.2,
            '4h_buy': base_volume * 0.4,
            '4h_sell': base_volume * 0.1,
            '24h_buy': base_volume,
            '24h_sell': base_volume * 0.15,
            'vibe': random.uniform(70, 95),
            'price_change_5m': random.uniform(0.1, 0.5)
        }
    
    elif pattern_type == 'pump_dump':
        # 拉高出货：早期流入强，近期流出增加
        return {
            '5min_buy': base_volume * 0.3,
            '5min_sell': base_volume * 0.7,
            '1h_buy': base_volume * 0.8,
            '1h_sell': base_volume * 0.5,
            '4h_buy': base_volume * 1.2,
            '4h_sell': base_volume * 0.3,
            '24h_buy': base_volume * 2.0,
            '24h_sell': base_volume * 0.4,
            'vibe': random.uniform(60, 85),  # 热度较高但下降
            'price_change_5m': random.uniform(-0.2, 0.05)
        }
    
    elif pattern_type == 'steady':
        # 健康上涨：持续净流入，各周期均衡
        return {
            '5min_buy': base_volume * 0.4,
            '5min_sell': base_volume * 0.2,
            '1h_buy': base_volume * 0.6,
            '1h_sell': base_volume * 0.3,
            '4h_buy': base_volume * 0.8,
            '4h_sell': base_volume * 0.4,
            '24h_buy': base_volume * 1.5,
            '24h_sell': base_volume * 0.6,
            'vibe': random.uniform(50, 75),
            'price_change_5m': random.uniform(0.02, 0.15)
        }
    
    else:  # dying
        # 衰退币：全面流出，低热度
        return {
            '5min_buy': base_volume * 0.1,
            '5min_sell': base_volume * 0.4,
            '1h_buy': base_volume * 0.2,
            '1h_sell': base_volume * 0.5,
            '4h_buy': base_volume * 0.3,
            '4h_sell': base_volume * 0.6,
            '24h_buy': base_volume * 0.5,
            '24h_sell': base_volume * 0.8,
            'vibe': random.uniform(10, 40),
            'price_change_5m': random.uniform(-0.15, -0.05)
        }

def generate_mock_data(num_tokens: int = 20):
    """生成完整的测试数据集"""
    data = []
    
    # 预设不同模式的币种数量
    patterns = ['rocket'] * 4 + ['pump_dump'] * 5 + ['steady'] * 7 + ['dying'] * 4
    ages = generate_age_and_decay_scenarios()
    
    for i in range(num_tokens):
        symbol = generate_token_symbol()
        age_hours = ages[i % len(ages)]
        pattern = patterns[i % len(patterns)]
        
        # 生成资金流
        flow = generate_flow_pattern(age_hours, pattern)
        
        # 生成Solana链地址（44字符base58）
        address = ''.join(random.choices('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', k=44))
        
        token = {
            'address': address,
            'symbol': symbol,
            'chain_id': '501',  # Solana
            'age_hours': round(age_hours, 4),
            'pattern_type': pattern,
            'current_price': round(random.uniform(0.0001, 0.1), 6),
            'vibe_score': round(flow['vibe'], 2),
            
            # 5分钟数据
            '5min_buy_value': round(flow['5min_buy'], 2),
            '5min_sell_value': round(flow['5min_sell'], 2),
            '5min_price_change': round(flow['price_change_5m'], 4),
            
            # 1小时数据  
            '1h_buy_value': round(flow['1h_buy'], 2),
            '1h_sell_value': round(flow['1h_sell'], 2),
            '1h_price_change': round(flow['price_change_5m'] * 0.8, 4),
            
            # 4小时数据
            '4h_buy_value': round(flow['4h_buy'], 2),
            '4h_sell_value': round(flow['4h_sell'], 2),
            '4h_price_change': round(flow['price_change_5m'] * 1.5 + random.uniform(-0.1, 0.1), 4),
            
            # 24小时数据
            '24h_buy_value': round(flow['24h_buy'], 2),
            '24h_sell_value': round(flow['24h_sell'], 2),
            '24h_price_change': round(random.uniform(-0.3, 0.8), 4)
        }
        data.append(token)
    
    df = pd.DataFrame(data)
    return df

def main():
    print("="*60)
    print("MEME币测试数据生成器")
    print("="*60)
    
    # 生成20个样本
    df = generate_mock_data(20)
    
    # 添加几个低成交额样本测试过滤功能
    low_volume_samples = []
    for i in range(3):
        lv = df.iloc[i].to_dict()
        lv['symbol'] = f"FAKE{i}"
        lv['address'] = ''.join(random.choices('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', k=44))
        # 设置极低的成交额
        lv['24h_buy_value'] = random.uniform(100, 8000)
        lv['24h_sell_value'] = random.uniform(50, 2000)
        lv['5min_buy_value'] = lv['24h_buy_value'] * 0.1
        lv['5min_sell_value'] = lv['24h_sell_value'] * 0.1
        low_volume_samples.append(lv)
    
    df = pd.concat([df, pd.DataFrame(low_volume_samples)], ignore_index=True)
    
    # 保存
    output_file = 'mock_meme_data.csv'
    df.to_csv(output_file, index=False)
    
    print(f"生成模拟数据: {len(df)} 个币种")
    print(f"\n数据分布:")
    print(f"  • 极新币 (<5min): {len([a for a in df['age_hours'] if a < 0.08])} 个")
    print(f"  • 新币 (5min-1h): {len([a for a in df['age_hours'] if 0.08 <= a < 1])} 个")  
    print(f"  • 次新 (1-24h): {len([a for a in df['age_hours'] if 1 <= a < 24])} 个")
    print(f"  • 老币 (>24h): {len([a for a in df['age_hours'] if a >= 24])} 个")
    
    # 统计成交额
    total_vols = df['24h_buy_value'] + df['24h_sell_value']
    print(f"\n成交额统计:")
    print(f"  • 最小: ${total_vols.min():,.2f}")
    print(f"  • 最大: ${total_vols.max():,.2f}")
    print(f"  • 平均: ${total_vols.mean():,.2f}")
    print(f"  • 低于10k过滤线的: {len([v for v in total_vols if v < 10000])} 个")
    
    print(f"\n文件已保存: {output_file}")
    print("\n数据列说明:")
    for col in df.columns:
        print(f"  • {col}")
    
    # 显示样本
    print(f"\n样本数据(前3行):")
    print(df[['symbol', 'age_hours', 'vibe_score', '24h_buy_value', '24h_sell_value']].head(3).to_string(index=False))

if __name__ == '__main__':
    main()