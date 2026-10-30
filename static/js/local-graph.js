// Attack-path map for post pages.
// Data: window.LOCAL_GRAPH from layouts/partials/extend_head.html — { self, steps: [{t, k, inBody, posts: [{t, u, d}]}], tagBase }
// Styles: .local-graph in static/css/redesign.css.
// Big dots = this writeup's techniques, chained in the order they appear (FTP → SSH → …), coloured by phase.
// Small dots = other boxes that used the same technique, coloured by difficulty.
(function () {
    var data = window.LOCAL_GRAPH;
    if (!data || !data.steps || !data.steps.length) return;
    if (!document.querySelector('.post-single')) return;

    var diffColors = { easy: '#9fce63', medium: '#ffa726', hard: '#ff5f56', insane: '#c792ea' };
    // first match wins, so the more specific phases come first
    var phases = [
        { name: 'PrivEsc',   color: '#ff5f56', re: /privilege|privesc|root|ntds|secretsdump|dcsync/ },
        { name: 'AD',        color: '#c792ea', re: /^(bloodhound|kerberos|kerberoast|asrep|adcs|ad-|gpo|ldap)/ },
        { name: 'Post-Ex',   color: '#ffa726', re: /^(lateral|revshell|reverse|shell|pivot|tunnel|chisel|ligolo)|enumation|enumeration|-proxy-/ },
        { name: 'Foothold',  color: '#9fce63', re: /^(web|owasp|cms|source-code|sqli|xss|lfi|ssti|cve|upload)|rce|-to-/ },
        { name: 'Recon',     color: '#5c9bf5', re: /^(port\d|nmap|dns|recon|subdomain|vhost|osint|smb|ftp|nfs)/ },
        { name: 'Other',     color: '#a1a1aa', re: /.*/ }
    ];
    function phaseOf(key) { for (var i = 0; i < phases.length; i++) if (phases[i].re.test(key)) return phases[i]; }

    // ── Nodes / links ─────────────────────────────────────────────────────
    var nodes = [], links = [], boxes = {};
    var steps = data.steps.map(function (s, i) {
        var ph = phaseOf(s.k);
        var n = { kind: 'step', i: i, title: s.t, key: s.k, inBody: s.inBody, phase: ph, color: ph.color, r: 5, deg: 0, nb: [],
                  url: s.inBody ? '#' + s.k : data.tagBase + s.k + '/' };
        nodes.push(n);
        return n;
    });
    function link(a, b, chain) { links.push({ s: a, t: b, chain: chain }); a.deg++; b.deg++; a.nb.push(b); b.nb.push(a); }
    steps.forEach(function (n, i) { if (i) link(steps[i - 1], n, true); });
    data.steps.forEach(function (s, i) {
        (s.posts || []).forEach(function (p) {
            var b = boxes[p.u];
            if (!b) {
                b = boxes[p.u] = { kind: 'box', title: p.t, url: p.u, color: diffColors[p.d] || '#cbd5e1', r: 2.6, deg: 0, nb: [], shared: [] };
                nodes.push(b);
            }
            b.shared.push(steps[i]);
            link(steps[i], b, false);
        });
    });
    var n0 = steps.length;
    nodes.forEach(function (n, i) {
        if (n.kind === 'step') { n.x = (i % 2 ? 1 : -1) * 16; n.y = (i - (n0 - 1) / 2) * 30; }
        else { var a = i * 2.39996; n.x = Math.cos(a) * 60; n.y = Math.sin(a) * 60; }
        n.vx = n.vy = 0;
    });

    // ── DOM ───────────────────────────────────────────────────────────────
    var box = document.createElement('aside');
    box.className = 'local-graph';
    box.setAttribute('aria-label', 'Attack path of this writeup');
    var boxList = Object.keys(boxes).map(function (u) { return boxes[u]; });
    box.innerHTML = '<div class="lg-label">Attack Path <span>' + n0 + ' steps</span></div>'
        + '<div class="lg-stage"><canvas></canvas><div class="lg-tip"></div></div>'
        + '<div class="lg-legend"></div>';
    document.body.appendChild(box);
    var stage  = box.querySelector('.lg-stage');
    var canvas = box.querySelector('canvas');
    var tip    = box.querySelector('.lg-tip');
    var ctx    = canvas.getContext('2d');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stage.style.height = Math.max(220, Math.min(320, n0 * 30 + 60)) + 'px';

    function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

    // legend: phases that appear in this writeup
    var legend = box.querySelector('.lg-legend');
    phases.filter(function (ph) { return steps.some(function (s) { return s.phase === ph; }); }).forEach(function (ph) {
        var item = el('span', null, ph.name);
        var dot = el('i'); dot.style.background = ph.color;
        item.insertBefore(dot, item.firstChild);
        legend.appendChild(item);
    });

    // step list: numbered attack path, click jumps to the technique in the writeup
    var listEls = [];
    var stepList = el('ol', 'lg-steps');
    steps.forEach(function (s, i) {
        var a = el('a', 'lg-step');
        a.href = s.url;
        a.style.setProperty('--c', s.color);
        a.appendChild(el('span', 'lg-step-num', String(i + 1)));
        a.appendChild(el('span', 'lg-step-title', s.title.replace(/-/g, ' ')));
        var others = s.nb.filter(function (n) { return n.kind === 'box'; }).length;
        if (others) a.appendChild(el('span', 'lg-step-count', '+' + others));
        a.title = s.title + (others ? ' — also used in ' + others + ' other box' + (others === 1 ? '' : 'es') : '');
        a.addEventListener('mouseenter', function () { setHover(s); });
        a.addEventListener('mouseleave', function () { setHover(null); });
        var li = el('li'); li.appendChild(a); stepList.appendChild(li);
        listEls.push(a);
    });
    box.appendChild(stepList);

    // boxes that share the most techniques with this one
    if (boxList.length) {
        boxList.sort(function (a, b) { return b.shared.length - a.shared.length || a.title.localeCompare(b.title); });
        var rel = el('div', 'lg-related');
        rel.appendChild(el('div', 'lg-label', 'Same techniques in'));
        boxList.slice(0, 5).forEach(function (b) {
            var a = el('a', 'lg-item');
            a.href = b.url;
            a.style.setProperty('--c', b.color);
            a.appendChild(el('span', 'lg-item-title', b.title));
            a.appendChild(el('span', 'lg-item-meta', b.shared.map(function (s) { return s.title; }).join(' · ')));
            a.addEventListener('mouseenter', function () { setHover(b); });
            a.addEventListener('mouseleave', function () { setHover(null); });
            rel.appendChild(a);
        });
        box.appendChild(rel);
    }

    // ── Force layout: steps are pulled into a top-to-bottom zigzag, boxes float around them ──
    var alpha = 1;
    function tick() {
        alpha += (0 - alpha) * 0.03;
        var i, j, a, b, dx, dy, d2, f;
        for (i = 0; i < nodes.length; i++) {
            a = nodes[i];
            for (j = i + 1; j < nodes.length; j++) {
                b = nodes[j];
                dx = b.x - a.x; dy = b.y - a.y; d2 = dx * dx + dy * dy;
                if (d2 < 1) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 1; }
                f = 24 * alpha / d2;
                a.vx -= dx * f; a.vy -= dy * f; b.vx += dx * f; b.vy += dy * f;
            }
        }
        links.forEach(function (l) {
            var s = l.s, t = l.t, want = l.chain ? 30 : 22;
            dx = t.x - s.x; dy = t.y - s.y;
            var len = Math.sqrt(dx * dx + dy * dy) || 1;
            f = (len - want) / len * alpha * (l.chain ? 0.5 : 0.3 / Math.max(1, t.deg));
            dx *= f; dy *= f;
            t.vx -= dx; t.vy -= dy; s.vx += dx; s.vy += dy;
        });
        nodes.forEach(function (n) {
            if (n.kind === 'step') {
                n.vy += ((n.i - (n0 - 1) / 2) * 30 - n.y) * 0.1 * alpha;
                n.vx += ((n.i % 2 ? 1 : -1) * 16 - n.x) * 0.05 * alpha;
            } else {
                n.vx -= n.x * 0.01 * alpha; n.vy -= n.y * 0.01 * alpha;
            }
            n.vx *= 0.6; n.vy *= 0.6; n.x += n.vx; n.y += n.vy;
        });
    }

    // ── View ──────────────────────────────────────────────────────────────
    var W = 0, H = 0, dpr = 1, k = 1, cx = 0, cy = 0;
    function fit() {
        var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        nodes.forEach(function (n) { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y); });
        k = Math.min(2, (W - 30) / (x1 - x0 || 1), (H - 30) / (y1 - y0 || 1));
        cx = (x0 + x1) / 2; cy = (y0 + y1) / 2;
    }
    function sx(n) { return W / 2 + (n.x - cx) * k; }
    function sy(n) { return H / 2 + (n.y - cy) * k; }
    function resize() {
        W = stage.clientWidth; H = stage.clientHeight;
        if (!W || !H) return;
        dpr = window.devicePixelRatio || 1;
        canvas.width = W * dpr; canvas.height = H * dpr;
        fit(); draw();
    }

    var hover = null;
    function setHover(n) {
        hover = n;
        listEls.forEach(function (a, i) { a.classList.toggle('is-on', !!n && (steps[i] === n || n.nb.indexOf(steps[i]) !== -1)); });
        draw();
    }
    function arrow(x1, y1, x2, y2, gap) {
        var ang = Math.atan2(y2 - y1, x2 - x1), ex = x2 - Math.cos(ang) * gap, ey = y2 - Math.sin(ang) * gap;
        ctx.beginPath(); ctx.moveTo(x1 + Math.cos(ang) * gap, y1 + Math.sin(ang) * gap); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - Math.cos(ang - 0.5) * 5, ey - Math.sin(ang - 0.5) * 5);
        ctx.lineTo(ex - Math.cos(ang + 0.5) * 5, ey - Math.sin(ang + 0.5) * 5);
        ctx.closePath(); ctx.fill();
    }
    function draw() {
        if (!W) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        var near = hover ? new Set(hover.nb.concat([hover])) : null;

        links.forEach(function (l) {
            if (l.chain) return;
            var on = hover && (l.s === hover || l.t === hover);
            ctx.globalAlpha = on ? 0.7 : (hover ? 0.05 : 0.18);
            ctx.strokeStyle = on ? l.s.color : '#a1a1aa';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(sx(l.s), sy(l.s)); ctx.lineTo(sx(l.t), sy(l.t)); ctx.stroke();
        });
        links.forEach(function (l) {
            if (!l.chain) return;
            ctx.globalAlpha = hover && !(near.has(l.s) && near.has(l.t)) ? 0.25 : 0.85;
            ctx.strokeStyle = ctx.fillStyle = l.s.color;
            ctx.lineWidth = 1.5;
            arrow(sx(l.s), sy(l.s), sx(l.t), sy(l.t), l.t.r + 3);
        });

        nodes.forEach(function (n) {
            ctx.globalAlpha = near && !near.has(n) ? 0.2 : 1;
            var r = n.r + (n === hover ? 1.5 : 0);
            ctx.beginPath(); ctx.arc(sx(n), sy(n), r, 0, Math.PI * 2);
            if (n.kind === 'step' && !n.inBody) { ctx.lineWidth = 1.5; ctx.strokeStyle = n.color; ctx.stroke(); }
            else { ctx.fillStyle = n.color; ctx.fill(); }
            if (n.kind === 'step') {
                ctx.globalAlpha = near && !near.has(n) ? 0.2 : 0.9;
                ctx.fillStyle = '#8b8b92';
                ctx.font = '9px system-ui, sans-serif';
                ctx.textAlign = n.i % 2 ? 'left' : 'right';
                ctx.fillText(String(n.i + 1), sx(n) + (n.i % 2 ? 9 : -9), sy(n) + 3);
            }
        });
    }

    function frame() {
        tick(); fit(); draw();
        if (alpha > 0.01) requestAnimationFrame(frame);
    }

    // ── Interaction ───────────────────────────────────────────────────────
    function pick(e) {
        var rect = canvas.getBoundingClientRect();
        var mx = e.clientX - rect.left, my = e.clientY - rect.top, best = null, bestD = 100;
        nodes.forEach(function (n) {
            var dx = sx(n) - mx, dy = sy(n) - my, d = dx * dx + dy * dy;
            if (d < bestD) { best = n; bestD = d; }
        });
        return best;
    }
    canvas.addEventListener('mousemove', function (e) {
        var n = pick(e);
        if (n === hover) return;
        setHover(n);
        canvas.style.cursor = n ? 'pointer' : 'default';
        if (!n) { tip.style.opacity = 0; return; }
        tip.textContent = n.kind === 'step' ? (n.i + 1) + '. ' + n.title : n.title;
        var sub = el('small', null, n.kind === 'step'
            ? n.phase.name + (n.inBody ? '' : ' · not in writeup body')
            : 'also used: ' + n.shared.length + ' technique' + (n.shared.length === 1 ? '' : 's'));
        tip.appendChild(sub);
        tip.style.left = sx(n) + 'px';
        tip.style.top = sy(n) + 'px';
        tip.style.opacity = 1;
    });
    canvas.addEventListener('mouseleave', function () { setHover(null); tip.style.opacity = 0; });
    canvas.addEventListener('click', function (e) {
        var n = pick(e);
        if (!n) return;
        if (n.kind === 'step' && n.inBody) {
            var target = document.getElementById(n.key);
            if (target) { target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); return; }
        }
        window.location.href = n.url;
    });

    // ── Start ─────────────────────────────────────────────────────────────
    for (var i = 0; i < (reduced ? 300 : 100); i++) tick();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    resize();
    if (!reduced) requestAnimationFrame(frame);
})();
