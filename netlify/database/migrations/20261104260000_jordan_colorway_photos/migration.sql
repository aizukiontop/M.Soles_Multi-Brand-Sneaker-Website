-- Air Jordan 1 colourway photos, supplied per colour. Each product's image list is parallel to image_colors.
-- Air Jordan 1 High OG: Red (black/red), Black (black/white) and White (white/black) photos replace the Nike CDN photos.
-- Air Jordan 1 Mid SE: Red, Blue and White (cream) photos replace the Nike CDN photos.
-- Earlier migrations are unchanged.

UPDATE products SET
  images = ARRAY['/products/jordan-air-jordan-1-high-og-red-black.png', '/products/jordan-air-jordan-1-high-og-black-white.png', '/products/jordan-air-jordan-1-high-og-white-black.png'],
  image_colors = ARRAY['Red', 'Black', 'White']
  WHERE id = 'jordan-air-jordan-1-high-og';

UPDATE products SET
  images = ARRAY['/products/jordan-air-jordan-1-mid-se-red.png', '/products/jordan-air-jordan-1-mid-se-blue.png', '/products/jordan-air-jordan-1-mid-se-cream.png'],
  image_colors = ARRAY['Red', 'Blue', 'White']
  WHERE id = 'jordan-air-jordan-1-mid-se';
