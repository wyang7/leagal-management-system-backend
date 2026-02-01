-- 历史数据迁移：把 case_info.case_close_ext(JSON) 迁移到新表 case_close_ext
-- 兼容：只迁移新表不存在(case_id 不存在)的记录，避免覆盖在线新数据。
-- 依赖：MySQL 5.7+/8.0（JSON_EXTRACT/JSON_UNQUOTE）。如果 case_close_ext 里 paymentFlows JSON 不是标准 JSON，迁移后可能为空。

-- 说明：
-- 1) 金额字段在历史 JSON 中可能出现空串、空格、非数字字符（例如 "0 "、"0元"、"-"），直接 CAST 会报错。
-- 2) 这里先 TRIM + NULLIF，把空值变 NULL，并用 REGEXP 过滤，只对“纯数字/小数/负数”做 CAST。

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
        WHEN NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.adjustedAmount'))), '') REGEXP '^-?[0-9]+(\\.[0-9]+)?$'
            THEN CAST(NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.adjustedAmount'))), '') AS DECIMAL(18,2))
        ELSE NULL
    END AS adjusted_amount,
    CASE
        WHEN NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.mediationFee'))), '') REGEXP '^-?[0-9]+(\\.[0-9]+)?$'
            THEN CAST(NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.mediationFee'))), '') AS DECIMAL(18,2))
        ELSE NULL
    END AS mediation_fee,
    CASE
        WHEN NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.plaintiffMediationFee'))), '') REGEXP '^-?[0-9]+(\\.[0-9]+)?$'
            THEN CAST(NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.plaintiffMediationFee'))), '') AS DECIMAL(18,2))
        ELSE NULL
    END AS plaintiff_mediation_fee,
    CASE
        WHEN NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.defendantMediationFee'))), '') REGEXP '^-?[0-9]+(\\.[0-9]+)?$'
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

-- 排查脏数据（可选）：找出金额字段不是纯数字的记录，便于人工修复。
-- SELECT
--   ci.case_id,
--   ci.case_number,
--   JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.adjustedAmount')) AS adjusted_amount_raw,
--   JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.mediationFee')) AS mediation_fee_raw,
--   JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.plaintiffMediationFee')) AS plaintiff_mediation_fee_raw,
--   JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.defendantMediationFee')) AS defendant_mediation_fee_raw
-- FROM management_system.case_info ci
-- WHERE ci.case_close_ext IS NOT NULL
--   AND ci.case_close_ext <> ''
--   AND (
--     (NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.adjustedAmount'))), '') IS NOT NULL AND NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.adjustedAmount'))), '') NOT REGEXP '^-?[0-9]+(\\.[0-9]+)?$')
--     OR (NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.mediationFee'))), '') IS NOT NULL AND NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.mediationFee'))), '') NOT REGEXP '^-?[0-9]+(\\.[0-9]+)?$')
--     OR (NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.plaintiffMediationFee'))), '') IS NOT NULL AND NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.plaintiffMediationFee'))), '') NOT REGEXP '^-?[0-9]+(\\.[0-9]+)?$')
--     OR (NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.defendantMediationFee'))), '') IS NOT NULL AND NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(ci.case_close_ext, '$.defendantMediationFee'))), '') NOT REGEXP '^-?[0-9]+(\\.[0-9]+)?$')
--   );

-- 可选：数据校验（迁移了多少条）
-- SELECT COUNT(*) FROM management_system.case_close_ext;

-- 回滚方案：
-- 1) 仅删除本次迁移插入的数据（前提：migration 前新表为空或你有 created_time 切分依据）
-- 2) 或者按 case_id 范围/时间窗口删除。
