package com.example.managementsystem.controller;

import com.example.managementsystem.common.Result;
import com.example.managementsystem.dto.InvoiceCasePageRequest;
import com.example.managementsystem.dto.UserSession;
import com.example.managementsystem.service.IInvoiceManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.Map;

/**
 * 开票管理
 *
 * @author Copilot
 */
@RestController
@RequestMapping("/invoice")
public class InvoiceManagementController {

    @Autowired
    private IInvoiceManagementService invoiceManagementService;

    /**
     * 开票管理分页查询（仅管理员可用）
     */
    @PostMapping("/page")
    public Result<Map<String, Object>> getInvoicePage(@RequestBody InvoiceCasePageRequest request, HttpSession session) {
        UserSession currentUser = (UserSession) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getRoleType() == null
                || !currentUser.getRoleType().contains("管理员")|| !currentUser.getRoleType().contains("财务")) {
            return Result.fail("无权限");
        }
        Map<String, Object> page = invoiceManagementService.getInvoiceCasePage(request);
        return Result.success(page);
    }
}
