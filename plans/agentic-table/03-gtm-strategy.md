# 03 — 市场切入策略

## 1. 为什么 GTM 是最差的入口（而不是最好的）

原始设想把 GTM 当 beachhead，理由是"ROI 清晰、用户好懂"。这两点都对，
但 beachhead 的选择标准不是"最好懂"，而是**"最好懂 × 在位者最弱"**。

GTM 在第二项上是全场最低：

| 事实 | 后果 |
|---|---|
| Clay ARR ≈ $150M，估值 $5B | 你在跟一个有无限弹药的对手抢同一个买家 |
| Clay Workflows 对所有付费档**永久免费** | 你的核心功能是对手的免费赠品 |
| Attio 已是 Clay 的预置 MCP 连接 | 生态已经闭环，你插不进去 |
| Unify / Gumloop / Keyplay / Common Room 同赛道 | 每个潜在客户一年被 pitch 20 次 |

**GTM 不是 beachhead，是终局市场。** 先在别处把产品打磨到"准确率可证明"，再回来打。

---

## 2. Beachhead 选择框架

四个筛选条件，缺一不可：

1. **工作形态同构**：核心工作 = "对一组实体，逐个研究 → 判断 → 打分 → 行动"
2. **错答案有代价**：错误会造成金钱/合规/时间损失 → 准确率数字才卖得动
3. **没有主导型 agentic table 在位者**
4. **我方已有分销或技术资产**

| 候选垂直 | 同构 | 错误代价 | 在位者 | 我方资产 | 结论 |
|---|---|---|---|---|---|
| GTM / 销售 | ✅ | 中 | **Clay 主导** | 有 | ❌ |
| 金融尽调 / 法律 | ✅ | 极高 | **Hebbia 主导** | 无 | ❌ |
| **招聘 / 人才 sourcing** | ✅ | 高（错招成本 = 数月薪资） | 分散，无主导 | **强，已确认** | ✅ **推荐** |
| 采购 / 供应商风险 | ✅ | 高 | 分散 | 无 | ✅ 次选 |
| 合规 / KYB 监测 | ✅ | 极高 | 传统厂商，非 agentic | 无 | ⚠️ 销售周期太长 |
| 竞争情报 | ✅ | 低 | 分散 | 有 | ❌ ROI 说不清 |
| 客户成功 / 流失预警 | ✅ | 中 | CS 平台内建 | 有 | ⚠️ 数据在别人系统里 |

### 为什么是招聘

- **工作形态完全同构**：候选人列表 → 背景研究 → 技能抽取 → 匹配打分 → 生成外联。
  和 Clay 的 `source → enrich → research → verify → route` 逐字对应。
- **错误代价高且买家自己算得清**：一个错招的全成本通常是数月薪资；
  招聘负责人本来就在用 time-to-hire、offer 接受率这类指标管理自己。
- **"为什么是这个人"是刚需**：招聘决策天然要向 hiring manager 解释、也可能被审计。
  Evidence + accuracy 在这里不是 nice-to-have。
- **Clay 结构性不适配**：Clay 是 **company-centric** 的，数据商、waterfall、
  play 模板全是围绕账户建的；它的定价与 seat 模型也是给销售团队设计的。
  人才场景在 Clay 里能勉强搭，但没人把它当招聘产品买。
- **✅ 已确认：管道是自有资产。** LinkedIn（人物搜索 / profile / 私信 / 邀请管理）、
  Gmail（搜索 / 读取 / 发送 / 草稿 / 联系人解析）、带向量检索的 context card 存储、
  workflow 运行时，均为自有。sourcing、研究输入、动作出口、触发器**几乎全部已具备**，
  MVP 里连接器的工期从约 3 周压到约 1 周，省下的全部投进飞轮。
  逐项映射见 [05-recruiting-build.md](./05-recruiting-build.md)。
- **✅ 合规是有确定日期的采购触发器。** EU AI Act Annex III 第 4(a) 条把候选人评估与
  候选名单排序列为高风险，义务包括记录留存、透明度、human-in-the-loop 和**准确性** ——
  与我们的飞轮逐项对应。适用日期 **2027-12-02**，罚则至 €15M 或全球营业额 3%。
  这把"可审计的准确率"从偏好变成预算项。
- **✅ 有一列竞品结构上算不出来。** 用自有邮箱与 context card 历史计算的
  **Relationship Evidence**（我们团队谁认识这个人、多热、谁该引荐）——
  Clay 和 LinkedIn Recruiter 算不出来，不是模型问题，是他们没有你的收件箱。

