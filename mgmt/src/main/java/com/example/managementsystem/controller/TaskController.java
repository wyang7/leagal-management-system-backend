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
        return success ? Result.success() : Result.fail("新增任务失败");
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
}
