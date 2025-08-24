-- Create stocks table
CREATE TABLE IF NOT EXISTS stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    store_id UUID NOT NULL,
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    max_quantity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE(product_id, store_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stocks_product_id ON stocks(product_id);
CREATE INDEX IF NOT EXISTS idx_stocks_store_id ON stocks(store_id);
CREATE INDEX IF NOT EXISTS idx_stocks_low_stock ON stocks(quantity, min_quantity);

-- Create trigger to update updated_at column
CREATE TRIGGER update_stocks_updated_at
    BEFORE UPDATE ON stocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
