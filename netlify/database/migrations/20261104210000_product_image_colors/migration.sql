-- Colourway consistency: each product image is tagged with the colour it shows, so the product
-- page can switch photos when a customer selects a colour. `image_colors` is parallel to `images`.
-- '' means the colour is unknown. Tags were set by viewing each current image.
-- A colour tag that is not in `available_colors` means the photo shows a colourway the product
-- does not come in, so it is never shown for a selected colour. Earlier migrations are unchanged.

ALTER TABLE products ADD COLUMN image_colors text[] NOT NULL DEFAULT '{}'::text[];

UPDATE products SET image_colors = ARRAY['White'] WHERE id = 'adidas-samba-og';
UPDATE products SET image_colors = ARRAY['Black'] WHERE id = 'adidas-ultraboost-light';
UPDATE products SET image_colors = ARRAY['White'] WHERE id = 'asics-gel-kayano-14';
UPDATE products SET image_colors = ARRAY['White'] WHERE id = 'asics-novablast-4';
UPDATE products SET image_colors = ARRAY['Pink'] WHERE id = 'converse-all-star-kids-hi';
UPDATE products SET image_colors = ARRAY['Black'] WHERE id = 'converse-chuck-70-low';
UPDATE products SET image_colors = ARRAY['Blue', ''] WHERE id = 'jordan-air-jordan-1-high-og';
UPDATE products SET image_colors = ARRAY['Gray'] WHERE id = 'new-balance-9060-cloud-grey';
UPDATE products SET image_colors = ARRAY['Black'] WHERE id = 'new-balance-574-core-kids';
UPDATE products SET image_colors = ARRAY['Green'] WHERE id = 'puma-velocity-nitro-3';
UPDATE products SET image_colors = ARRAY['Black'] WHERE id = 'puma-suede-classic-xxi';
UPDATE products SET image_colors = ARRAY['Black', 'Black'] WHERE id = 'nike-air-zoom-pulse';
UPDATE products SET image_colors = ARRAY['Black', 'Tan'] WHERE id = 'nike-court-vision-mid';
UPDATE products SET image_colors = ARRAY['Black'] WHERE id = 'nike-pegasus-trail-5';
UPDATE products SET image_colors = ARRAY['Black', 'Black'] WHERE id = 'jordan-air-jordan-1-mid-se';
UPDATE products SET image_colors = ARRAY['Teal'] WHERE id = 'vans-old-skool-pro';
UPDATE products SET image_colors = ARRAY['Blue', 'Blue'] WHERE id = 'reebok-nano-x4-trainer';
UPDATE products SET image_colors = ARRAY['White'] WHERE id = 'reebok-club-c-85-vintage';
UPDATE products SET image_colors = ARRAY['White'] WHERE id = 'under-armour-curry-flow-11';
UPDATE products SET image_colors = ARRAY['Black', 'Black'] WHERE id = 'vans-knu-skool';
