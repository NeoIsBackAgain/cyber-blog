import * as params from '@params';

// --- Constants ---
const DEFAULT_LIMIT = 10;
const DEBOUNCE_DELAY = 120;

// --- DOM References ---
const resList   = document.getElementById('searchResults');
const sInput    = document.getElementById('searchInput');
const searchBox = document.getElementById('searchbox');

// --- State ---
let fuse = null;
let resultsAvailable = false;
let focusedIndex = -1;
let isLoading = false;
let lastQuery = '';

// --- Tag Tokenizer ---
// Tags are hyphen-separated: "Bloodhound-Ce-Python", "Port139-135-SMB-Anonymous-Login"
// Fuse matches the whole string as one blob — "blood" never finds "Bloodhound-Ce-Python"
// Fix: store segments as an ARRAY so Fuse searches each token independently
function expandTags(tags) {
    if (!tags || !tags.length) return [];
    const parts = new Set();
    for (const tag of tags) {
        parts.add(tag);                      // keep original casing for display
        for (const seg of tag.split('-')) {
            if (seg.length > 1) parts.add(seg);
        }
    }
    return Array.from(parts);
}

// --- Fuse.js Configuration ---

function getFuseOptions() {
    const defaults = {
        isCaseSensitive:    false,
        includeScore:       true,
        includeMatches:     false,
        minMatchCharLength: 1,
        shouldSort:         true,
        findAllMatches:     true,
        keys: [
            // tagsExpanded is now an array — Fuse searches each element independently
            // so "blood" matches the "Bloodhound" segment directly
            { name: 'tagsExpanded', weight: 10 },
            { name: 'tags',         weight: 8  },
            { name: 'tips',         weight: 5  },
            { name: 'title',        weight: 4  },
            { name: 'description',  weight: 2  },
            { name: 'summary',      weight: 1  },
            { name: 'content',      weight: 0.5 },
        ],
        threshold:      0.4,   // loose enough for partial segment matches
        distance:       100,
        ignoreLocation: true,
    };

    const opts = params.fuseOpts;
    if (!opts) return defaults;

    return {
        isCaseSensitive:    opts.iscasesensitive    ?? defaults.isCaseSensitive,
        includeScore:       opts.includescore       ?? defaults.includeScore,
        includeMatches:     opts.includematches     ?? defaults.includeMatches,
        minMatchCharLength: opts.minmatchcharlength ?? defaults.minMatchCharLength,
        shouldSort:         opts.shouldsort         ?? defaults.shouldSort,
        findAllMatches:     opts.findallmatches     ?? defaults.findAllMatches,
        keys:               opts.keys               ?? defaults.keys,
        location:           opts.location           ?? 0,
        threshold:          opts.threshold          ?? defaults.threshold,
        distance:           opts.distance           ?? defaults.distance,
        ignoreLocation:     opts.ignorelocation     ?? defaults.ignoreLocation,
    };
}

function getSearchLimit() {
    return params.fuseOpts?.limit ?? DEFAULT_LIMIT;
}

// --- Utilities ---

function escapeHTML(value) {
    return String(value ?? '')
        .replaceAll('&',  '&amp;')
        .replaceAll('<',  '&lt;')
        .replaceAll('>',  '&gt;')
        .replaceAll('"',  '&quot;')
        .replaceAll("'", '&#039;');
}

