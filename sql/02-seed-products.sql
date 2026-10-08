INSERT INTO public.products (name, category, price, stock_quantity)
SELECT sample.name, sample.category, sample.price, sample.stock_quantity
FROM (VALUES
  ('캔버스 토트백', '가방', 18000, 10),
  ('데일리 머그컵', '주방', 12000, 15),
  ('포켓 노트', '문구', 4500, 20)
) AS sample(name, category, price, stock_quantity)
WHERE NOT EXISTS (
  SELECT 1 FROM public.products AS p WHERE p.name = sample.name
);
