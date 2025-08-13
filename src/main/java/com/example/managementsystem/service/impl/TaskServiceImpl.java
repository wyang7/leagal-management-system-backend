package com.example.managementsystem.service.impl;

import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.entity.Task;
import com.example.managementsystem.mapper.TaskMapper;
import com.example.managementsystem.service.ICaseInfoService;
import com.example.managementsystem.service.ITaskService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * <p>
 * 任务表 服务实现类
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
@Service
public class TaskServiceImpl extends ServiceImpl<TaskMapper, Task> implements ITaskService {

    @Autowired
    private ICaseInfoService caseInfoService;

    @Override
    public Task getTaskWithCases(Long taskId) {
        Task task = getById(taskId);
        if (task != null) {
            List<CaseInfo> cases = caseInfoService.getCasesByTaskId(taskId);
            // 这里可以将案件信息设置到task对象中，或者返回一个包含案件的DTO
        }
        return task;
    }

    @Override
    public boolean assignCasesToTask(Long taskId, List<Long> caseIds) {
        if (caseIds == null || caseIds.isEmpty()) {
            return false;
        }
        
        // 更新案件的任务ID
        for (Long caseId : caseIds) {
            CaseInfo caseInfo = new CaseInfo();
            caseInfo.setCaseId(caseId);
            caseInfo.setTaskId(taskId);
            caseInfoService.updateById(caseInfo);
        }
        return true;
    }
}
