package com.example.managementsystem.dto;

import lombok.Data;

/**
 * 案件分页查询请求封装
 */
@Data
public class CasePageRequest {
    // 分页参数
    private Integer pageNum = 1;
    private Integer pageSize = 10;

    // 过滤条件
    private String caseName;      // 案由
    private String status;        // 单个状态或特殊标识（我的案件/我的待办）
    /**
     * 多选状态列表：当不为空时，优先按照该列表过滤（涵盖多个业务状态）
     */
    private java.util.List<String> statusList;
    private String caseNumber;    // 案号
    private String plaintiff;     // 原告
    private String defendant;     // 被告
    private String userName;      // 处理人用户名
    private String assistant;     // 助理用户名
    private String receiveTimeStart; // 法院收案时间开始（yyyy-MM-dd）
    private String receiveTimeEnd;   // 法院收案时间结束（yyyy-MM-dd）
    private String station;       // 驻点

    // 排序
    private String sortField;     // 排序字段
    private String sortOrder;     // 排序顺序 asc/desc

    // 其他业务参数
    private Boolean timeout;      // 是否查询即将超时案件
    private String keyword;       // 万能搜索关键字
}
