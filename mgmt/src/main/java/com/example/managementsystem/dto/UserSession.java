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

    /**
     * 管理员案件管理权限：案件来源 -> 允许查看的归属地列表。
     * 形如：[{caseSource:"九堡法庭", stations:["九堡","彭埠"]}, {caseSource:"综治中心", stations:["闸弄口"]}]
     *
     * 说明：
     * - 该字段由 /auth/currentUser 返回，用于前端控制菜单/Tab 可见性。
     * - 若用户拥有 station=总部 的管理员角色，可直接返回 null/空并由前端放开全部，或返回全量。
     */
    private java.util.List<CaseSourceStationPerm> caseSourceStationPerms;

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

    public java.util.List<CaseSourceStationPerm> getCaseSourceStationPerms() {
        return caseSourceStationPerms;
    }

    public void setCaseSourceStationPerms(java.util.List<CaseSourceStationPerm> caseSourceStationPerms) {
        this.caseSourceStationPerms = caseSourceStationPerms;
    }

    public static class CaseSourceStationPerm implements java.io.Serializable {
        private String caseSource;
        private java.util.List<String> stations;

        public String getCaseSource() {
            return caseSource;
        }

        public void setCaseSource(String caseSource) {
            this.caseSource = caseSource;
        }

        public java.util.List<String> getStations() {
            return stations;
        }

        public void setStations(java.util.List<String> stations) {
            this.stations = stations;
        }
    }
}

