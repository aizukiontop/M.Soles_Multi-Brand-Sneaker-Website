-- Under Armour Curry Flow 11: supply White and Black colourway photos.
-- Earlier migrations are unchanged.

UPDATE products SET
  images = ARRAY['/products/under-armour-curry-flow-11-white.png', '/products/under-armour-curry-flow-11-black.png'],
  image_colors = ARRAY['White', 'Black']
  WHERE id = 'under-armour-curry-flow-11';
