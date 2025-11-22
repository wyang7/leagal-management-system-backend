-- 添加结案扩展 JSON 字段
ALTER TABLE management_system.case_info ADD COLUMN case_close_ext TEXT COMMENT '结案扩展信息JSON: CaseCloseExtDTO';

