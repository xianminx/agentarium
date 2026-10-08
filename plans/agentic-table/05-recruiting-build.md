# 05 — 招聘垂直：落地方案

> **前提已确认**：LinkedIn（人物搜索 / profile / 私信 / 邀请管理）、Gmail（搜索 / 读取 / 发送 / 草稿 /
> 联系人解析）、带向量检索的 context card 存储、以及 workflow 运行时，均为自有资产。
> 本文档基于该前提，取代 03 号文档里那个待确认的假设。

---

## 1. 最重要的发现：合规把护城河变成了采购要求

核查 EU AI Act 时发现的东西，改变了整个方案的优先级排序。

Annex III 第 4(a) 条明确把**"用于招募或选拔自然人的 AI 系统，特别是投放定向招聘广告、
分析和筛选求职申请、以及评估候选人"**列为高风险。简历筛选模型、文化匹配打分器、
以及**为人工审阅者排序候选名单的排序模型**，全部被涵盖 —— 最后一条尤其关键，
因为"最终由人决定"并不能让你脱离高风险类别。

高风险系统的义务清单是：

> 风险管理、数据治理、技术文档、**记录留存**、运行透明度、给部署方的使用说明、
> **human-in-the-loop**、**准确性**、稳健性与网络安全。

把这份清单和 04 号 PRD 的对象模型并排看：

| AI Act 要求 | PRD 里已有的对象 |
|---|---|
| 记录留存 | `Run.steps`（逐步轨迹）+ `Cell` 按版本不覆盖 |
| 透明度 / 可解释 | Evidence schema（逐字原文引用、criteria 三态） |
| Human-in-the-loop | `Judgment` + Review 模式 + 弃权转人工 |
| **准确性** | `EvalRun` + 每列的 accuracy 数字 |
| 技术文档 / 版本管理 | `AgentColumnVersion` + promote 门槛 |

**这不是巧合，是同一个问题的两个名字。** 我们为了做护城河而设计的飞轮，
恰好就是欧盟要求高风险招聘系统必须具备的东西。

**时间窗**：Annex III 高风险义务的适用日期已从 2026-08-02 **推迟到 2027-12-02**。
对部署方违规的罚则最高 **€1,500 万或全球年营业额 3%**，取其高者。

这给出三个结论：

1. **今天不是阻碍**，还有约 26 个月缓冲期 —— 不需要第一天就做完整合规套件。
2. **但它是一个有确定日期的采购触发器。** 2027 年欧洲每一个用 AI 筛人的团队都要回答
   "你的系统准确率多少、记录在哪、人在哪个环节"。没有飞轮的竞品那时要从零补。
3. **所以定位要改一个词**：不是"更准的 AI 招聘工具"，是
   **"能通过审计的 AI 招聘工具"**。前者是偏好，后者是预算。

⚠️ 这是产品定位分析，不是法律意见。真正进欧洲市场前需要律师出具适用性判断
（尤其是 provider vs deployer 的角色界定，两者义务不同）。

---

## 2. 自有资产 → PRD 对象映射

这张表是本文档的核心。左边是 04 号 PRD 要的东西，中间是已经有的，右边是真正要写的代码。

| PRD 对象 | 已有资产 | 缺口（要建的） |
|---|---|---|
| **Entity store** | context cards：upsert / read / search / **find_similar（向量）** / list_related | 稳定 `natural_key` 去重；类型化字段；**字段级版本化**。cards 是文档，不是带 schema 的行 |
| **实体导入 / sourcing** | `search_linkedin_people`、`get_linkedin_profile` | CSV 导入；ATS 导出解析 |
| **Agent 研究工具** | `get_linkedin_profile`、`search_emails`、`read_email`、`find_email_contact`、`find_similar_context_cards` | **web search / fetch 工具（没有，必建）** |
| **动作出口** | `save_email_draft`（返回链接供人工发）、`send_email`、`send_linkedin_message`、`upsert_context_card` | ATS 写回 |
| **触发器** | `manage_skill_webhook`、`manage_skill_form`、`create_unipile_webhook` | 定时 / cron 触发 |
| **Run 编排** | `run_workflow`、`update_workflow_phase`、`append_run_note`、`wait_for_task` | **per-cell fan-out**；`Run.steps` 结构化轨迹（目前是 run note，非结构化） |
| **人工审批闸门** | **`park_workflow_run`** —— 把 run 挂起等人，这正是 review gate 的原语 | 键盘驱动的 Review UI；`Judgment` 记录 |
| **Golden set** | 无 | 全部 |
| **Eval / 回放** | 无 | 全部 |
| **版本与 promote** | 无 | 全部 |

