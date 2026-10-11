CREATE TABLE IF NOT EXISTS public.orders (
    order_id BIGSERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES public.customers(customer_id),
    contact_name VARCHAR(50) NOT NULL,
    contact_email VARCHAR(150) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS order_id BIGINT REFERENCES public.orders(order_id);
