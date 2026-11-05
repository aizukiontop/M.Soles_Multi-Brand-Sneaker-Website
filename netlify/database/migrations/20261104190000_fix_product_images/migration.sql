-- Fix: several sample products pointed at Unsplash photos that show a different brand's shoe
-- (e.g. Puma items displayed Nike swooshes). This roll-forward migration replaces the image
-- arrays of the products whose replacement photos were verified against the correct brand and model.
-- Products not listed here keep their existing image arrays.

UPDATE products SET images = ARRAY['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/377749/14/sv01/fnd/PNA/fmt/png/Velocity-NITRO™-3-Women''s-Running-Shoes']
  WHERE id = 'puma-velocity-nitro-3';

UPDATE products SET images = ARRAY['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/374915/12/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Sneakers']
  WHERE id = 'puma-suede-classic-xxi';

UPDATE products SET images = ARRAY[
  'https://nmp.about.nike.com/about/prod/daf54e8a-b8c6-4a99-bc0c-3816f058a615/nike-air-zoom-pulse-2-91660.jpg?m=eyJlZGl0cyI6eyJqcGVnIjp7InF1YWxpdHkiOjEwMH0sIndlYnAiOnsicXVhbGl0eSI6MTAwfSwiZXh0cmFjdCI6eyJsZWZ0IjowLCJ0b3AiOjAsIndpZHRoIjoxNjAwLCJoZWlnaHQiOjEwNjd9LCJyZXNpemUiOnsid2lkdGgiOjkwMH19fQ%3D%3D&s=badd2127641462dc39d0365b5108771d06cd40e6344fde7f16c8d801bf062a4c',
  'https://nmp.about.nike.com/about/prod/1c49860f-bb6c-4ba4-aea2-9ce611096e1d/nike-air-zoom-pulse-1-91659.jpg?m=eyJlZGl0cyI6eyJqcGVnIjp7InF1YWxpdHkiOjEwMH0sIndlYnAiOnsicXVhbGl0eSI6MTAwfSwiZXh0cmFjdCI6eyJsZWZ0IjowLCJ0b3AiOjAsIndpZHRoIjoxNjAwLCJoZWlnaHQiOjEwNjd9LCJyZXNpemUiOnsid2lkdGgiOjIwNDh9fX0%3D&s=ed6b8919fa302e154efe3a9897d538fda1ff9a7a388f83b526f2c46cf3f02f2a'
  ] WHERE id = 'nike-air-zoom-pulse';

UPDATE products SET images = ARRAY[
  'https://static.nike.com/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/a010a8df-ba5d-489e-818e-1ef2dd1033b0/NIKE+COURT+VISION+MID.png',
  'https://static.nike.com/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/bfe3802e-6c01-479b-99da-f3943092cc4d/NIKE+COURT+VISION+MID+WNTR.png'
  ] WHERE id = 'nike-court-vision-mid';

UPDATE products SET images = ARRAY[
  'https://static.nike.com/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/12f0bbe7-1d4e-4e81-b8e1-b1a5c6874204/NIKE+REACTX+PEGASUS+TRAIL+5.png'
  ] WHERE id = 'nike-pegasus-trail-5';

UPDATE products SET images = ARRAY[
  'https://static.nike.com/a/images/t_default/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/1f55b158-4613-48c6-8b80-2ef19b7bf2de/AIR+JORDAN+1+HIGH+OG.png',
  'https://static.nike.com/a/images/t_default/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/ba9f162a-46d1-4ba9-a321-3c267773fb51/AIR+JORDAN+1+RETRO+HIGH+OG.png'
  ] WHERE id = 'jordan-air-jordan-1-high-og';

UPDATE products SET images = ARRAY[
  'https://static.nike.com/a/images/t_default/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/b1f4c787-3674-4d0a-a754-454d1fbff87a/AIR+JORDAN+1+MID+SE.png',
  'https://static.nike.com/a/images/t_default/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/89f08d2e-858f-4a55-a3c4-718d25892fbf/AIR+JORDAN+1+MID+SE.png'
  ] WHERE id = 'jordan-air-jordan-1-mid-se';

UPDATE products SET images = ARRAY[
  'https://www.reebok.com/cdn/shop/files/100204677_SLC_eCom.jpg?v=1764595794&width=1024',
  'https://www.reebok.com/cdn/shop/files/100204677_TPP_eCom.jpg?v=1764595794&width=1024'
  ] WHERE id = 'reebok-nano-x4-trainer';

UPDATE products SET images = ARRAY[
  'https://www.reebok.com/cdn/shop/files/100000317_SLC_eCom_s.jpg?v=1781189947&width=1024'
  ] WHERE id = 'reebok-club-c-85-vintage';

UPDATE products SET images = ARRAY[
  'https://m.media-amazon.com/images/I/61c0A2oIGbL._SX700_.jpg',
  'https://images.journeys.com/images/products/1_744576_FS.JPG'
  ] WHERE id = 'vans-knu-skool';
