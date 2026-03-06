ALTER TABLE bank_flow ADD COLUMN remaining_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '当前可用/剩余金额（用于拆分后记录剩余部分），默认等于trade_amount';

-- 初始化已有数据的remaining_amount为trade_amount
UPDATE bank_flow SET remaining_amount = trade_amount WHERE remaining_amount = 0 OR remaining_amount IS NULL;
