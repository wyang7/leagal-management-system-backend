package com.example.managementsystem.mapper;

import com.example.managementsystem.entity.CaseInfo;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * <p>
 * 案件表 Mapper 接口
 * </p>
 *
 * @author example
 * @since 2023-07-10
 */
public interface CaseInfoMapper extends BaseMapper<CaseInfo> {

    /**
     * 根据任务ID查询案件
     */
    List<CaseInfo> selectByTaskId(@Param("taskId") Long taskId);

    CaseInfo selectByCaseId(@Param("caseId") Long caseId);
    
    /**
     * 根据用户ID查询案件
     */
    List<CaseInfo> selectByUserId(@Param("userId") Long userId);

    /**
     * 移除案件包
     */
    int removeTaskId(@Param("caseId") Long caseId);
    
    /**
     * 根据状态查询案件
     */
    List<CaseInfo> selectByStatus(@Param("status") String status);

    // 添加：根据案由前缀模糊搜索
    List<CaseInfo> selectByCaseNameLikePrefix(@Param("caseName") String caseName);

    // 新增：关联查询案件列表（包含处理人用户名）
    List<CaseInfo> selectCasesWithUsername();

    // 新增：根据状态关联查询（用于筛选功能）
    List<CaseInfo> selectCasesByStatusWithUsername(String status);

    List<CaseInfo> selectMyCasesWithUsername(Long userId);
    //助理案件
    List<CaseInfo> selectAssistantCasesWithUsername(Long userId);


    /**
     * 查询所有案件总数
     */
    int countAllCases(@Param("caseName") String caseName,@Param("status") String status,
                      @Param("statusList") java.util.List<String> statusList,
                      @Param("caseNumber") String caseNumber,
                      @Param("plaintiff") String plaintiff,
                      @Param("defendant") String defendant,
                      @Param("receiveTimeStart") String receiveTimeStart,
                      @Param("receiveTimeEnd") String receiveTimeEnd,
                      @Param("assistantId") Long assistantId,
                      @Param("userId") Long userId,
                      @Param("taskId") Long taskId,
                      @Param("station") String station,
                      @Param("keyword") String keyword);

    /*
     * 根据taskid查询案件数量
     */
    int countByTaskId(@Param("taskId") Long taskId);

    /*
     * 根据用户ID查询在线案件数量
     */
    int countActiveByUserId(@Param("userId") Long userId);

    /*
     * 根据用户ID查询在线领取类型的案件数量
     */
    int countActiveReceiveByUserId(@Param("userId") Long userId,@Param("receiveType") String receiveType);

    // 新增方法
    int updateReturnStatus(@Param("caseId") Long caseId,
                           @Param("status") String status,
                           @Param("returnReason") String returnReason);

    /**
     * 分页查询案件
     * @param offset 起始位置
     * @param pageSize 每页条数
     */
    List<CaseInfo> selectCasePage(@Param("offset") int offset, @Param("pageSize") int pageSize,
                                  @Param("caseName") String caseName,@Param("status") String status,
                                  @Param("statusList") java.util.List<String> statusList,
                                  @Param("caseNumber") String caseNumber,
                                  @Param("plaintiff") String plaintiff,
                                  @Param("defendant") String defendant,
                                  @Param("receiveTimeStart") String receiveTimeStart,
                                  @Param("receiveTimeEnd") String receiveTimeEnd,
                                  @Param("assistantId") Long assistantId,
                                  @Param("userId") Long userId,
                                  @Param("taskId") Long taskId,
                                  @Param("station") String station,
                                  @Param("sortField") String sortField,
                                  @Param("sortOrder") String sortOrder,
                                  @Param("keyword") String keyword);


    List<CaseInfo> selectByStatusList(@Param("statusList") List<String> statusList,
                                      @Param("taskId") Integer taskId,
                                      @Param("caseName") String caseName,
                                      @Param("station") String station);

    /**
     * 更新案件为调解失败状态，包含备注和退回法院时间
     */
    int updateCompleteStatus(
            @Param("caseId") Long caseId,
            @Param("status") String status,
            @Param("completionRemark") String completionRemark,
            @Param("returnCourtTime") String returnCourtTime
    );

    /**
     * 查询最大回执编号
     */
    Integer selectMaxReceiptNumber();

    /**
     * 查询最大鹏合案件编号（全局），保留兼容
     */
    Integer selectMaxPengheCaseNumber();

    /**
     * 查询四季青青枫号最大值
     */
    Integer selectMaxQingfengCaseNumber();

    /**
     * 查询非四季青澎和号最大值
     */
    Integer selectMaxPengheCaseNumberForOtherStations();

    /**
     * 查询本部最大收款单号（S0XX格式）
     */
    String selectMaxReceiptNumberForBenbu();

    String selectMaxReceiptNumberForKaixuan();

    String selectMaxReceiptNumberForZhanongkou();

    /**
     * 根据年份前缀查询四季青青枫号最大值
     */
    String selectMaxQingfengCaseNumberForYear(@Param("yearPrefix") String yearPrefix);

    /**
     * 根据年份前缀查询非四季青澎和号最大值
     */
    String selectMaxPengheCaseNumberForYear(@Param("yearPrefix") String yearPrefix);

    /** 根据年份前缀查询本部+四季青最大 S0XX 收款单号，例如 2026-S070 */
    String selectMaxReceiptNumberForBenbuYear(@Param("yearPrefix") String yearPrefix);

    /** 根据年份前缀查询凯旋街道最大 KXX 收款单号，例如 2026-K01 */
    String selectMaxReceiptNumberForKaixuanYear(@Param("yearPrefix") String yearPrefix);

    /** 根据年份前缀查询闸弄口最大 ZXX 收款单号，例如 2026-Z01 */
    String selectMaxReceiptNumberForZhanongkouYear(@Param("yearPrefix") String yearPrefix);

    /** 根据年份前缀查询其他驻点最大纯数字收款单号，例如 2026-070 */
    String selectMaxReceiptNumberForOthersYear(@Param("yearPrefix") String yearPrefix);

    /**
     * 根据年份前缀查询最大人调号（格式：yyyy彭人NNN）
     */
    String selectMaxMediateCaseNumberForYear(@Param("yearPrefix") String yearPrefix);

    /**
     * 根据年份前缀查询最大人调号并加行锁（用于生成序列的并发安全）
     */
    String selectMaxMediateCaseNumberForYearForUpdate(@Param("yearPrefix") String yearPrefix);

    /**
     * 根据任务ID列表查询案件，联表任务和用户信息，用于案件包导出
     */
    List<CaseInfo> selectByTaskIdsWithTaskInfo(@org.apache.ibatis.annotations.Param("taskIds") List<Long> taskIds);
}
