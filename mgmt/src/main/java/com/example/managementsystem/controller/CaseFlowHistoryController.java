package com.example.managementsystem.controller;

import com.example.managementsystem.entity.CaseFlowHistory;
import com.example.managementsystem.service.ICaseFlowHistoryService;
import com.example.managementsystem.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/case/history")
public class CaseFlowHistoryController {

    @Autowired
    private ICaseFlowHistoryService caseFlowHistoryService;

    /**
     * 根据案件ID查询流转历史
     */
    @GetMapping("/{caseId}")
    public Result<List<CaseFlowHistory>> getCaseHistory(@PathVariable Long caseId) {
        List<CaseFlowHistory> historyList = caseFlowHistoryService.getHistoryByCaseId(caseId);
        return Result.success(historyList);
    }
}