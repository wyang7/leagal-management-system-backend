package com.example.managementsystem.service;

import com.example.managementsystem.entity.Task;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;
import java.util.Map;

/**
 * <p>
 * 任务表 服务类
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
public interface ITaskService extends IService<Task> {

    /**
     * 获取任务及关联的案件
     */
    Task getTaskWithCases(Long taskId);
    
    /**
     * 为任务关联案件
     */
    boolean assignCasesToTask(Long taskId, List<Long> caseIds);


    // 新增方法：领取案件包
    boolean receiveTask(Long taskId, Long userId, Long operateId, boolean isAssign);

    /**
     * 分页查询案件包列表（包含状态）
     * @param stations 允许查看的驻点列表；总部用户传 null 或空表示不过滤
     * @param caseSource 案件来源过滤；可为空表示不过滤
     */
    Map<String, Object> getTaskPage(Integer pageNum, Integer pageSize,String taskName,String taskStatus,List<String> stations, String caseSource);

    /**
     * 批量发布案件包（将状态从待发布改为待领取）
     */
    boolean publishTasks(List<Long> taskIds);

    /**
     * 根据多个任务ID获取其下所有案件，用于导出
     */
    java.util.List<com.example.managementsystem.entity.CaseInfo> getCasesByTaskIds(java.util.List<Long> taskIds);
}
