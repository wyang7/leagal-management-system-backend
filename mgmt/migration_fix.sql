-- 先清空 case_payment_flow 表（谨慎操作：确保数据已备份或代码未上线）
TRUNCATE TABLE case_payment_flow;

-- 迁移数据：从 case_close_ext.payment_flows 解析 JSON 并插入 case_payment_flow
-- 添加 EXISTS 检查确保 case_id 在 case_info 表中存在
INSERT INTO case_payment_flow (case_id, screenshot_url, screenshot_url_type, channel, pay_time, amount, created_time, updated_time)
SELECT
    cce.case_id,
    JSON_UNQUOTE(JSON_EXTRACT(cce.payment_flows, CONCAT('$[', idx.i, '].screenshotUrl'))) AS screenshot_url,
    JSON_UNQUOTE(JSON_EXTRACT(cce.payment_flows, CONCAT('$[', idx.i, '].screenshotUrlType'))) AS screenshot_url_type,
    JSON_UNQUOTE(JSON_EXTRACT(cce.payment_flows, CONCAT('$[', idx.i, '].channel'))) AS channel,
    CASE
        WHEN JSON_UNQUOTE(JSON_EXTRACT(cce.payment_flows, CONCAT('$[', idx.i, '].payTime'))) IS NOT NULL
             AND JSON_UNQUOTE(JSON_EXTRACT(cce.payment_flows, CONCAT('$[', idx.i, '].payTime'))) != ''
        THEN STR_TO_DATE(
            CONCAT(
                REPLACE(JSON_UNQUOTE(JSON_EXTRACT(cce.payment_flows, CONCAT('$[', idx.i, '].payTime'))), 'T', ' '),
                ':00'
            ),
            '%Y-%m-%d %H:%i:%s'
        )
        ELSE NULL
    END AS pay_time,
    CAST(JSON_UNQUOTE(JSON_EXTRACT(cce.payment_flows, CONCAT('$[', idx.i, '].amount'))) AS DECIMAL(19,2)) AS amount,
    NOW() AS created_time,
    NOW() AS updated_time
FROM case_close_ext cce
CROSS JOIN (
    SELECT 0 AS i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
    UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
) AS idx
WHERE cce.payment_flows IS NOT NULL
  AND cce.payment_flows != ''
  AND cce.payment_flows != '[]'
  AND JSON_UNQUOTE(JSON_EXTRACT(cce.payment_flows, CONCAT('$[', idx.i, '].amount'))) IS NOT NULL
  -- 关键：确保 case_id 在父表 case_info 中存在，避免外键约束错误
  AND EXISTS (SELECT 1 FROM case_info ci WHERE ci.case_id = cce.case_id);

-- 验证迁移结果
SELECT '迁移完成' AS status,
       (SELECT COUNT(*) FROM case_payment_flow) AS payment_flow_count,
       (SELECT COUNT(DISTINCT case_id) FROM case_payment_flow) AS case_count;

-- 查看有 payment_flows 的 case_close_ext 记录数（用于对比）
SELECT COUNT(DISTINCT case_id) AS case_close_ext_with_payment_flows
FROM case_close_ext
WHERE payment_flows IS NOT NULL
  AND payment_flows != ''
  AND payment_flows != '[]';
