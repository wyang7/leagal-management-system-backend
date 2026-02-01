-- 为 case_close_ext 增加“开票状态/是否已付款”字段
-- 执行前请确认当前库名 management_system

ALTER TABLE management_system.case_close_ext
    ADD COLUMN invoice_status VARCHAR(32) NULL COMMENT '开票状态：暂未申请开票/待开票/已开票' AFTER payer,
    ADD COLUMN paid TINYINT(1) NULL COMMENT '是否已付款' AFTER invoice_status;

-- 可选：将历史 invoiced 字段迁移为 invoice_status（仅供参考，按需执行）
-- UPDATE management_system.case_close_ext
-- SET invoice_status = CASE
--     WHEN invoiced IS NULL THEN invoice_status
--     WHEN invoiced = 1 THEN '已开票'
--     WHEN invoiced = 0 THEN '暂未申请开票'
--     ELSE invoice_status
-- END
-- WHERE invoice_status IS NULL;

