import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import Beasties from 'beasties'
import { SEO_ROUTES, canonicalUrl } from '../src/seo.js'

// Static pages: every route in SEO_ROUTES ships as finished HTML (rendered at build time from the same
// React pages), with the CSS it needs inlined and the rest of the CSS loaded without blocking.
// The page script starts on the visitor's first scroll, tap, key or mouse move, so the page is readable at once.

const dist = path.resolve('dist')
const ssrEntry = path.resolve('dist-ssr', 'entry-server.js')

// Minimal browser stand-ins so page modules can be imported in Node. Effects never run at build time.
const noop = () => {}
const memory = {}
const storage = { getItem: (k) => memory[k] ?? null, setItem: (k, v) => { memory[k] = String(v) }, removeItem: (k) => { delete memory[k] }, clear: noop, key: () => null, length: 0 }
const element = () => ({ style: {}, dataset: {}, setAttribute: noop, getAttribute: () => null, removeAttribute: noop, appendChild: noop, removeChild: noop, classList: { add: noop, remove: noop, toggle: noop, contains: () => false }, addEventListener: noop, removeEventListener: noop, querySelector: () => null, querySelectorAll: () => [] })
const browserGlobals = {
  window: globalThis, localStorage: storage, sessionStorage: storage,
  matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop }),
  addEventListener: noop, removeEventListener: noop, dispatchEvent: noop, innerWidth: 390, innerHeight: 844, scrollY: 0, devicePixelRatio: 1,
  requestAnimationFrame: () => 0, cancelAnimationFrame: noop, scrollTo: noop,
  document: { documentElement: element(), body: element(), head: element(), createElement: element, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener: noop, removeEventListener: noop, title: '', cookie: '', referrer: '', visibilityState: 'visible' },
}
for (const [key, value] of Object.entries(browserGlobals)) {
  if (!(key in globalThis) || key === 'window') Object.defineProperty(globalThis, key, { value, configurable: true, writable: true })
}
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'prerender', language: 'en-US', languages: ['en-US'], onLine: true, hardwareConcurrency: 4, maxTouchPoints: 0 }, configurable: true, writable: true })
const setLocation = (route) => {
  globalThis.location = { pathname: route, search: '', hash: '', href: canonicalUrl(route), origin: 'https://esnoffical.com', host: 'esnoffical.com', hostname: 'esnoffical.com', protocol: 'https:', assign: noop, replace: noop, reload: noop }
}
setLocation('/')

const { render } = await import(pathToFileURL(ssrEntry).href)

const fileFor = (route) => route === '/' ? path.join(dist, 'index.html') : path.join(dist, route.replace(/^\//, ''), 'index.html')

// Loader: starts the page script, and applies the full stylesheet (every rule the page uses is already inlined), on first interaction. A button tapped before the script is ready is tapped again once it is.
function loaderFor(src) {
  return `<script>(function(){var d=0,q=null,E=['pointerdown','touchstart','keydown','scroll','wheel','mousemove','focusin'];
function p(el){var r=document.getElementById('root'),a=[];while(el&&el!==r&&el.parentElement){a.unshift([].indexOf.call(el.parentElement.children,el));el=el.parentElement}return el===r?a:null}
function f(a){var el=document.getElementById('root');for(var i=0;el&&i<a.length;i++)el=el.children[a[i]];return el}
function c(e){if(window.__esnReady)return;var t=e.target&&e.target.closest&&e.target.closest('button,[role=button],summary,label,input[type=checkbox],input[type=radio]');if(!t)return;var a=p(t);if(!a)return;e.preventDefault();e.stopPropagation();q=a;go()}
function go(e){if(d)return;d=1;window.__esnBootBy=e&&e.type;[].forEach.call(document.querySelectorAll('link[data-esn-css]'),function(l){l.media='all'});E.forEach(function(t){removeEventListener(t,go,true)});var s=document.createElement('script');s.type='module';s.src='${src}';document.head.appendChild(s)}
addEventListener('click',c,true);
addEventListener('esn:ready',function(){removeEventListener('click',c,true);if(q){var el=f(q);q=null;setTimeout(function(){el&&el.click&&el.click()},60)}});
E.forEach(function(t){addEventListener(t,go,{capture:true,passive:true})});
})()</script>`
}

let count = 0
let failed = 0
for (const route of Object.keys(SEO_ROUTES)) {
  const file = fileFor(route)
  if (!fs.existsSync(file)) continue
  let html = fs.readFileSync(file, 'utf8')
  setLocation(route)
  let markup = ''
  try {
    markup = await render(route)
  } catch (error) {
    console.warn(`Static render failed for ${route}: ${error.message}`)
  }
  if (!markup || markup.includes('class="route-loading"') || (markup.match(/<h1[\s>]/g) || []).length !== 1) {
    // Keep the normal app shell for this route (the script loads right away).
    failed += 1
    console.warn(`Static render skipped for ${route} (h1 count ${(markup.match(/<h1[\s>]/g) || []).length})`)
    continue
  }
  const start = html.indexOf('<div id="root">')
  const end = html.indexOf('<noscript>', start)
  if (start < 0 || end < 0) continue
  html = `${html.slice(0, start)}<div id="root" data-prerendered="">${markup}</div>\n    ${html.slice(end)}`
  // Same page-wide styling class the app sets on start (main.jsx), so the page looks identical before and after.
  html = html.replace(/<html([^>]*)>/, (tag, attrs) => /class="/.test(attrs) ? tag.replace(/class="([^"]*)"/, 'class="$1 esn-ultra"') : `<html${attrs} class="esn-ultra">`)
  // The page script and its preloads start on first interaction instead of during load.
  const entry = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>\s*/)
  if (entry) {
    html = html.replace(entry[0], '')
    html = html.replace(/<link rel="modulepreload" crossorigin href="[^"]+"\s*\/?>\s*/g, '')
    html = html.replace('</body>', `${loaderFor(entry[1])}\n</body>`)
  }
  fs.writeFileSync(file, html)
  count += 1
}

// Inline the CSS each page uses; load the full stylesheet without blocking the first paint.
const beasties = new Beasties({ path: dist, publicPath: '/', preload: 'media', pruneSource: false, reduceInlineStyles: false, mergeStylesheets: true, logLevel: 'warn', fonts: false })
for (const route of Object.keys(SEO_ROUTES)) {
  const file = fileFor(route)
  if (!fs.existsSync(file)) continue
  const html = fs.readFileSync(file, 'utf8')
  if (!html.includes('data-prerendered')) continue
  fs.writeFileSync(file, (await beasties.process(html)).replace(/ onload="this\.media='all'"/g, ' data-esn-css'))
}

console.log(`Static pages: ${count} routes pre-rendered with inlined CSS, ${failed} kept as app shell.`)
