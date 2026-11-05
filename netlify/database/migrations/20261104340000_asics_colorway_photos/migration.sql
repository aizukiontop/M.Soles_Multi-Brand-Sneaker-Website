-- ASICS colourway photos, supplied per colour. Each product's image list is parallel to image_colors.
-- Gel-Kayano 14: Gray and White photos replace the existing Amplience photo.
-- Novablast 4: Green and Blue photos replace the existing Shopify photo.
-- Earlier migrations are unchanged.

UPDATE products SET
  images = ARRAY['/products/asics-gel-kayano-14-gray.png', '/products/asics-gel-kayano-14-white.png'],
  image_colors = ARRAY['Gray', 'White']
  WHERE id = 'asics-gel-kayano-14';

UPDATE products SET
  images = ARRAY['/products/asics-novablast-4-green.png', '/products/asics-novablast-4-blue.png'],
  image_colors = ARRAY['Green', 'Blue']
  WHERE id = 'asics-novablast-4';
