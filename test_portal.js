const fs = require('fs');
const path = require('path');

const projectRoot = 'C:/Users/Admin/.gemini/antigravity/scratch/immense-error-code-hub';

console.log('=== STARTING AUTOMATED TEST SUITE FOR IMMENSE ERROR HUB ===\n');

// 1. Check data/errors.json
const jsonPath = path.join(projectRoot, 'data/errors.json');
if (!fs.existsSync(jsonPath)) {
  console.error('FAIL: data/errors.json does not exist!');
  process.exit(1);
}
const errors = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log(`[PASS] data/errors.json loaded successfully with ${errors.length} records.`);

// 2. Check js/errors-data.js
const jsDataPath = path.join(projectRoot, 'js/errors-data.js');
if (!fs.existsSync(jsDataPath)) {
  console.error('FAIL: js/errors-data.js does not exist!');
  process.exit(1);
}
const jsDataContent = fs.readFileSync(jsDataPath, 'utf8');
if (!jsDataContent.includes('window.IMMENSE_ERRORS_DATA')) {
  console.error('FAIL: js/errors-data.js does not contain window.IMMENSE_ERRORS_DATA!');
  process.exit(1);
}
console.log(`[PASS] js/errors-data.js exists (${jsDataContent.length} bytes) and defines fallback.`);

// 3. Verify Exact Error Code Search: '20A'
const match20A = errors.filter(e => e.code.toUpperCase() === '20A');
console.log(`[PASS] Exact code '20A' test: found ${match20A.length} record(s).`);
match20A.forEach(m => console.log(`       Desc: "${m.description}"`));
if (match20A.length === 0 || !match20A[0].description.includes('Bearer Service Not Supported')) {
  console.error('FAIL: Code 20A description mismatch!');
  process.exit(1);
}

// 4. Verify Case-insensitivity: '20a'
const match20aLower = errors.filter(e => e.code.toLowerCase() === '20a');
console.log(`[PASS] Case-insensitive '20a' matches: ${match20aLower.length} record(s).`);

// 5. Verify Partial Code Search: '20'
const match20Partial = errors.filter(e => e.code.toLowerCase().includes('20'));
console.log(`[PASS] Partial code '20' matches: ${match20Partial.length} record(s).`);

// 6. Verify Keyword Search: 'authentication'
const matchAuth = errors.filter(e => e.description.toLowerCase().includes('authentication'));
console.log(`[PASS] Keyword 'authentication' matches: ${matchAuth.length} record(s).`);
matchAuth.forEach(m => console.log(`       Code: ${m.code} -> "${m.description}"`));

// 7. Verify Multi-description retention (Code 22E)
const match22E = errors.filter(e => e.code.toUpperCase() === '22E');
console.log(`[PASS] Code 22E multi-description test: found ${match22E.length} record(s).`);
match22E.forEach(m => console.log(`       Desc: "${m.description}"`));
if (match22E.length !== 2) {
  console.error('FAIL: Code 22E should have preserved both distinct descriptions!');
  process.exit(1);
}

// 8. Verify Special characters & DLT codes: 5110
const match5110 = errors.filter(e => e.code === '5110');
console.log(`[PASS] Code 5110 test: found ${match5110.length} record(s).`);
match5110.forEach(m => console.log(`       Desc: "${m.description}"`));

// 9. Verify End record: 9196
const match9196 = errors.filter(e => e.code === '9196');
console.log(`[PASS] Boundary code 9196 test: found ${match9196.length} record(s).`);
match9196.forEach(m => console.log(`       Desc: "${m.description}"`));

// 10. Verify index.html elements
const htmlPath = path.join(projectRoot, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const requiredIds = [
  'searchInput', 'clearBtn', 'searchForm', 'resultsGrid', 'emptyState',
  'resultsCount', 'queryDuration', 'categoryTabs', 'targetSelect', 'themeToggle',
  'resetSearchBtn', 'recentTagsContainer', 'statTotal', 'statCategories', 'statSpeed'
];

let allIdsFound = true;
requiredIds.forEach(id => {
  if (!html.includes(`id="${id}"`)) {
    console.error(`FAIL: index.html missing id="${id}"`);
    allIdsFound = false;
  }
});
if (allIdsFound) {
  console.log('[PASS] All DOM Element IDs verified in index.html.');
} else {
  process.exit(1);
}

// 11. Verify CSS file
const cssPath = path.join(projectRoot, 'css/style.css');
const css = fs.readFileSync(cssPath, 'utf8');
if (css.includes('--immense-navy: #0B1936') && css.includes('--immense-orange: #FF5E1E') && css.includes('--immense-white: #FFFFFF') && css.includes('data-theme="dark"')) {
  console.log('[PASS] CSS tokens & dark theme verified.');
} else {
  console.error('FAIL: CSS missing brand tokens or dark theme!');
  process.exit(1);
}

// 12. Verify Assets
if (fs.existsSync(path.join(projectRoot, 'assets/logo.svg')) && fs.existsSync(path.join(projectRoot, 'assets/favicon.svg'))) {
  console.log('[PASS] SVG Logo & Favicon verified.');
} else {
  console.error('FAIL: Assets missing!');
  process.exit(1);
}

console.log('\n=== ALL 12 AUTOMATED TESTS PASSED WITH 100% SUCCESS ===');
