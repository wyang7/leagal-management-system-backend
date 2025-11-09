UPDATE case_info
SET status = '待结案'
WHERE status = '已完成';

UPDATE case_info
SET status = '调解失败'
WHERE status = '失败';
