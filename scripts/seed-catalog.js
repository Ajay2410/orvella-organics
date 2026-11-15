import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ugufhlgepbtzgddilwjy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVndWZobGdlcGJ0emdkZGlsd2p5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDY3MjA4NywiZXhwIjoyMTEwMjQ4MDg3fQ.g5rSWNMKaKdbHSBBdypS1AlLHK8OZXolNb1wudt-ZDc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const ASSETS_DIR = path.resolve(__dirname, '../src/assets/products');

async function uploadImages() {
  console.log('--- Step 1: Uploading Product Images to Supabase Storage ---');
  const files = fs.readdirSync(ASSETS_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  const urlMap = {};

  for (const file of files) {
    const filePath = path.join(ASSETS_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `catalog/${file}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error(`Failed to upload ${file}:`, uploadError.message);
    } else {
      const { data } = supabase.storage.from('product-images').getPublicUrl(storagePath);
      urlMap[file] = data.publicUrl;
      console.log(`✓ Uploaded ${file} -> ${data.publicUrl}`);
    }
  }

  return urlMap;
}

async function seedCategories() {
  console.log('\n--- Step 2: Seeding Categories ---');
  const categories = [
    {
      name: 'Dried Fruit Snacks',
      slug: 'dried-fruit-snacks',
      description: '100% natural, dehydrated fruit slices with no added sugar or preservatives.',
      sort_order: 1,
      is_active: true,
    },
    {
      name: 'Wellness Powders',
      slug: 'wellness-powders',
      description: 'Pure, finely milled plant superfoods for smoothies, shakes, and healthy cooking.',
      sort_order: 2,
      is_active: true,
    },
  ];

  const categoryMap = {};

  for (const cat of categories) {
    const { data, error } = await supabase
      .from('categories')
      .upsert(cat, { onConflict: 'slug' })
      .select('id, slug')
      .single();

    if (error) {
      console.error(`Error inserting category ${cat.name}:`, error.message);
    } else {
      categoryMap[cat.slug] = data.id;
      console.log(`✓ Category ready: ${cat.name} (${data.id})`);
    }
  }

  return categoryMap;
}

async function seedProductsAndVariants(categoryMap, urlMap) {
  console.log('\n--- Step 3: Seeding Products and Variants ---');

  const productsData = [
    {
      category_slug: 'dried-fruit-snacks',
      id_slug: 'dried-chickoo-slices',
      name: 'Orvella Organics 100% Natural Dried Chickoo Slices',
      short_name: 'Dried Chickoo Slices',
      tagline: 'Pure Dehydrated Sapota Fruit, No Added Sugar',
      description: 'Enjoy the rich taste of Chickoo in a convenient dried fruit format. These chickoo slices are prepared from real fruit and carefully dehydrated to create a naturally flavorful snack. Made with a clean ingredient approach, they contain no added sugar and no added preservatives.',
      hero_file: 'chikoo-front.jpg',
      image_files: ['chikoo-front.jpg', 'chikoo-back.jpg', 'chikoo-front-back.jpg', 'chikoo-nutrition.jpg', 'chikoo-contact.jpg'],
      hsn_code: '08134090',
      gst_rate: 5.0,
      is_active: true,
      is_featured: true,
      benefits: [
        '100% fruit content prepared from real Chickoo slices',
        'No added sugar & no preservatives',
        'Rich in dietary fiber and natural energy',
        'Resealable moisture-proof pouch'
      ],
      ingredients: ['100% Pure Chikoo (Sapota) Slices'],
      nutrition: [
        ['Calories', '380 kcal', '19%'],
        ['Total Fat', '1g', '1%'],
        ['Total Carbohydrate', '91g', '33%'],
        ['Dietary Fiber', '5g', '18%'],
        ['Protein', '1g', '2%'],
        ['Calcium', '28mg', '11%'],
        ['Iron', '1.2mg', '12%']
      ],
      details: {
        itemWeight: '170 Grams',
        dimensions: '20 x 10 x 6 cm',
        countryOfOrigin: 'India',
        genericName: 'Fruit Snacks',
        manufacturer: 'ORVELLA ORGANICS',
        fssai: '20726031003417'
      },
      variants: [
        { label: '100 g', sku: 'ORV-CHK-100G', price_paise: 14900, mrp_paise: 19900, stock_qty: 0, weight_grams: 100, is_default: false },
        { label: '200 g', sku: 'ORV-CHK-200G', price_paise: 24900, mrp_paise: 39900, stock_qty: 50, weight_grams: 200, is_default: true },
        { label: '400 g', sku: 'ORV-CHK-400G', price_paise: 44900, mrp_paise: 69900, stock_qty: 35, weight_grams: 400, is_default: false }
      ]
    },
    {
      category_slug: 'dried-fruit-snacks',
      id_slug: 'dried-black-plum-jamun-slices',
      name: 'Orvella Organics 100% Natural Dried Black Plum (Jamun) Slices',
      short_name: 'Dried Black Plum (Jamun) Slices',
      tagline: 'Pure Dehydrated Fruit, No Added Sugar | Superfood Snack',
      description: 'Experience the authentic, slightly tangy flavor of Indian Jamun (Black Plum) in dehydrated form. Naturally packed with antioxidants and known for supporting metabolic health, with zero sugar or chemicals added.',
      hero_file: 'jamun-front.jpg',
      image_files: ['jamun-front.jpg', 'jamun-back.jpg', 'jamun-front-back.jpg', 'jamun-nutrition.jpg', 'jamun-contact.jpg'],
      hsn_code: '08134090',
      gst_rate: 5.0,
      is_active: true,
      is_featured: true,
      benefits: [
        'Pure dehydrated Black Plum with intact phytonutrients',
        'Known for diabetic-friendly natural snacking',
        'Zero added sugar, vegan and gluten-free',
        'Resealable zip pouch'
      ],
      ingredients: ['100% Dehydrated Jamun Slices'],
      nutrition: [
        ['Calories', '340 kcal', '17%'],
        ['Total Fat', '0.5g', '1%'],
        ['Carbohydrate', '82g', '30%'],
        ['Dietary Fiber', '6g', '21%'],
        ['Protein', '2g', '4%'],
        ['Iron', '1.5mg', '15%']
      ],
      details: {
        itemWeight: '170 Grams',
        dimensions: '20 x 10 x 6 cm',
        countryOfOrigin: 'India',
        genericName: 'Fruit Snacks',
        manufacturer: 'ORVELLA ORGANICS',
        fssai: '20726031003417'
      },
      variants: [
        { label: '100 g', sku: 'ORV-JMN-100G', price_paise: 14900, mrp_paise: 19900, stock_qty: 25, weight_grams: 100, is_default: false },
        { label: '200 g', sku: 'ORV-JMN-200G', price_paise: 24900, mrp_paise: 39900, stock_qty: 60, weight_grams: 200, is_default: true },
        { label: '400 g', sku: 'ORV-JMN-400G', price_paise: 44900, mrp_paise: 69900, stock_qty: 40, weight_grams: 400, is_default: false }
      ]
    },
    {
      category_slug: 'dried-fruit-snacks',
      id_slug: 'dried-mango-slices',
      name: 'Orvella Organics 100% Natural Dried Mango Slices',
      short_name: 'Dried Mango Slices',
      tagline: 'King of Fruits in Pure Dehydrated Form, No Added Sugar',
      description: 'Sweet, fragrant, and chewy dried mango slices made from carefully selected ripe Indian mangoes. Provides a clean energy burst anytime without syrups or sulfur.',
      hero_file: 'mango-front.jpg',
      image_files: ['mango-front.jpg', 'mango-back.jpg', 'mango-front-back.jpg', 'mango-nutrition.jpg', 'mango-contact.jpg'],
      hsn_code: '08134090',
      gst_rate: 5.0,
      is_active: true,
      is_featured: true,
      benefits: [
        'Prepared from whole ripe mangoes',
        'Naturally rich in Vitamin A and Vitamin C',
        'No artificial colors, flavorings or sulfur',
        'Pocket-friendly travel nutrition'
      ],
      ingredients: ['100% Pure Mango Slices'],
      nutrition: [
        ['Calories', '360 kcal', '18%'],
        ['Total Fat', '0.8g', '1%'],
        ['Carbohydrate', '88g', '32%'],
        ['Dietary Fiber', '4.5g', '16%'],
        ['Vitamin A', '1400 IU', '28%'],
        ['Vitamin C', '35mg', '40%']
      ],
      details: {
        itemWeight: '170 Grams',
        dimensions: '20 x 10 x 6 cm',
        countryOfOrigin: 'India',
        genericName: 'Fruit Snacks',
        manufacturer: 'ORVELLA ORGANICS',
        fssai: '20726031003417'
      },
      variants: [
        { label: '100 g', sku: 'ORV-MNG-100G', price_paise: 14900, mrp_paise: 19900, stock_qty: 30, weight_grams: 100, is_default: false },
        { label: '200 g', sku: 'ORV-MNG-200G', price_paise: 24900, mrp_paise: 39900, stock_qty: 70, weight_grams: 200, is_default: true },
        { label: '400 g', sku: 'ORV-MNG-400G', price_paise: 44900, mrp_paise: 69900, stock_qty: 50, weight_grams: 400, is_default: false }
      ]
    },
    {
      category_slug: 'wellness-powders',
      id_slug: 'beetroot-powder',
      name: 'Orvella Organics Natural Beetroot Powder',
      short_name: 'Beetroot Powder',
      tagline: 'Superfood for Smoothies, Juices, Cooking and Natural Color',
      description: 'Experience the convenience of finely milled beetroot powder made from carefully selected root beets. Brings natural nitric oxide precursors, minerals, and vibrant natural color to everyday meals.',
      hero_file: 'beetroot-front.jpg',
      image_files: ['beetroot-front.jpg', 'beetroot-back.jpg', 'beetroot-front-back.jpg', 'beetroot-nutrition.jpg', 'beetroot-contact.jpg'],
      hsn_code: '21069099',
      gst_rate: 5.0,
      is_active: true,
      is_featured: true,
      benefits: [
        'Finely milled powder blends easily in water and smoothies',
        'Natural plant nitrates for stamina and circulation',
        '100% vegan, gluten-free with zero added sugar',
        'Ideal natural food coloring for rotis, bakery, and desserts'
      ],
      ingredients: ['100% Pure Beetroot Powder'],
      nutrition: [
        ['Energy', '354 kcal', '18%'],
        ['Protein', '11g', '22%'],
        ['Carbohydrate', '75g', '27%'],
        ['Dietary Fiber', '8g', '28%'],
        ['Iron', '2.8mg', '20%']
      ],
      details: {
        itemWeight: '200 Grams',
        dimensions: '20 x 10 x 6 cm',
        countryOfOrigin: 'India',
        genericName: 'Beetroot Powder',
        manufacturer: 'ORVELLA ORGANICS',
        fssai: '20726031003417'
      },
      variants: [
        { label: '100 g', sku: 'ORV-BTR-100G', price_paise: 14900, mrp_paise: 19900, stock_qty: 40, weight_grams: 100, is_default: false },
        { label: '200 g', sku: 'ORV-BTR-200G', price_paise: 24900, mrp_paise: 39900, stock_qty: 85, weight_grams: 200, is_default: true },
        { label: '400 g', sku: 'ORV-BTR-400G', price_paise: 44900, mrp_paise: 69900, stock_qty: 45, weight_grams: 400, is_default: false }
      ]
    },
    {
      category_slug: 'wellness-powders',
      id_slug: 'pumpkin-powder',
      name: 'Orvella Organics Natural Pumpkin Powder',
      short_name: 'Pumpkin Powder',
      tagline: 'Nutrient-Dense Pumpkin Powder for Soups, Baking and Shakes',
      description: 'Finely milled pumpkin powder packed with vitamins, zinc, and fiber. Perfect for enhancing soups, smoothies, daily gravies, or porridges without any fillers.',
      hero_file: 'pumpkin-front.jpg',
      image_files: ['pumpkin-front.jpg', 'pumpkin-back.jpg', 'pumpkin-front-back.jpg', 'pumpkin-nutrition.jpg', 'pumpkin-contact.jpg'],
      hsn_code: '21069099',
      gst_rate: 5.0,
      is_active: true,
      is_featured: true,
      benefits: [
        'Rich in beta carotene, potassium, and magnesium',
        'Versatile cooking and baking ingredient',
        'Zero additives, preservatives, or sugars',
        'Hygienically milled and sealed'
      ],
      ingredients: ['100% Pure Pumpkin Powder'],
      nutrition: [
        ['Energy', '330 kcal', '16%'],
        ['Protein', '9g', '18%'],
        ['Carbohydrate', '71g', '25%'],
        ['Dietary Fiber', '10g', '35%'],
        ['Potassium', '650mg', '19%']
      ],
      details: {
        itemWeight: '200 Grams',
        dimensions: '10 x 5 x 10 cm',
        countryOfOrigin: 'India',
        genericName: 'Pumpkin Powder',
        manufacturer: 'ORVELLA ORGANICS',
        fssai: '20726031003417'
      },
      variants: [
        { label: '100 g', sku: 'ORV-PMK-100G', price_paise: 14900, mrp_paise: 19900, stock_qty: 35, weight_grams: 100, is_default: false },
        { label: '200 g', sku: 'ORV-PMK-200G', price_paise: 24900, mrp_paise: 39900, stock_qty: 60, weight_grams: 200, is_default: true },
        { label: '400 g', sku: 'ORV-PMK-400G', price_paise: 44900, mrp_paise: 69900, stock_qty: 30, weight_grams: 400, is_default: false }
      ]
    }
  ];

  for (const item of productsData) {
    const category_id = categoryMap[item.category_slug];
    const hero_image = urlMap[item.hero_file] || '';
    const image_urls = item.image_files.map(f => urlMap[f] || '').filter(Boolean);

    const productPayload = {
      category_id,
      name: item.name,
      slug: item.id_slug,
      short_name: item.short_name,
      tagline: item.tagline,
      description: item.description,
      hero_image,
      image_urls,
      hsn_code: item.hsn_code,
      gst_rate: item.gst_rate,
      is_active: item.is_active,
      is_featured: item.is_featured,
      benefits: item.benefits,
      ingredients: item.ingredients,
      nutrition: item.nutrition,
      details: item.details
    };

    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .upsert(productPayload, { onConflict: 'slug' })
      .select('id, slug')
      .single();

    if (prodError) {
      console.error(`Error saving product ${item.name}:`, prodError.message);
      continue;
    }

    console.log(`✓ Product saved: ${item.short_name} (${prodData.id})`);

    // Clean old variants if any and re-insert
    await supabase.from('product_variants').delete().eq('product_id', prodData.id);

    const variantsPayload = item.variants.map(v => ({
      product_id: prodData.id,
      label: v.label,
      sku: v.sku,
      price_paise: v.price_paise,
      mrp_paise: v.mrp_paise,
      stock_qty: v.stock_qty,
      weight_grams: v.weight_grams,
      is_active: true,
      is_default: v.is_default
    }));

    const { error: variantError } = await supabase
      .from('product_variants')
      .insert(variantsPayload);

    if (variantError) {
      console.error(`Error adding variants for ${item.short_name}:`, variantError.message);
    } else {
      console.log(`  └─ Added ${variantsPayload.length} variants for ${item.short_name}`);
    }
  }
}

async function seedSettings() {
  console.log('\n--- Step 4: Seeding Store Settings ---');
  const settings = [
    {
      key: 'general',
      value: {
        store_name: 'Orvella Organics',
        tagline: '100% Natural Dehydrated Fruits & Wellness Powders',
        support_phone: '+91 97142 80780',
        support_email: 'orvellaorganics@gmail.com',
        fssai_number: '20726031003417',
        is_store_open: true
      }
    },
    {
      key: 'shipping',
      value: {
        free_shipping_threshold_paise: 49900, // ₹499
        flat_shipping_rate_paise: 4900,        // ₹49
        packaging_weight_grams: 50,
        pickup_pincode: '395006',
        pickup_city: 'Surat',
        pickup_state: 'Gujarat'
      }
    }
  ];

  for (const s of settings) {
    const { error } = await supabase
      .from('site_settings')
      .upsert(s, { onConflict: 'key' });

    if (error) {
      console.error(`Error updating setting ${s.key}:`, error.message);
    } else {
      console.log(`✓ Setting configured: ${s.key}`);
    }
  }
}

async function run() {
  try {
    const urlMap = await uploadImages();
    const categoryMap = await seedCategories();
    await seedProductsAndVariants(categoryMap, urlMap);
    await seedSettings();
    console.log('\n✨ Catalog import completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

run();
