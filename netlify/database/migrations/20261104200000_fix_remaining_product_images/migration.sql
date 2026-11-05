-- Fix: the remaining sample products still pointed at Unsplash photos that did not show the
-- listed brand or model. This roll-forward migration replaces the image arrays of the products
-- whose replacement photos were checked against the correct brand and model (the photo was
-- downloaded from a retailer or brand page and visually confirmed). Earlier migrations are unchanged.

UPDATE products SET images = ARRAY['https://images.journeys.com/images/products/1_587708_FS.JPG']
  WHERE id = 'converse-chuck-70-low';

UPDATE products SET images = ARRAY['https://classic.cdn.media.amplience.net/i/hibbett/G4625_9114_right1/Converse%20Chuck%20Taylor%20All%20Star%20Hi%20%22Pink/White%22%20Preschool%20Girls%27%20Shoe-9114']
  WHERE id = 'converse-all-star-kids-hi';

UPDATE products SET images = ARRAY['https://www.leagueoutfitters.com/cdn/shop/files/177395886.webp?crop=center&height=1200&v=1771631186&width=1200']
  WHERE id = 'adidas-ultraboost-light';

UPDATE products SET images = ARRAY['https://static.ftshp.digital/img/p/1/4/6/9/3/0/8/1469308-thickbox.jpg']
  WHERE id = 'adidas-samba-og';

UPDATE products SET images = ARRAY['https://www.topsandbottomsusa.com/cdn/shop/files/new-balance-9060-rain-cloud-shoes-u9060gry_2.webp?v=1739813180&width=2048']
  WHERE id = 'new-balance-9060-cloud-grey';

UPDATE products SET images = ARRAY['https://images.journeys.com/images/products/1_819220_FS.JPG']
  WHERE id = 'new-balance-574-core-kids';

UPDATE products SET images = ARRAY['https://classic.cdn.media.amplience.net/i/hibbett/003P7_9170_right1/ASICS%20GEL-KAYANO%2014%20%22White/Black%22%20Unisex%20Shoe-9170']
  WHERE id = 'asics-gel-kayano-14';

UPDATE products SET images = ARRAY['https://cdn.shopify.com/s/files/1/0129/6942/files/asics-mens-novablast-4-running-shoe-white-orange-red_1200x630.webp']
  WHERE id = 'asics-novablast-4';

UPDATE products SET images = ARRAY['https://cdn.skatepro.com/product/520/vans-old-skool-pro-skate-shoes-n4.webp']
  WHERE id = 'vans-old-skool-pro';

UPDATE products SET images = ARRAY['https://www.kicksown.com/cdn/shop/files/20250306181550.jpg?v=1741256197&width=2048']
  WHERE id = 'under-armour-curry-flow-11';
