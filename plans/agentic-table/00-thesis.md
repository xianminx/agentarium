# 00 — 产品论点：对原始设想的三处修正

原始设想的核心抽象是对的：

> Table = Agent State，Agent = Computation，Workflow = State Transition，
> Evidence = Trust，External Tools = Action

核查完 2026 年 9 月的市场后，这个抽象需要三处修正。这三处都不是措辞问题，
每一处都会改变架构、MVP 范围和融资叙事。

---

## 修正一：`Table = Agent State` 是错的，而且 Clay 已经用真金白银证明了

原文把 Clay 在 2026 年拆出 Workflows 读成"验证了你的思路"。
我读完 Clay 自己的发布文章后认为恰恰相反 —— **那是一次对 "table = state" 的公开证伪**。

Clay 给出的三个拆分理由，逐条都在打 table-as-state：

| Clay 的原话 | 它在说什么 |
|---|---|
| 在 table 里搭的 play "只能用显式拉进这张表的数据"；一个针对 closed-lost 客户的召回流程，不会知道"其中某个客户上周注册了 webinar" | **表是一个封闭世界。** Agent 需要的上下文天然跨表、跨事件流 |
| "branching makes the logic hard to follow. 一个把记录分三路的 play 被拆成分别运行的碎片，串起它们的逻辑最后活在搭它的那个人脑子里" | **表格没有控制流。** 分支一多，状态机就不在系统里了 |
| Workflows 的"每次运行的 working memory 比一个 table cell 大一个数量级" | **单元格是错误的状态粒度。** Agent 的中间态装不进一个格子 |

Clay 的结论是 "Tables are great for builders to visualize their data" ——
表退回成**可视化层**，执行搬到 Workflows，触发源换成 Audiences 这个跨表数据层。

所以正确的抽象应该改成：

```
        ┌──────────────────────────────────────────┐
        │  Entity Store  (实体 + 事件 + 版本化字段)  │   ← 真正的 state
        └──────────────────┬───────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ↓              ↓              ↓
       Agent Runtime   Event Stream   Materialized View
       (computation)   (transition)   (= Table，交互面)
```

**Table 是 entity store 之上的一个物化视图，不是存储本身。**

这不是学术区别，它决定三件事：

1. 同一个实体可以同时出现在多张表（"我的 ICP 表"和"同事的 churn 风险表"共享 OpenAI 这一行的研究结果），
   research 只跑一次、成本只付一次 —— 这是 Clay 用 Audiences 层补的洞，也是新产品可以第一天就做对的事。
2. Agent 的中间态（搜了哪些词、读了哪些页、放弃了哪条线索）存在 run 记录里，不塞进单元格。
3. "重跑这一列"不等于"覆盖数据"，而是产生字段的一个新版本 —— 这是修正三的前提。

---

## 修正二：Evidence 不是护城河，2026 年它已经是入场券

原文把 provenance（为什么给 87 分、引用了哪些来源）列为关键创新。
它是必要的，但它**已经被做完了**：

- **Hebbia Matrix**：用户可以点进任意一个 cell，看到 agent 的逐步推理链和它引用的**精确原文段落**。
  这是 2024 年就有的能力，2026 年已服务 40%+ 的最大资管机构（BlackRock、KKR、Carlyle）。
- **Clay Workflows**：record-level observability，能看到单条记录走过的**确切路径**，
  并且按步骤拆分了**每条记录消耗的 credits 和 actions**。
- **Attio**：AI Attributes + web research agent，把非结构化信息落成带来源的结构化字段。

所以"每个 AI 字段都有 provenance"在 2026 年**卖不动**，它是评估清单上的一个勾。

真正没人做的是下一步。Provenance 回答"它当时为什么这么判断"，
但用户真正的问题是 **"我能不能不看它就直接用？"** ——那是个统计问题，不是溯源问题。

---

## 修正三：护城河是 correction → eval → version 飞轮

原文把 Evaluation 列在护城河清单的第 5 位。我认为它应该是第 1 位，而且是唯一一位。

整个系统里有一个被所有产品浪费掉的高价值信号：**人类修改了 agent 填的那个格子**。

今天在 Clay / Airtable / Hebbia 里，你改掉一个错的 ICP 分数，就只是……改掉了。
那次修正没有变成任何东西。

把它变成产品原语之后：

