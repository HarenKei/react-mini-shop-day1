SELECT o.order_id, o.customer_id, o.contact_name, o.contact_email,
       s.product_id, s.quantity, s.total_price
FROM public.orders AS o
JOIN public.sales AS s ON s.order_id = o.order_id
WHERE o.order_id = 123
ORDER BY s.sale_id;

SELECT product_id, name, stock_quantity
FROM public.products
ORDER BY product_id;
