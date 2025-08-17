package com.example.managementsystem.controller;

import com.example.managementsystem.common.Result;
import com.example.managementsystem.dto.LoginDTO;
import com.example.managementsystem.dto.UserSession;
import com.example.managementsystem.entity.User;
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
        
        // 保存登录状态
        UserSession userSession = new UserSession();
        userSession.setUserId(user.getUserId());
        userSession.setUsername(user.getUsername());
        userSession.setRoleId(user.getRoleId());
        userSession.setLoginTime(new Date(System.currentTimeMillis()));

        session.setAttribute("currentUser", userSession);
        return Result.success(user);
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<?> register(@RequestBody LoginDTO loginDTO) {
        // 检查用户名是否已存在
        if (userService.existsByUsername(loginDTO.getUsername())) {
            return Result.fail("用户名已存在");
        }
        
        // 创建新用户
        User user = new User();
        user.setUsername(loginDTO.getUsername());
        // 密码加密存储
        user.setPassword(DigestUtils.md5DigestAsHex(
            loginDTO.getPassword().getBytes(StandardCharsets.UTF_8)
        ));
        user.setStatus(1); // 默认为正常状态
        user.setCreatedTime(new Date(System.currentTimeMillis()));
        user.setUpdatedTime(new Date(System.currentTimeMillis()));
        
        boolean success = userService.save(user);
        return success ? Result.success(true) : Result.fail("注册失败");
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