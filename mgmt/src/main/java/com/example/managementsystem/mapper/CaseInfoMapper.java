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
     * 根据状态查询案件
     */
    List<CaseInfo> selectByStatus(@Param("status") String status);

    // 添加：根据案由前缀模糊搜索
    List<CaseInfo> selectByCaseNameLikePrefix(@Param("caseName") String caseName);

    // 新增：关联查询案件列表（包含处理人用户名）
    List<CaseInfo> selectCasesWithUsername();

    // 新增：根据状态关联查询（用于筛选功能）
    List<CaseInfo> selectCasesByStatusWithUsername(String status);
}
