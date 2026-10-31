// Attack Path panel for post pages (right side).
// Data: window.LOCAL_GRAPH from layouts/partials/extend_head.html — { self, steps: [{t, k, inBody, posts: [{t, u, d}]}], tagBase }
// Categories: static/js/kb-phases.js (attack stages). Styles: .local-graph in static/css/redesign.css.
//   - flow bar: one segment per step, in attack order, coloured by stage
//   - timeline: consecutive steps of the same stage grouped under one heading
//   - scroll-spy: the step you are reading is highlighted, earlier steps count as done
(function () {
    var data = window.LOCAL_GRAPH;
    if (!data || !data.steps || !data.steps.length) return;
    if (!document.querySelector('.post-single')) return;

    var diffColors = { easy: '#9fce63', medium: '#ffa726', hard: '#ff5f56', insane: '#c792ea' };
    var phases = window.KB_PHASES || [{ name: 'Other', color: '#a1a1aa', re: /.*/ }];
    var phaseOf = window.KB_PHASE_OF || function () { return phases[phases.length - 1]; };
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    function pretty(t) { return t.replace(/-/g, ' '); }

    // ── Steps + other boxes that used the same technique ──────────────────
    var boxes = {};
    var steps = data.steps.map(function (s, i) {
        var ph = phaseOf(s.k);
        return { i: i, title: s.t, key: s.k, inBody: s.inBody, phase: ph, color: ph.color, others: [],
                 url: s.inBody ? '#' + s.k : data.tagBase + s.k + '/' };
    });
    data.steps.forEach(function (s, i) {
        (s.posts || []).forEach(function (p) {
            var b = boxes[p.u] || (boxes[p.u] = { title: p.t, url: p.u, color: diffColors[p.d] || '#cbd5e1', shared: [] });
            b.shared.push(steps[i]);
            steps[i].others.push(p.t);
        });
    });

    // ── Panel ─────────────────────────────────────────────────────────────
    var box = el('aside', 'local-graph');
    box.setAttribute('aria-label', 'Attack path of this writeup');
    var head = el('div', 'lg-label', 'Attack Path');
    head.appendChild(el('span', null, steps.length + ' step' + (steps.length === 1 ? '' : 's')));
    box.appendChild(head);

    // flow bar
    var flow = el('div', 'lg-flow');
    var segEls = steps.map(function (s) {
        var a = el('a', 'lg-seg');
        a.href = s.url;
        a.style.setProperty('--c', s.color);
        a.title = (s.i + 1) + '. ' + pretty(s.title) + ' — ' + s.phase.name;
        a.addEventListener('mouseenter', function () { setHover(s); });
        a.addEventListener('mouseleave', function () { setHover(null); });
        a.addEventListener('click', function (e) { jump(e, s); });
        flow.appendChild(a);
        return a;
    });
    box.appendChild(flow);

    // stage totals, in the order they first appear in the writeup
    var totals = el('div', 'lg-totals');
    var seen = [];
    steps.forEach(function (s) { if (seen.indexOf(s.phase) === -1) seen.push(s.phase); });
    seen.forEach(function (ph) {
        var n = steps.filter(function (s) { return s.phase === ph; }).length;
        var chip = el('span', 'lg-total');
        chip.style.setProperty('--c', ph.color);
        chip.appendChild(el('i'));
        chip.appendChild(document.createTextNode(ph.name));
        chip.appendChild(el('em', null, String(n)));
        totals.appendChild(chip);
    });
    box.appendChild(totals);

    // timeline: runs of consecutive steps in the same stage
    var timeline = el('ol', 'lg-timeline');
    var stepEls = [];
    var run = null;
    steps.forEach(function (s) {
        if (!run || run.phase !== s.phase) {
            run = { phase: s.phase, li: el('li', 'lg-run'), list: el('ol', 'lg-run-steps'), count: 0 };
            run.li.style.setProperty('--c', s.color);
            run.head = el('div', 'lg-run-head', s.phase.name);
            run.li.appendChild(run.head);
            run.li.appendChild(run.list);
            timeline.appendChild(run.li);
        }
        run.count++;
        var a = el('a', 'lg-step' + (s.inBody ? '' : ' is-external'));
        a.href = s.url;
        a.style.setProperty('--c', s.color);
        a.appendChild(el('span', 'lg-step-num', String(s.i + 1)));
        a.appendChild(el('span', 'lg-step-title', pretty(s.title)));
        if (s.others.length) {
            var more = el('span', 'lg-step-count', '+' + s.others.length);
            more.title = 'Also used in: ' + s.others.join(', ');
            a.appendChild(more);
        }
        a.title = pretty(s.title) + (s.inBody ? '' : ' (not used in the writeup body — opens the tag page)');
        a.addEventListener('mouseenter', function () { setHover(s); });
        a.addEventListener('mouseleave', function () { setHover(null); });
        a.addEventListener('click', function (e) { jump(e, s); });
        var li = el('li'); li.appendChild(a); run.list.appendChild(li);
        stepEls.push(a);
    });
    box.appendChild(timeline);

    // boxes that share the most techniques with this one
    var boxList = Object.keys(boxes).map(function (u) { return boxes[u]; });
    if (boxList.length) {
        boxList.sort(function (a, b) { return b.shared.length - a.shared.length || a.title.localeCompare(b.title); });
        var rel = el('div', 'lg-related');
        rel.appendChild(el('div', 'lg-label', 'Same techniques in'));
        boxList.slice(0, 5).forEach(function (b) {
            var a = el('a', 'lg-item');
            a.href = b.url;
            a.style.setProperty('--c', b.color);
            a.appendChild(el('span', 'lg-item-title', b.title));
            a.appendChild(el('span', 'lg-item-meta', b.shared.map(function (s) { return pretty(s.title); }).join(' · ')));
            rel.appendChild(a);
        });
        box.appendChild(rel);
    }
    document.body.appendChild(box);

    // ── Hover: link the flow bar and the timeline ─────────────────────────
    function setHover(s) {
        steps.forEach(function (x, i) {
            var on = s === x;
            segEls[i].classList.toggle('is-hover', on);
            stepEls[i].classList.toggle('is-hover', on);
        });
        flow.classList.toggle('has-hover', !!s);
    }

    // ── Click: smooth-scroll to the technique in the writeup ──────────────
    function jump(e, s) {
        var target = s.inBody && document.getElementById(s.key);
        if (!target) return;                       // not in the body: follow the link to the tag page
        e.preventDefault();
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        if (history.replaceState) history.replaceState(null, '', '#' + s.key);
    }

    // ── Scroll-spy: highlight the step being read, mark earlier ones done ──
    var anchors = steps.map(function (s) { return s.inBody ? document.getElementById(s.key) : null; });
    var current = -2;
    function spy() {
        var line = window.innerHeight * 0.35, active = -1;
        anchors.forEach(function (a, i) { if (a && a.getBoundingClientRect().top <= line) active = i; });
        if (active === current) return;
        current = active;
        steps.forEach(function (s, i) {
            segEls[i].classList.toggle('is-done', i <= active);
            segEls[i].classList.toggle('is-active', i === active);
            stepEls[i].classList.toggle('is-done', i < active);
            stepEls[i].classList.toggle('is-active', i === active);
        });
        // keep the active step visible inside the panel without moving the page
        if (active >= 0) {
            var item = stepEls[active], top = item.offsetTop;   // the fixed panel is the offsetParent
            if (top < box.scrollTop + 60 || top > box.scrollTop + box.clientHeight - 60) {
                box.scrollTo({ top: Math.max(0, top - box.clientHeight / 2), behavior: reduced ? 'auto' : 'smooth' });
            }
        }
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { ticking = false; spy(); });
    }, { passive: true });
    window.addEventListener('resize', spy);
    spy();
})();
