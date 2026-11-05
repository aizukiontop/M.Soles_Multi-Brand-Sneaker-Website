-- Reebok Nano X4 Trainer: add the Black colourway photo alongside the existing Green photo.
-- Earlier migrations are unchanged.

UPDATE products SET
  images = ARRAY['/products/reebok-nano-x4-trainer-green.png', '/products/reebok-nano-x4-trainer-black.png'],
  image_colors = ARRAY['Green', 'Black']
  WHERE id = 'reebok-nano-x4-trainer';
