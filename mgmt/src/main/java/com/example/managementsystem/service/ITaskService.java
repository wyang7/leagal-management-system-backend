package com.example.managementsystem.service;

import com.example.managementsystem.entity.Task;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.managementsystem.entity.CaseInfo;
import java.util.List;

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
}
