package com.example.managementsystem.service;

import com.example.managementsystem.entity.CaseInfo;
import com.baomidou.mybatisplus.extension.service.IService;
import java.util.List;
import java.util.Map;

/**
 * <p>
 * 案件表 服务类
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
public interface ICaseInfoService extends IService<CaseInfo> {

    /**
     * 根据任务ID查询案件
     */
    List<CaseInfo> getCasesByTaskId(Long taskId);
    
    /**
     * 根据用户ID查询案件
     */
    List<CaseInfo> getCasesByUserId(Long userId);
    
    /**
     * 根据状态查询案件
     */
    List<CaseInfo> getCasesByStatus(String status);
    
    /**
     * 领取案件
     */
    boolean receiveCase(Long caseId, Long userId);
    
    /**
     * 更新案件状态
     */
    boolean updateCaseStatus(Long caseId, String status);

    // 添加：根据案由前缀搜索
    List<CaseInfo> searchCasesByCaseNamePrefix(String caseName);

    List<CaseInfo> getMyCases(Long userId);


    String genCaseNumber();

}
