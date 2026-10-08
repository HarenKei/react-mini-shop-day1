INSERT INTO public.products (name, category, price, stock_quantity)
VALUES ('미니 파우치', '생활', 8000, 5);

SELECT product_id, name, category, price, stock_quantity
FROM public.products
ORDER BY product_id;
