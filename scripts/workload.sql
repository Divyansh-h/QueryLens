-- scripts/workload.sql

-- 1. Simple Seq Scan on a large table
SELECT COUNT(*) FROM orders WHERE status = 'PENDING';

-- 2. Heavy Join
SELECT c.first_name, c.last_name, sum(o.total_amount)
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id
ORDER BY sum(o.total_amount) DESC
LIMIT 100;

-- 3. Complex Aggregation
SELECT p.category, count(oi.id) as items_sold, sum(oi.quantity * oi.unit_price) as revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.order_date > NOW() - INTERVAL '1 year'
GROUP BY p.category
ORDER BY revenue DESC;

-- 4. Text search without index
SELECT * FROM customers WHERE email LIKE '%@example.com' AND first_name LIKE '%5%';