function highlightText(text, query) {
    if (!text) return "";
    const escapedText = escapeHTML(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    return escapedText.replace(regex, `<mark>$1</mark>`);
}

function debounce(fn, delay) {
    let timer;
    function debounced(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    }
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
}

// --- DOM Helpers ---

function setMessage(text, hint = "ERR_NOT_FOUND") {
    resList.innerHTML = `
        <li class="post-entry no-results search-empty-state" style="padding: 20px; text-align: center; color: #888; font-family: 'JetBrains Mono', monospace; border-bottom: none;">
            <span class="cmd-hint" style="background: rgba(239, 83, 80, 0.15); color: #ef5350; border: 1px solid rgba(239, 83, 80, 0.4); padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; margin-bottom: 10px; display: inline-block;">
                ${hint}
            </span>
            <p style="margin: 0; font-size: 0.95rem; color: #ccc;">${text}</p>
        </li>
    `;
}

function clearResults() {
    resList.innerHTML = '';
    resultsAvailable = false;
    focusedIndex = -1;
    lastQuery = '';
}

// --- Focus Management ---

function clearFocus() {
    resList.querySelectorAll('.focus').forEach((el) => el.classList.remove('focus'));
}

function focusResult(index) {
    const items = resList.querySelectorAll('.post-entry:not(.no-results)');

    if (!items.length) { focusedIndex = -1; return; }

    if (index < 0) {
        focusedIndex = -1;
        clearFocus();
        sInput.focus();
        return;
    }

    const clampedIndex = Math.min(index, items.length - 1);
    const item = items[clampedIndex];
    const link = item?.querySelector('a');

    if (link) {
        clearFocus();
        item.classList.add('focus');
        link.focus();
        focusedIndex = clampedIndex;
    }
}

// --- Rendering ---

function renderResults(results, query) {
    focusedIndex = -1;

    if (!results.length) {
        resultsAvailable = false;
        setMessage(
            `No boxes, tags, or tips matched <span style="color:#fff;">"${escapeHTML(query)}"</span><br>
            <span style="font-size:0.8rem;color:#666;margin-top:6px;display:block;">
                Try a shorter word · use a tag segment like <span style="color:#aaa;">smb</span> or <span style="color:#aaa;">blood</span>
            </span>`,
            "ERR_NOT_FOUND"
        );
        return;
    }

    const count = results.length;
    const hint  = count > 5
        ? ` &nbsp;·&nbsp; <span style="color:#ef5350;">try being more specific</span>`
        : '';

    const counterLi = document.createElement('li');
    counterLi.className  = 'no-results';
    counterLi.style.cssText = 'padding:7px 16px;font-size:0.75rem;font-family:"JetBrains Mono",monospace;color:#666;border-bottom:1px solid #1a1a1a;pointer-events:none;list-style:none;';
    counterLi.innerHTML = `<span style="color:#aaa;">${count} result${count !== 1 ? 's' : ''} found</span>${hint}`;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(counterLi);

    for (const { item } of results) {
        const safeTitle     = highlightText(item.title || 'Untitled', query);
        const safePermalink = escapeHTML(item.permalink || '#');

        let tagsHtml = "";
        if (item.tags && item.tags.length > 0) {
            const formattedTags = item.tags.map(tag => {
                // FIX: match against any hyphen-segment, not just full tag string
                const segments = tag.toLowerCase().split('-');
                const isMatch  = tag.toLowerCase().includes(query.toLowerCase())
                              || segments.some(s => s.includes(query.toLowerCase()));
                const tagClass = isMatch ? "search-tag-match" : "search-tag-std";
                return `<span class="${tagClass}">#${escapeHTML(tag)}</span>`;
            }).join('');
            tagsHtml = `<div class="result-desc">${formattedTags}</div>`;
        }

        let tipsHtml = "";
        if (item.tips) {
            const highlightedTips = highlightText(item.tips, query);
            tipsHtml = `<div class="search-tip-text" style="margin-top:6px;"><span class="search-tip-label">TIP:</span> ${highlightedTips}</div>`;
        }

        const li = document.createElement('li');
        li.className = 'post-entry search-result-item';
        li.innerHTML = `
            <a href="${safePermalink}" aria-label="${escapeHTML(item.title)}">
                <div class="result-title">${safeTitle}</div>
                ${tagsHtml}
                ${tipsHtml}
            </a>
        `;
        fragment.appendChild(li);
    }

    resList.innerHTML = '';
    resList.appendChild(fragment);
    resultsAvailable = true;
}

// --- Search ---

function search(query) {
    const trimmed = query.trim();

    if (trimmed && trimmed === lastQuery) return;
    lastQuery = trimmed;

    if (!trimmed) { clearResults(); return; }

    if (isLoading) { setMessage('Search is still loading…', 'LOADING...'); return; }
    if (!fuse)     { setMessage('Search unavailable', 'ERR_SYS'); return; }

    const allResults = fuse.search(trimmed);
    const limit      = getSearchLimit();

    renderResults(
        allResults.length > limit ? allResults.slice(0, 25) : allResults,
        trimmed
    );
}

const debouncedSearch = debounce(search, DEBOUNCE_DELAY);

// --- Reset ---

function reset() {
    debouncedSearch.cancel();
    clearResults();
    sInput.value = '';
    sInput.focus();
}

// --- Index Loading ---

async function loadSearchIndex() {
    if (fuse || isLoading) return;
    isLoading = true;

    const indexURL = params.searchIndex ?? '../index.json';

    try {
        const response = await fetch(indexURL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const raw = await response.json();
        if (!Array.isArray(raw)) throw new Error('Search index is not a valid array.');

        // FIX: Inject expanded tag tokens into every record before building Fuse index
        const data = raw.map(item => ({
            ...item,
            tagsExpanded: expandTags(item.tags),
        }));

        fuse = new Fuse(data, getFuseOptions());

        const pending = sInput.value.trim();
        if (pending) { lastQuery = ''; search(pending); }

    } catch (err) {
        console.error('[Search] Failed to load index:', err);
        if (sInput.value.trim()) setMessage('Search index could not be loaded', 'ERR_NETWORK');
    } finally {
        isLoading = false;
    }
}

// --- Event Listeners ---

sInput.addEventListener('input', function () { debouncedSearch(this.value); });
sInput.addEventListener('search', function () { if (!this.value) reset(); });

document.addEventListener('keydown', function (e) {
    const { key } = e;
    const isInsideSearchBox = searchBox?.contains(document.activeElement);

    if (key === 'Escape') { reset(); return; }
    if (!isInsideSearchBox || !resultsAvailable) return;

    const items = resList.querySelectorAll('.post-entry:not(.no-results)');
    if (!items.length) return;

    switch (key) {
        case 'ArrowDown':
            e.preventDefault();
            focusResult(focusedIndex < 0 ? 0 : Math.min(focusedIndex + 1, items.length - 1));
            break;
        case 'ArrowUp':
            e.preventDefault();
            focusResult(focusedIndex <= 0 ? -1 : focusedIndex - 1);
            break;
        case 'Enter':
        case 'ArrowRight': {
            if (focusedIndex >= 0) {
                const link = items[focusedIndex]?.querySelector('a');
                if (link) { e.preventDefault(); link.click(); }
            }
            break;
        }
    }
});

window.addEventListener('load', loadSearchIndex);