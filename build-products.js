#!/usr/bin/env node
// build-products.js
// Runs on every Netlify deploy — reads all product .md files
// and outputs a single products.json the site reads at runtime

const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, 'products');
const outputFile = path.join(__dirname, 'products.json');

// Simple frontmatter parser (no dependencies needed)
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result = {};
  
  let currentKey = null;
  let inArray = false;
  const arrayItems = [];

  yaml.split('\n').forEach(line => {
    // Array item
    if (line.match(/^  - /)) {
      const val = line.replace(/^  - /, '').replace(/^"|"$/g, '').trim();
      arrayItems.push(val);
      return;
    }
    
    // Save previous array
    if (inArray && currentKey) {
      result[currentKey] = [...arrayItems];
      arrayItems.length = 0;
      inArray = false;
    }

    const kvMatch = line.match(/^(\w+):\s*(.*)/);
    if (!kvMatch) return;
    
    const [, key, val] = kvMatch;
    currentKey = key;
    
    if (val.trim() === '') {
      // Could be array start
      inArray = true;
      return;
    }
    
    // Parse value
    const clean = val.trim().replace(/^"|"$/g, '');
    if (clean === 'true') result[key] = true;
    else if (clean === 'false') result[key] = false;
    else if (!isNaN(clean) && clean !== '') result[key] = parseFloat(clean);
    else result[key] = clean;
  });

  // Flush last array
  if (inArray && currentKey && arrayItems.length) {
    result[currentKey] = [...arrayItems];
  }

  return result;
}

const products = [];

if (fs.existsSync(productsDir)) {
  const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.md'));
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(productsDir, file), 'utf8');
    const data = parseFrontmatter(content);
    const slug = file.replace('.md', '');
    
    if (data.visible !== false) { // Only include visible products
      products.push({
        id: slug,
        name: data.name || slug,
        price: parseFloat(data.price) || 0,
        category: data.category || 'accessories',
        image: data.image || '',
        printful_url: data.printful_url || '',
        sizes: Array.isArray(data.sizes) ? data.sizes : ['One Size'],
        has_color: data.has_color !== false,
        badge: data.badge || '',
        featured: data.featured === true,
        sort_order: parseInt(data.sort_order) || 99,
        description: data.description || '',
      });
    }
  });
}

// Sort by sort_order
products.sort((a, b) => a.sort_order - b.sort_order);

fs.writeFileSync(outputFile, JSON.stringify(products, null, 2));
console.log(`✅ Built products.json with ${products.length} products`);
