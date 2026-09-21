# Agentic Table — 研究与产品方案

> 研究日期：2026-09-21。所有市场数据均为该日期前可公开检索的信息，见各文档末尾来源。

## 文档

| 文件 | 内容 |
|---|---|
| [00-thesis.md](./00-thesis.md) | 产品论点、对原始设想的三处修正、命名判断 |
| [01-landscape.md](./01-landscape.md) | 竞争格局图：13 家产品的分层、定位与事实核查 |
| [02-product-options.md](./02-product-options.md) | 5 个产品方案的 PRD/MVP 对比与打分 |
| [03-gtm-strategy.md](./03-gtm-strategy.md) | 市场切入策略：beachhead 选择、定价、90 天计划 |
| [04-mvp-prd.md](./04-mvp-prd.md) | 推荐方案的完整 PRD：数据模型、执行语义、Evidence schema、计费 |
| [05-recruiting-build.md](./05-recruiting-build.md) | 招聘垂直落地方案：资产映射、合规窗口、列模板、风险登记 |
| [prototype/index.html](./prototype/index.html) | 可交互原型（单文件，浏览器直接打开）：[在线版本](https://claude.ai/artifact/UHcW78f4o2mhL2evjTi5g8) |

## 原型

`prototype/index.html` 是 04 号 PRD 的可点击版本，三个视图：

- **Table** — agent 列的列头即仪表盘（准确率 / n / 改写率 / 单行成本 / 弃权率）；
  点任意 cell 看逐步证据链；点列头 `Run on 6 rows` 观察 pending → running → filled/abstained。
- **Review** — 键盘驱动（J 确认 / K 修正 / D 驳回），每次裁决**实时改变列头的准确率数字**。
  这是整个产品的核心演示。
- **Versions** — 把候选版本在 golden set 上回放，看 Δ 准确率 / Δ 弃权率 / Δ 成本 + 回归清单，
  跑赢才允许 promote。

数据为演示用虚构公司，agent 运行是定时器模拟，不是真实研究。

## 一句话结论

这个方向是真的，但**"Agentic Table" 这个位置已经有三个各自垄断一个垂直的在位者**
（Hebbia = 金融/法律，Clay = GTM，Paradigm = 通用长尾），
所以不能按"新品类"来打，要按"在位者结构性做不到的那一件事"来打。

那件事是：**人类对 agent 输出的修正，被当成一等公民，闭环回 agent 的评测与版本**。
所有人都在做 provenance（Hebbia 的 cell 级推理链、Clay 的 per-record trace），
但没有人把"这一列历史准确率 87%、上周你改过 12 个格子、v18 相比 v17 提升 9 个点"做成产品原语。

护城河不是表格，不是 evidence，是 **correction → eval → version 这个飞轮**。

而在招聘这个 beachhead 上，这个飞轮同时是合规要求：EU AI Act Annex III 把候选人评估
与名单排序列为高风险，要求记录留存、透明度、human-in-the-loop 和准确性 —— 逐项对应飞轮的四个对象。
适用日期 2027-12-02，罚则至 €15M 或全球营业额 3%。**差异化和采购理由在这里是同一件事。**
