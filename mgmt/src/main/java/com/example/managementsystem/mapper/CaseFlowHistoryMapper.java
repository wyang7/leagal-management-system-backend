package com.example.managementsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.managementsystem.entity.CaseFlowHistory;
import java.util.List;

/**
 * <p>
 * 案件流转历史记录表 Mapper 接口
 * </p>
 *
 * @author example
 * @since 2023-10-01
 */
public interface CaseFlowHistoryMapper extends BaseMapper<CaseFlowHistory> {

    /**
     * 根据案件ID查询历史记录
     * @param caseId 案件ID
     * @return 历史记录列表
     */
    List<CaseFlowHistory> selectByCaseId(Long caseId);
}