```
人工修正一个 cell
      ↓
自动进入该 column 的 golden set（带当时的输入快照 + agent 版本）
      ↓
每个 agent column 拥有：accuracy / coverage / 人工改写率 / 单位成本
      ↓
改 prompt / 换模型 / 加工具 → 新版本先在 golden set 上回放
      ↓
只有跑赢现役版本才允许 promote，全量重跑
```

用户看到的东西变成这样：

```
ICP Score                    v18 · 现役
├─ 准确率     87%  (基于 214 条人工确认)   ▲ +9 vs v17
├─ 人工改写率  6%   (近 30 天)
├─ 单行成本   $0.021
└─ 覆盖率     94%  (6% 因证据不足弃权)

     [ 用新 prompt 试 v19 → 在 golden set 上回放 ]
```

这一条同时解决了三个真实障碍：

1. **信任门槛。** "87% 准确率"是可以拿去跟老板要预算的数字；"它有引用"不是。
2. **弃权语义。** 有 eval 之后，agent 可以合法地说"我不知道"（低置信度不写值、转人工），
   而不是被迫编一个。这是 AI 填表最大的实际痛点。
3. **锁定。** 客户的 golden set 是他们自己积累的、不可迁移的资产。
   搬去 Clay 意味着把准确率归零重来。这是**表格本身给不了的切换成本**。

对照 Salesforce 的教训：Agentforce 在 2026 年增长放缓，华尔街独立调研给出的诊断是
"demo 很漂亮，直到它碰上客户真实的数据"；Salesforce 自己的报告里，
数据负责人认为 **26% 的组织数据不可信**，84% 认为 AI 落地前数据战略要推倒重来。
市场缺的不是更多 agent 输出，是**能被量化信任的** agent 输出。

---

## 命名判断

| 候选 | 判断 |
|---|---|
| **Agentic Database** | ❌ 已被基础设施厂商占用。Cockroach Continuum（2026-09-15 起对新组织开放）明确自称 "the Agentic Database Cloud"，EDB 2026-06 发布 "agentic database"。技术买家会理解成自愈/自调优的数据库。 |
| **Agentic Table / Agentic Spreadsheet** | ⚠️ 描述准确，但**已被抢注心智**。Paradigm 自称 "agentic spreadsheet"（每个格子里一个 agent，5000+ agents），2026-02 Meridian 拿 $17M 做 "agentic spreadsheet"。作为品类词可以用，作为差异化没有任何信息量。 |
| **Agentic Data Workspace** | ⚠️ 准确但没有钩子，也不可被搜索。适合放在融资材料里，不适合放在首页。 |
| **推荐：用"可信度"做词，不要用"表格"做词** | ✅ 表格是形态，不是价值。形态已经有三家在卖了。 |

推荐定位语：

> **Verified Columns.**
> Every AI column comes with an accuracy number — measured against your own corrections.
>
> 别人给你 AI 填的表。我们给你一张**知道自己有多准**的表。

品类词仍然用 "agentic table"（为了 SEO 和买家能归类），
但首页第一屏卖的必须是 accuracy number，不是 "AI 帮你填表"。

---

## 最终抽象

```
Entity Store   = state            （不是 Table）
Agent Run      = computation
Event / Trigger= transition
Evidence       = 可审计性          （入场券）
Eval + Version = 可信任性          （护城河）
Tools          = action
Table          = 交互面 + 物化视图   （不是存储，不是执行）
```

## 来源

- [Introducing Clay Workflows — Clay Blog](https://www.clay.com/blog/introducing-workflows)
- [Hebbia Matrix / 多 agent 重构](https://www.hebbia.com/blog/divide-and-conquer-hebbias-multi-agent-redesign)
- [Cockroach Continuum: The Agentic Database Cloud](https://www.cockroachlabs.com/product/continuum/)
- [EDB Launches Agentic Database](https://www.prnewswire.com/news-releases/edb-launches-agentic-database-converged-analytics-and-governance-bringing-sovereign-ai-where-enterprise-data-already-lives-302807516.html)
- [Paradigm: an AI agent in every cell](https://finance.yahoo.com/news/why-paradigm-built-spreadsheet-ai-150055380.html)
- [Meridian raises $17M to remake the agentic spreadsheet — TechCrunch](https://techcrunch.com/2026/02/11/meridian-ai-raises-17-million-to-remake-the-agentic-spreadsheet/)
- [Why Agentforce Adoption Is Stalling: data readiness](https://salesforcedictionary.com/blogs/agentforce-adoption-data-readiness-2026)
- [Introducing Attio's AI-powered research agent](https://attio.com/blog/introducing-attio-ai-research-agent)
