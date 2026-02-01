package com.example.managementsystem.service.impl;

import com.example.managementsystem.service.InvoicePdfService;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.UUID;

/**
 * @author Copilot
 */
@Service
public class InvoicePdfServiceImpl implements InvoicePdfService {

    @Override
    public String buildInvoicePdfObjectName(String originalFilename,Long caseId) {
        String lower = originalFilename == null ? UUID.randomUUID().toString().replace("-", "") : originalFilename.toLowerCase(Locale.ROOT);
        String ext = ".pdf";
        return "invoice/"+caseId+"/" + lower + ext;
    }
}
