/**
 * seedProducts.js — Demo data seed script for TriCore Surgical.
 *
 * Run from the backend directory:
 *   node src/utils/seedProducts.js            # insert (skip duplicates)
 *   node src/utils/seedProducts.js --reset    # delete existing demo products first, then insert
 *
 * ⚠️  This inserts FAKE data for client demo purposes only.
 *     Replace with real product data before going live.
 *
 * Rules:
 * - Uses the real Product model and MongoDB connection — goes through real DB.
 * - Skips duplicates by slug (insertMany with ordered: false).
 * - Does NOT modify the Product schema.
 * - Images use Pexels stock photos (free-to-use, commercially licensed).
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const Product = require('../models/Product');

const img = (url) => [url];

const DEMO_PRODUCTS = [
  // ── Surgical Instruments ──────────────────────────────────────────────────
  {
    name: 'TC-SCI 200 Surgical Scissor Set',
    slug: 'tc-sci-200-surgical-scissor-set',
    category: 'Surgical Instruments',
    brand: 'TriCore Supply',
    description:
      'A five-piece stainless steel scissor set covering the most common intraoperative requirements: Mayo straight, Mayo curved, Metzenbaum, iris, and bandage shears. Autoclavable, corrosion-resistant finish.',
    specs: {
      Material: 'Grade 316L stainless steel',
      Sterilization: 'Autoclave / EO gas compatible',
      Pieces: '5',
      'Handle type': 'Ring handle',
    },
    images: img('https://images.pexels.com/photos/4074689/pexels-photo-4074689.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    featured: true,
  },
  {
    name: 'Atom Needle Holder — Crile-Wood 18 cm',
    slug: 'atom-needle-holder-crile-wood-18cm',
    category: 'Surgical Instruments',
    brand: 'Atom Medical',
    description:
      'Crile-Wood pattern needle holder with tungsten carbide jaw inserts for reliable suture grip. Ratchet locking mechanism, 18 cm length — suitable for general and abdominal procedures.',
    specs: {
      Length: '18 cm',
      Jaw: 'Tungsten carbide inserts',
      Pattern: 'Crile-Wood',
      Finish: 'Satin',
    },
    images: img('https://images.pexels.com/photos/7108116/pexels-photo-7108116.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    featured: false,
  },

  // ── Hospital Furniture ────────────────────────────────────────────────────
  {
    name: 'LifeCare HC-300 Electric Hospital Bed',
    slug: 'lifecare-hc-300-electric-hospital-bed',
    category: 'Hospital Furniture',
    brand: 'LifeCare Medical',
    description:
      'Three-function electric hospital bed with head, foot, and height adjustment. Collapsible full-length side rails, 150 kg safe working load, lockable castors, and central brake system. Suitable for general wards and post-op recovery.',
    specs: {
      Functions: '3 (head / foot / height)',
      'Safe working load': '150 kg',
      'Mattress platform': '2000 × 900 mm',
      'Height range': '450 – 800 mm',
      Power: '240 V AC',
    },
    images: img('https://images.pexels.com/photos/6010874/pexels-photo-6010874.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    featured: true,
  },
  {
    name: 'TC-WT 450 Stainless Dressing Trolley',
    slug: 'tc-wt-450-stainless-dressing-trolley',
    category: 'Hospital Furniture',
    brand: 'TriCore Supply',
    description:
      'Two-shelf stainless steel dressing trolley with push-handle and four swivel castors (two locking). Smooth welded edges, no hidden recesses. 450 × 350 mm shelf surface. Suitable for treatment rooms and ward use.',
    specs: {
      Material: '304 stainless steel',
      Shelves: '2',
      'Shelf dimensions': '450 × 350 mm',
      Castors: '4 swivel, 2 locking',
      Load: '40 kg per shelf',
    },
    images: img('https://images.pexels.com/photos/5827294/pexels-photo-5827294.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    featured: false,
  },
  {
    name: 'Atom Overbed Table — Height Adjustable',
    slug: 'atom-overbed-table-height-adjustable',
    category: 'Hospital Furniture',
    brand: 'Atom Medical',
    description:
      'Cantilever overbed table with tiltable MDF laminate top (660 × 400 mm). Gas-assisted height adjustment from 750 to 1150 mm. H-base with castors and non-scratch foot pads. Suitable for meals, reading, or patient activity.',
    specs: {
      'Top dimensions': '660 × 400 mm',
      'Height range': '750 – 1150 mm',
      'Top surface': 'MDF, wipe-clean laminate',
      Base: 'Powder-coated steel H-base',
    },
    images: img('https://images.pexels.com/photos/12081340/pexels-photo-12081340.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    featured: false,
  },

  // ── Sterilization Equipment ───────────────────────────────────────────────
  {
    name: 'Yuwell YX-18L Autoclave Steam Sterilizer',
    slug: 'yuwell-yx-18l-autoclave-steam-sterilizer',
    category: 'Sterilization Equipment',
    brand: 'Yuwell',
    description:
      'Class B pre-vacuum autoclave, 18-litre chamber. Microprocessor-controlled cycle management with LCD display, built-in printer port, and automatic door safety lock. Meets EN 13060 Class B requirements.',
    specs: {
      'Chamber volume': '18 L',
      Class: 'Class B (EN 13060)',
      Temperature: '134 °C (default)',
      'Cycle time': '~30 min (standard)',
      Power: '2.2 kW / 240 V',
    },
    images: img('https://images.pexels.com/photos/6627664/pexels-photo-6627664.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    featured: true,
  },
  {
    name: 'TC-UV 600 Ultraviolet Cabinet',
    slug: 'tc-uv-600-ultraviolet-cabinet',
    category: 'Sterilization Equipment',
    brand: 'TriCore Supply',
    description:
      'Stainless steel UV-C storage cabinet for maintaining sterility of already-sterilized instruments. Dual 15 W UV-C lamps, timed exposure (0–99 min), viewing window, and internal mirror reflector for even irradiation.',
    specs: {
      'Interior dimensions': '600 × 400 × 300 mm',
      'UV-C output': '2 × 15 W',
      Timer: '0 – 99 min',
      Material: '304 stainless interior',
    },
    images: img('https://images.pexels.com/photos/6627827/pexels-photo-6627827.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    featured: false,
  },

  // ── Diagnostic Devices ────────────────────────────────────────────────────
  {
    name: 'UCheck UC-D200 Digital Otoscope',
    slug: 'ucheck-uc-d200-digital-otoscope',
    category: 'Diagnostic Devices',
    brand: 'UCheck',
    description:
      'Diagnostic otoscope with 3.5 V LED illumination, 2.5× magnification, and 4 mm pneumatic speculum port. Ergonomic rubber-grip handle compatible with standard UCheck diagnostic handle range. Autoclavable speculum tips.',
    specs: {
      Illumination: '3.5 V LED',
      Magnification: '2.5×',
      'Speculum port': '4 mm pneumatic',
      Compatibility: 'UCheck handle range',
    },
    images: img('https://images.pexels.com/photos/5206950/pexels-photo-5206950.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    featured: false,
  },
  {
    name: 'LifeChek BP-900 Aneroid Sphygmomanometer',
    slug: 'lifechek-bp-900-aneroid-sphygmomanometer',
    category: 'Diagnostic Devices',
    brand: 'LifeChek',
    description:
      'Adult aneroid sphygmomanometer with calibration check port, latex-free cuff (22–42 cm range), and chrome-plated gauge. Zero-reset control valve. Supplied in a zippered carry case. Compliant with EN ISO 81060-1.',
    specs: {
      'Cuff range': '22 – 42 cm (adult)',
      Gauge: 'Chrome-plated aneroid',
      Standard: 'EN ISO 81060-1',
      Latex: 'Latex-free',
    },
    images: img('https://images.pexels.com/photos/5721676/pexels-photo-5721676.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    featured: false,
  },

  // ── Patient Monitoring ────────────────────────────────────────────────────
  {
    name: 'Yuwell YX-300 Fingertip Pulse Oximeter',
    slug: 'yuwell-yx-300-fingertip-pulse-oximeter',
    category: 'Patient Monitoring',
    brand: 'Yuwell',
    description:
      'Compact fingertip pulse oximeter with dual-colour OLED display showing SpO₂, pulse rate, and plethysmograph. Auto-off at 8 seconds of no signal. Suitable for spot-check use in wards and clinics. CE and FDA cleared.',
    specs: {
      'SpO₂ range': '70 – 100 %',
      Accuracy: '±2 % (70–100 %)',
      'Pulse rate': '25 – 250 bpm',
      Display: 'Dual-colour OLED',
      'Power source': '2 × AAA batteries',
    },
    images: img('https://images.pexels.com/photos/7580249/pexels-photo-7580249.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    featured: true,
  },
  {
    name: 'LifeCare PM-500 Bedside Patient Monitor',
    slug: 'lifecare-pm-500-bedside-patient-monitor',
    category: 'Patient Monitoring',
    brand: 'LifeCare Medical',
    description:
      'Five-parameter bedside monitor: ECG, SpO₂, NIBP, temperature, and respiration rate. 10.1-inch TFT colour touchscreen, 120-hour trend storage, nurse call output, and optional central station connectivity. Suitable for general ward and HDU.',
    specs: {
      Parameters: 'ECG, SpO₂, NIBP, Temp, Resp',
      Display: '10.1" TFT colour touchscreen',
      'Trend storage': '120 hours',
      Connectivity: 'LAN / optional central station',
    },
    images: img('https://images.pexels.com/photos/9408868/pexels-photo-9408868.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    featured: true,
  },

  // ── Disposables / Consumables ─────────────────────────────────────────────
  {
    name: 'TC-DG N95 Filtering Facepiece Respirator (Box 20)',
    slug: 'tc-dg-n95-filtering-facepiece-respirator-box-20',
    category: 'Disposables & Consumables',
    brand: 'TriCore Supply',
    description:
      'NIOSH-approved N95 filtering facepiece respirator. Cup-shaped design with adjustable noseclip and dual head-strap. ≥95 % filtration of non-oil-based particulates. Individually poly-wrapped. Box of 20 units. Suitable for clinical environments.',
    specs: {
      Standard: 'NIOSH N95',
      Filtration: '≥95 % (non-oil particulates)',
      Design: 'Cup-shaped, adjustable noseclip',
      'Pack size': '20 units per box',
    },
    images: img('https://images.pexels.com/photos/3993241/pexels-photo-3993241.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    featured: false,
  },
  {
    name: 'UCheck Nitrile Examination Gloves — Medium (100)',
    slug: 'ucheck-nitrile-examination-gloves-medium-100',
    category: 'Disposables & Consumables',
    brand: 'UCheck',
    description:
      'Powder-free nitrile examination gloves, textured fingertips, AQL 1.5. Suitable for clinical examination, diagnostic procedures, and general barrier protection. Latex-free. Box of 100. Available in S, M, L, XL on request.',
    specs: {
      Material: 'Nitrile (latex-free)',
      Powder: 'Powder-free',
      AQL: '1.5',
      Size: 'Medium',
      'Pack size': '100 units per box',
    },
    images: img('https://images.pexels.com/photos/7856715/pexels-photo-7856715.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    featured: false,
  },
  {
    name: 'LifeChek IV Administration Set — Macro-drip (50)',
    slug: 'lifechek-iv-administration-set-macro-drip-50',
    category: 'Disposables & Consumables',
    brand: 'LifeChek',
    description:
      'Standard macro-drip IV administration set (20 drops/mL). Non-DEHP PVC tubing, luer-lock connector, roller clamp, 15 μm in-line filter, and injection port. 180 cm length. EO sterilized, individually packaged. Box of 50 sets.',
    specs: {
      'Drop factor': '20 drops / mL',
      'Tubing length': '180 cm',
      Material: 'Non-DEHP PVC',
      Filter: '15 μm in-line',
      Sterilization: 'EO sterilized',
      'Pack size': '50 sets per box',
    },
    images: img('https://images.pexels.com/photos/6129691/pexels-photo-6129691.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
    featured: false,
  },
];

async function seed() {
  const { MONGODB_URI } = process.env;
  const isReset = process.argv.includes('--reset');

  if (!MONGODB_URI) {
    console.error('❌  MONGODB_URI not set. Add it to backend/.env and try again.');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.info(`MongoDB connected: ${mongoose.connection.host}`);

  if (isReset) {
    const slugs = DEMO_PRODUCTS.map((p) => p.slug);
    const deleted = await Product.deleteMany({ slug: { $in: slugs } });
    console.info(`🗑️  Reset: deleted ${deleted.deletedCount} existing demo products.`);
  }

  try {
    const result = await Product.insertMany(DEMO_PRODUCTS, { ordered: false });
    console.info(`✅  Inserted ${result.length} demo products.`);
  } catch (err) {
    if (err.writeErrors) {
      const inserted = DEMO_PRODUCTS.length - err.writeErrors.length;
      console.info(`✅  Inserted ${inserted} new demo products (${err.writeErrors.length} skipped — already exist).`);
    } else {
      throw err;
    }
  }

  console.warn('⚠️  Seeded FAKE demo data — replace with real client data before going live.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed script failed:', err.message);
  process.exit(1);
});
