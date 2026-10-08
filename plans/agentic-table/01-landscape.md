# 01 — 竞争格局图（2026-09）

## 1. 两轴定位图

两个真正有区分度的轴：

- **X 轴：垂直专用 ←→ 水平通用**
- **Y 轴：表格是可视化层 ←→ 表格是执行层**（谁把 agent 真正跑在行/列上）

```
                    表格 = 执行层（agent 跑在行列上）
                                 ▲
                                 │
        Hebbia Matrix ●          │          ● Paradigm
        (文档×问题 网格,          │          (每格一个 agent,
         金融/法律)               │           5000+ agents)
                                 │
              Clay Tables ●      │      ● Airtable Field Agents
              + Claygent         │        + Hyperagent
                                 │
    Unify ●                      │              ● Rows AI Analyst
    Keyplay ●         ┌──────────┼──────────┐
                      │  空白区：  │          │   ● Meridian
                      │  可验证的  │          │     (财务建模 IDE)
   垂直 ◄─────────────┤  agent 列 ├──────────┼──────────────────► 水平
                      │ (eval+版本)│          │
                      └──────────┼──────────┘
        Attio ●                  │              ● Baserow
        (CRM + AI attributes)    │                (开源, 无代码)
                                 │
      Agentforce ●               │            ● Retool Agents
      (Salesforce 内)             │              (内部工具)
                                 │            ● Gumloop
                                 │              (节点式自动化)
                                 │            ● Rowset
                                 │              (headless, MCP/REST)
                                 ▼
                    表格 = 可视化层（执行在别处）
```

**空白区的含义**：中间偏左下那块不是"没人做表格"，
而是**没有人把 agent 列的准确率做成可测量、可版本化的产品对象**。
每一家都能填格子，没有一家能告诉你这一列多准。

---

## 2. 分层：这 13 家其实在打 4 场不同的仗

### 第 1 层 — 真正的 Agentic Table（表格即执行面）

| 产品 | 形态 | 关键事实（2026-09） | 对你的威胁 |
|---|---|---|---|
| **Hebbia Matrix** | 行=文档/实体，列=分析问题，agent 并行填满每个 cell；点开 cell 看逐步推理链 + 精确引用原文 | 服务 **40%+ 最大资管机构**（BlackRock / KKR / Carlyle / MetLife / Centerview），及 Ropes & Gray、Fenwick 等律所。单网格常见数千行 × 数十列 | **最高**。它就是"Agentic Table"，只是没用这个词，而且已经在最愿意付钱的市场赢了 |
| **Clay** | Table + Claygent + 2026 新增 Workflows + Audiences 数据层 | ARR 约 **$150M**（Sacra, 2026-05，年末 2025 为 $108M）；估值 **$5B**（2026-01 员工 tender，DST 领投）；Workflows 对 Launch/Growth/Enterprise **永久免费** | **高**（仅限 GTM）。免费放出 Workflows 是明确的护城河加宽动作 |
| **Paradigm** | 自称 "agentic spreadsheet"，每个 cell 一个 agent，5000+ agents，按列/格分配 prompt，支持 Anthropic/OpenAI/Gemini 切换 | 总融资 **$7M**（$5M seed by General Catalyst + $2M pre-seed YC）。已 GA，有免费层 | **中**。心智抢注强，资本与企业渗透弱 |
| **Airtable** | Omni（AI app builder）+ Field Agents（每条记录内工作）+ Hyperagent（2026-01，多 agent 并行研究） | 2025-06 "refounding" 为 AI-native app platform。AI credits：Free 500/编辑者，Team 15k/付费用户，Business 20k，Enterprise Scale 25k；加购约 $40/20k credits | **中**。分销能力最强，但产品重心是"造 app"不是"研究实体" |

### 第 2 层 — 垂直数据/CRM 里长出 agent

| 产品 | 关键事实 | 判断 |
|---|---|---|
| **Attio** | 自称 "CRM for agentic revenue"。AI Attributes + web research agent（作为一种 attribute 加到 list/record 上）；2026 年加了 Ask Attio、自然语言执行动作、Slack、**mcp.attio.com 官方 MCP（40+ tools，全读写）** | 已是 Notion Custom Agents / Raycast / **Clay** 的预置连接。它在成为 agent 的写入目标，而不是 agent 平台 |
| **Unify** | 端到端 outbound 引擎，内建 agent 跑 "Plays" | Clay 的近身对手，进一步说明 GTM 赛道已挤满 |
| **Salesforce Agentforce** | Agentforce ARR 破 **$1B**，50%+ 预订来自老客户扩容；但 FY2026 指引低于预期并归因于 Agentforce 采用放缓；2026 年**开始去掉 Agentforce 品牌命名** | 巨头的失败给出了最有价值的情报：**卡点是数据可信度，不是 agent 能力** |

### 第 3 层 — 水平自动化/内部工具（表格只是数据源）

| 产品 | 关键事实 |
|---|---|
| **Retool** | Agents 单独计量，不走 credit pool，每月 20 agent-hours 免费，之后按模型分级小时计费。Team $12/builder/月 |
| **Gumloop** | 2026-03 **$50M B 轮，Benchmark 领投**，总融资 $70M。Shopify / Ramp / Instacart 在用 |
| **Baserow** | 开源，"数据库 + 应用 + 自动化 + AI agents，全部无代码"。$10/user/月起 |
| **Coda / Rows** | Rows 定位 "AI Data Analyst"，白皮书讲 agentic enterprise；宣称 AI Analyst 首次成功率 89% |

### 第 4 层 — Headless / Agent-native 后端（没有表格 UI，或 UI 是次要的）