**读这张表的正确方式**：已有资产覆盖了 sourcing、研究输入、动作出口、触发器 ——
几乎全部的"管道"。它们**完全没有覆盖飞轮**。

这是最好的一种分工：管道是商品化的（Clay 也有，而且更强），飞轮才是差异化的。
所以 8 周应该几乎不花在连接器上。

---

## 3. 第二个发现：一个 Clay 结构上算不出来的列

`search_emails` + `read_email` + `find_email_contact` + context cards 的向量检索，
合起来能支撑一个竞品**做不到**的 agent column：

```
Relationship Evidence
─────────────────────
我们团队里谁认识这个人？什么时候？聊过什么？
关系有多热？上次接触距今多久？谁是最合适的引荐人？
```

Clay、Attio 的 research agent、LinkedIn Recruiter 都算不出这一列，
原因不是模型不够强，是**他们没有你的收件箱**。这是第一方数据，不是数据商能卖的东西。

为什么这一列特别适合做旗舰：

1. **准确率天然高。** 证据来自你自己的邮件记录，不是从公开网页推断的 —— 这一列的
   accuracy 数字一开始就会很好看，是最好的首屏演示。
2. **它是招聘里最高价值的信号。** "冷触达"和"同事引荐"的回复率差一个数量级。
3. **它同时演示弃权的价值。** 没有邮件往来时 agent 必须说"无记录"，
   而不是编一个"中等关系强度"。
4. **隐私边界必须做对**（见 §6）—— 这本身又是一个只有认真做的产品才会处理的细节。

建议把它作为**第一个上线的 agent column**，而不是 ICP 式的打分列。

---

## 4. 修订后的 8 周计划

原 04 号 PRD 假设要花时间建连接器。前提确认后重排：

| 周 | 内容 | 依赖的已有资产 |
|---|---|---|
| **1** | Entity store：在 context cards 之上加类型化 schema + `natural_key` 去重 + 字段版本 | context card CRUD / search |
| **1** | Web search / fetch 工具（唯一缺失的研究工具） | — |
| **2** | AgentColumn 定义 + 自然语言 → output_schema + plan | — |
| **2–3** | per-cell fan-out 执行器（Celery）+ 结构化 `Run.steps` + 弃权 + 计费 | `run_workflow` / `wait_for_task` 作为外层编排 |
| **3** | 三个研究工具接入 agent runtime | `get_linkedin_profile` / `search_emails` / `find_similar_context_cards` |
| **4** | **Review 模式 + Judgment + golden set** ← 核心 | `park_workflow_run` 作为闸门原语 |
| **5** | 列头准确率仪表 + 弃权率 + 成本 | — |
| **6** | EvalRun 回放 + 版本 diff + promote 门槛 | — |
| **7** | 动作出口：外联草稿（**默认存草稿，不直发**） | `save_email_draft` / `send_linkedin_message` |
| **8** | 导入（CSV + LinkedIn 搜索）+ 打磨 | `search_linkedin_people` |

**净变化**：连接器与动作从原计划的约 3 周压到约 1 周，省下的时间全部投进 4–6 周的飞轮。
这正是这个前提最大的价值 —— 不是"少干活"，是**把工期投在唯一有差异化的地方**。

---

## 5. 首批 Agent Column 模板

四个模板，按上线顺序。每个都要有明确的弃权条件 —— 这是模板质量的标志。

