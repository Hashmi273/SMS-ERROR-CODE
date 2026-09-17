const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const tabsRegex = /<div class="category-tabs"[^>]*>[\s\S]*?<\/div>/;
const newTabs = `<div class="category-tabs" id="categoryTabs" role="tablist">
          <button type="button" class="tab-btn active" data-cat="All" role="tab">All Operators</button>
          <button type="button" class="tab-btn" data-cat="Jio" role="tab">Jio</button>
          <button type="button" class="tab-btn" data-cat="Vi" role="tab">Vi</button>
          <button type="button" class="tab-btn" data-cat="Airtel" role="tab">Airtel</button>
          <button type="button" class="tab-btn" data-cat="SmartPing" role="tab">SmartPing</button>
        </div>`;
indexHtml = indexHtml.replace(tabsRegex, newTabs);
fs.writeFileSync(indexHtmlPath, indexHtml);

const appJsPath = path.join(__dirname, 'js', 'app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

// Update property references
appJs = appJs.replace(/item\.code/g, "(item.error_code || item.ErrorCode || item.code || '')");
appJs = appJs.replace(/item\.description/g, "(item.description || item.Description || '')");
appJs = appJs.replace(/item\.id/g, "(item.id || item.error_code || '')");
appJs = appJs.replace(/item\.category === activeCategory/g, "item.operator === activeCategory");
appJs = appJs.replace(/e\.category/g, "e.operator");

// Replace createErrorCard completely
const createCardRegex = /function createErrorCard\(item\) \{[\s\S]*?return card;\n  \}/;
const newCreateCard = `function createErrorCard(item) {
    const card = document.createElement('article');
    card.className = 'error-card';
    const code = (item.error_code || item.ErrorCode || item.code || '');
    card.setAttribute('data-id', code);
    card.setAttribute('data-code', code);

    const operator = item.operator || 'Unknown';
    let opClass = 'op-default';
    if(operator === 'Jio') opClass = 'op-jio';
    else if(operator === 'Vi') opClass = 'op-vi';
    else if(operator === 'Airtel') opClass = 'op-airtel';
    else if(operator === 'SmartPing') opClass = 'op-smartping';

    const safeCode = escapeHtml(code);
    const highlightedCode = currentQuery ? highlightMatches(code, currentQuery) : safeCode;

    const desc = item.description || item.Description || '';
    const descParts = desc.split('|').map(p => p.trim()).filter(Boolean);
    let descHtml = '';
    descParts.forEach(part => {
      const highlightedPart = currentQuery ? highlightMatches(part, currentQuery) : escapeHtml(part);
      descHtml += '<span class="desc-part">' + highlightedPart + '</span>';
    });

    const errorName = item.error_name ? escapeHtml(item.error_name) : '';
    const portalAction = item.portal_action ? escapeHtml(item.portal_action) : 'N/A';
    const retry = item.retry ? escapeHtml(item.retry) : 'N/A';

    card.innerHTML = [
      '<div class="card-header-bar" style="margin-bottom:0.5rem; border-bottom:none;">',
      '  <div class="code-badge-group">',
      '    <span class="operator-badge ' + opClass + '">' + escapeHtml(operator) + '</span>',
      '    <span class="error-code-badge">' + highlightedCode + '</span>',
      '  </div>',
      '  <span class="category-tag cat-system">' + escapeHtml(item.category || 'General') + '</span>',
      '</div>',
      '<div class="card-body" style="padding-top:0;">',
      '  <h3 class="error-title" style="margin-top:0.5rem;">' + errorName + '</h3>',
      '  <div class="error-desc-content">' + descHtml + '</div>',
      '  <div class="error-meta">',
      '    <div class="meta-item"><span class="meta-label">Action:</span><span class="meta-value">' + portalAction + '</span></div>',
      '    <div class="meta-item"><span class="meta-label">Retry:</span><span class="meta-value">' + retry + '</span></div>',
      '  </div>',
      '</div>',
      '<div class="card-action-bar">',
      '  <button type="button" class="card-btn copy-code-btn" title="Copy Error Code">',
      '    <span>Copy Code</span>',
      '  </button>',
      '  <button type="button" class="card-btn copy-desc-btn" title="Copy Error Description">',
      '    <span>Copy Details</span>',
      '  </button>',
      '</div>'
    ].join('');

    const copyCodeBtn = card.querySelector('.copy-code-btn');
    copyCodeBtn.addEventListener('click', () => {
      copyToClipboard(code, 'Error code copied: ' + code, copyCodeBtn);
    });

    const copyDescBtn = card.querySelector('.copy-desc-btn');
    copyDescBtn.addEventListener('click', () => {
      copyToClipboard('Operator: ' + operator + '\\nError Code: ' + code + '\\nName: ' + errorName + '\\nDescription: ' + desc, 'Details copied!', copyDescBtn);
    });

    return card;
  }`;

appJs = appJs.replace(createCardRegex, newCreateCard);
fs.writeFileSync(appJsPath, appJs);
console.log('UI updated successfully!');
