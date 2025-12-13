package com.example.managementsystem.dto;

import java.io.Serializable;
import java.util.Date;

public class UserSession implements Serializable {
    private Long userId;
    private String username;
    /**
     * 多角色ID，逗号分隔，例如 "1,2,3"
     */
    private String roleIds;
    /**
     * 多角色名称，逗号分隔
     */
    private String roleName;
    /**
     * 多角色类型，逗号分隔
     */
    private String roleType;
    private String station;
    private Date loginTime;

    public String getStation() {
        return station;
    }
    public void setStation(String station) {
        this.station = station;
    }

    public String getRoleType() {
        return roleType;
    }

    public void setRoleType(String roleType) {
        this.roleType = roleType;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

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

    public String getRoleIds() {
        return roleIds;
    }

    public void setRoleIds(String roleIds) {
        this.roleIds = roleIds;
    }

    public Date getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(Date loginTime) {
        this.loginTime = loginTime;
    }
}