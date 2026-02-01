package com.example.managementsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.managementsystem.entity.CaseCloseExt;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CaseCloseExtMapper extends BaseMapper<CaseCloseExt> {

    CaseCloseExt selectByCaseId(@Param("caseId") Long caseId);
}

