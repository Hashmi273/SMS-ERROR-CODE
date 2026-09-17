/**
 * IMMENSE SMART SOLUTIONS — ERROR CODE INTELLIGENCE HUB
 * High-Performance Client-Side Application Engine
 */

(function () {
  'use strict';

  // State
  let allErrors = [];
  let currentFiltered = [];
  let activeCategory = 'All';
  let activeTarget = 'all'; // 'all', 'code', 'desc'
  let currentQuery = '';
  let renderLimit = 48;
  const BATCH_SIZE = 48;

  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  const searchForm = document.getElementById('searchForm');
  const resultsGrid = document.getElementById('resultsGrid');
  const emptyState = document.getElementById('emptyState');
  const resultsCount = document.getElementById('resultsCount');
  const queryDuration = document.getElementById('queryDuration');
  const categoryTabs = document.getElementById('categoryTabs');
  const targetSelect = document.getElementById('targetSelect');
  const themeToggle = document.getElementById('themeToggle');
  const resetSearchBtn = document.getElementById('resetSearchBtn');
  const recentTagsContainer = document.getElementById('recentTagsContainer');
  const loadMoreContainer = document.getElementById('loadMoreContainer');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  // Stat Elements
  const statTotal = document.getElementById('statTotal');
  const statCategories = document.getElementById('statCategories');
  const statSpeed = document.getElementById('statSpeed');
  // ==========================================================================
  // 1. Initial Load & Resilient Data Fetching
  // ==========================================================================
  async function init() {
    initTheme();
    setupEventListeners();
    await loadDataset();
    handleUrlParams();
    renderRecentSearches();
  }

  async function loadDataset() {
    try {
      const response = await fetch('data/errors.json');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      allErrors = await response.json();
    } catch (err) {
      console.warn('Network fetch failed (likely running via file://). Using embedded master dataset fallback.', err);
      if (window.IMMENSE_ERRORS_DATA && Array.isArray(window.IMMENSE_ERRORS_DATA)) {
        allErrors = window.IMMENSE_ERRORS_DATA;
      } else {
        console.error('Master dataset could not be loaded.');
        showToast('Failed to load error database.', 'error');
        return;
      }
    }

    if (statTotal) statTotal.textContent = allErrors.length;
    const categoriesSet = new Set(allErrors.map(e => e.operator));
    if (statCategories) statCategories.textContent = categoriesSet.size;

    executeSearch();
  }
  // ==========================================================================
  // 2. High-Performance Search & Ranking Engine
  // ==========================================================================
  function executeSearch() {
    const startTime = performance.now();
    const q = (searchInput ? searchInput.value : '').trim();
    currentQuery = q;

    if (clearBtn) {
      if (q.length > 0) {
        clearBtn.classList.add('visible');
      } else {
        clearBtn.classList.remove('visible');
      }
    }

    let results = allErrors;

    if (activeCategory !== 'All') {
      results = results.filter(item => item.operator === activeCategory);
    }

    if (q) {
      const qLower = q.toLowerCase();
      const qTokens = qLower.split(/\s+/).filter(Boolean);

      results = results.filter(item => {
        const code = (item.error_code || item.ErrorCode || item.code || '').toLowerCase();
        const desc = (item.description || item.Description || '').toLowerCase();

        if (activeTarget === 'code') {
          return code.includes(qLower);
        } else if (activeTarget === 'desc') {
          return qTokens.every(tok => desc.includes(tok));
        } else {
          if (code === qLower || code.includes(qLower)) return true;
          return qTokens.every(tok => desc.includes(tok) || code.includes(tok));
        }
      });

      results.sort((a, b) => {
        const aCode = a.code.toLowerCase();
        const bCode = b.code.toLowerCase();
        if (aCode === qLower && bCode !== qLower) return -1;
        if (bCode === qLower && aCode !== qLower) return 1;

        const aStarts = aCode.startsWith(qLower);
        const bStarts = bCode.startsWith(qLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        const aHas = aCode.includes(qLower);
        const bHas = bCode.includes(qLower);
        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;

        return a.id - b.id;
      });
    }

    const elapsed = Math.max(0.1, performance.now() - startTime).toFixed(1);
    if (queryDuration) queryDuration.textContent = elapsed + 'ms';
    if (statSpeed) statSpeed.textContent = '<' + (Math.ceil(elapsed) || 1) + 'ms';

    currentFiltered = results;
    renderLimit = BATCH_SIZE;
    renderResults();
    updateUrlParams();
  }
  // ==========================================================================
  // 3. Results Rendering
  // ==========================================================================
  function renderResults() {
    if (!resultsGrid) return;
    resultsGrid.innerHTML = '';

    const total = currentFiltered.length;
    if (resultsCount) resultsCount.textContent = total;

    if (total === 0) {
      emptyState.classList.add('visible');
      resultsGrid.style.display = 'none';
      if (loadMoreContainer) loadMoreContainer.style.display = 'none';
      return;
    }

    emptyState.classList.remove('visible');
    resultsGrid.style.display = 'grid';

    const itemsToRender = currentFiltered.slice(0, renderLimit);
    const fragment = document.createDocumentFragment();

    itemsToRender.forEach(item => {
      const card = createErrorCard(item);
      fragment.appendChild(card);
    });

    resultsGrid.appendChild(fragment);

    if (loadMoreContainer) {
      if (renderLimit < total) {
        loadMoreContainer.style.display = 'flex';
        loadMoreBtn.textContent = 'Show More (' + (total - renderLimit) + ' remaining)';
      } else {
        loadMoreContainer.style.display = 'none';
      }
    }
  }

  function createErrorCard(item) {
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
      copyToClipboard('Operator: ' + operator + '\nError Code: ' + code + '\nName: ' + errorName + '\nDescription: ' + desc, 'Details copied!', copyDescBtn);
    });

    return card;
  }

  function getCategoryClass(category) {
    if (category.includes('DLT')) return 'cat-dlt';
    if (category.includes('MAP')) return 'cat-map';
    if (category.includes('SMPP')) return 'cat-smpp';
    if (category.includes('Network')) return 'cat-network';
    return 'cat-system';
  }
  // ==========================================================================
  // 4. Safe XSS Sanitization & Highlighting
  // ==========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightMatches(text, query) {
    if (!text || !query) return escapeHtml(text);
    const tokens = query.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return escapeHtml(text);

    const pattern = tokens.map(escapeRegExp).join('|');
    const regex = new RegExp('(' + pattern + ')', 'gi');

    const parts = text.split(regex);
    return parts
      .map(part => {
        if (!part) return '';
        if (tokens.some(t => t.toLowerCase() === part.toLowerCase())) {
          return '<mark class="search-highlight">' + escapeHtml(part) + '</mark>';
        }
        return escapeHtml(part);
      })
      .join('');
  }
  // ==========================================================================
  // 5. Clipboard & Toast Notifications
  // ==========================================================================
  async function copyToClipboard(text, message, btnEl) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      if (btnEl) {
        const origHtml = btnEl.innerHTML;
        btnEl.classList.add('copied');
        btnEl.innerHTML = '<svg class="card-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Copied ✓</span>';
        setTimeout(() => {
          btnEl.classList.remove('copied');
          btnEl.innerHTML = origHtml;
        }, 1800);
      }

      showToast(message);
    } catch (e) {
      console.error('Failed to copy', e);
      showToast('Could not copy to clipboard.', 'error');
    }
  }

  function showToast(text, type) {
    type = type || 'success';
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = (type === 'success' 
      ? '<svg class="toast-icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : '<svg class="toast-icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>')
      + '<span>' + escapeHtml(text) + '</span>';

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }
  // ==========================================================================
  // 6. Recent Searches Management (localStorage)
  // ==========================================================================
  function saveRecentSearch(query) {
    if (!query || query.trim().length < 2) return;
    const clean = query.trim();
    let recents = getRecentSearches();
    recents = recents.filter(item => item.toLowerCase() !== clean.toLowerCase());
    recents.unshift(clean);
    if (recents.length > 5) recents = recents.slice(0, 5);
    try {
      localStorage.setItem('immense_recent_searches', JSON.stringify(recents));
    } catch (e) {}
    renderRecentSearches();
  }

  function getRecentSearches() {
    try {
      const data = localStorage.getItem('immense_recent_searches');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function renderRecentSearches() {
    if (!recentTagsContainer) return;
    const recents = getRecentSearches();
    if (recents.length === 0) {
      const popular = ['20A', '408', 'DLT', 'SMPP', '5110', 'timeout', 'DND'];
      recentTagsContainer.innerHTML = '<span class="quick-label">Popular:</span>' +
        popular.map(p => '<button type="button" class="quick-pill" data-query="' + p + '">' + p + '</button>').join('');
    } else {
      recentTagsContainer.innerHTML = '<span class="quick-label">Recent:</span>' +
        recents.map(r => '<button type="button" class="quick-pill" data-query="' + escapeHtml(r) + '">' + escapeHtml(r) + '</button>').join('') +
        '<button type="button" class="quick-pill" id="clearRecentsBtn" style="opacity:0.75" title="Clear History">Clear ✕</button>';
      
      const clearBtnEl = document.getElementById('clearRecentsBtn');
      if (clearBtnEl) {
        clearBtnEl.addEventListener('click', () => {
          localStorage.removeItem('immense_recent_searches');
          renderRecentSearches();
        });
      }
    }

    recentTagsContainer.querySelectorAll('.quick-pill[data-query]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-query');
        if (searchInput) {
          searchInput.value = val;
          searchInput.focus();
        }
        executeSearch();
      });
    });
  }
  // ==========================================================================
  // 7. URL State & Deep Linking
  // ==========================================================================
  function handleUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const errorCode = params.get('error');
      const query = params.get('q');
      const cat = params.get('cat');

      if (cat && categoryTabs) {
        const tab = Array.from(categoryTabs.querySelectorAll('.tab-btn')).find(b => b.getAttribute('data-cat') === cat);
        if (tab) {
          categoryTabs.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          activeCategory = cat;
        }
      }

      if (errorCode) {
        if (searchInput) searchInput.value = errorCode;
        executeSearch();
        setTimeout(() => {
          const matchingCard = document.querySelector('.error-card[data-code="' + CSS.escape(errorCode) + '"]');
          if (matchingCard) {
            matchingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            matchingCard.style.outline = '2px solid var(--blue)';
            matchingCard.style.boxShadow = 'var(--shadow-glow)';
            setTimeout(() => { matchingCard.style.outline = ''; }, 3000);
          }
        }, 300);
      } else if (query) {
        if (searchInput) searchInput.value = query;
        executeSearch();
      }
    } catch (e) {
      console.warn('URL parsing failed', e);
    }
  }

  function updateUrlParams() {
    try {
      const url = new URL(window.location.href);
      if (currentQuery) {
        if (allErrors.some(e => e.code.toLowerCase() === currentQuery.toLowerCase())) {
          url.searchParams.set('error', currentQuery);
          url.searchParams.delete('q');
        } else {
          url.searchParams.set('q', currentQuery);
          url.searchParams.delete('error');
        }
      } else {
        url.searchParams.delete('error');
        url.searchParams.delete('q');
      }

      if (activeCategory !== 'All') {
        url.searchParams.set('cat', activeCategory);
      } else {
        url.searchParams.delete('cat');
      }

      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  }
  // ==========================================================================
  // 8. Dark Mode & Theme Management
  // ==========================================================================
  function initTheme() {
    const saved = localStorage.getItem('immense_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('immense_theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('immense_theme', 'dark');
    }
  }
  // ==========================================================================
  // 9. Event Listeners & Keyboard Shortcuts
  // ==========================================================================
  function setupEventListeners() {
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        executeSearch();
      });
    }

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = searchInput.value.trim();
        if (val) {
          saveRecentSearch(val);
        }
        executeSearch();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        executeSearch();
      });
    }

    if (resetSearchBtn) {
      resetSearchBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        activeCategory = 'All';
        categoryTabs.querySelectorAll('.tab-btn').forEach(t => {
          t.classList.toggle('active', t.getAttribute('data-cat') === 'All');
        });
        executeSearch();
      });
    }

    if (categoryTabs) {
      categoryTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        categoryTabs.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-cat');
        executeSearch();
      });
    }

    if (targetSelect) {
      targetSelect.addEventListener('change', () => {
        activeTarget = targetSelect.value;
        executeSearch();
      });
    }

    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        renderLimit += BATCH_SIZE;
        renderResults();
      });
    }

    document.addEventListener('keydown', (e) => {
      if ((e.key === '/' && document.activeElement !== searchInput) || 
          ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      if (e.key === 'Escape') {
        if (searchInput && searchInput.value.length > 0) {
          searchInput.value = '';
          executeSearch();
        } else if (searchInput) {
          searchInput.blur();
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
