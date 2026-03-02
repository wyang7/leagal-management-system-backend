package com.example.managementsystem.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class CasePaymentFlow {
    private Long id;
    private Long caseId;
    private String screenshotUrl;
    private String screenshotUrlType;
    private String channel;
    private Date payTime;
    private BigDecimal amount;
    private Date createdTime;
    private Date updatedTime;
}

