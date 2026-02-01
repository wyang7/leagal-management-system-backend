package com.example.managementsystem.controller.support;

import com.example.managementsystem.dto.CaseCloseExtDTO;
import com.example.managementsystem.entity.CaseInfo;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Collection;

/**
 * 结案扩展信息(caseCloseExt)兼容工具：
 * - 读取时：如果新表存在数据，则把 DTO 序列化 JSON 覆盖到返回对象的 caseCloseExt 字段（仅用于返回，不落库）。
 * - 如果新表无数据，则保持旧字段不变（用于历史兼容）。
 */
public final class CaseCloseExtCompatHelper {

    private CaseCloseExtCompatHelper() {
    }

    public interface CaseCloseExtLoader {
        CaseCloseExtDTO load(CaseInfo caseInfo);
    }

    public static void fillCaseCloseExtForReturn(CaseInfo info, CaseCloseExtLoader loader, ObjectMapper mapper) {
        if (info == null || info.getCaseId() == null || loader == null || mapper == null) {
            return;
        }
        CaseCloseExtDTO dto = loader.load(info);
        if (dto == null) {
            return;
        }
        try {
            info.setCaseCloseExt(mapper.writeValueAsString(dto));
        } catch (Exception ignored) {
            // 返回兼容字段失败不影响主流程
        }
    }

    public static void fillCaseCloseExtForReturn(Collection<CaseInfo> list, CaseCloseExtLoader loader, ObjectMapper mapper) {
        if (list == null || list.isEmpty()) {
            return;
        }
        for (CaseInfo c : list) {
            fillCaseCloseExtForReturn(c, loader, mapper);
        }
    }
}

