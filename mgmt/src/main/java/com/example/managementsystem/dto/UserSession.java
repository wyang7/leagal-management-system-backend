package com.example.managementsystem.dto;

import java.io.Serializable;
import java.util.Date;

public class UserSession implements Serializable {
    private Long userId;
    private String username;
    private Long roleId;
    private Date loginTime;
    
    // 省略getter和setter方法


    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public Date getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(Date loginTime) {
        this.loginTime = loginTime;
    }
}