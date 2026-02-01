package com.example.managementsystem.service;

import com.example.managementsystem.dto.InvoiceCasePageRequest;

import java.util.Map;

public interface IInvoiceManagementService {

    Map<String, Object> getInvoiceCasePage(InvoiceCasePageRequest request);
}

