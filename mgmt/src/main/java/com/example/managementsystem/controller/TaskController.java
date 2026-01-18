package com.example.managementsystem.controller;

import com.example.managementsystem.common.Result;
import com.example.managementsystem.dto.UserSession;
import com.example.managementsystem.entity.Role;
import com.example.managementsystem.entity.Task;
import com.example.managementsystem.service.IRoleService;
import com.example.managementsystem.service.ITaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    @Autowired
    private IRoleService roleService;

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
        // 新增案件包默认状态为"待发布"
        if (task.getStatus() == null || task.getStatus().isEmpty()) {
            task.setStatus("待发布");
        }
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
            @RequestParam(required = false) String taskStatus,
            HttpSession session) {
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || !StringUtils.hasText(currentUser.getRoleIds())) {
            return Result.fail("未登录或角色信息缺失");
        }
        // 取第一个角色ID作为驻点判定基础，与 CaseInfoController / workspace.js 保持一致
        String[] roleIdArray = currentUser.getRoleIds().split(",");
        if (roleIdArray.length == 0 || !StringUtils.hasText(roleIdArray[0])) {
            return Result.fail("角色信息缺失");
        }
        long firstRoleId;
        try {
            firstRoleId = Long.parseLong(roleIdArray[0].trim());
        } catch (NumberFormatException e) {
            return Result.fail("角色信息格式错误");
        }
        Role role = roleService.getById(firstRoleId);
        if (role == null) {
            return Result.fail("角色信息不存在");
        }
        if ("临时调解员".equals(role.getRoleType())){
            Map<String, Object> result = new HashMap<>();
            result.put("total", 0);
            result.put("records", new ArrayList<>());
            result.put("pageNum", pageNum);
            result.put("pageSize", pageSize);
            return Result.success(result);
        }
        String station = role.getStation();
        return Result.success(taskService.getTaskPage(pageNum, pageSize, taskName, taskStatus, station));
    }

    /**
     * 分派案件包给用户
     */
    @PostMapping("/assign")
    public Result<?> assignTask(@RequestBody Map<String, Object> params, HttpSession session) {
        Long taskId = Long.parseLong(params.get("taskId").toString());
        Long userId = Long.parseLong(params.get("userId").toString());
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getUserId() == null) {
            return Result.fail("未登录或会话已过期，请重新登录");
        }
        Long operatorId = currentUser.getUserId();
        boolean success = taskService.receiveTask(taskId, userId,operatorId,true);
        return success ? Result.success() : Result.fail("分派案件包失败");
    }

    /**
     * 批量发布案件包（更新状态为待领取）
     */
    @PostMapping("/publish")
    public Result<?> publishTasks(@RequestBody Map<String, Object> params) {

        List<Integer> intTaskIds = (List<Integer>) params.get("taskIds");
        // 手动转换为List<Long>
        List<Long> taskIds = intTaskIds.stream()
                .map(Integer::longValue) // 每个Integer转为Long
                .collect(Collectors.toList());

        if (taskIds == null || taskIds.isEmpty()) {
            return Result.fail("请选择要发布的案件包");
        }
        try {
            boolean success = taskService.publishTasks(taskIds);
            return success ? Result.success() : Result.fail("发布案件包失败");
        }catch (Exception e) {
            return Result.fail("发布案件包异常：" + e.getMessage());
        }

    }

    /**
     * 领取案件包
     */
    @PostMapping("/receive")
    public Result<?> receiveTask(@RequestBody Map<String, Object> params, HttpSession session) {
        Long taskId = Long.parseLong(params.get("taskId").toString());
        Long userId = Long.parseLong(params.get("userId").toString());
        Task taskWithCases = taskService.getTaskWithCases(taskId);
        if (taskWithCases == null|| !"待领取".equals(taskWithCases.getStatus())) {
            return Result.fail("分派案件包失败，当前状态不允许领取");
        }

        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getUserId() == null) {
            return Result.fail("未登录或会话已过期，请重新登录");
        }
        Long operatorId = currentUser.getUserId();
        boolean success = taskService.receiveTask(taskId, userId,operatorId,false);
        return success ? Result.success() : Result.fail("领取案件包失败，当前案件已到达领取上限");
    }

    /**
     * 批量创建案件包
     */
    @PostMapping("/batch-create")
    public Result<?> batchCreateTasks(@RequestBody Map<String, Object> params) {
        List<String> names = (List<String>) params.get("names");
        String station = (String) params.get("station");
        if (names == null || names.isEmpty() || station == null || station.isEmpty()) {
            return Result.fail("参数错误");
        }
        try {
            for (String name : names) {
                Task task = new Task();
                task.setTaskName(name);
                task.setStation(station);
                task.setStatus("待发布");
                taskService.save(task);
            }
            return Result.success();
        } catch (Exception e) {
            return Result.fail("批量创建失败：" + e.getMessage());
        }
    }

    /**
     * 导出选中的案件包对应的案件（打平为按案件维度的列表）
     */
    @PostMapping("/export-cases")
    public void exportTaskCases(@RequestBody Map<String, Object> params, javax.servlet.http.HttpServletResponse response) {
        try {
            Object idsObj = params.get("taskIds");
            if (!(idsObj instanceof java.util.List)) {
                response.setStatus(400);
                return;
            }
            @SuppressWarnings("unchecked")
            java.util.List<Integer> intIds = (java.util.List<Integer>) idsObj;
            java.util.List<Long> taskIds = intIds.stream().map(Integer::longValue).collect(java.util.stream.Collectors.toList());
            if (taskIds.isEmpty()) {
                response.setStatus(400);
                return;
            }
            java.util.List<com.example.managementsystem.entity.CaseInfo> cases = taskService.getCasesByTaskIds(taskIds);
            String[] headers = {"案件包名(任务名)", "案件包归属", "领取人", "领取时间", "关联案件号"};
            org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("案件包案件导出");
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }
            int rowIdx = 1;
            for (com.example.managementsystem.entity.CaseInfo c : cases) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                int col = 0;
                row.createCell(col++).setCellValue(c.getTaskName() == null ? "" : c.getTaskName());
                row.createCell(col++).setCellValue(c.getCaseLocation() == null ? "" : c.getCaseLocation());
                row.createCell(col++).setCellValue(c.getUsername() == null ? "" : c.getUsername());
                row.createCell(col++).setCellValue(c.getReceiveTime() == null ? "" : c.getReceiveTime().toString());
                row.createCell(col++).setCellValue(c.getCaseNumber() == null ? "" : c.getCaseNumber());
            }
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            String filename = "案件包案件导出_" + java.time.LocalDate.now() + ".xlsx";
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=" + java.net.URLEncoder.encode(filename, "UTF-8"));
            workbook.write(response.getOutputStream());
            response.flushBuffer();
            workbook.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
