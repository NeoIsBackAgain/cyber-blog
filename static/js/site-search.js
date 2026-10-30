// Shared search engine for the homepage search box (layouts/partials/index_profile.html)
// and the ⇧F overlay (layouts/partials/header.html). Google-style:
//   - the query is split into words; every word must match the title, a tag or a tip (AND)
//   - results are ranked: title > tag > tip text; whole-word > prefix > substring
//   - small typos are tolerated (edit distance 1, or 2 for long words)
//   - if nothing matches every word, the best partial matches are returned (partial: true)
// Index: index.json (layouts/_default/index.json) → [{ title, permalink, tags, tips }]
window.SiteSearch = (function () {
    var docs = null;

    function norm(s) { return (s || '').toString().toLowerCase().replace(/[^a-z0-9.]+/g, ' ').trim(); }
    function words(s) { return norm(s).split(' ').filter(Boolean); }
    function slugify(t) {
        return t.toString().toLowerCase().trim()
            .replace(/&/g, '-and-').replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
    }
    function stripHtml(h) {
        var d = document.createElement('div'); d.innerHTML = h || '';
        return d.textContent || '';
    }
    function escapeHtml(s) {
        return (s || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
    }
    // Levenshtein distance, stops early once it exceeds max
    function within(a, b, max) {
        if (Math.abs(a.length - b.length) > max) return false;
        var prev = [], cur, i, j;
        for (j = 0; j <= b.length; j++) prev[j] = j;
        for (i = 1; i <= a.length; i++) {
            cur = [i];
            var rowMin = i;
            for (j = 1; j <= b.length; j++) {
                cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
                if (cur[j] < rowMin) rowMin = cur[j];
            }
            if (rowMin > max) return false;
            prev = cur;
        }
        return prev[b.length] <= max;
    }

    // "Tag ::: tip text ||| Tag2 ::: tip text" → [{ tag, text }]
    function parseTips(tips) {
        var out = [];
        (tips || '').split('|||').forEach(function (part) {
            var sep = part.indexOf(':::');
            if (sep !== -1) out.push({ tag: part.substring(0, sep).trim(), text: stripHtml(part.substring(sep + 3)).trim() });
        });
        return out;
    }

    function prepare(item) {
        var tags = (item.tags || []).filter(function (t) { return t && t.trim() && t.toLowerCase() !== 'blog'; });
        var tips = parseTips(item.tips);
        return {
            item: item,
            title: item.title || '',
            titleWords: words(item.title),
            titleNorm: norm(item.title),
            tags: tags.map(function (t) { return { raw: t.trim(), words: words(t), norm: norm(t) }; }),
            tips: tips.map(function (t) { return { tag: t.tag, text: t.text, norm: norm(t.text) }; })
        };
    }

    function load(url) {
        return fetch(url + (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + Date.now())
            .then(function (r) { return r.ok ? r.text() : Promise.reject('HTTP ' + r.status); })
            .then(function (text) {
                var s = text.indexOf('['), e = text.lastIndexOf(']') + 1;
                if (s === -1 || e <= s) throw new Error('Index JSON is empty or malformed');
                docs = JSON.parse(text.substring(s, e)).map(prepare);
                return docs;
            });
    }

    // score of one query word against a list of words / a normalised string
    function wordScore(token, list, joined, exact, prefix, sub) {
        for (var i = 0; i < list.length; i++) if (list[i] === token) return exact;
        for (i = 0; i < list.length; i++) if (list[i].indexOf(token) === 0) return prefix;
        if (token.length >= 3 && joined.indexOf(token) !== -1) return sub;
        return 0;
    }
    function fuzzy(token, list) {
        if (token.length < 4) return false;
        var max = token.length >= 7 ? 2 : 1;
        for (var i = 0; i < list.length; i++) if (within(token, list[i], max)) return true;
        return false;
    }

    function scoreDoc(d, tokens) {
        var total = 0, matched = 0, bestTag = null, bestTagScore = 0, tagHits = {}, tip = null;
        tokens.forEach(function (tok) {
            var s = wordScore(tok, d.titleWords, d.titleNorm, 12, 9, 5);
            d.tags.forEach(function (t) {
                var ts = wordScore(tok, t.words, t.norm, 8, 6, 4);
                if (ts) { tagHits[t.raw] = (tagHits[t.raw] || 0) + ts; s = Math.max(s, ts); }
            });
            if (!s) {
                for (var i = 0; i < d.tips.length; i++) {
                    if (d.tips[i].norm.indexOf(tok) !== -1) { s = 2; tip = tip || d.tips[i]; break; }
                }
            }
            if (!s) {
                if (fuzzy(tok, d.titleWords)) s = 4;
                else d.tags.forEach(function (t) { if (fuzzy(tok, t.words)) { s = Math.max(s, 3); tagHits[t.raw] = (tagHits[t.raw] || 0) + 3; } });
            }
            if (s) { matched++; total += s; }
        });
        Object.keys(tagHits).forEach(function (t) { if (tagHits[t] > bestTagScore) { bestTagScore = tagHits[t]; bestTag = t; } });
        if (tokens.length > 1 && d.titleNorm.indexOf(tokens.join(' ')) !== -1) total += 10;   // whole phrase in title
        if (bestTag && !tip) {
            for (var i = 0; i < d.tips.length; i++) if (d.tips[i].tag.toLowerCase() === bestTag.toLowerCase()) { tip = d.tips[i]; break; }
        }
        return { doc: d, score: total, matched: matched, tag: bestTag, moreTags: Math.max(0, Object.keys(tagHits).length - 1), tip: tip };
    }

    function query(q) {
        if (!docs) return null;
        var tokens = words(q);
        if (!tokens.length) return { results: [], partial: false, tokens: tokens };
        var scored = docs.map(function (d) { return scoreDoc(d, tokens); }).filter(function (r) { return r.matched > 0; });
        var full = scored.filter(function (r) { return r.matched === tokens.length; });
        var partial = !full.length && tokens.length > 1;
        var list = full.length ? full : scored;
        list.sort(function (a, b) { return b.matched - a.matched || b.score - a.score || a.doc.title.localeCompare(b.doc.title); });
        return {
            partial: partial,
            tokens: tokens,
            results: list.map(function (r) {
                var it = r.doc.item;
                return {
                    url: it.permalink + (r.tag ? '#' + slugify(r.tag) : (r.tip ? '#' + slugify(r.tip.tag) : '')),
                    title: r.doc.title,
                    tag: r.tag,
                    moreTags: r.moreTags,
                    desc: r.tip ? r.tip.text.substring(0, 200) : ''
                };
            })
        };
    }

    // escape, then wrap query words in <mark>
    function highlight(text, tokens) {
        var safe = escapeHtml(text);
        var parts = (tokens || []).filter(function (t) { return t.length >= 2; })
            .map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
        if (!parts.length) return safe;
        return safe.replace(new RegExp('(' + parts.join('|') + ')', 'gi'), '<mark>$1</mark>');
    }

    return { load: load, query: query, highlight: highlight, escapeHtml: escapeHtml };
})();
