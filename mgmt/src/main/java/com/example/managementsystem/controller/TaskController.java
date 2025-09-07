package com.example.managementsystem.controller;

import com.example.managementsystem.common.Result;
import com.example.managementsystem.entity.Task;
import com.example.managementsystem.service.ITaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * <p>
 * 任务表 前端控制器
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
@RestController
@RequestMapping("/task")
public class TaskController {

    @Autowired
    private ITaskService taskService;

    /**
     * 查询所有任务
     */
    @GetMapping
    public Result<List<Task>> getAllTasks() {
        return Result.success(taskService.list());
    }

    /**
     * 根据ID查询任务
     */
    @GetMapping("/{id}")
    public Result<Task> getTaskById(@PathVariable Long id) {
        Task task = taskService.getById(id);
        return task != null ? Result.success(task) : Result.fail("任务不存在");
    }

    /**
     * 新增任务
     */
    @PostMapping
    public Result<?> addTask(@RequestBody Task task) {
        boolean success = taskService.save(task);
        return success ? Result.success() : Result.fail("新增案件包失败");
    }

    /**
     * 更新任务
     */
    @PutMapping
    public Result<?> updateTask(@RequestBody Task task) {
        boolean success = taskService.updateById(task);
        return success ? Result.success() : Result.fail("更新任务失败");
    }

    /**
     * 删除任务
     */
    @DeleteMapping("/{id}")
    public Result<?> deleteTask(@PathVariable Long id) {
        boolean success = taskService.removeById(id);
        return success ? Result.success() : Result.fail("删除任务失败");
    }

    /**
     * 为任务关联案件
     */
    @PostMapping("/assign-cases")
    public Result<?> assignCasesToTask(@RequestBody Map<String, Object> params) {
        Long taskId = Long.parseLong(params.get("taskId").toString());
        List<Long> caseIds = (List<Long>) params.get("caseIds");
        
        boolean success = taskService.assignCasesToTask(taskId, caseIds);
        return success ? Result.success() : Result.fail("关联案件失败");
    }

    /**
     * 分页查询案件包列表
     */
    @GetMapping("/page")
    public Result<Map<String, Object>> getTaskPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String taskName,
            @RequestParam(required = false) String taskStatus) {
        return Result.success(taskService.getTaskPage(pageNum, pageSize,taskName,taskStatus));
    }

    /**
     * 分派案件包给用户
     */
    @PostMapping("/assign")
    public Result<?> assignTask(@RequestBody Map<String, Object> params) {
        Long taskId = Long.parseLong(params.get("taskId").toString());
        Long userId = Long.parseLong(params.get("userId").toString());
        boolean success = taskService.receiveTask(taskId, userId);
        return success ? Result.success() : Result.fail("分派案件包失败");
    }

    /**
     * 领取案件包
     */
    @PostMapping("/receive")
    public Result<?> receiveTask(@RequestBody Map<String, Object> params) {
        Long taskId = Long.parseLong(params.get("taskId").toString());
        Long userId = Long.parseLong(params.get("userId").toString());
        Task taskWithCases = taskService.getTaskWithCases(taskId);
        if (taskWithCases == null|| !"待领取".equals(taskWithCases.getStatus())) {
            return Result.fail("分派案件包失败，当前状态不允许领取");
        }
        boolean success = taskService.receiveTask(taskId, userId);
        return success ? Result.success() : Result.fail("领取案件包失败，当前案件已到达领取上限");
    }
}
