# 04 — MVP PRD：Verified Research Table

方案 D 的工程规格。技术选型对齐本仓库现状（Django 5 + DRF + Celery + Redis + Postgres，React 19 + TanStack）。

---

## 1. 产品一句话

> 一张会自己研究、并且知道自己有多准的表。

## 2. 核心对象

五个一等对象。**注意 Table 不在其中** —— 它是视图。

```
Entity          被研究的东西（公司/人/供应商/文档）。跨表共享。
AgentColumn     一个有版本、有准确率、能弃权的计算定义。
Cell            (Entity, AgentColumn, version) → 值 + 置信度 + 证据 + 成本
Run             一次 agent 执行的完整轨迹（工具调用、来源、token、时长）
Judgment        人类对某个 Cell 的裁决。golden set 的原子单位。
```

## 3. 数据模型（Django）

```python
# ---------- 状态层：entity store，不是 table ----------

class Entity(Model):
    id          = UUIDField(primary_key=True)
    workspace   = FK(Workspace)
    type        = CharField()          # "company" | "person" | "vendor" | ...
    natural_key = CharField(db_index=True)   # 去重键：域名 / linkedin url / ...
    attrs       = JSONField(default=dict)    # 用户导入的原始字段
    created_at  = DateTimeField(auto_now_add=True)

    class Meta:
        # 同一实体在整个 workspace 内只有一份 → research 只跑一次、只付一次
        constraints = [UniqueConstraint(fields=["workspace", "type", "natural_key"],
                                        name="uniq_entity_natural_key")]


class EntityEvent(Model):
    """跨表可见的信号流。解决 Clay 明确承认的『表是封闭世界』问题。"""
    entity     = FK(Entity, related_name="events")
    source     = CharField()           # "webhook" | "monitor" | "import" | "crm"
    kind       = CharField()           # "funding_round" | "job_posted" | ...
    payload    = JSONField()
    occurred_at= DateTimeField(db_index=True)


# ---------- 计算层 ----------

class AgentColumn(Model):
    workspace     = FK(Workspace)
    name          = CharField()                 # "ICP Score"
    entity_type   = CharField()
    output_schema = JSONField()                 # JSON Schema：类型/枚举/范围
    active_version= FK("AgentColumnVersion", null=True, related_name="+")


class AgentColumnVersion(Model):
    column        = FK(AgentColumn, related_name="versions")
    version       = PositiveIntegerField()      # v1, v2, ...
    instruction   = TextField()                 # 用户写的自然语言
    plan          = JSONField()                 # 系统生成的研究计划（工具序列）
    model         = CharField()
    tools         = JSONField(default=list)     # ["web_search","linkedin","crm_read"]
    abstain_below = FloatField(default=0.6)     # 低于此置信度 → 弃权，不收费
    status        = CharField(default="draft")  # draft | candidate | active | retired

    # 由 eval 引擎回填，列头直接读这三个数
    eval_accuracy = FloatField(null=True)
    eval_n        = PositiveIntegerField(default=0)
    eval_at       = DateTimeField(null=True)

    class Meta:
        constraints = [UniqueConstraint(fields=["column", "version"],
                                        name="uniq_column_version")]


class Cell(Model):
    entity       = FK(Entity, related_name="cells")
    column       = FK(AgentColumn)
    version      = FK(AgentColumnVersion)       # 哪个版本算出来的
    value        = JSONField(null=True)         # null + state=abstained 是合法状态
    confidence   = FloatField(null=True)
    state        = CharField()                  # pending|running|filled|abstained|failed|confirmed|corrected
    run          = FK("Run", null=True)
    cost_usd     = DecimalField(max_digits=10, decimal_places=6, default=0)
    computed_at  = DateTimeField(null=True)

    class Meta:
        # 重跑 = 新 version 的新行，不是覆盖。历史可比对
        constraints = [UniqueConstraint(fields=["entity", "column", "version"],
                                        name="uniq_cell_per_version")]
        indexes = [Index(fields=["column", "state"])]   # review 队列查询


# ---------- 证据层 ----------

class Run(Model):
    version      = FK(AgentColumnVersion)
    entity       = FK(Entity)
    status       = CharField()                  # running | ok | failed
    steps        = JSONField(default=list)      # 见 §5 Evidence schema
    input_digest = CharField(db_index=True)     # 输入快照哈希，用于 eval 回放
    tokens_in    = IntegerField(default=0)
    tokens_out   = IntegerField(default=0)
    latency_ms   = IntegerField(null=True)
    cost_usd     = DecimalField(max_digits=10, decimal_places=6, default=0)


# ---------- 飞轮层：这是护城河 ----------

class Judgment(Model):
    """人类对一个 cell 的裁决。每一条都自动成为 golden set 的一行。"""
    cell         = FK(Cell, related_name="judgments")
    verdict      = CharField()                  # confirm | correct | reject | unsure
    corrected    = JSONField(null=True)         # verdict=correct 时的正确值
    note         = TextField(blank=True)
    judged_by    = FK(User)
    judged_at    = DateTimeField(auto_now_add=True)

    # 冻结当时的输入，否则回放不可复现
    input_digest = CharField(db_index=True)
    input_snapshot = JSONField()


class EvalRun(Model):
    """把候选版本在 golden set 上回放，决定能否 promote。"""
    version      = FK(AgentColumnVersion, related_name="evals")
    n            = PositiveIntegerField()
    accuracy     = FloatField()
    abstain_rate = FloatField()
    cost_per_row = DecimalField(max_digits=10, decimal_places=6)
    p50_latency_ms = IntegerField()
    baseline     = FK(AgentColumnVersion, null=True, related_name="+")
    delta        = FloatField(null=True)        # 相对现役版本的准确率变化
    created_at   = DateTimeField(auto_now_add=True)
```

