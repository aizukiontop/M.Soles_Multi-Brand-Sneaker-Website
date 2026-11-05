-- Vans colourway photos, supplied per colour. Each product's image list is parallel to image_colors.
-- Old Skool Pro: Cream and Red photos replace the existing remote photo.
-- Knu Skool: Black and White photos replace the existing photos.
-- Earlier migrations are unchanged.

UPDATE products SET
  images = ARRAY['/products/vans-old-skool-pro-cream.png', '/products/vans-old-skool-pro-red.png'],
  image_colors = ARRAY['Cream', 'Red']
  WHERE id = 'vans-old-skool-pro';

UPDATE products SET
  images = ARRAY['/products/vans-knu-skool-black.png', '/products/vans-knu-skool-white.png'],
  image_colors = ARRAY['Black', 'White']
  WHERE id = 'vans-knu-skool';
