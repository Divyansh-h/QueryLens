-- scripts/seed.sql

-- Drop existing tables
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Create tables
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(id),
    order_date TIMESTAMP NOT NULL,
    status TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id),
    product_id INT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL
);

-- Disable synchronous_commit for faster bulk inserts
SET synchronous_commit = off;

-- Seed customers (50,000 rows)
INSERT INTO customers (first_name, last_name, email, created_at)
SELECT 
    'FirstName' || id,
    'LastName' || id,
    'user' || id || '@example.com',
    NOW() - (random() * (INTERVAL '5 years'))
FROM generate_series(1, 50000) AS id;

-- Seed products (5,000 rows)
INSERT INTO products (name, category, price)
SELECT
    'Product ' || id,
    (ARRAY['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports'])[floor(random() * 5 + 1)],
    round((random() * 990 + 10)::numeric, 2)
FROM generate_series(1, 5000) AS id;

-- Seed orders (1,000,000 rows)
INSERT INTO orders (customer_id, order_date, status, total_amount)
SELECT
    floor(random() * 50000 + 1)::INT,
    NOW() - (random() * (INTERVAL '5 years')),
    (ARRAY['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])[floor(random() * 4 + 1)],
    round((random() * 1000 + 20)::numeric, 2)
FROM generate_series(1, 1000000) AS id;

-- Seed order_items (2,000,000 rows)
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT
    floor(random() * 1000000 + 1)::INT,
    floor(random() * 5000 + 1)::INT,
    floor(random() * 5 + 1)::INT,
    round((random() * 990 + 10)::numeric, 2)
FROM generate_series(1, 2000000) AS id;

-- Re-enable synchronous_commit
SET synchronous_commit = on;
