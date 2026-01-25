package com.example.managementsystem.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.CollectionUtils;
import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.entity.Task;
import com.example.managementsystem.entity.User;
import com.example.managementsystem.mapper.CaseInfoMapper;
import com.example.managementsystem.mapper.TaskMapper;
import com.example.managementsystem.mapper.UserMapper;
import com.example.managementsystem.service.ICaseFlowHistoryService;
import com.example.managementsystem.service.ICaseInfoService;
import com.example.managementsystem.service.ITaskService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @Autowired
    private CaseInfoMapper caseInfoMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ICaseFlowHistoryService caseFlowHistoryService;

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





    /**
     * 领取案件包
     */
    @Override
    @Transactional
    public boolean receiveTask(Long taskId, Long userId, Long operateId, boolean isAssign) {

        if (!isAssign) {
            int count = caseInfoMapper.countActiveByUserId(userId);
            if (count > 12) {
                return false;
            }
//            int countReceive = caseInfoMapper.countActiveReceiveByUserId(userId,"self_receive");
//            if (countReceive > 3) {
//                return false;
//            }
            int countTask = baseMapper.countTasksReceivedByUser(userId, LocalDate.now());
            if (countTask > 0) {
                return false;
            }
        }
        Task task = getById(taskId);
        if (task == null) {
            return false;
        }

        // 1. 更新案件包状态为已领取，并写入领取时间
        task.setStatus("已领取");
        task.setOwnerId(userId);
        task.setReceiveTime(LocalDateTime.now());
        boolean taskUpdated = updateById(task);

        if (!taskUpdated) {
            return false;
        }

        // 2. 获取该案件包下的所有案件
        List<CaseInfo> cases = caseInfoService.getCasesByTaskId(taskId);
        if (cases.isEmpty()) {
            return true; // 没有案件也视为成功
        }

        // 3. 批量更新案件的处理人
        for (CaseInfo caseInfo : cases) {
            caseInfo.setUserId(userId);
            caseInfo.setStatus("已领取");
            if (isAssign){
                caseInfo.setReceiveType("assign");
            }else {
                caseInfo.setReceiveType("self_receive");
            }
            caseInfo.setReceiveTime(LocalDateTime.now());
        }

        boolean updateBoolean = caseInfoService.updateBatchById(cases);
        if (updateBoolean) {
            User user = userMapper.selectById(userId);
            for (CaseInfo caseInfo : cases) {
                caseFlowHistoryService.saveHistory(caseInfo.getCaseId(), operateId,user.getUsername(), "领取案件"
                , "待领取","已领取","");
            }
        }
        return updateBoolean;
    }

    /**
     * 分页查询案件包列表（包含状态）
     */
    @Override
    public Map<String, Object> getTaskPage(Integer pageNum, Integer pageSize
            ,String taskName,String taskStatus,List<String> stations) {
        int offset = (pageNum - 1) * pageSize;

        // 总部管理员：stations 为空 -> 不做驻点过滤
        boolean filterByStations = stations != null && !stations.isEmpty();

        int total;
        List<Task> records;
        if (filterByStations) {
            total = baseMapper.countAllTasksByStations(taskName, taskStatus, stations);
            records = baseMapper.selectTaskPageByStations(offset, pageSize, taskName, taskStatus, stations);
        } else {
            // 兼容旧逻辑：传 null 不过滤
            total = baseMapper.countAllTasks(taskName, taskStatus, null);
            records = baseMapper.selectTaskPage(offset, pageSize, taskName, taskStatus, null);
        }

        if (CollectionUtils.isNotEmpty(records)) {
            for (Task task : records) {
                int caseCount = caseInfoMapper.countByTaskId(task.getTaskId());
                task.setCaseCount(caseCount);
                User user = userMapper.selectById(task.getOwnerId());
                if (user != null) {
                    task.setOwnerName(user.getUsername());
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        result.put("records", records);
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        return result;
    }

    @Override
    @Transactional
    public boolean publishTasks(List<Long> taskIds) {
        if (taskIds == null || taskIds.isEmpty()) {
            return false;
        }
        taskIds.forEach(taskId -> {
            int i = caseInfoMapper.countByTaskId(taskId);
            if (i == 0) {
                throw new RuntimeException("案件包ID " + taskId + " 下没有案件，无法发布！");
            }
        });
        // 创建更新对象，将状态从待发布改为待领取
        Task updateTask = new Task();
        updateTask.setStatus("待领取");
        updateTask.setUpdatedTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        // 构建查询条件：只更新状态为"待发布"的案件包
        QueryWrapper<Task> queryWrapper = new QueryWrapper<>();
        queryWrapper.in("task_id", taskIds);
        queryWrapper.eq("status", "待发布");

        // 执行批量更新
        return update(updateTask, queryWrapper);
    }

    @Override
    public java.util.List<CaseInfo> getCasesByTaskIds(java.util.List<Long> taskIds) {
        if (taskIds == null || taskIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return caseInfoMapper.selectByTaskIdsWithTaskInfo(taskIds);
    }
}
