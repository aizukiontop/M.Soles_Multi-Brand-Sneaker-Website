-- New Balance colourway photos, supplied per colour. Each product's image list is parallel to image_colors.
-- 9060 Cloud Grey: Beige and Gray photos replace the existing Unsplash photos.
-- 574 Core Kids: Blue and Gray photos replace the existing Unsplash photos.
-- Earlier migrations are unchanged.

UPDATE products SET
  images = ARRAY['/products/new-balance-9060-cloud-grey-beige.png', '/products/new-balance-9060-cloud-grey-gray.png'],
  image_colors = ARRAY['Beige', 'Gray']
  WHERE id = 'new-balance-9060-cloud-grey';

UPDATE products SET
  images = ARRAY['/products/new-balance-574-core-kids-blue.png', '/products/new-balance-574-core-kids-gray.png'],
  image_colors = ARRAY['Blue', 'Gray']
  WHERE id = 'new-balance-574-core-kids';
