package com.example.managementsystem.controller;

import com.example.managementsystem.common.Result;
import com.example.managementsystem.entity.Role;
import com.example.managementsystem.service.IRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * <p>
 * 角色表 前端控制器
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
@RestController
@RequestMapping("/role")
public class RoleController {

    @Autowired
    private IRoleService roleService;

    /**
     * 查询所有角色
     */
    @GetMapping
    public Result<List<Role>> getAllRoles() {
        return Result.success(roleService.list());
    }

    /**
     * 根据ID查询角色
     */
    @GetMapping("/{id}")
    public Result<Role> getRoleById(@PathVariable Long id) {
        Role role = roleService.getById(id);
        return role != null ? Result.success(role) : Result.fail("角色不存在");
    }

    /**
     * 新增角色
     */
    @PostMapping
    public Result<?> addRole(@RequestBody Role role) {
        boolean success = roleService.save(role);
        return success ? Result.success() : Result.fail("新增角色失败");
    }

    /**
     * 更新角色
     */
    @PutMapping
    public Result<?> updateRole(@RequestBody Role role) {
        boolean success = roleService.updateById(role);
        return success ? Result.success() : Result.fail("更新角色失败");
    }

    /**
     * 删除角色
     */
    @DeleteMapping("/{id}")
    public Result<?> deleteRole(@PathVariable Long id) {
        boolean success = roleService.removeById(id);
        return success ? Result.success() : Result.fail("删除角色失败");
    }

    /**
     * 为角色分配用户
     */
    @PostMapping("/assign-users")
    public Result<?> assignUsersToRole(@RequestBody Map<String, Object> params) {
        Long roleId = Long.parseLong(params.get("roleId").toString());
        List<Long> userIds = (List<Long>) params.get("userIds");
        
        boolean success = roleService.assignUsersToRole(roleId, userIds);
        return success ? Result.success() : Result.fail("分配用户失败");
    }
}
