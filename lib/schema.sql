PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS org_unit (
  id        INTEGER PRIMARY KEY,
  code      TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  parent_id INTEGER REFERENCES org_unit(id)
);

CREATE TABLE IF NOT EXISTS app_user (
  id          INTEGER PRIMARY KEY,
  username    TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  position    TEXT,
  role        TEXT NOT NULL CHECK (role IN ('STAFF','APPROVER','ADMIN')),
  org_unit_id INTEGER NOT NULL REFERENCES org_unit(id)
);

CREATE TABLE IF NOT EXISTS fiscal_year (
  id          INTEGER PRIMARY KEY,
  year        INTEGER NOT NULL UNIQUE,   -- พ.ศ.
  start_month INTEGER NOT NULL,
  is_current  INTEGER NOT NULL DEFAULT 0
);

-- กลุ่มผู้มีส่วนได้ส่วนเสีย 3 ชั้น (level 1 = กลุ่มหลัก, 2 = กลุ่มย่อย, 3 = รายการ)
CREATE TABLE IF NOT EXISTS stakeholder_group (
  id        INTEGER PRIMARY KEY,
  level     INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  parent_id INTEGER REFERENCES stakeholder_group(id),
  code      TEXT NOT NULL,
  name      TEXT NOT NULL,
  definition  TEXT,   -- นิยามของกลุ่มตามที่ กยท. กำหนด (แสดงบนหน้าแรกและหน้าทะเบียน)
  icon        TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ref_engagement_level (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ref_risk_rm (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ref_risk_ba (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============ [100] Stakeholder's Profile ============
CREATE TABLE IF NOT EXISTS stakeholder (
  id                 INTEGER PRIMARY KEY,
  fiscal_year_id     INTEGER NOT NULL REFERENCES fiscal_year(id),
  org_unit_id        INTEGER NOT NULL REFERENCES org_unit(id),
  group_l1_id        INTEGER REFERENCES stakeholder_group(id),
  group_l2_id        INTEGER REFERENCES stakeholder_group(id),
  group_l3_id        INTEGER REFERENCES stakeholder_group(id),
  name               TEXT NOT NULL,
  business_model     TEXT,
  coord_name         TEXT,
  coord_phone        TEXT,
  coord_email        TEXT,
  coord_line         TEXT,
  coord_note         TEXT,
  dm_name            TEXT,
  dm_phone           TEXT,
  dm_email           TEXT,
  dm_line            TEXT,
  dm_note            TEXT,
  interest_x         INTEGER,
  influence_y        INTEGER,
  zone               INTEGER,
  status             TEXT NOT NULL DEFAULT 'DRAFT',
  updated_at         TEXT NOT NULL,
  updated_by         TEXT
);

CREATE TABLE IF NOT EXISTS stakeholder_issue (
  id                  INTEGER PRIMARY KEY,
  stakeholder_id      INTEGER NOT NULL REFERENCES stakeholder(id) ON DELETE CASCADE,
  seq                 INTEGER NOT NULL,
  title               TEXT,
  impact_org          INTEGER,
  impact_stakeholder  INTEGER,
  priority            INTEGER,
  level_code          TEXT,
  level_extra_code    TEXT,
  methods             TEXT,
  frequency           TEXT
);

-- ============ [004]/[005] วัตถุประสงค์และขอบเขตการสร้างความสัมพันธ์ ============
CREATE TABLE IF NOT EXISTS engagement_objective (
  id              INTEGER PRIMARY KEY,
  scope           TEXT NOT NULL CHECK (scope IN ('ORG','UNIT')),
  fiscal_year_id  INTEGER NOT NULL REFERENCES fiscal_year(id),
  org_unit_id     INTEGER NOT NULL REFERENCES org_unit(id),
  objective       TEXT,
  scope_text      TEXT,
  target_groups   TEXT,          -- JSON array ของ stakeholder_group.id ชั้นที่ 1
  expected_result TEXT,
  status          TEXT NOT NULL DEFAULT 'DRAFT',
  updated_at      TEXT NOT NULL,
  updated_by      TEXT,
  UNIQUE (scope, fiscal_year_id, org_unit_id)
);

-- ============ [040]/[050] แผนงาน/โครงการ ============
CREATE TABLE IF NOT EXISTS plan (
  id                 INTEGER PRIMARY KEY,
  scope              TEXT NOT NULL CHECK (scope IN ('ORG','UNIT')),
  fiscal_year_id     INTEGER NOT NULL REFERENCES fiscal_year(id),
  org_unit_id        INTEGER NOT NULL REFERENCES org_unit(id),
  stakeholder_id     INTEGER REFERENCES stakeholder(id),
  name               TEXT NOT NULL,
  objective          TEXT,
  relation_level     TEXT,
  relation_method    TEXT,
  linked_plan_type   TEXT,
  linked_plan_name   TEXT,
  relation_objective TEXT,
  goal_output        TEXT,
  goal_outcome       TEXT,
  goal_q1            TEXT,
  goal_q2            TEXT,
  goal_q3            TEXT,
  goal_q4            TEXT,
  rm_code            TEXT,
  ba_code            TEXT,
  risk_approach      TEXT,
  risk_factor        TEXT,
  impact             INTEGER,
  likelihood         INTEGER,
  risk_level         TEXT,
  risk_control       TEXT,
  risk_appetite      TEXT,
  risk_goal_output   TEXT,
  risk_goal_outcome  TEXT,
  res_headcount      TEXT,
  res_capability     TEXT,
  res_technology     TEXT,
  res_budget         TEXT,
  status             TEXT NOT NULL DEFAULT 'DRAFT',
  updated_at         TEXT NOT NULL,
  updated_by         TEXT
);

-- ============ [0411]-[0414] / [0511]-[0514] ผลการดำเนินงานรายไตรมาส ============
CREATE TABLE IF NOT EXISTS plan_quarter_result (
  id                 INTEGER PRIMARY KEY,
  plan_id            INTEGER NOT NULL REFERENCES plan(id) ON DELETE CASCADE,
  quarter            INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  month1             TEXT,
  month2             TEXT,
  month3             TEXT,
  forecast           TEXT,
  problem            TEXT,
  solution           TEXT,
  cumulative_percent REAL,
  is_on_target       INTEGER,
  remediation        TEXT,
  -- เฉพาะไตรมาส 4
  year_output        TEXT,
  year_outcome       TEXT,
  risk_result        TEXT,
  risk_output        TEXT,
  risk_outcome       TEXT,
  emergency_output   TEXT,
  emergency_outcome  TEXT,
  res_headcount_ok   INTEGER,
  res_headcount_note TEXT,
  res_capability_ok  INTEGER,
  res_capability_note TEXT,
  res_technology_ok  INTEGER,
  res_technology_note TEXT,
  res_budget_ok      INTEGER,
  res_budget_note    TEXT,
  status             TEXT NOT NULL DEFAULT 'DRAFT',
  updated_at         TEXT NOT NULL,
  updated_by         TEXT,
  UNIQUE (plan_id, quarter)
);

-- ============ [604] ความต้องการ/ความคาดหวัง ============
CREATE TABLE IF NOT EXISTS expectation (
  id             INTEGER PRIMARY KEY,
  fiscal_year_id INTEGER NOT NULL REFERENCES fiscal_year(id),
  org_unit_id    INTEGER NOT NULL REFERENCES org_unit(id),
  stakeholder_id INTEGER NOT NULL REFERENCES stakeholder(id) ON DELETE CASCADE,
  need           TEXT,
  expectation    TEXT,
  channel        TEXT,
  response       TEXT,
  note           TEXT,
  status         TEXT NOT NULL DEFAULT 'DRAFT',
  updated_at     TEXT NOT NULL,
  updated_by     TEXT
);

-- ============ องค์ความรู้ (Knowledge Management) ============
-- องค์ความรู้ — ผู้ดูแลระบบเพิ่มหัวข้อได้เอง ไม่ใช่รายการตายตัวอีกต่อไป
CREATE TABLE IF NOT EXISTS km_article (
  id         INTEGER PRIMARY KEY,
  title      TEXT NOT NULL,
  summary    TEXT,            -- คำโปรยสั้น ๆ ใช้แสดงในหน้ารายการ
  category   TEXT,            -- หมวดหมู่ ใช้กรองในหน้ารายการ
  body       TEXT NOT NULL,   -- เนื้อหาแบบ Markdown
  created_at TEXT NOT NULL,   -- วันที่บันทึกข้อมูล ใช้เรียงลำดับในหน้ารายการ
  created_by TEXT,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_km_created ON km_article(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stakeholder_unit ON stakeholder(org_unit_id, fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_issue_stakeholder ON stakeholder_issue(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_plan_scope ON plan(scope, fiscal_year_id, org_unit_id);
CREATE INDEX IF NOT EXISTS idx_result_plan ON plan_quarter_result(plan_id, quarter);
