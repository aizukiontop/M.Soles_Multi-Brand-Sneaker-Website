-- Nike colourway photos, supplied per colour. Each product's image list is parallel to image_colors.
-- Court Vision Mid: White and Red photos replace the black and tan photos (tan is not offered).
-- Pegasus Trail 5: White and Orange photos replace the black photo (black is not offered).
-- Air Zoom Pulse: the Red photo is added after the two existing Black photos.
-- Earlier migrations are unchanged.

UPDATE products SET
  images = ARRAY['/products/nike-court-vision-mid-white.png', '/products/nike-court-vision-mid-red.png'],
  image_colors = ARRAY['White', 'Red']
  WHERE id = 'nike-court-vision-mid';

UPDATE products SET
  images = ARRAY['/products/nike-pegasus-trail-5-white.png', '/products/nike-pegasus-trail-5-orange.png'],
  image_colors = ARRAY['White', 'Orange']
  WHERE id = 'nike-pegasus-trail-5';

UPDATE products SET
  images = array_append(images, '/products/nike-air-zoom-pulse-red.png'),
  image_colors = array_append(image_colors, 'Red')
  WHERE id = 'nike-air-zoom-pulse';
