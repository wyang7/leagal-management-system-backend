package com.example.managementsystem.service;

import com.example.managementsystem.entity.CaseInfo;
import com.baomidou.mybatisplus.extension.service.IService;
import java.util.List;
import java.util.Map;
import com.example.managementsystem.dto.CasePageRequest;

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
    boolean receiveCase(Long caseId, Long userId, boolean isAssign);

    boolean returnCase(Long caseId, String returnReason);
    
    /**
     * 更新案件状态
     */
    boolean updateCaseStatus(Long caseId, String status);

    // 添加：根据案由前缀搜索
    List<CaseInfo> searchCasesByCaseNamePrefix(String caseName);

    List<CaseInfo> getMyCases(Long userId);

    List<CaseInfo> getAssistantCases(Long userId);


    String genCaseNumber(String courtReceiveTime);


    /**
     * 分页查询案件列表(新) 使用请求体封装参数
     * @param request 封装了查询参数的请求体
     * @return 包含总条数和当前页数据的Map
     */
    Map<String, Object> getCasePage(CasePageRequest request);


    /**
     * 批量更新案件的任务ID
     * @param caseIds 案件ID列表
     * @param taskId 任务ID，可为null表示取消关联
     * @return 成功更新的数量
     */
    int batchUpdateTaskId(List<Long> caseIds, Long taskId);

    int removeTaskId(Long caseId);

    List<CaseInfo> getCasesByStatusList(List<String> statusList,Integer taskId,String caseName,String station);

    boolean save(CaseInfo caseInfo);

    /**
     * 调解失败案件（更新状态、备注、退回法院时间）
     * @param caseId 案件ID
     * @param completionRemark 调解失败备注
     * @param returnCourtTime 退回法院时间
     * @param operatorId 操作人ID
     * @return 是否成功
     */
    boolean completeCase(Long caseId, String completionRemark, String returnCourtTime, Long operatorId);

    List<CaseInfo> getSelfReceivedCheckableCases();

    /**
     * 获取被分派且状态为已领取或反馈的案件
     */
    List<CaseInfo> getAssignedCheckableCases();

    /**
     * 批量更新退回法院时间
     * @param caseIds 案件ID列表
     * @param returnCourtTime 退回法院时间
     * @return 成功更新的数量
     */
    int batchUpdateReturnCourtTime(List<Long> caseIds, String returnCourtTime);

    /**
     * 写入案件操作历史
     */
    void addCaseHistory(Long caseId, String action, String afterStatus, String remarks, Long operatorId);

    /**
     * 批量更新案件状态
     * @param caseIds 案件ID列表
     * @param status 新状态
     * @param completionRemark 调解失败备注
     * @return 更新数量
     */
    int batchUpdateStatus(List<Integer> caseIds, String status, String completionRemark,Long operatorId);

    Integer getMaxReceiptNumber();

    // 原有：全局最大澎和号，保留以兼容老逻辑（如有其他地方使用）
    Integer getMaxPengheCaseNumber();

    /**
     * 查询本部/四季青的青枫号最大值（复用 penghe_case_number 字段）
     */
    Integer getMaxQingfengCaseNumber();

    /**
     * 查询非本部/四季青的澎和号最大值（复用 penghe_case_number 字段）
     */
    Integer getMaxPengheCaseNumberForOtherStations();

    /**
     * 查询本部最大收款单号（S0XX格式）
     */
    String getMaxReceiptNumberForBenbu();

    /**
     * 查询凯旋街道最大收款单号（KXX格式）
     */
    String getMaxReceiptNumberForKaixuan();

    /**
     * 查询闸弄口最大收款单号（ZXX格式）
     */
    String getMaxReceiptNumberForZhanongkou();
}
