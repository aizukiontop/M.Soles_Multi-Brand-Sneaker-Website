-- Colourway audit: correct image colour tags that did not match the photo or the product's colours.
-- ASICS Gel-Kayano 14 photo is the silver/grey colourway (the product offers Gray, not White).
-- Nike Air Zoom Pulse second photo is a sole view with no clear colourway, so it is untagged.
-- Earlier migrations are unchanged.

UPDATE products SET image_colors = ARRAY['Gray'] WHERE id = 'asics-gel-kayano-14';
UPDATE products SET image_colors = ARRAY['Black', ''] WHERE id = 'nike-air-zoom-pulse';
