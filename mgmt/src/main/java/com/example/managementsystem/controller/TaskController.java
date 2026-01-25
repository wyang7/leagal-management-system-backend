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
import java.util.*;
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
     * 判断当前用户是否为“总部管理员”：1）roleType 包含“管理员”；2）station 列表中包含“总部”
     */
    private boolean isHeadquartersAdmin(UserSession currentUser) {
        if (currentUser == null) {
            return false;
        }
        String roleType = currentUser.getRoleType();
        String stationStr = currentUser.getStation();
        boolean isAdmin = StringUtils.hasText(roleType) && roleType.contains("管理员");
        if (!isAdmin) {
            return false;
        }
        if (!StringUtils.hasText(stationStr)) {
            return false;
        }
        List<String> stations = Arrays.stream(stationStr.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .collect(Collectors.toList());
        return stations.contains("总部");
    }

    /**
     * 从当前用户的所有角色中汇总驻点（去重）。
     * 注意：当前项目中 UserSession.station 也会存放逗号分隔驻点，这里优先使用 station；
     * 若 station 为空则回退到 roleIds -> role.station 汇总。
     */
    private List<String> resolveUserStations(UserSession currentUser) {
        if (currentUser == null) {
            return Collections.emptyList();
        }
        if (StringUtils.hasText(currentUser.getStation())) {
            return Arrays.stream(currentUser.getStation().split(","))
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .distinct()
                    .collect(Collectors.toList());
        }
        if (!StringUtils.hasText(currentUser.getRoleIds())) {
            return Collections.emptyList();
        }
        String[] roleIdArray = currentUser.getRoleIds().split(",");
        Set<String> stations = new LinkedHashSet<>();
        for (String ridStr : roleIdArray) {
            if (!StringUtils.hasText(ridStr)) {
                continue;
            }
            try {
                Long rid = Long.parseLong(ridStr.trim());
                Role r = roleService.getById(rid);
                if (r != null && StringUtils.hasText(r.getStation())) {
                    stations.add(r.getStation().trim());
                }
            } catch (NumberFormatException ignore) {
                // ignore invalid role id
            }
        }
        return new ArrayList<>(stations);
    }

    private Result<?> requireHeadquartersAdmin(HttpSession session) {
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null) {
            return Result.fail("未登录或会话已过期，请重新登录");
        }
        if (!isHeadquartersAdmin(currentUser)) {
            return Result.fail("无权限：仅总部管理员可执行该操作");
        }
        return null; // ok
    }

    /**
     * 新增任务（案件包）- 仅总部管理员
     */
    @PostMapping
    public Result<?> addTask(@RequestBody Task task, HttpSession session) {
        Result<?> auth = requireHeadquartersAdmin(session);
        if (auth != null) {
            return auth;
        }
        // 新增案件包默认状态为"待发布"
        if (task.getStatus() == null || task.getStatus().isEmpty()) {
            task.setStatus("待发布");
        }
        boolean success = taskService.save(task);
        return success ? Result.success() : Result.fail("新增案件包失败");
    }

    /**
     * 更新任务（案件包）- 仅总部管理员
     */
    @PutMapping
    public Result<?> updateTask(@RequestBody Task task, HttpSession session) {
        Result<?> auth = requireHeadquartersAdmin(session);
        if (auth != null) {
            return auth;
        }
        boolean success = taskService.updateById(task);
        return success ? Result.success() : Result.fail("更新任务失败");
    }

    /**
     * 删除任务（案件包）- 仅总部管理员
     */
    @DeleteMapping("/{id}")
    public Result<?> deleteTask(@PathVariable Long id, HttpSession session) {
        Result<?> auth = requireHeadquartersAdmin(session);
        if (auth != null) {
            return auth;
        }
        boolean success = taskService.removeById(id);
        return success ? Result.success() : Result.fail("删除任务失败");
    }

    /**
     * 为任务关联案件 - 仅总部管理员
     */
    @PostMapping("/assign-cases")
    public Result<?> assignCasesToTask(@RequestBody Map<String, Object> params, HttpSession session) {
        Result<?> auth = requireHeadquartersAdmin(session);
        if (auth != null) {
            return auth;
        }
        Long taskId = Long.parseLong(params.get("taskId").toString());
        @SuppressWarnings("unchecked")
        List<Long> caseIds = (List<Long>) params.get("caseIds");

        boolean success = taskService.assignCasesToTask(taskId, caseIds);
        return success ? Result.success() : Result.fail("关联案件失败");
    }

    /**
     * 分页查询案件包列表
     * - 总部管理员：可查看全部驻点
     * - 非总部管理员：仅能查看自己驻点的案件包（A用户拥有彭埠、笕桥权限 -> 只能看到这两个驻点）
     */
    @GetMapping("/page")
    public Result<Map<String, Object>> getTaskPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String taskName,
            @RequestParam(required = false) String taskStatus,
            HttpSession session) {
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null) {
            return Result.fail("未登录或会话已过期，请重新登录");
        }

        // 临时调解员不展示案件包（保持原有规则）
        // 这里用 roleType 兜底判断（UserSession.roleType 可能是逗号分隔）
        if (StringUtils.hasText(currentUser.getRoleType()) && currentUser.getRoleType().contains("临时调解员")) {
            Map<String, Object> result = new HashMap<>();
            result.put("total", 0);
            result.put("records", new ArrayList<>());
            result.put("pageNum", pageNum);
            result.put("pageSize", pageSize);
            return Result.success(result);
        }

        boolean hqAdmin = isHeadquartersAdmin(currentUser);
        List<String> userStations = resolveUserStations(currentUser);
        return Result.success(taskService.getTaskPage(pageNum, pageSize, taskName, taskStatus,
                hqAdmin ? null : userStations));
    }

    /**
     * 分派案件包给用户 - 仅总部管理员
     */
    @PostMapping("/assign")
    public Result<?> assignTask(@RequestBody Map<String, Object> params, HttpSession session) {
        Result<?> auth = requireHeadquartersAdmin(session);
        if (auth != null) {
            return auth;
        }
        Long taskId = Long.parseLong(params.get("taskId").toString());
        Long userId = Long.parseLong(params.get("userId").toString());
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        Long operatorId = currentUser.getUserId();
        boolean success = taskService.receiveTask(taskId, userId, operatorId, true);
        return success ? Result.success() : Result.fail("分派案件包失败");
    }

    /**
     * 批量发布案件包（更新状态为待领取）- 仅总部管理员
     */
    @PostMapping("/publish")
    public Result<?> publishTasks(@RequestBody Map<String, Object> params, HttpSession session) {
        Result<?> auth = requireHeadquartersAdmin(session);
        if (auth != null) {
            return auth;
        }

        @SuppressWarnings("unchecked")
        List<Integer> intTaskIds = (List<Integer>) params.get("taskIds");
        List<Long> taskIds = intTaskIds.stream().map(Integer::longValue).collect(Collectors.toList());

        if (taskIds.isEmpty()) {
            return Result.fail("请选择要发布的案件包");
        }
        try {
            boolean success = taskService.publishTasks(taskIds);
            return success ? Result.success() : Result.fail("发布案件包失败");
        } catch (Exception e) {
            return Result.fail("发布案件包异常：" + e.getMessage());
        }
    }

    /**
     * 批量创建案件包 - 仅总部管理员
     */
    @PostMapping("/batch-create")
    public Result<?> batchCreateTasks(@RequestBody Map<String, Object> params, HttpSession session) {
        Result<?> auth = requireHeadquartersAdmin(session);
        if (auth != null) {
            return auth;
        }
        @SuppressWarnings("unchecked")
        List<String> names = (List<String>) params.get("names");
        String station = (String) params.get("station");
        if (names == null || names.isEmpty() || !StringUtils.hasText(station)) {
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
    public void exportTaskCases(@RequestBody Map<String, Object> params,
                                javax.servlet.http.HttpServletResponse response,
                                HttpSession session) {
        try {
            UserSession currentUser = (UserSession) session.getAttribute("currentUser");
            if (currentUser == null) {
                response.setStatus(401);
                return;
            }
            // 仅管理员允许进入案件包管理导出（与前端入口一致）
            if (!StringUtils.hasText(currentUser.getRoleType()) || !currentUser.getRoleType().contains("管理员")) {
                response.setStatus(403);
                return;
            }

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

            boolean hqAdmin = isHeadquartersAdmin(currentUser);
            if (!hqAdmin) {
                // 非总部管理员：只能导出自己驻点范围内的案件包
                java.util.Set<String> allowedStations = new java.util.HashSet<>(resolveUserStations(currentUser));
                for (Long taskId : taskIds) {
                    Task t = taskService.getById(taskId);
                    if (t == null) {
                        response.setStatus(404);
                        return;
                    }
                    String st = t.getStation();
                    // 兼容九堡彭埠映射：允许 stations 含“九堡彭埠”时导出 station 为 九堡/彭埠/九堡彭埠
                    if ("九堡".equals(st) || "彭埠".equals(st)) {
                        if (!allowedStations.contains("九堡彭埠") && !allowedStations.contains(st)) {
                            response.setStatus(403);
                            return;
                        }
                    } else {
                        if (st != null && !allowedStations.contains(st)) {
                            response.setStatus(403);
                            return;
                        }
                    }
                }
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
}
