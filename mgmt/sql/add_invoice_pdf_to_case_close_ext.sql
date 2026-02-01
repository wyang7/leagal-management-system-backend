-- 为结案扩展新表增加发票PDF字段
ALTER TABLE management_system.case_close_ext
    ADD COLUMN invoice_pdf VARCHAR(512) NULL COMMENT '发票PDF(OSS objectName, 例如 invoice/xxx.pdf)' AFTER payment_flows;

