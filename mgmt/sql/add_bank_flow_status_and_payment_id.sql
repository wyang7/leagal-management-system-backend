-- 银行流水表增加字段：流水状态和案件付款ID
-- 用途：支持案件流水与银行流水的绑定及状态管理

-- 1. 增加流水状态字段
ALTER TABLE management_system.bank_flow
    ADD COLUMN flow_status VARCHAR(32) NULL COMMENT '流水状态：待案件匹配/申请结算/已结算/申请退费/已退费';

-- 2. 增加案件付款ID字段（关联case_payment_flow表）
ALTER TABLE management_system.bank_flow
    ADD COLUMN case_payment_id BIGINT NULL COMMENT '案件付款ID（关联case_payment_flow表的ID）';

-- 3. 创建索引优化查询性能
CREATE INDEX idx_bank_flow_status ON management_system.bank_flow (flow_status);
CREATE INDEX idx_bank_flow_case_payment_id ON management_system.bank_flow (case_payment_id);

-- 4. 更新现有数据：将已关联案件的流水状态设为默认值
-- 注意：历史数据根据实际情况可能需要手动调整
UPDATE management_system.bank_flow
SET flow_status = '待案件匹配'
WHERE flow_status IS NULL;

