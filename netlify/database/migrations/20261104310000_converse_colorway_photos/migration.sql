-- Converse colourway photos, supplied per colour. Each product's image list is parallel to image_colors.
-- Chuck 70 Low: Black and White photos replace the existing Unsplash photos.
-- All Star Kids Hi: Pink and White photos replace the existing remote photo.
-- Earlier migrations are unchanged.

UPDATE products SET
  images = ARRAY['/products/converse-chuck-70-low-black.png', '/products/converse-chuck-70-low-white.png'],
  image_colors = ARRAY['Black', 'White']
  WHERE id = 'converse-chuck-70-low';

UPDATE products SET
  images = ARRAY['/products/converse-all-star-kids-hi-pink.png', '/products/converse-all-star-kids-hi-white.png'],
  image_colors = ARRAY['Pink', 'White']
  WHERE id = 'converse-all-star-kids-hi';
