-- 添加收款单号与澎和案件号字段
ALTER TABLE management_system.case_info ADD COLUMN receipt_number INT NULL COMMENT '收款单号(提交结案审核时生成,起始818)';
ALTER TABLE management_system.case_info ADD COLUMN penghe_case_number INT NULL COMMENT '澎和案件号(司法确认结案方式生成,起始689)';
ALTER TABLE case_info MODIFY COLUMN receipt_number VARCHAR(16);
ALTER TABLE management_system.case_info
    MODIFY COLUMN case_location ENUM('九堡','彭埠','笕桥','本部','四季青','闸弄口','凯旋街道')
    COMMENT '案件归属地';
