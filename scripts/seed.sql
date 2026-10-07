-- scripts/seed.sql
-- Disable synchronous_commit for faster bulk inserts
SET synchronous_commit = off;

-- Seed customers
INSERT INTO customers (first_name, last_name, email, created_at)
SELECT 
    'FirstName' || id,
    'LastName' || id,
    'user' || id || '@example.com',
    NOW() - (random() * (INTERVAL '5 years'))
FROM generate_series(1, :customers_count) AS id;

-- Seed products
INSERT INTO products (name, category, price)
SELECT
    'Product ' || id,
    (ARRAY['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports'])[floor(random() * 5 + 1)],
    round((random() * 990 + 10)::numeric, 2)
FROM generate_series(1, :products_count) AS id;

-- Seed orders
INSERT INTO orders (customer_id, order_date, status, total_amount)
SELECT
    floor(random() * :customers_count + 1)::INT,
    NOW() - (random() * (INTERVAL '5 years')),
    (ARRAY['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])[floor(random() * 4 + 1)],
    round((random() * 1000 + 20)::numeric, 2)
FROM generate_series(1, :orders_count) AS id;

-- Seed order_items
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT
    floor(random() * :orders_count + 1)::INT,
    floor(random() * :products_count + 1)::INT,
    floor(random() * 5 + 1)::INT,
    round((random() * 990 + 10)::numeric, 2)
FROM generate_series(1, :order_items_count) AS id;

-- Re-enable synchronous_commit
SET synchronous_commit = on;
