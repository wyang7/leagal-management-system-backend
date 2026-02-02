package com.example.managementsystem.dto;

import lombok.Data;

/**
 * 银行流水分页查询请求
 */
@Data
public class BankFlowPageRequest {
    private Integer pageNum;
    private Integer pageSize;

    /** 万能搜索（流水号/付款方/收款方/渠道/收款账号） */
    private String keyword;

    /** 案件号精确匹配过滤 */
    private String caseNumber;
}

