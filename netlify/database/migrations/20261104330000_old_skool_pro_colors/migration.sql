-- Old Skool Pro: the colour list now matches the supplied photos (Cream and Red).
-- Without this, the default colour (White) has no photo and the product shows "Photo coming soon".
-- Earlier migrations are unchanged.

UPDATE products SET
  available_colors = ARRAY['Cream', 'Red']
  WHERE id = 'vans-old-skool-pro';
