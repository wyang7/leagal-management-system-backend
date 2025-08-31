package com.example.managementsystem.service;

import com.example.managementsystem.entity.Task;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.managementsystem.entity.CaseInfo;
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

    // 新增方法：分派案件包给指定用户
    boolean assignTask(Long taskId, Long userId);

    // 新增方法：领取案件包
    boolean receiveTask(Long taskId, Long userId);

    // 新增方法：获取案件包及状态信息
    Map<String, Object> getTaskPage(Integer pageNum, Integer pageSize,String taskName,String taskStatus);
}
