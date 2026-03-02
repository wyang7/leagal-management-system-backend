INSERT INTO management_system.case_payment_flow (
    case_id, screenshot_url, screenshot_url_type, channel, pay_time, amount, created_time, updated_time
)
SELECT
    cce.case_id,
    flow.screenshotUrl,
    flow.screenshotUrlType,
    flow.channel,
    -- 兼容 '2026-01-12T11:28' 和 '2026-01-12 11:28:00' 等格式
    STR_TO_DATE(
        CONCAT(
            LEFT(REPLACE(flow.payTime, 'T', ' '), 16),
            ':00'
        ), '%Y-%m-%d %H:%i:%s'
    ),
    CAST(flow.amount AS DECIMAL(10,2)),
    NOW(),
    NOW()
FROM
    management_system.case_close_ext cce
    JOIN JSON_TABLE(
        cce.payment_flows,
        '$[*]' COLUMNS (
            screenshotUrl VARCHAR(255) PATH '$.screenshotUrl',
            screenshotUrlType VARCHAR(32) PATH '$.screenshotUrlType',
            channel VARCHAR(64) PATH '$.channel',
            payTime VARCHAR(32) PATH '$.payTime',
            amount VARCHAR(32) PATH '$.amount'
        )
    ) AS flow
WHERE cce.payment_flows IS NOT NULL AND cce.payment_flows != 'null' AND cce.payment_flows != '';
