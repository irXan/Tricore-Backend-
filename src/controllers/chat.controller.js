const Product = require('../models/Product');

const CATEGORIES = {
  'surgical instrument': 'Surgical Instruments',
  'surgical': 'Surgical Instruments',
  'scissor': 'Surgical Instruments',
  'needle holder': 'Surgical Instruments',
  'forcep': 'Surgical Instruments',
  'hospital bed': 'Hospital Furniture',
  'furniture': 'Hospital Furniture',
  'trolley': 'Hospital Furniture',
  'table': 'Hospital Furniture',
  'overbed': 'Hospital Furniture',
  'bed': 'Hospital Furniture',
  'steril': 'Sterilization Equipment',
  'autoclave': 'Sterilization Equipment',
  'uv cabinet': 'Sterilization Equipment',
  'diagnostic': 'Diagnostic Devices',
  'otoscope': 'Diagnostic Devices',
  'sphygmomanometer': 'Diagnostic Devices',
  'bp': 'Diagnostic Devices',
  'blood pressure': 'Diagnostic Devices',
  'monitor': 'Patient Monitoring',
  'patient monitor': 'Patient Monitoring',
  'oximeter': 'Patient Monitoring',
  'pulse': 'Patient Monitoring',
  'spo2': 'Patient Monitoring',
  'disposable': 'Disposables & Consumables',
  'consumable': 'Disposables & Consumables',
  'glove': 'Disposables & Consumables',
  'n95': 'Disposables & Consumables',
  'mask': 'Disposables & Consumables',
  'iv': 'Disposables & Consumables',
  'administration set': 'Disposables & Consumables',
};

const BRAND_KEYWORDS = {
  'atom': 'Atom Medical',
  'lifecare': 'LifeCare Medical',
  'yuwell': 'Yuwell',
  'ucheck': 'UCheck',
  'lifechek': 'LifeChek',
  'tricore': 'TriCore Supply',
};

function extractKeywords(message) {
  const lower = message.toLowerCase();
  const words = lower.split(/[\s,.;:!?()]+/).filter(Boolean);
  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(words[i] + ' ' + words[i + 1]);
  }
  return { words, bigrams, full: lower };
}

function detectCategory(keywords) {
  for (const [keyword, category] of Object.entries(CATEGORIES)) {
    if (keywords.full.includes(keyword)) return category;
  }
  return null;
}

function detectBrand(keywords) {
  for (const [keyword, brand] of Object.entries(BRAND_KEYWORDS)) {
    if (keywords.full.includes(keyword)) return brand;
  }
  return null;
}

const INTENTS = {
  greeting: /\b(hi|hello|hey|good (morning|afternoon|evening)|greet)\b/i,
  quote: /\b(quote|order|buy|purchase|price|cost|how (much|to order)|request)\b/i,
  contact: /\b(contact|phone|call|email|talk|speak|reach)\b/i,
  brands: /\b(brand|partner|manufacturer|distribut|who (makes|supplies)|carry)\b/i,
  help: /\b(help|what can you|capabilities|features|assist)\b/i,
  spec: /\b(spec|specification|weight|size|dimension|capacity|material|power|standard)\b/i,
  catalogue: /\b(catalogue|catalog|list|all product|everything|what (do you|products)|available)\b/i,
};

function detectIntent(message) {
  const matches = [];
  for (const [intent, pattern] of Object.entries(INTENTS)) {
    if (pattern.test(message)) matches.push(intent);
  }
  return matches;
}

