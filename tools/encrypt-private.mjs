#!/usr/bin/env node
// Encrypt password-protected posts so their content never reaches the public repo.
//
// Workflow: write the post in Obsidian with a `password:` property -> Hugo Publish copies it (in plain text)
// to content/posts/ and its images to static/ob/ -> this script, run by the git pre-commit hook:
//   1. intake  - moves every post in content/ that has a password but no `encrypted:` (and the images/canvases
//                only it uses) into private/ (git-ignored)
//   2. encrypt - renders the site with Hugo, the private posts included (private/.build), inlines their images
//                as data: URIs and encrypts each finished page with AES-256-GCM,
//                key = PBKDF2-SHA256(password, random salt, 600k rounds)   ->  static/enc/<id>.json
//                (skipped when the post and its images did not change since the last run)
//   3. stub    - writes content/<same path>.md: the same front matter minus the password, plus `encrypted:`
// In the browser, layouts/partials/password-protect.html asks for the password and decrypts with WebCrypto.
//
//   node tools/encrypt-private.mjs                  intake + encrypt + stubs
//   node tools/encrypt-private.mjs --stage          same, then fix the git index (used by the pre-commit hook)
//   node tools/encrypt-private.mjs --install-hook   install .git/hooks/pre-commit

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync, renameSync, chmodSync } from 'node:fs';
import { join, dirname, relative, sep, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { randomBytes, pbkdf2Sync, createCipheriv, createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');
const STATIC = join(ROOT, 'static');
const PRIV = join(ROOT, 'private');
const PRIV_CONTENT = join(PRIV, 'content');
const PRIV_STATIC = join(PRIV, 'static');
const BUILD = join(PRIV, '.build');
const STATE = join(PRIV, 'state.json');
const ENC_DIR = join(STATIC, 'enc');
const ITERATIONS = 600000;
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
               '.webp': 'image/webp', '.svg': 'image/svg+xml', '.bmp': 'image/bmp' };
const args = process.argv.slice(2);

const posix = p => p.split(sep).join('/');
// big buffer: `git show` of a post with pasted images can be several MB (default limit is 1 MB)
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 1024 });
function walk(dir, test, out = []) {
    if (!existsSync(dir)) return out;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p, test, out); else if (test(e.name)) out.push(p);
    }
    return out;
}
function frontMatter(text) {
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    return m ? m[1] : '';
}
const prop = (fm, name) => { const m = fm.match(new RegExp(`^${name}:[ \\t]*(.*)$`, 'm')); return m ? m[1].trim().replace(/^(['"])(.*)\1$/, '$2') : ''; };
const needsEncryption = text => { const fm = frontMatter(text); return !!prop(fm, 'password') && !prop(fm, 'encrypted'); };
function moveFile(from, to) { mkdirSync(dirname(to), { recursive: true }); rmSync(to, { force: true }); renameSync(from, to); }

// static/ob paths a post uses: ![..](/ob/x.png), {{< canvas "x.canvas" >}}, and the files inside those canvases
function obRefs(text, lookup) {
    const refs = new Set();
    const decode = s => { try { return decodeURIComponent(s); } catch (e) { return s; } };
    for (const m of text.matchAll(/\/ob\/([^)\s"'<>]+)/g)) refs.add(decode(m[1]));
    for (const m of text.matchAll(/\{\{<\s*canvas\s+"([^"]+)"/g)) refs.add('Canvas/' + m[1]);
    for (const r of [...refs]) {
        if (!r.endsWith('.canvas')) continue;
        const file = lookup(r);
        if (!file) continue;
        try {
            for (const n of JSON.parse(readFileSync(file, 'utf8')).nodes || [])
                if (n.type === 'file' && n.file && !/^https?:/.test(n.file)) refs.add('Canvas/' + n.file.replace(/^\/+/, ''));
        } catch (e) { /* not JSON - ignore */ }
    }
    return refs;
}

// ── --install-hook ───────────────────────────────────────────────────────
if (args.includes('--install-hook')) {
    const hook = join(ROOT, '.git', 'hooks', 'pre-commit');
    writeFileSync(hook, [
        '#!/bin/sh',
        '# installed by: node tools/encrypt-private.mjs --install-hook',
        '# encrypts password-protected posts before they can be committed (see tools/encrypt-private.mjs)',
        'node tools/encrypt-private.mjs --stage || { echo "encrypt-private: commit aborted" >&2; exit 1; }',
        ''].join('\n'));
    try { chmodSync(hook, 0o755); } catch (e) {}
    console.log('Installed .git/hooks/pre-commit');
    process.exit(0);
}

// ── 1. intake: plain-text password posts that Hugo Publish copied into content/ ──
const intake = [];
const privateText = [];
for (const file of walk(CONTENT, n => n.endsWith('.md'))) {
    const text = readFileSync(file, 'utf8');
    if (!needsEncryption(text)) continue;
    const rel = posix(relative(CONTENT, file));
    moveFile(file, join(PRIV_CONTENT, rel));
    intake.push(rel);
}
const posts = walk(PRIV_CONTENT, n => n.endsWith('.md')).map(file => {
    const text = readFileSync(file, 'utf8');
    return { file, text, rel: posix(relative(PRIV_CONTENT, file)), fm: frontMatter(text), password: prop(frontMatter(text), 'password') };
});
for (const p of posts) if (!p.password) { console.error(`✗ private/content/${p.rel}: add a "password:" property.`); process.exit(1); }

// images / canvases used by private posts and by no public post -> private/static
const findOb = r => [join(STATIC, 'ob', r), join(PRIV_STATIC, 'ob', r)].find(existsSync);
const privRefs = new Set();
posts.forEach(p => obRefs(p.text, findOb).forEach(r => privRefs.add(r)));
const publicRefs = new Set();
for (const file of walk(CONTENT, n => n.endsWith('.md'))) obRefs(readFileSync(file, 'utf8'), findOb).forEach(r => publicRefs.add(r));
const movedAssets = [];
for (const r of privRefs) {
    if (publicRefs.has(r)) continue;
    const src = join(STATIC, 'ob', r);
    if (!existsSync(src)) continue;
    moveFile(src, join(PRIV_STATIC, 'ob', r));
    movedAssets.push('static/ob/' + r);
}
if (intake.length) console.log(`Moved ${intake.length} post(s) and ${movedAssets.length} file(s) into private/.`);
if (!posts.length) { console.log('No password-protected posts.'); stage(); process.exit(0); }

// ── 2. encrypt the posts that changed ────────────────────────────────────
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {};
for (const p of posts) {
    const h = createHash('sha256').update(p.text);
    [...obRefs(p.text, findOb)].sort().forEach(r => { const f = findOb(r); if (f) h.update(r).update(readFileSync(f)); });
    p.hash = h.digest('hex');
    p.id = createHash('sha256').update(p.rel).digest('hex').slice(0, 16);
    p.changed = state[p.rel] !== p.hash || !existsSync(join(ENC_DIR, p.id + '.json'));
}
const changed = posts.filter(p => p.changed);
if (changed.length) {
    const cfg = join(PRIV, '.hugo-encrypt.toml');
    writeFileSync(cfg, [
        '# generated by tools/encrypt-private.mjs',
        '[params]', '  encryptBuild = true',
        '[module]',
        '[[module.mounts]]', '  source = "private/content"', '  target = "content"',
        '[[module.mounts]]', '  source = "content"', '  target = "content"',
        `  excludeFiles = ${JSON.stringify(posts.map(p => p.rel))}`,   // the stubs of the same posts
        '[[module.mounts]]', '  source = "static"', '  target = "static"',
        '[[module.mounts]]', '  source = "private/static"', '  target = "static"',
        ''].join('\n'));
    console.log(`Rendering ${changed.length} changed private post(s) with Hugo…`);
    try {
        execFileSync('hugo', ['--config', `hugo.toml,${posix(relative(ROOT, cfg))}`, '--destination', posix(relative(ROOT, BUILD)),
                              '--cleanDestinationDir', '--minify', '--quiet', '--logLevel', 'error'], { cwd: ROOT, stdio: 'inherit' });
    } finally { rmSync(cfg, { force: true }); }

    // single.html / extend_head.html emit <meta name="enc-source"> for these pages in this build only
    const built = {};
    for (const f of walk(BUILD, n => n === 'index.html')) {
        const html = readFileSync(f, 'utf8');
        const m = html.match(/<meta name="?enc-source"? content="([^"]+)"/);
        if (m) built[m[1].replace(/\\/g, '/')] = html;
    }
    const inlineImages = html => html.replace(/(<img\b[^>]*?\bsrc=)("?)([^"\s>]+)\2/g, (all, pre, q, url) => {
        const m = url.match(/\/ob\/([^?#]+)/);
        if (!m) return all;
        let rel; try { rel = decodeURIComponent(m[1]); } catch (e) { rel = m[1]; }
        const file = findOb(rel), mime = MIME[extname(rel).toLowerCase()];
        return file && mime ? `${pre}"data:${mime};base64,${readFileSync(file).toString('base64')}"` : all;
    });

    mkdirSync(ENC_DIR, { recursive: true });
    for (const p of changed) {
        const html = built[p.rel];
        if (!html) { console.error(`✗ ${p.rel}: Hugo did not render it (draft? future date?)`); process.exit(1); }
        const page = inlineImages(html).replace(/<meta name="?enc-source"?[^>]*>/, '');
        const salt = randomBytes(16), iv = randomBytes(12);
        const cipher = createCipheriv('aes-256-gcm', pbkdf2Sync(p.password, salt, ITERATIONS, 32, 'sha256'), iv);
        const data = Buffer.concat([cipher.update(page, 'utf8'), cipher.final(), cipher.getAuthTag()]);  // WebCrypto wants ct||tag
        writeFileSync(join(ENC_DIR, p.id + '.json'), JSON.stringify({
            v: 1, kdf: 'PBKDF2-SHA256', iter: ITERATIONS, cipher: 'AES-256-GCM',
            salt: salt.toString('base64'), iv: iv.toString('base64'), data: data.toString('base64') }));
        state[p.rel] = p.hash;
        console.log(`✓ encrypted ${p.rel}  →  static/enc/${p.id}.json (${(data.length / 1024).toFixed(0)} KB)`);
    }
    writeFileSync(STATE, JSON.stringify(state, null, 1));
}

// ── 3. stubs ─────────────────────────────────────────────────────────────
for (const p of posts) {
    const fm = p.fm.split(/\r?\n/)
        .filter(l => !/^(password|encrypted|summary):/.test(l))
        .concat([`encrypted: enc/${p.id}.json`, 'summary: "🔒 This post is encrypted."']).join('\n');
    const stub = join(CONTENT, p.rel);
    mkdirSync(dirname(stub), { recursive: true });
    writeFileSync(stub, `---\n${fm}\n---\n`);
}
if (!changed.length) console.log(`${posts.length} encrypted post(s) up to date.`);
stage();

// ── --stage: make the git index match (pre-commit hook) ──────────────────
function stage() {
    if (!args.includes('--stage')) return;
    const add = posts.map(p => 'content/' + p.rel).concat(existsSync(ENC_DIR) ? ['static/enc'] : []);
    if (add.length) git('add', '--', ...add);
    for (const f of movedAssets) git('rm', '--cached', '--ignore-unmatch', '-q', '--', f);
    // last line of defence: no staged post may still carry a plain-text password
    const staged = git('diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z').split('\0').filter(f => /^content\/.*\.md$/.test(f));
    const leaks = staged.filter(f => needsEncryption(git('show', ':' + f)));
    if (leaks.length) {
        console.error('✗ these staged posts still contain a password in plain text:\n  ' + leaks.join('\n  '));
        process.exit(1);
    }
}
