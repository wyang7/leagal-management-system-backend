package com.example.managementsystem.service;

import com.example.managementsystem.entity.CaseCloseExt;

/**
 * 结案扩展信息服务：直接操作 case_close_ext 表，逐步替代通过 CaseInfo.caseCloseExt(JSON) 的写入入口。
 */
public interface ICaseCloseExtService {

    /**
     * 根据 caseId 查询结案扩展信息
     */
    CaseCloseExt getByCaseId(Long caseId);

    /**
     * 保存或更新结案扩展信息（按 caseId upsert）
     */
    void saveOrUpdateByCaseId(Long caseId, CaseCloseExt ext);
}

