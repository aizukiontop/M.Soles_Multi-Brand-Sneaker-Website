-- Reebok colourway photos, supplied per colour. Each product's image list is parallel to image_colors.
-- Nano X4 Trainer: Green photo replaces the existing Reebok CDN photos.
-- Club C 85 Vintage: White and Green photos replace the existing Reebok CDN photos.
-- Earlier migrations are unchanged.

UPDATE products SET
  images = ARRAY['/products/reebok-nano-x4-trainer-green.png'],
  image_colors = ARRAY['Green']
  WHERE id = 'reebok-nano-x4-trainer';

UPDATE products SET
  images = ARRAY['/products/reebok-club-c-85-vintage-white.png', '/products/reebok-club-c-85-vintage-green.png'],
  image_colors = ARRAY['White', 'Green']
  WHERE id = 'reebok-club-c-85-vintage';