---

## 4. 执行语义

### 4.1 Cell 状态机

```
                      ┌──────────────────────────────────┐
                      │                                  │
  pending ──► running ├──► filled ──────► confirmed      │ 人工裁决
                      │      │                           │ 写入 golden set
                      │      └────────► corrected ───────┤
                      │                                  │
                      ├──► abstained  (证据不足，不收费)  │
                      └──► failed     (工具错误，不收费)  │
                                                         ▼
                                                   Judgment
                                                         │
                                            ┌────────────┘
                                            ▼
                              EvalRun (回放候选版本)
                                            │
                              delta > 0  ───┴──► promote → 全量重跑
```

### 4.2 三条不可妥协的规则

1. **弃权是一等结果，不是失败。**
   `confidence < abstain_below` → `state=abstained`，`value=null`，`cost_usd=0`，进入 review 队列。
   这是产品的核心主张，不允许为了"表格看起来满"而放宽。

2. **重跑永不覆盖。**
   新版本产生新 Cell 行。旧版本保留，可做并排 diff。
   这让"升级 agent"从一个不可逆的赌博变成一次可回滚的发布。

3. **成本按 run 归属到 entity × column。**
   任何时候都能回答"这一列这个月花了多少、每行多少"。
   （Clay 已经做到按步骤拆分到每条记录，这是及格线，不是加分项。）

### 4.3 Celery 任务拓扑

```
fan_out_column(column_id, entity_ids)     # 建 pending cells，按 chunk 分发
  └─► execute_cell(cell_id)               # 单 cell，幂等，可重试
        ├─ 载入 version.plan
        ├─ 执行工具序列，逐步写 Run.steps
        ├─ 结构化输出 → 按 output_schema 校验
        ├─ confidence < abstain_below → abstained
        └─ 记账 cost_usd
  └─► on_column_complete(column_id)       # 回填统计，触发下游 workflow

replay_eval(candidate_version_id)         # 在 golden set 的 input_snapshot 上回放
```

并发靠 Celery chunk + 每个 workspace 的信号量限流（避免单客户打爆外部 API 配额）。
SSE（本仓库已有 `/stream/tasks/`）复用为 cell 级进度推送。

---

## 5. Evidence Schema

每个 Cell 的证据就是它的 `Run.steps`。固定形状，前端直接渲染：

```jsonc
{
  "run_id": "run_01J…",
  "version": 18,
  "steps": [
    { "t": "search",  "query": "OpenAI enterprise customers 2026",
      "results": 8, "ms": 1240 },
    { "t": "fetch",   "url": "https://openai.com/enterprise",
      "title": "OpenAI for Enterprise", "chars": 14203, "ms": 890 },
    { "t": "extract", "claim": "服务 92% 的财富 500 强",
      "source_url": "https://openai.com/enterprise",
      "quote": "…used by 92% of the Fortune 500…",   // 必须是原文，不是改写
      "confidence": 0.94 },
    { "t": "reason",  "text": "企业客户 ✓ / 美国市场 ✓ / 500+ 员工 ✓ / 用 Salesforce ？未确认" },
    { "t": "output",  "value": 87, "confidence": 0.81,
      "criteria": [
        { "name": "企业客户", "met": true,  "source_ix": 1 },
        { "name": "美国市场", "met": true,  "source_ix": 1 },
        { "name": "500+ 员工", "met": true,  "source_ix": 0 },
        { "name": "用 Salesforce", "met": null, "source_ix": null }   // null = 未知，不是 false
      ] }
  ]
}
```

