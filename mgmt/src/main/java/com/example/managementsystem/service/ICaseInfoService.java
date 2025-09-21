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
     * 通过caseId查询案件
     */
    CaseInfo getCaseById(Long caseId);

    /**
     * 领取案件
     */
    boolean receiveCase(Long caseId, Long userId);

    boolean returnCase(Long caseId, String returnReason);
    
    /**
     * 更新案件状态
     */
    boolean updateCaseStatus(Long caseId, String status);

    // 添加：根据案由前缀搜索
    List<CaseInfo> searchCasesByCaseNamePrefix(String caseName);

    List<CaseInfo> getMyCases(Long userId);

    List<CaseInfo> getAssistantCases(Long userId);


    String genCaseNumber();


    /**
     * 分页查询案件列表
     * @param pageNum 页码(从1开始)
     * @param pageSize 每页条数
     * @return 包含总条数和当前页数据的Map
     */
    Map<String, Object> getCasePage(String caseName,String status,Integer pageNum, Integer pageSize);


    /**
     * 批量更新案件的任务ID
     * @param caseIds 案件ID列表
     * @param taskId 任务ID，可为null表示取消关联
     * @return 成功更新的数量
     */
    int batchUpdateTaskId(List<Long> caseIds, Long taskId);

    int removeTaskId(Long caseId);

    List<CaseInfo> getCasesByStatusList(List<String> statusList,Integer taskId,String caseName);

    boolean save(CaseInfo caseInfo);
}
