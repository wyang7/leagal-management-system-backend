-- 新建案件结案扩展信息表（从 case_info.case_close_ext 拆分）
-- 说明：使用 case_id 与 case_info(case_id) 关联；每个 caseId 至多一条记录。

CREATE TABLE IF NOT EXISTS management_system.case_close_ext (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    case_id BIGINT NOT NULL COMMENT '关联 case_info.case_id',

    sign_date VARCHAR(32) NULL COMMENT '签字时间(yyyy-MM-dd)',

    adjusted_amount DECIMAL(18,2) NULL COMMENT '调成标的额',
    mediation_fee DECIMAL(18,2) NULL COMMENT '调解费(总额)',
    plaintiff_mediation_fee DECIMAL(18,2) NULL COMMENT '原告调解费',
    defendant_mediation_fee DECIMAL(18,2) NULL COMMENT '被告调解费',

    payer VARCHAR(32) NULL COMMENT '支付方：原告/被告/原被告',
    invoiced TINYINT(1) NULL COMMENT '是否开票',
    invoice_info TEXT NULL COMMENT '开票信息',

    payment_flows LONGTEXT NULL COMMENT '付款流水(JSON: List<CaseCloseExtDTO.PaymentFlow>)',

    created_time VARCHAR(32) NULL COMMENT '创建时间 yyyy-MM-dd HH:mm:ss',
    updated_time VARCHAR(32) NULL COMMENT '更新时间 yyyy-MM-dd HH:mm:ss',

    PRIMARY KEY (id),
    UNIQUE KEY uk_case_close_ext_case_id (case_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='案件结案扩展信息(case_close_ext)';

