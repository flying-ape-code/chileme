-- 吃了么 - 商品数据表迁移脚本
-- 用于初始化/更新 products 表以支持爬虫数据

-- 如果表不存在则创建
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    img VARCHAR(512) NOT NULL,
    promo_url VARCHAR(512),
    cps_link VARCHAR(512),
    category VARCHAR(50) NOT NULL,
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    rating DECIMAL(3,2),
    distance VARCHAR(50),
    delivery_time VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order, created_at);

-- 添加唯一约束（防止重复商品）
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_name_category 
ON products(LOWER(name), category);

-- 创建更新触发器（自动更新 updated_at）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 添加注释
COMMENT ON TABLE products IS '吃了么 - 转盘商品数据表';
COMMENT ON COLUMN products.cps_link IS 'CPS 推广链接（美团/饿了么）';
COMMENT ON COLUMN products.promo_url IS '原始推广链接';
COMMENT ON COLUMN products.is_active IS '商品是否可用';
