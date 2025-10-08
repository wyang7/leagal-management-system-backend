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
                      @Param("caseNumber") String caseNumber,
                      @Param("plaintiff") String plaintiff,
                      @Param("defendant") String defendant);

    /*
     * 根据taskid查询案件数量
     */
    int countByTaskId(@Param("taskId") Long taskId);

    /*
     * 根据用户ID查询在线案件数量
     */
    int countActiveByUserId(@Param("userId") Long userId);

    // 新增方法
    int updateReturnStatus(@Param("caseId") Long caseId,
                           @Param("status") String status,
                           @Param("returnReason") String returnReason);

    /**
     * 分页查询案件
     * @param offset 起始位置
     * @param pageSize 每页条数
     */
    List<CaseInfo> selectCasePage(@Param("offset") int offset, @Param("pageSize") int pageSize
    ,@Param("caseName") String caseName,@Param("status") String status,
                                  @Param("caseNumber") String caseNumber,
                                  @Param("plaintiff") String plaintiff,
                                  @Param("defendant") String defendant);


    List<CaseInfo> selectByStatusList(@Param("statusList") List<String> statusList,
                                      @Param("taskId") Integer taskId,
                                      @Param("caseName") String caseName);
}
