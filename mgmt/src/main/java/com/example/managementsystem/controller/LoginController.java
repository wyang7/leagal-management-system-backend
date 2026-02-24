package com.example.managementsystem.controller;

import com.example.managementsystem.common.Result;
import com.example.managementsystem.dto.LoginDTO;
import com.example.managementsystem.dto.UserSession;
import com.example.managementsystem.entity.Role;
import com.example.managementsystem.entity.User;
import com.example.managementsystem.entity.UserRole;
import com.example.managementsystem.mapper.UserRoleMapper;
import com.example.managementsystem.service.IRoleService;
import com.example.managementsystem.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.DigestUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.nio.charset.StandardCharsets;
import java.sql.Date;

@RestController
@RequestMapping("/auth")
public class LoginController {

    @Autowired
    private IUserService userService;

    @Autowired
    private IRoleService roleService;

    @Autowired
    private UserRoleMapper userRoleMapper;



    /**
     * 获取当前登录用户信息
     */
    @GetMapping("/currentUser")
    public Result<UserSession> getCurrentUser(HttpSession session) {
        // 从session中获取用户信息，假设登录时已将用户信息存入session
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");

        if (currentUser != null) {
            return Result.success(currentUser);
        } else {
            return Result.fail("未登录或会话已过期");
        }
    }

    /**
     * 检查登录状态
     */
    @GetMapping("/checkLogin")
    public Result<?> checkLogin(HttpSession session) {
        if (session.getAttribute("loginUser") != null) {
            return Result.success();
        }
        return Result.fail("未登录");
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<?> login(@RequestBody LoginDTO loginDTO, HttpSession session) {
        // 密码加密（MD5）
        String encryptedPassword = DigestUtils.md5DigestAsHex(
            loginDTO.getPassword().getBytes(StandardCharsets.UTF_8)
        );
        
        // 查询用户
        User user = userService.getUserByUsernameAndPassword(
            loginDTO.getUsername(), 
            encryptedPassword
        );
        
        if (user == null) {
            return Result.fail("用户名或密码错误");
        }
        
        if (user.getStatus() == 0) {
            return Result.fail("账号已禁用，请联系管理员");
        }

        // 查询用户所有角色
        java.util.List<UserRole> relations = userRoleMapper.selectByUserIds(java.util.Collections.singletonList(user.getUserId()));
        if (relations == null || relations.isEmpty()) {
            return Result.fail("用户未绑定角色，请联系管理员");
        }
        java.util.List<Long> roleIds = new java.util.ArrayList<>();
        for (UserRole ur : relations) {
            roleIds.add(ur.getRoleId());
        }
        java.util.List<Role> roles = roleService.listByIds(roleIds);
        if (roles == null || roles.isEmpty()) {
            return Result.fail("用户角色无效，请联系管理员");
        }
        java.util.List<String> idStrs = new java.util.ArrayList<>();
        java.util.List<String> names = new java.util.ArrayList<>();
        java.util.List<String> types = new java.util.ArrayList<>();
        java.util.List<String> stations = new java.util.ArrayList<>();

        // 新增：聚合管理员的来源-归属地权限
        java.util.Map<String, java.util.Set<String>> casePerms = new java.util.HashMap<>();
        boolean hasHqAdmin = false;

        for (Role r : roles) {
            idStrs.add(String.valueOf(r.getRoleId()));
            names.add(r.getRoleName());
            types.add(r.getRoleType());
            if (r.getStation() != null && !r.getStation().isEmpty()) {
                stations.add(r.getStation());
            }

            // 总部管理员：放开全部
            if (r.getRoleType() != null && r.getRoleType().contains("管理员")) {
                if (r.getStation() != null && r.getStation().contains("总部")) {
                    hasHqAdmin = true;
                }
                String src = r.getCaseSource();
                String st = r.getStation();
                if (src != null && !src.trim().isEmpty()) {
                    casePerms.computeIfAbsent(src.trim(), k -> new java.util.HashSet<>());
                    // 归属地允许多个：用逗号分隔（例如 "闸弄口" 或 "九堡,彭埠"）
                    if (st != null && !st.trim().isEmpty()) {
                        String[] parts = st.split(",");
                        for (String p : parts) {
                            String v = p == null ? "" : p.trim();
                            if (!v.isEmpty() && !"总部".equals(v)) {
                                casePerms.get(src.trim()).add(v);
                            }
                        }
                    }
                }
            }
        }

        // 保存登录状态
        UserSession userSession = new UserSession();
        userSession.setUserId(user.getUserId());
        userSession.setUsername(user.getUsername());
        userSession.setRoleIds(String.join(",", idStrs));
        userSession.setRoleName(String.join(",", names));
        userSession.setRoleType(String.join(",", types));
        // 若存在多个驻点，前端可以自行解析，这里简单用逗号拼接
        userSession.setStation(String.join(",", stations));
        userSession.setLoginTime(new Date(System.currentTimeMillis()));

        // 写入权限到 session 返回值
        if (!hasHqAdmin && !casePerms.isEmpty()) {
            java.util.List<UserSession.CaseSourceStationPerm> perms = new java.util.ArrayList<>();
            for (java.util.Map.Entry<String, java.util.Set<String>> e : casePerms.entrySet()) {
                UserSession.CaseSourceStationPerm p = new UserSession.CaseSourceStationPerm();
                p.setCaseSource(e.getKey());
                p.setStations(new java.util.ArrayList<>(e.getValue()));
                perms.add(p);
            }
            userSession.setCaseSourceStationPerms(perms);
        }

        session.setAttribute("currentUser", userSession);
        session.setAttribute("loginUser", user);
        return Result.success(user);
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<?> register(@RequestBody LoginDTO loginDTO) {
        // 检查用户名是否已存在
        if (userService.existsByUsername(loginDTO.getUsername())|| loginDTO.getPassword()==null) {
            return Result.fail("用户名已存在或密码为空");
        }
        
        // 创建新用户
        User user = new User();
        user.setUsername(loginDTO.getUsername());
        // user.setRoleId(loginDTO.getRoleId()); // 不再直接使用单一角色字段
        // 密码加密存储
        user.setPassword(DigestUtils.md5DigestAsHex(
            loginDTO.getPassword().getBytes(StandardCharsets.UTF_8)
        ));
        user.setStatus(1); // 默认为正常状态
        user.setCreatedTime(new Date(System.currentTimeMillis()));
        user.setUpdatedTime(new Date(System.currentTimeMillis()));
        
        boolean success = userService.save(user);
        if (!success) {
            return Result.fail("注册失��");
        }
        // 如果注册时传了 roleId，建立一条默认关联
        if (loginDTO.getRoleId() != null) {
            UserRole ur = new UserRole();
            ur.setUserId(user.getUserId());
            ur.setRoleId(loginDTO.getRoleId());
            userRoleMapper.insert(ur);
        }
        return Result.success(true);
    }

    /**
     * 退出登录
     */
    @PostMapping("/logout")
    public Result<?> logout(HttpSession session) {
        session.invalidate();
        return Result.success();
    }
}