三条硬约束：

- `quote` **必须是逐字原文**。改写过的引用等于没有引用 —— 这是 Hebbia 的做法，也是唯一站得住的做法。
- `criteria[].met` 允许 `null`（未知），禁止把"没查到"折叠成 `false`。
- 任何 `extract` 步骤没有 `source_url` → 整个 cell 强制 `abstained`。

---

## 6. 关键 UI

### 6.1 列头（产品的核心界面元素）

```
┌─ ICP Score ───────────────────── v18 ▾ ─┐
│  准确率  87%   n=214        ▲ +9 vs v17 │
│  改写率   6%   近30天                    │
│  成本   $0.021 / 行                      │
│  覆盖率  94%   (6% 弃权)                 │
│  ───────────────────────────────────    │
│  [ 审阅 12 个待定 ]  [ 试新版本 ]        │
└──────────────────────────────────────────┘
```

首页第一屏卖的是这个框，不是表格。

### 6.2 Review 模式

全屏、键盘驱动、一次一个 cell，默认按置信度升序：

```
  第 3 / 12 个待审        ICP Score · Linear

  agent 给出：  81        置信度 0.58  ⚠ 低于阈值

  依据
   ✓ 企业客户        linear.app/customers  「…Ramp, Vercel, Cash App…」
   ✓ 美国市场        linkedin.com/company/linear
   ✗ 500+ 员工       约 150 人 — 不满足
   ? 用 Salesforce   未找到证据

  [J] 确认   [K] 修正   [D] 驳回   [?] 不确定   [→] 跳过
```

每一次按键都写一条 `Judgment`。审 20 个 → 第一个准确率数字。

### 6.3 版本回放

```
  v19 候选  在 214 条 golden set 上回放中…  ████████░░ 78%

  准确率      91%   ▲ +4   vs v18 的 87%
  弃权率      11%   ▲ +5   （更谨慎）
  成本/行   $0.028  ▲ +$0.007
  p50 延迟    8.2s  ▼ -1.1s

  回归：3 条原本正确的现在错了   [ 查看 ]

              [ 取消 ]      [ 发布 v19 并重跑全表 ]
```

---

## 7. 计费实现

```python
BILLABLE_STATES = {"filled", "confirmed", "corrected"}
# abstained / failed / pending / running 一律不计费

RATES = {
    "verified_cell":  Decimal("0.02"),
    "deep_research":  Decimal("0.15"),   # >10 来源或多轮
    "external_action":Decimal("0.01"),
}
```

按月对 `Cell.state ∈ BILLABLE_STATES` 计数。
弃权率因此成为**双向指标**：太高说明 agent 没用，太低说明阈值定虚了。
两边都要在内部看板上盯。

---

## 8. MVP 范围（8 周）

> 排期已按"管道为自有资产"的前提修订，逐周计划见
> [05-recruiting-build.md §4](./05-recruiting-build.md#4-修订后的-8-周计划)。
> 净变化：连接器与动作出口从约 3 周压到约 1 周，省出的时间全部投进第 4–6 周的飞轮。


**做：**
- CSV 导入 + 一种连接器（按 03 的推荐：LinkedIn 人才搜索）
- 自然语言 → AgentColumn（自动生成 output_schema + plan）
- 逐行执行 + 弃权 + 证据 + 成本
- Review 模式 + Judgment + golden set
- 列头准确率
- 版本回放 + promote
- 一个动作出口（生成外联草稿）

**不做（写进文档，防止范围蔓延）：**
- 公式引擎、视图系统（看板/日历/画廊）、权限矩阵
- 多表关联、双向同步
- 连接器矩阵（每多一个连接器就少一周核心功能）
- 移动端

## 9. 里程碑判据

| 时点 | 判据 |
|---|---|
| 第 4 周 | 一个真实用户在 10 分钟内拿到第一个准确率数字 |
| 第 6 周 | 至少一列通过版本迭代把准确率提升 ≥ 15 个百分点，且有回放证明 |
| 第 8 周 | 3 个付费客户；弃权率落在 5–15% 区间；毛利 ≥ 70% |