async function searchProducts(message) {
  const keywords = extractKeywords(message);
  const category = detectCategory(keywords);
  const brand = detectBrand(keywords);
  const intents = detectIntent(message);

  const query = {};
  if (category) query.category = category;
  if (brand) query.brand = brand;

  const searchTerms = keywords.words.filter((w) => w.length > 2);
  if (!category && !brand && searchTerms.length > 0) {
    const regexTerms = searchTerms.map((t) => new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    query.$or = [
      { name: { $in: regexTerms } },
      { description: { $in: regexTerms } },
      { category: { $in: regexTerms } },
      { brand: { $in: regexTerms } },
      ...regexTerms.map((r) => ({ 'specs': { $regex: r.source, $options: 'i' } })),
    ];
  } else if (searchTerms.length > 0) {
    const searchRegex = new RegExp(searchTerms.join('|').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (!query.$or) query.$or = [];
    query.$or.push({ name: searchRegex }, { description: searchRegex });
  }

  const products = await Product.find(query).limit(5).lean();
  return { products, category, brand, intents };
}

function buildReply(result, message) {
  const { products, category, brand, intents } = result;
  const suggestions = [];

  if (products.length > 0) {
    const list = products.map((p) => `- **${p.name}** (${p.brand}): ${p.description.slice(0, 120)}…`).join('\n');
    const categoryLabel = category || products[0].category;
    const count = products.length;
    return {
      reply: `I found ${count} ${categoryLabel.toLowerCase()} item${count > 1 ? 's' : ''}:\n\n${list}\n\nWould you like details on any specific item, or shall I help with a quote request?`,
      products: products.map((p) => ({
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        category: p.category,
        description: p.description.slice(0, 150),
        specs: Object.entries(p.specs || {}).slice(0, 6).map(([k, v]) => `${k}: ${v}`),
      })),
      suggestions: ['Tell me more about ' + products[0].name, 'Request a quote for these items', 'Show me all ' + categoryLabel.toLowerCase()],
    };
  }

  if (intents.includes('greeting')) {
    suggestions.push('What products do you have?', 'Show me ICU equipment', 'How do I request a quote?');
    return {
      reply: 'Welcome to TriCore Surgical. I can help you explore our catalogue of general surgical equipment and hospital furniture. Ask me about specific products, brands, or how to request a quotation.',
      products: [],
      suggestions,
    };
  }

  if (intents.includes('quote')) {
    suggestions.push('Take me to the quote form');
    return {
      reply: 'TriCore Surgical works on a quotation-first model — there is no online checkout. Send your requirements (item, quantity, preferred brand, and timing) via our Request a Quote form, and our team will respond directly with pricing and availability.',
      products: [],
      suggestions,
    };
  }

  if (intents.includes('contact')) {
    return {
      reply: 'You can reach TriCore Surgical through the Contact page on this site, or by phone at the number listed in the footer. For a direct message, use the contact form and our team will respond.',
      products: [],
      suggestions: ['Go to the contact page', 'I want to request a quote instead'],
    };
  }

  if (intents.includes('brands')) {
    return {
      reply: 'TriCore Surgical distributes products from five partner brands:\n\n- **Atom Medical** — clinical equipment solutions\n- **LifeCare Medical** — practical healthcare delivery products\n- **Yuwell** — healthcare devices and patient care equipment\n- **UCheck** — testing and diagnostic solutions\n- **LifeChek** — health monitoring products\n\nWould you like to see products from a specific brand?',
      products: [],
      suggestions: ['Show me Atom Medical products', 'Show me Yuwell products', 'Browse all brands'],
    };
  }

  if (intents.includes('help')) {
    suggestions.push('What surgical instruments do you have?', 'Show me hospital beds', 'How do I order?');
    return {
      reply: 'I can help with:\n\n- **Product search** — ask me about surgical instruments, hospital furniture, monitors, sterilizers, diagnostics, or disposables\n- **Brand information** — learn about our partner brands\n- **Specifications** — ask about specific product specs\n- **Quotation guidance** — how to request a quote\n\nWhat would you like to know?',
      products: [],
      suggestions,
    };
  }

  if (intents.includes('catalogue')) {
    suggestions.push('Show me surgical instruments', 'Show me hospital furniture', 'Show me patient monitors');
    return {
      reply: 'Our catalogue covers six categories: Surgical Instruments, Hospital Furniture, Sterilization Equipment, Diagnostic Devices, Patient Monitoring, and Disposables & Consumables. Which area would you like to explore?',
      products: [],
      suggestions,
    };
  }

  if (intents.includes('spec')) {
    suggestions.push('Show me product specifications', 'Browse the full catalogue');
    return {
      reply: 'I can look up specifications for any product in our catalogue. Tell me the product name (e.g., "LifeCare HC-300 bed specs") and I will show you the details.',
      products: [],
      suggestions,
    };
  }

  suggestions.push('Browse the product catalogue', 'How do I request a quote?', 'What brands do you carry?');
  return {
    reply: "I'm not sure I understood that. I can help you find products by name, category, or brand. Try asking about a specific product, like \"What ICU beds do you carry?\" or \"Show me Yuwell products.\"",
    products: [],
    suggestions,
  };
}

async function chat(req, res, next) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(422).json({ message: 'A message is required.' });
    }

    const result = await searchProducts(message.trim());
    const reply = buildReply(result, message);
    return res.json(reply);
  } catch (error) {
    return next(error);
  }
}

module.exports = { chat };