```yaml
- name: Relationship Evidence          # 旗舰，第一个上线
  entity_type: person
  tools: [search_emails, read_email, find_email_contact, find_similar_context_cards]
  output_schema:
    strength: {enum: [strong, warm, weak, none]}
    last_contact: {type: date, nullable: true}
    best_intro:   {type: string, nullable: true}
  abstain_when: "邮箱无法解析到该人，或检索结果无法确认是同一人"
  # 注意：默认 none，不是 weak。没有记录 ≠ 弱关系

- name: Scope Fit
  entity_type: person
  tools: [get_linkedin_profile, web_search]
  output_schema:
    verdict: {enum: [yes, no, unclear]}
    evidence_roles: {type: array}
  instruction: "该候选人是否有把一个产品从 0 做到 1 的经历（而非加入已成规模的团队）？"
  abstain_when: "任职时间线无法确定该阶段公司规模"

- name: Seniority Match
  entity_type: person
  tools: [get_linkedin_profile]
  output_schema: {band: {enum: [below, match, above]}}
  abstain_when: "职级头衔跨地区含义不一致且无其他佐证"

- name: Outreach Angle                  # 依赖上面三列
  entity_type: person
  tools: [get_linkedin_profile, search_emails]
  output_schema: {angle: {type: string}, referrer: {type: string, nullable: true}}
  abstain_when: "上游任一列弃权"       # 不在未知之上编个性化理由
```

**跨模板的硬规则**：`Outreach Angle` 在上游弃权时必须弃权。
在不知道对方是谁的情况下生成"个性化"外联，是这类产品最常见也最伤品牌的失败模式。

---

## 6. 风险登记

| 风险 | 事实 | 缓解 |
|---|---|---|
| **候选人数据是个人数据** | GDPR 下的合法性基础、告知义务、保留期限，全都适用 | 保留期 TTL；不缓存 profile 全文，只存抽取出的字段 + 来源链接；候选人查询/删除接口 |
| **邮箱检索的隐私边界** | Relationship Evidence 会读团队成员的邮件 | **只读发件人/收件人/日期/主题做关系强度，正文仅在同一 workspace 成员明确授权后读取**；证据里展示"3 封往来，最近 2026-04"而非引用正文 |
| **LinkedIn 自动化限流** | Unipile 文档给出的邀请上限是 **80–100/天**；超限返回 429/500，需正确处理否则触发账号自动化告警。少于约 150 连接数或新账号的邀请投递可能需要人工验证 | 在 runtime 层做配额与退避；把限流做成 workspace 级信号量；**永不代发未经审阅的邀请** |
| **账号封禁** | Unipile 侧数据显示 316,703 条序列中无永久封禁，最坏为可恢复的限流 —— 优于浏览器自动化，但**不等于零风险** | 动作默认"存草稿 + 人工点发"；直发需显式开启并显示当日配额 |
| **EU AI Act 高风险** | 见 §1。2027-12-02 生效，罚则至 €15M / 3% | 飞轮本身即是合规基础；2027 年前补齐技术文档模板与部署方说明 |
| **弃权率过高导致产品显得没用** | 招聘数据比公司数据更稀疏 | 冷启动内置种子评测集；首次运行强制审阅 20 行；弃权率进内部看板双向监控 |

---

## 7. 对 03 号文档的修订

03 号文档里的 beachhead 结论**不变**（招聘），但理由的权重要重排：

| 原理由 | 修订后 |
|---|---|
| 工作形态同构 | 不变 |
| 错误代价高 | 不变 |
| Clay 是 company-centric，结构上不适配 | 不变 |
| ~~我方资产假设~~ | **已确认** —— 管道约 1 周即可复用，工期全投飞轮 |
| （原文没有） | **新增，且权重最高**：EU AI Act 把"可审计的准确率"从偏好变成有确定日期的采购要求 |
| （原文没有） | **新增**：first-party 关系证据是竞品结构上算不出来的一列 |

## 来源

- [EU AI Act — what it means for staffing businesses](https://artificialintelligenceact.eu/what-the-act-means-for-staffing-businesses/)
- [EU AI Act in Recruitment: high-risk rules](https://accessfinancial.com/eu-ai-act-recruitment-high-risk-hiring-2026/) · [Annex III timeline update](https://intrvio.com/blog/eu-ai-act-hiring-aug-2026)
- [Employment spotlight: draft guidelines on high-risk classification — McCann FitzGerald](https://www.mccannfitzgerald.com/knowledge/technology/employment-spotlight-eu-ai-act-draft-guidelines-on-high-risk-ai-classification)
- [Unipile — Provider limits and restrictions](https://developer.unipile.com/docs/provider-limits-and-restrictions) · [Unipile review: pricing, limits](https://www.swarmhit.com/blog/unipile-review)
