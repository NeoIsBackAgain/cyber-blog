import * as params from '@params';

// --- Constants ---
const DEFAULT_LIMIT = 10;
const DEBOUNCE_DELAY = 150;

// --- DOM References ---
const resList = document.getElementById('searchResults');
const sInput = document.getElementById('searchInput');
const searchBox = document.getElementById('searchbox');

// --- State ---
let fuse = null;
let resultsAvailable = false;
let focusedIndex = -1;
let isLoading = false;

// --- Fuse.js Configuration ---

function getFuseOptions() {
    const defaults = {
        isCaseSensitive: false,
        includeScore: true,
        includeMatches: false,
        minMatchCharLength: 2,
        shouldSort: true,
        findAllMatches: true,
        // UPDATED: Added tags and tips to the search weights!
        keys: [
            { name: 'title',     weight: 0.5 },
            { name: 'tips',      weight: 0.3 },
            { name: 'tags',      weight: 0.2 },
            { name: 'summary',   weight: 0.1 },
            { name: 'content',   weight: 0.1 },
            { name: 'permalink', weight: 0.1 },
        ],
        threshold: 0.35,
        distance: 1000,
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

// NEW: Highlight text based on query
function highlightText(text, query) {
    if (!text) return "";
    const escapedText = escapeHTML(text);
    // Regex safely matches the query ignoring case
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    return escapedText.replace(regex, `<mark>$1</mark>`);
}

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// --- DOM Helpers ---

// UPDATED: Styled the error/empty message to fit the Cyberpunk terminal theme
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
}

// --- Focus Management ---

function clearFocus() {
    resList.querySelectorAll('.focus').forEach((el) => el.classList.remove('focus'));
}

function focusResult(index) {
    const items = resList.querySelectorAll('.post-entry:not(.no-results)');

    if (!items.length) {
        focusedIndex = -1;
        return;
    }

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

// UPDATED: Render the advanced Cyberpunk layout
function renderResults(results, query) {
    focusedIndex = -1;

    if (!results.length) {
        resultsAvailable = false;
        setMessage(`No boxes, tags, or tips found for <br><span style="color: #fff;">"${escapeHTML(query)}"</span>`, "ERR_NOT_FOUND");
        return;
    }

    const fragment = document.createDocumentFragment();

    for (const { item } of results) {
        const safeTitle = highlightText(item.title || 'Untitled', query);
        const safePermalink = escapeHTML(item.permalink || '#');

        // Build Cyberpunk Tags
        let tagsHtml = "";
        if (item.tags && item.tags.length > 0) {
            const formattedTags = item.tags.map(tag => {
                const isMatch = tag.toLowerCase().includes(query.toLowerCase());
                const tagClass = isMatch ? "search-tag-match" : "search-tag-std";
                return `<span class="${tagClass}">#${escapeHTML(tag)}</span>`;
            }).join('');
            tagsHtml = `<div class="result-desc">${formattedTags}</div>`;
        }

        // Build Cyberpunk Tips
        let tipsHtml = "";
        if (item.tips) {
            const highlightedTips = highlightText(item.tips, query);
            tipsHtml = `<div class="search-tip-text" style="margin-top: 6px;"><span class="search-tip-label">TIP:</span> ${highlightedTips}</div>`;
        }

        // Create the Element
        const li = document.createElement('li');
        li.className = 'post-entry search-result-item'; // Keep post-entry for focus tracking
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

    if (!trimmed) {
        clearResults();
        return;
    }

    if (isLoading) {
        setMessage('Search is still loading…', 'LOADING...');
        return;
    }

    if (!fuse) {
        setMessage('Search unavailable', 'ERR_SYS');
        return;
    }

    // Run the search to get ALL matches first
    const allResults = fuse.search(trimmed);
    const limit = getSearchLimit();

    // UPDATED logic: Trigger the specific error if too many results are found
    if (allResults.length > limit) {
        clearResults();
        setMessage(`<b>${allResults.length}</b> results were found, try being more specific.`, "ERR_TOO_BROAD");
        return;
    }

    // If within limits, render them!
    renderResults(allResults, trimmed);
}

const debouncedSearch = debounce(search, DEBOUNCE_DELAY);

// --- Reset ---

function reset() {
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

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Search index is not a valid array.');
        }

        fuse = new Fuse(data, getFuseOptions());

        // Flush any search that arrived while the index was loading
        const pending = sInput.value.trim();
        if (pending) search(pending);
    } catch (err) {
        console.error('[Search] Failed to load index:', err);
        if (sInput.value.trim()) {
            setMessage('Search index could not be loaded', 'ERR_NETWORK');
        }
    } finally {
        isLoading = false;
    }
}

// --- Event Listeners ---

sInput.addEventListener('input', function () {
    debouncedSearch(this.value);
});

sInput.addEventListener('search', function () {
    if (!this.value) reset();
});

document.addEventListener('keydown', function (e) {
    const { key } = e;
    const isInsideSearchBox = searchBox?.contains(document.activeElement);

    if (key === 'Escape') {
        reset();
        return;
    }

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
                if (link) {
                    e.preventDefault();
                    link.click();
                }
            }
            break;
        }
    }
});

window.addEventListener('load', loadSearchIndex);