-- 银行流水管理：新建表
-- 用途：存储银行流水，后续可通过 case_number 绑定到案件

CREATE TABLE IF NOT EXISTS management_system.bank_flow (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',

    flow_no VARCHAR(64) NOT NULL COMMENT '流水号',
    trade_time VARCHAR(32) NULL COMMENT '交易时间(建议 yyyy-MM-dd HH:mm:ss)',
    trade_amount DECIMAL(18,2) NULL COMMENT '交易金额',
    payer VARCHAR(128) NULL COMMENT '付款方',
    payee VARCHAR(128) NULL COMMENT '收款方',
    channel VARCHAR(64) NULL COMMENT '交易渠道',
    payee_account VARCHAR(64) NULL COMMENT '收款账号',

    case_number VARCHAR(64) NULL COMMENT '案件号（用于后续绑定案件）',

    created_time VARCHAR(32) NULL COMMENT '创建时间 yyyy-MM-dd HH:mm:ss',
    updated_time VARCHAR(32) NULL COMMENT '更新时间 yyyy-MM-dd HH:mm:ss',

    PRIMARY KEY (id),
    UNIQUE KEY uk_bank_flow_flow_no (flow_no),
    KEY idx_bank_flow_case_number (case_number),
    KEY idx_bank_flow_trade_time (trade_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='银行流水(bank_flow)';