| 产品 | 关键事实 | 判断 |
|---|---|---|
| **Rowset** | 明确定位 "gives your AI agent a dataset backend"。私有 MCP + REST；卖点正是：**稳定行标识、语义化列元数据、持久化 agent instructions、显式 index 列、导出、公开预览、Qdrant 混合检索** | 原文提到它是对的。它证明了品类正在独立，但它选了**最难变现的一层**（开发者 + 极低 ACV） |
| **Cockroach Continuum** | 2026-09-15 起对新组织开放，自称 "the Agentic Database Cloud"；Aegis 运维 agent 读慢查询日志给建议 | **不是竞争对手，是词汇小偷**。它占掉了 "agentic database" 这个词 |
| **EDB Postgres AI** | 2026-06 发布 "agentic database" + 融合分析 + 治理 | 同上 |

---

## 3. 最关键的三条情报

### 情报 A：Hebbia 已经赢下了这个抽象的最高价值版本

原始分析完全没提 Hebbia，这是最大的盲点。
Hebbia Matrix 的形态**逐字命中**了原始设想：行=实体，列=AI 计算，
点开任意 cell 看推理链和引用来源，agent 并行填格。

它还证明了两件事：
1. 这个抽象在**证据要求最严苛的市场**（尽调、合规、诉讼）价值最高，因为一个错答案的代价最大。
2. 它没有向下泛化到中小企业 —— 定价与交付都是企业级。**下方市场是开的。**

### 情报 B：Clay 把 Workflows 免费送出去，是防御姿态

Workflows 对 Launch / Growth / Enterprise **无限期免费**，
连 legacy Pro / Explorer / Starter 也免费到 2026 年底。
$150M ARR 的公司把一个重大新模块完全免费，只有一种解读：
**他们要用它把 GTM 这块地彻底焊死。**

任何"更好的 Clay"方案，第一天就要面对一个免费的、更成熟的、有 $5B 背书的对手。

### 情报 C：所有人的计费都已经是 usage-based，所以定价不是差异化

- Clay：credits + actions，**按步骤拆到每条记录**
- Airtable：AI credits 分层配额 + 加购包
- Retool：agent-hours，按模型分级
- Hebbia：企业合同

原文提出的 "platform + agent execution + data usage + actions" 模式是**行业标准**，不是创新。
真正的定价创新空间在别处：**按"已验证的正确答案"计费**，而不是按"跑了多少次"计费
（见 03-gtm-strategy.md）。

---

## 4. 竞争结论

| 结论 | 含义 |
|---|---|
| 品类已成立，且**已经有三个在位者各占一块** | 不能讲"我们开创新品类"，要讲"我们解决在位者的结构性缺陷" |
| 形态（表格 + agent 列 + 证据）已被完全复制 | 形态不能作为差异化 |
| 没有一家把 **accuracy 作为产品对象** | 这是唯一真实的空位 |
| GTM 是最差的入口，不是最好的 | 见 03-gtm-strategy.md |
| Salesforce 在数据可信度上翻车，是最好的市场教育 | 买家已经被教会问"它准吗" |

## 来源

- [Introducing Clay Workflows](https://www.clay.com/blog/introducing-workflows) · [Clay revenue, valuation & funding — Sacra](https://sacra.com/c/clay/) · [Clay valuation doubles to $3.1B — Crunchbase News](https://news.crunchbase.com/venture/ai-powered-gtm-startup-clay-valuation-doubles-capitalg/)
- [Hebbia: The Multi-Agent Redesign Behind Matrix](https://www.hebbia.com/blog/divide-and-conquer-hebbias-multi-agent-redesign) · [Hebbia's deep research — OpenAI](https://openai.com/index/hebbia/)
- [Airtable: The AI-Native Airtable Has Arrived](https://www.airtable.com/newsroom/introducing-the-ai-native-airtable) · [Airtable AI billing](https://support.airtable.com/docs/airtable-ai-billing) · [Airtable AI pricing 2026 — Jotform](https://www.jotform.com/ai/airtable-ai-pricing/)
- [Why Paradigm built a spreadsheet with an AI agent in every cell](https://finance.yahoo.com/news/why-paradigm-built-spreadsheet-ai-150055380.html) · [Paradigm GA + General Catalyst](https://www.webwire.com/ViewPressRel.asp?aId=342545)
- [Attio AI updates 2026](https://crmnewspaper.com/blog/attio-ai-updates-ask-attio-2026/) · [Introducing Attio's AI research agent](https://attio.com/blog/introducing-attio-ai-research-agent)
- [Retool pricing](https://retool.com/pricing) · [Retool pricing 2026 — UI Bakery](https://uibakery.io/blog/retool-pricing)
- [Gumloop $50M Series B — SiliconANGLE](https://siliconangle.com/2026/03/13/gumloop-reels-50m-ai-automation-platform/)
- [Baserow](https://baserow.io/blog/best-no-code-tools) · [Rows: agentic enterprise white paper](https://rows.com/blog/post/white-paper-agentic-enterprise-in-ai-spreadsheets-with-rows)
- [Rowset — GitHub](https://github.com/LVTD-LLC/rowset) · [Rowset Dataset API](https://rowset.lvtd.dev/docs/dataset-api)
- [Agentforce hits $1B ARR — Salesforce Ben](https://www.salesforceben.com/salesforce-q1-results-agentforce-hits-1b-arr-as-benioff-takes-aim-at-ai-doubters/) · [Salesforce drops Agentforce branding](https://valueaddvc.com/pulse/salesforce-drops-agentforce-branding-retreat-2026)
- [Cockroach Continuum](https://www.cockroachlabs.com/product/continuum/) · [Meridian $17M — TechCrunch](https://techcrunch.com/2026/02/11/meridian-ai-raises-17-million-to-remake-the-agentic-spreadsheet/)
