-- 为案件表增加案件来源字段
ALTER TABLE case_info
    ADD COLUMN case_source VARCHAR(64) NULL COMMENT '案件来源：上城法院本部、九堡法庭、笕桥法庭、综治中心' AFTER case_location;

-- 为角色表增加案件来源字段
ALTER TABLE role
    ADD COLUMN case_source VARCHAR(64) NULL COMMENT '角色可管理的案件来源：上城法院本部、九堡法庭、笕桥法庭、综治中心' AFTER station;

-- 1）优先处理特殊逻辑：九堡/彭埠/笕桥 且 案件编号包含“杭”的，来源统一为“综治中心”
UPDATE case_info
SET case_source = '综治中心'
WHERE case_location IN ('九堡', '彭埠', '笕桥')
  AND case_number LIKE '%杭%';

-- 2）按归属地做常规映射（不会覆盖上一步已经设好的“综治中心”）
-- 本部 → 上城法院本部
UPDATE case_info
SET case_source = '上城法院本部'
WHERE case_location = '本部'
  AND (case_source IS NULL OR case_source = '');

-- 九堡 → 九堡法庭（未被上一步特殊逻辑命中的九堡案件）
UPDATE case_info
SET case_source = '九堡法庭'
WHERE case_location = '九堡'
  AND (case_source IS NULL OR case_source = '');

-- 彭埠 → 九堡法庭（未被上一步特殊逻辑命中的彭埠案件）
UPDATE case_info
SET case_source = '九堡法庭'
WHERE case_location = '彭埠'
  AND (case_source IS NULL OR case_source = '');

-- 笕桥 → 笕桥法庭（未被上一步特殊逻辑命中的笕桥案件）
UPDATE case_info
SET case_source = '笕桥法庭'
WHERE case_location = '笕桥'
  AND (case_source IS NULL OR case_source = '');

-- 四季青 → 综治中心
UPDATE case_info
SET case_source = '综治中心'
WHERE case_location = '四季青'
  AND (case_source IS NULL OR case_source = '');

-- 闸弄口 → 综治中心
UPDATE case_info
SET case_source = '综治中心'
WHERE case_location = '闸弄口'
  AND (case_source IS NULL OR case_source = '');

-- 凯旋街道 → 综治中心
UPDATE case_info
SET case_source = '综治中心'
WHERE case_location = '凯旋街道'
  AND (case_source IS NULL OR case_source = '');

-- 丁兰 → 综治中心
UPDATE case_info
SET case_source = '综治中心'
WHERE case_location = '丁兰'
  AND (case_source IS NULL OR case_source = '');

