package com.example.managementsystem.dto;

import lombok.Data;

/**
 * 案件分页查询请求封装
 *
 * @author example
 */
@Data
public class CasePageRequest {
    /** 分页参数：页码（从 1 开始） */
    private Integer pageNum = 1;
    /** 分页参数：每页条数 */
    private Integer pageSize = 10;

    /** 过滤条件：案由 */
    private String caseName;
    /** 过滤条件：单个状态或特殊标识（我的案件/我的待办） */
    private String status;
    /**
     * 多选状态列表：当不为空时，优先按该列表过滤（涵盖多个业务状态）
     */
    private java.util.List<String> statusList;
    /** 过滤条件：案号 */
    private String caseNumber;
    /** 过滤条件：原告 */
    private String plaintiff;
    /** 过滤条件：被告 */
    private String defendant;
    /** 过滤条件：处理人用户名 */
    private String userName;
    /** 过滤条件：助理用户名 */
    private String assistant;
    /** 过滤条件：法院收案时间开始（yyyy-MM-dd） */
    private String receiveTimeStart;
    /** 过滤条件：法院收案时间结束（yyyy-MM-dd） */
    private String receiveTimeEnd;
    /** 过滤条件：驻点 */
    private String station;
    /** 过滤条件：案件来源（上城法院本部、九堡法庭、笕桥法庭、综治中心） */
    private String caseSource;
    /** 过滤条件：案件包ID */
    private Long taskId;

    /** 排序字段 */
    private String sortField;
    /** 排序顺序 asc/desc */
    private String sortOrder;

    /** 是否查询即将超时案件 */
    private Boolean timeout;
    /** 万能搜索关键字 */
    private String keyword;
}
