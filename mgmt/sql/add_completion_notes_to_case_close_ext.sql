-- 为 case_close_ext 增加“结案方式”字段
-- 说明：历史上结案方式一直存储在 case_info.completion_notes（且会追加时间/操作人等），
--      新需求需要把“结案方式（枚举）”单独存到结案扩展表，以便前端回填展示。
--      建议：新表字段只保存本次/最新的结案方式：司法确认/撤诉/民初/其他

ALTER TABLE management_system.case_close_ext
    ADD COLUMN completion_notes VARCHAR(32) NULL COMMENT '结案方式：司法确认/撤诉/民初/其他' AFTER case_id;

