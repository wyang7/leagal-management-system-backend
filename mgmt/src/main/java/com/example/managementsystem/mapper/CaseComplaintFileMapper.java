package com.example.managementsystem.mapper;

import com.example.managementsystem.entity.CaseComplaintFile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CaseComplaintFileMapper {
    /**
     * 插入诉状文件记录
     */
    int insert(CaseComplaintFile file);

    /**
     * 根据ID查询诉状文件
     */
    CaseComplaintFile selectById(@Param("id") Long id);

    /**
     * 根据案件ID查询所有诉状文件
     */
    List<CaseComplaintFile> selectByCaseId(@Param("caseId") Long caseId);

    /**
     * 根据ID删除诉状文件记录
     */
    int deleteById(@Param("id") Long id);

    /**
     * 根据案件ID删除所有诉状文件记录
     */
    int deleteByCaseId(@Param("caseId") Long caseId);

    /**
     * 更新诉状文件备注
     */
    int updateRemark(@Param("id") Long id, @Param("remark") String remark);
}
