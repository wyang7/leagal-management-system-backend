-- 添加人调号字段（格式：2026彭人003）
ALTER TABLE management_system.case_info
    ADD COLUMN mediate_case_number VARCHAR(32) NULL COMMENT '人调号(提交结案审核/结案时生成，格式：yyyy彭人NNN)';

-- 可选：加索引，便于按人调号检索/唯一性约束（如确认全局唯一可打开唯一索引）
-- CREATE UNIQUE INDEX uk_case_info_mediate_case_number ON management_system.case_info(mediate_case_number);

