CREATE TABLE management_system.case_payment_flow (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    case_id BIGINT NOT NULL COMMENT '案件ID，关联case_info/case_close_ext',
    screenshot_url VARCHAR(255) COMMENT '付款截图URL',
    screenshot_url_type VARCHAR(32) COMMENT '截图地址类型',
    channel VARCHAR(64) COMMENT '付款渠道',
    pay_time DATETIME COMMENT '付款时间',
    amount DECIMAL(10,2) COMMENT '付款金额',
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT fk_case_payment_flow_case_id FOREIGN KEY (case_id) REFERENCES management_system.case_info(case_id) ON DELETE CASCADE
) COMMENT='案件付款流水表';

