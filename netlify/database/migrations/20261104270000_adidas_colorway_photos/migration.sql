-- Adidas colourway photos, supplied per colour. Each product's image list is parallel to image_colors.
-- Samba OG: White and Green photos replace the existing Samba OG photo.
-- Ultraboost Light: Blue and White photos replace the existing Ultraboost Light photo.
-- Earlier migrations are unchanged.

UPDATE products SET
  images = ARRAY['/products/adidas-samba-og-white.png', '/products/adidas-samba-og-green.png'],
  image_colors = ARRAY['White', 'Green']
  WHERE id = 'adidas-samba-og';

UPDATE products SET
  images = ARRAY['/products/adidas-ultraboost-light-blue.png', '/products/adidas-ultraboost-light-white.png'],
  image_colors = ARRAY['Blue', 'White']
  WHERE id = 'adidas-ultraboost-light';
