# MEME币选型方案 - 多因子评分系统

## 📋 项目概述

本项目针对MEME类型加密资产设计了一套**多因子量化评分系统**，通过结合OKX DEX数据、0G存储网络验证能力，实现对MEME币项目的科学选型与风险评估。该系统基于**资金流向分析**、**市场热度**、**币龄衰竭因子**等维度，为投资决策提供量化支撑。

---

## 🎯 核心设计思路

### 1. **三维评估框架**

```
总分 = (X_hot + 复合NIS) × Age_Decay

其中：
- X_hot       : 热度因子 (Vibe Score 0-100)
- 复合NIS     : 资金净流入强度 (多时间加权)
- Age_Decay   : 币龄衰竭因子 (时间衰减)
```

### 2. **关键因子说明**

#### **① 资金净流入强度因子 (NIS - Net Inflow Strength)**

**定义：** 衡量在特定时间窗口内，买入资金相对于总成交量的优势程度。

$$\text{NIS} = \frac{\text{Net Volume}}{\text{Total Volume}} \times \log(\text{Total Volume} + 1)$$

**特点：**
- `5分钟 (权重40%)`: 捕捉极端短期资金推动
- `1小时 (权重30%)`: 监测早期进场浪潮
- `4小时 (权重20%)`: 观察中期趋势维持
- `24小时 (权重10%)`: 评估基础支持力度

**解读：**
- NIS > 0.8: 强势流入信号 ✅
- 0.3 ~ 0.8: 中等热度 ⚠️
- < 0.3: 资金出货 ❌

#### **② 热度因子 (Vibe Score - 0~100)**

**数据来源：** 结合OKX DEX实时热度、社区讨论量、交易活跃度

**等级划分：**
```
优秀 (85-100)  : 极度活跃，新晋热门
良好 (70-84)   : 活跃度较高，有持续热度
中等 (50-69)   : 正常交易，缺乏爆点
较差 (30-49)   : 活跃度下滑，冷门币种
极弱 (0-29)    : 基本无热度，清退阶段
```

#### **③ 币龄衰竭因子 (Age Decay)**

**设计理由：** MEME币的价值在**新鲜度**。随着币龄增长，热度自然衰减，需通过时间权重反映这一规律。

**衰减曲线：**

| 币龄范围 | Age Decay | 解释 |
|---------|-----------|------|
| < 5分钟 | 1.5x | 🚀 极新币，单位时间热度最高 |
| 5分钟～1小时 | 1.3x | 🔥 抢购期，快速涨幅阶段 |
| 1～3小时 | 1.0x | 📈 定价阶段，基础倍数 |
| 3～24小时 | 0.7x | 📊 衰减开始，热度转淡 |
| 1～7天 | 0.5x | 📉 显著衰竭，老币特征 |
| > 7天 | 0.3x | 🔴 严重衰竭，投机价值消失 |

---

## 🔬 0G数据验证架构

### **验证流程**

```
OKX DEX API数据
      ↓
[本地因子计算] ← meme_factor_engine.py
      ↓
[多周期评分] (5min/1h/4h/24h)
      ↓
[0G存储验证] 
  ├─ 数据真实性校验
  ├─ 链上交易记录匹配
  └─ 历史轨迹溯源
      ↓
[最终评分输出] → scoring_result.csv
```

### **关键验证项**

| 验证项 | 0G验证方式 | 优势 |
|-------|----------|------|
| 交易数据真实性 | 链上Merkle证明 | 防止数据篡改 |
| 资金流向追踪 | 历史交易链追溯 | 识别主力操作 |
| 热度数据一致性 | 多源数据交叉验证 | 防止虚假热度 |
| 风险事件预警 | 异常行为检测 | 及时发现地板砸 |

---

## 📁 文件结构说明

```
.
├── meme_factor_engine.py          # 核心因子计算引擎
│   ├── TimeWindowData              # 时间窗口数据类
│   ├── MemeFactorCalculator        # 因子计算器
│   └── calculate_composite_nis()   # 多周期NIS合成
│
├── generate_test_data.py           # 测试数据生成器
│   ├── generate_flow_pattern()     # 资金流模式
│   └── 涵盖4种场景: rocket/pump_dump/steady/dying
│
├── mock_meme_data.csv              # 测试样本集
│   ├── symbol: 币种代码
│   ├── age_hours: 币龄
│   ├── vibe_score: 热度评分
│   ├── 5min/1h/4h/24h流量数据
│   └── 总成交额
│
├── scoring_result.csv              # 最终评分结果
│   ├── symbol: 币种
│   ├── final_score: 综合评分 (0-1500+)
│   ├── recommendation: 推荐等级
│   ├── risk_level: 风险等级
│   └── timestamp: 生成时间
│
└── README.md (本文档)              # 设计方案说明
```

