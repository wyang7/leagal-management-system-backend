package com.example.managementsystem.service.impl;

import com.example.managementsystem.entity.CaseCloseExt;
import com.example.managementsystem.mapper.CaseCloseExtMapper;
import com.example.managementsystem.service.ICaseCloseExtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 结案扩展信息服务实现：直接操作 case_close_ext 表。
 */
@Service
public class CaseCloseExtServiceImpl implements ICaseCloseExtService {

    @Autowired
    private CaseCloseExtMapper caseCloseExtMapper;

    @Override
    public CaseCloseExt getByCaseId(Long caseId) {
        if (caseId == null) {
            return null;
        }
        return caseCloseExtMapper.selectByCaseId(caseId);
    }

    @Override
    public void saveOrUpdateByCaseId(Long caseId, CaseCloseExt ext) {
        if (caseId == null || ext == null) {
            return;
        }
        // 确保实体上有 caseId
        ext.setCaseId(caseId);
        CaseCloseExt existing = caseCloseExtMapper.selectByCaseId(caseId);
        String now = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        if (existing == null) {
            ext.setCreatedTime(now);
            ext.setUpdatedTime(now);
            caseCloseExtMapper.insert(ext);
        } else {
            ext.setId(existing.getId());
            // 保留原创建时间
            ext.setCreatedTime(existing.getCreatedTime());
            ext.setUpdatedTime(now);
            caseCloseExtMapper.updateById(ext);
        }
    }
}

