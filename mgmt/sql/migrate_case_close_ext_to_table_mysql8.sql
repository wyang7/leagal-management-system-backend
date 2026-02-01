-- MySQL 8.0+ 更宽松的迁移写法：使用 REGEXP_LIKE + CAST
-- 如果你确认数据库是 MySQL 8，可以用这个脚本（语义更清晰）。

INSERT INTO management_system.case_close_ext (
    case_id,
    sign_date,
    adjusted_amount,
    mediation_fee,
    plaintiff_mediation_fee,
    defendant_mediation_fee,
    payer,
    invoiced,
    invoice_info,
    payment_flows,
    created_time,
    updated_time
)
SELECT
    ci.case_id,
    JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.signDate')) AS sign_date,
    CASE
        WHEN REGEXP_LIKE(NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.adjustedAmount'))), ''), '^-?[0-9]+(\\.[0-9]+)?$')
            THEN CAST(NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.adjustedAmount'))), '') AS DECIMAL(18,2))
        ELSE NULL
    END AS adjusted_amount,
    CASE
        WHEN REGEXP_LIKE(NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.mediationFee'))), ''), '^-?[0-9]+(\\.[0-9]+)?$')
            THEN CAST(NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.mediationFee'))), '') AS DECIMAL(18,2))
        ELSE NULL
    END AS mediation_fee,
    CASE
        WHEN REGEXP_LIKE(NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.plaintiffMediationFee'))), ''), '^-?[0-9]+(\\.[0-9]+)?$')
            THEN CAST(NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.plaintiffMediationFee'))), '') AS DECIMAL(18,2))
        ELSE NULL
    END AS plaintiff_mediation_fee,
    CASE
        WHEN REGEXP_LIKE(NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.defendantMediationFee'))), ''), '^-?[0-9]+(\\.[0-9]+)?$')
            THEN CAST(NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.defendantMediationFee'))), '') AS DECIMAL(18,2))
        ELSE NULL
    END AS defendant_mediation_fee,
    JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.payer')) AS payer,
    CASE
        WHEN JSON_EXTRACT(ci.case_close_ext, '$.invoiced') IS NULL THEN NULL
        WHEN JSON_EXTRACT(ci.case_close_ext, '$.invoiced') = true THEN 1
        WHEN JSON_EXTRACT(ci.case_close_ext, '$.invoiced') = false THEN 0
        ELSE NULL
    END AS invoiced,
    JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.invoiceInfo')) AS invoice_info,
    JSON_EXTRACT(ci.case_close_ext, '$.paymentFlows') AS payment_flows,
    COALESCE(ci.created_time, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')) AS created_time,
    COALESCE(ci.updated_time, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')) AS updated_time
FROM management_system.case_info ci
LEFT JOIN management_system.case_close_ext cce ON cce.case_id = ci.case_id
WHERE ci.case_close_ext IS NOT NULL
  AND ci.case_close_ext <> ''
  AND cce.case_id IS NULL;

