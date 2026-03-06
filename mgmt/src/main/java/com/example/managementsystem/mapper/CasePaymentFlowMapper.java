package com.example.managementsystem.mapper;

import com.example.managementsystem.entity.CasePaymentFlow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface CasePaymentFlowMapper {
    int insertBatch(@Param("flows") List<CasePaymentFlow> flows);
    int insert(CasePaymentFlow flow);
    List<CasePaymentFlow> selectByCaseId(@Param("caseId") Long caseId);
    int deleteByCaseId(@Param("caseId") Long caseId);
    int deleteById(@Param("id") Long id);
    CasePaymentFlow selectById(@Param("id") Long id);
}
