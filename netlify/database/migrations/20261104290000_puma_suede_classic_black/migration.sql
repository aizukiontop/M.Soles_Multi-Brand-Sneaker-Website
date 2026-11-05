-- Puma Suede Classic XXI: Black photo added alongside the existing Red photo.
-- Earlier migrations are unchanged.

UPDATE products SET
  images = ARRAY['/products/puma-suede-classic-xxi-black.png', '/products/puma-suede-classic-xxi-red.png'],
  image_colors = ARRAY['Black', 'Red']
  WHERE id = 'puma-suede-classic-xxi';
