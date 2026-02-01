package com.example.managementsystem.dto;

import lombok.Data;

/**
 * 开票管理分页查询请求
 *
 * @author Copilot
 */
@Data
public class InvoiceCasePageRequest {
    private Integer pageNum = 1;
    private Integer pageSize = 10;

    /** 开票状态：待开票 / 已开票 */
    private String invoiceStatus;

    /** 万能搜索关键字（对齐案件管理的关键字搜索能力） */
    private String keyword;
}
