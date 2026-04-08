/**
 * Upload CAD fonts to S3 storage using FormData POST (same as storagePut).
 * Run with: npx tsx upload-fonts.mjs
 */
import fs from 'fs';
import path from 'path';

const FONT_DIR = '/home/ubuntu/webdev-static-assets/cad-fonts';
const baseUrl = (process.env.BUILT_IN_FORGE_API_URL || '').replace(/\/+$/, '');
const apiKey = process.env.BUILT_IN_FORGE_API_KEY || '';

if (!baseUrl || !apiKey) {
  console.error('Missing env vars.');
  process.exit(1);
}

function ensureTrailingSlash(value) {
  return value.endsWith('/') ? value : `${value}/`;
}

async function uploadFont(file) {
  const filePath = path.join(FONT_DIR, file);
  const fileBuffer = fs.readFileSync(filePath);
  
  let contentType = 'application/octet-stream';
  if (file.endsWith('.woff')) contentType = 'font/woff';
  else if (file.endsWith('.json')) contentType = 'application/json';
  
  const relKey = `fonts/${file}`;
  
  // Build upload URL
  const uploadUrl = new URL('v1/storage/upload', ensureTrailingSlash(baseUrl));
  uploadUrl.searchParams.set('path', relKey);
  
  // Create FormData (same as storagePut)
  const blob = new Blob([fileBuffer], { type: contentType });
  const form = new FormData();
  form.append('file', blob, file);
  
  const resp = await fetch(uploadUrl.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: form,
  });
  
  if (resp.ok) {
    const data = await resp.json();
    return data.url;
  } else {
    const text = await resp.text();
    throw new Error(`${resp.status} ${text}`);
  }
}

const files = fs.readdirSync(FONT_DIR).filter(f => fs.statSync(path.join(FONT_DIR, f)).isFile());
console.log(`Found ${files.length} font files to upload`);

const results = {};
for (const file of files) {
  try {
    const url = await uploadFont(file);
    console.log(`OK ${file} -> ${url}`);
    results[file] = url;
  } catch (err) {
    console.error(`FAIL ${file}: ${err.message}`);
  }
}

if (results['fonts.json']) {
  const fontsBaseUrl = results['fonts.json'].replace('fonts.json', '');
  console.log(`\n=== FONTS BASE URL ===`);
  console.log(fontsBaseUrl);
}