---

## 🚀 使用指南

### 1. **生成测试数据**

```bash
python generate_test_data.py
```

**输出：** `mock_meme_data.csv` 包含30个MEME币样本，涵盖：
- 极新币（<5分钟）- 火箭型资金流
- 活跃币（1-24小时）- 稳定型资金流
- 衰退币（>24小时）- 衰竭型资金流

### 2. **计算因子与评分**

```bash
python meme_factor_engine.py
```

**处理流程：**
1. 读取 `mock_meme_data.csv`
2. 计算NIS、Age Decay、综合评分
3. 生成 `scoring_result.csv`

### 3. **结果解读**

打开 `scoring_result.csv`，按以下维度分析：

**推荐等级 (Recommendation)：**
- 🟢 **Strong Buy (S)**: 总分 > 900，极佳选型
- 🟡 **Buy (A)**: 总分 700-900，良好选型
- 🟠 **Hold (B)**: 总分 400-700，中性持观
- 🔴 **Avoid (C)**: 总分 < 400，规避风险

**风险等级 (Risk Level)：**
- 🟢 **Low**: 币龄充分，流入稳定
- 🟡 **Medium**: 币龄适中，流入波动
- 🔴 **High**: 极新币或流出信号

---

## 📊 案例分析

### **案例1：火箭币 (Rocket Pattern)**

```
币种: PEPE-MOON
币龄: 2分钟
Vibe Score: 88
NIS值: 
  - 5min:  0.95 (极强流入)
  - 1h:    0.72 (快速拉升)
  - 4h:    0.45 (维持热度)
  - 24h:   0.12 (基础支撑)
复合NIS: 0.95×0.4 + 0.72×0.3 + 0.45×0.2 + 0.12×0.1 = 0.646
Age Decay: 1.5 (极新币加成)
最终评分: (88 + 64.6) × 1.5 = 228.9

推荐: 强力买入 🟢
风险: 极高 🔴 (需要立即止损计划)
```

### **案例2：衰退币 (Dying Pattern)**

```
币种: OLD-FLOKI
币龄: 180小时 (7.5天)
Vibe Score: 32
NIS值:
  - 5min:  -0.15 (明显出货)
  - 1h:    -0.08 (持续流出)
  - 4h:     0.02 (基本停滞)
  - 24h:    0.05 (无支撑)
复合NIS: -0.146
Age Decay: 0.3 (严重衰竭)
最终评分: (32 + (-14.6)) × 0.3 = 5.22

推荐: 规避 🔴
风险: 低 🟢 (但没有投资价值)
```

---

## ⚠️ 风险提示

1. **极新币 (<1小时) 风险极高**
   - Age Decay倍数最高(1.5x)但流动性最差
   - 容易被主力操纵
   - 需配合**链上数据深度分析**才能确认

2. **热度数据延迟**
   - OKX DEX数据有~30秒延迟
   - 需要0G存储网络进行**链上实时验证**

3. **币龄衰竭模型局限**
   - 未考虑项目方运营、社区动态
   - 仅作为**量化筛选工具**，需结合基本面分析

---

## 🔗 0G网络集成建议

### **推荐集成方案**

```python
# 伪代码示例
from og_network import OGVerifier

verifier = OGVerifier()

# 验证历史数据完整性
historical_proof = verifier.verify_transaction_history(
    token_address=token_addr,
    time_window="24h"
)

# 获取链上真实NIS值
on_chain_nis = verifier.calculate_on_chain_nis(
    buy_transactions=tx_history['buy'],
    sell_transactions=tx_history['sell']
)

# 异常检测 (识别主力操纵)
anomaly_score = verifier.detect_whale_activity(
    large_transactions=tx_history['large_txs']
)

# 最终评分 = 本地评分 × 链上验证系数
final_score = local_score * (1 + on_chain_nis_delta)
```

---

## 📈 后续优化方向

- [ ] 接入0G实时链上数据流
- [ ] 添加社交情绪指数 (Twitter/Discord情绪分析)
- [ ] 实现主力钱包追踪模块
- [ ] 开发风险预警系统 (地板砸、项目方退出检测)
- [ ] 优化Age Decay曲线 (基于历史胜率反向优化)
- [ ] 多链适配 (Ethereum/Base/Arbitrum等)

---

## 📝 参考资源

- **OKX DEX API文档**: https://www.okx.com/docs/
- **0G存储网络**: https://0g.ai/
- **MEME币交易策略参考**: 基于时间衰竭的投机波段交易

---

## 📧 联系与反馈

如有问题或改进建议，欢迎反馈。本方案持续迭代中。

**最后更新**: 2026年1月31日