---

## 3. 楔子话术

不要卖"AI 帮你填表"。市场上已经有 6 家在说这句话。

**卖这个**：

> 你现在已经在用 AI 填这些字段了。
> 问题是：**你知道它有多准吗？**
>
> 我们接上你现有的表，让你连续审阅 30 行，
> 10 分钟后给你第一个数字：这一列 74% 准确。
> 然后我们帮你把它做到 90%，并且证明给你看。

这个话术的三个好处：
1. **零迁移**：第一次接触不要求客户换系统（方案 E 的 0 号阶段）。
2. **它诊断的是买家已经感觉到但说不出口的焦虑** —— Salesforce 已经替你把这堂课上了
   （Agentforce 采用受阻的公认诊断就是数据可信度；84% 的数据负责人说 AI 落地前数据战略要推倒重来）。
3. **它自动产生 golden set** —— 客户在销售过程中就开始积累切换成本。

---

## 4. 定价：不要按执行次数收费，按**已验证的产出**收费

所有人都已经是 usage-based（Clay 的 credits+actions、Airtable 的 AI credits、
Retool 的 agent-hours）。按次收费不是创新，而且有一个致命的激励错配：

> 按次收费 = agent 跑错一次你也收钱 = 你和客户的利益相反。

推荐结构：

```
Platform            $299 / 月
  含：无限行、无限列、无限席位、5,000 verified cells / 月

Verified cell       $0.02 / 个
  定义：一个通过置信度阈值、或经人工确认的 cell

Abstained cell      $0         ← 关键
  agent 说"证据不足"时不收费

Deep research       $0.15 / cell   （多轮、>10 个来源）
External action     $0.01 / 次     （邮件、CRM 写入、webhook）
```

**"弃权不收费"是整个定价的锚点**，因为它把定价变成了一句市场主张：

> 我们对自己的答案有信心到：不确定的时候不跟你要钱。

没有一个在位者能跟进这一条 —— 因为他们的系统里根本没有"弃权"这个概念，
也没有准确率来支撑它。

---

## 5. 90 天计划

| 周 | 目标 | 交付 | 成功判据 |
|---|---|---|---|
| 1–2 | 需求验证 | 访谈 15 位在用 AI 填表的招聘/RevOps 负责人 | ≥ 10 人无法回答"这一列多准" |
| 3–6 | 方案 E 极简版 | Airtable + Sheets 连接器、review 队列、准确率看板 | 5 个团队接入，产出首个准确率数字 |
| 7–8 | 判定 | 复盘：他们看到数字之后做了什么？ | ≥ 3 个团队主动要求"帮我们提高它" |
| 9–16 | 方案 D MVP | 自有表 + Agent Column + Evidence + Golden Set + 版本回放 | 3 个付费客户，单列准确率提升 ≥ 15 个百分点 |
| 17–20 | 定价验证 | 上线 verified-cell 定价 | 毛利 ≥ 70%，弃权率 < 15% |

**Kill criteria（明确的止损线）**：
如果到第 8 周，看到准确率数字的团队里**没有人主动要求提升它**，
那说明市场还没到"要求 AI 可信"的阶段，整条论点作废，回到方案 A/E 重想。

---

## 6. 融资叙事

> 2024–2026 年，行业解决了"让 agent 产出结构化数据"。
> Clay、Hebbia、Airtable 都做到了，而且做得很好。
>
> 没有人解决的是下一个问题：**这些数据能不能不经人看就直接用。**
> Salesforce 用 $1B ARR 的 Agentforce 和一次下调指引证明了这个卡点是真的。
>
> 我们把人类的每一次修正变成评测数据，
> 让每一个 AI 列都有一个准确率数字、一个版本号、和一条上升曲线。
>
> 表格是我们的界面。飞轮是我们的产品。

## 来源

- [Clay revenue & valuation — Sacra](https://sacra.com/c/clay/) · [Introducing Clay Workflows](https://www.clay.com/blog/introducing-workflows)
- [Where Are We Really at With Agentforce Adoption? — Salesforce Ben](https://www.salesforceben.com/where-are-we-really-at-with-agentforce-adoption/) · [Why Agentforce Adoption Is Stalling](https://salesforcedictionary.com/blogs/agentforce-adoption-data-readiness-2026)
- [Airtable AI billing](https://support.airtable.com/docs/airtable-ai-billing) · [Retool pricing](https://retool.com/pricing)
- [Attio AI updates 2026](https://crmnewspaper.com/blog/attio-ai-updates-ask-attio-2026/)
