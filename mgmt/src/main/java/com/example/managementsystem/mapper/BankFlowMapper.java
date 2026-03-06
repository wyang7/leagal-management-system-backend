package com.example.managementsystem.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.managementsystem.entity.BankFlow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BankFlowMapper extends BaseMapper<BankFlow> {

    int countBankFlows(@Param("keyword") String keyword,
                       @Param("caseNumber") String caseNumber);

    List<BankFlow> selectBankFlows(@Param("offset") int offset,
                                   @Param("pageSize") int pageSize,
                                   @Param("keyword") String keyword,
                                   @Param("caseNumber") String caseNumber);

    BankFlow selectByFlowNo(@Param("flowNo") String flowNo);

    /**
     * 根据案件付款ID查询银行流水（用于判断是否已绑定）
     */
    BankFlow selectByCasePaymentId(@Param("casePaymentId") Long casePaymentId);

    /**
     * 查询所有未绑定案件付款的银行流水（状态为"待案件匹配"）
     */
    List<BankFlow> selectUnboundFlows();
}

