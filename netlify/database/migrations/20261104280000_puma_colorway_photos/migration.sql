-- Puma colourway photos, supplied per colour. Each product's image list is parallel to image_colors.
-- Velocity Nitro 3: White and Red photos replace the Puma CDN photo.
-- Suede Classic XXI: Red photo replaces the Puma CDN photo.
-- Earlier migrations are unchanged.

UPDATE products SET
  images = ARRAY['/products/puma-velocity-nitro-3-white.png', '/products/puma-velocity-nitro-3-red.png'],
  image_colors = ARRAY['White', 'Red']
  WHERE id = 'puma-velocity-nitro-3';

UPDATE products SET
  images = ARRAY['/products/puma-suede-classic-xxi-red.png'],
  image_colors = ARRAY['Red']
  WHERE id = 'puma-suede-classic-xxi';
