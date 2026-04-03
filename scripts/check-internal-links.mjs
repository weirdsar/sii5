#!/usr/bin/env node
/**
 * Проверка внутренних ссылок после статической сборки:
 * — все href="/..." из HTML в dist/;
 * — markdown-ссылки ] (/path) в src/content/ (рекурсивно .md).
 *
 * Запуск: node scripts/check-internal-links.mjs (после astro build).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const contentDir = path.join(root, 'src', 'content');

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

/** `true` — ок, `false` — битая внутренняя ссылка, `null` — не проверяем (не внутренняя). */
function internalHrefResolves(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean.startsWith('/') || clean.startsWith('//')) {
    return null;
  }
  const rel = clean.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!rel) {
    return isFile(path.join(distDir, 'index.html'));
  }
  const directPath = path.join(distDir, rel);
  if (/\.[a-z0-9]+$/i.test(rel) && isFile(directPath)) {
    return true;
  }
  if (isFile(path.join(distDir, rel, 'index.html'))) {
    return true;
  }
  if (isFile(path.join(distDir, `${rel}.html`))) {
    return true;
  }
  return false;
}

function collectHrefsFromHtml(html) {
  const out = new Set();
  const re = /href\s*=\s*["'](\/[^"']*)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    out.add(m[1]);
  }
  return out;
}

function walkHtmlFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      walkHtmlFiles(full, acc);
    } else if (name.isFile() && name.name.endsWith('.html')) {
      acc.push(full);
    }
  }
  return acc;
}

function collectHrefsFromMarkdown(md) {
  const out = new Set();
  const re = /\]\((\/[^)\s#]+)/g;
  let m;
  while ((m = re.exec(md)) !== null) {
    out.add(m[1]);
  }
  return out;
}

function walkMarkdownFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      walkMarkdownFiles(full, acc);
    } else if (name.isFile() && name.name.endsWith('.md')) {
      acc.push(full);
    }
  }
  return acc;
}

function main() {
  if (!fs.existsSync(distDir)) {
    console.error('[check-internal-links] Нет папки dist/. Сначала выполните: npm run build');
    process.exit(1);
  }

  const cache = new Map();

  /** @returns {boolean} нужно ли считать ссылку битой */
  function isBroken(href) {
    if (cache.has(href)) return cache.get(href);
    const res = internalHrefResolves(href);
    const broken = res === null ? false : !res;
    cache.set(href, broken);
    return broken;
  }

  /** @type {Map<string, Set<string>>} */
  const brokenByHref = new Map();

  function record(href, sourceRel) {
    if (!isBroken(href)) return;
    if (!brokenByHref.has(href)) brokenByHref.set(href, new Set());
    brokenByHref.get(href).add(sourceRel);
  }

  const htmlFiles = walkHtmlFiles(distDir);
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(root, file);
    for (const href of collectHrefsFromHtml(html)) {
      record(href, rel);
    }
  }

  const mdFiles = walkMarkdownFiles(contentDir);
  for (const file of mdFiles) {
    const md = fs.readFileSync(file, 'utf8');
    const rel = path.relative(root, file);
    for (const href of collectHrefsFromMarkdown(md)) {
      record(href, rel);
    }
  }

  if (brokenByHref.size > 0) {
    console.error('[check-internal-links] Найдены битые внутренние ссылки:');
    for (const [href, sources] of brokenByHref) {
      console.error(`  ${href}`);
      for (const s of sources) {
        console.error(`    ← ${s}`);
      }
    }
    process.exit(1);
  }

  console.log(
    `[check-internal-links] OK: проверены HTML (${htmlFiles.length} файлов) и markdown контента (${mdFiles.length} файлов).`
  );
}

main();
