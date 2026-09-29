import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import './siteBuilder.css'

const ROOT_DOMAIN='esnoffical.com'
const ISSUE_BASE='https://github.com/sheldonrocks2022-cmyk/ESN-Website/issues/new'
const DRAFT_KEY='esn_site_builder_draft_v1'
const THEMES=['midnight','neon','clean','ember','ocean']
const BLOCKED_TEXT=/password|passcode|seed phrase|wallet recovery|credit card|social security|bank login|verify your account|sign in to continue/i
const tick=String.fromCharCode(96)

const STARTER={
  slug:'',brand:'My Website',category:'creator',theme:'midnight',
  heroTitle:'Build something worth visiting.',
  heroCopy:'A clean, fast website built with the ESN Website Builder.',
  aboutTitle:'About',
  aboutCopy:'Tell visitors who you are, what you do, and why they should care.',
  cards:[
    {title:'What I do',copy:'Describe your main service, project, community, or offer.'},
    {title:'Why choose me',copy:'Explain what makes your work, brand, or community different.'},
    {title:'Get started',copy:'Give visitors one clear next step.'},
  ],
  ctaTitle:'Ready to connect?',
  ctaCopy:'Use the button below to reach out or visit my main page.',
  ctaLabel:'Contact me',
  ctaUrl:'https://esnoffical.com',
  footer:'Built with ESN Website Builder',
}

const PRESETS={
  gaming:{hero:'Level up your community.',copy:'A high-energy home for players, updates, events, and everything happening around your gaming brand.',cards:[['Community','Give players one place for announcements, links, and updates.'],['Events','Showcase tournaments, drops, challenges, and upcoming sessions.'],['Join in','Point visitors directly to your server, Discord, or social hub.']]},
  business:{hero:'Make your business easy to trust.',copy:'A professional home for your services, value, contact information, and the next step customers should take.',cards:[['Services','Show exactly what you offer without making visitors hunt for it.'],['Why us','Explain the value, quality, speed, or experience behind the business.'],['Contact','Give customers a clear way to reach you and start a project.']]},
  portfolio:{hero:'Put your best work first.',copy:'A focused portfolio built to show what you create, what you can do, and where people can find you.',cards:[['Featured work','Highlight your strongest projects and recent work.'],['Skills','Summarize the tools, styles, and work you are best at.'],['Work with me','Give clients or collaborators a simple next step.']]},
  community:{hero:'Give your community a home.',copy:'A central place for updates, links, events, rules, and everything your members need.',cards:[['Updates','Keep the community current with important news and changes.'],['Events','Highlight upcoming activities, launches, and community moments.'],['Join','Send new visitors to the right place to become part of the community.']]},
  restaurant:{hero:'Turn visitors into customers.',copy:'A polished local page for your food, atmosphere, hours, and the fastest way to visit or order.',cards:[['Menu highlights','Feature the dishes, drinks, or specialties people should know first.'],['Experience','Describe the atmosphere and what makes the place memorable.'],['Visit','Make location, hours, reservations, or ordering easy to find.']]},
  creator:{hero:'Make your next idea look official.',copy:'A modern creator page for your work, links, story, and the audience you are building.',cards:[['Content','Show visitors what you create and where to find it.'],['About','Give your audience the short version of who you are.'],['Connect','Send people to your main social, community, or contact page.']]},
}

function cleanSlug(value){return value.toLowerCase().replace(/[^a-z0-9-]/g,'').replace(/^-+|-+$/g,'').slice(0,48)}
function clamp(value,max){return String(value||'').trim().slice(0,max||280)}
function safeUrl(value){try{const url=new URL(String(value||'').trim());return ['https:','http:'].includes(url.protocol)?url.toString():''}catch{return ''}}
function classify(prompt){
  const value=prompt.toLowerCase()
  if(/restaurant|food|cafe|pizza|burger|menu|bakery/.test(value))return 'restaurant'
  if(/business|company|agency|service|shop|store|client/.test(value))return 'business'
  if(/portfolio|designer|developer|photograph|editor|artist|resume/.test(value))return 'portfolio'
  if(/minecraft|gaming|game|clan|esports|server|fortnite/.test(value))return 'gaming'
  if(/community|discord|club|group|network|team/.test(value))return 'community'
  return 'creator'
}
function inferTheme(prompt,category){
  const value=prompt.toLowerCase()
  if(/light|white|minimal|clean|simple/.test(value))return 'clean'
  if(/red|orange|fire|warm|ember/.test(value))return 'ember'
  if(/blue|ocean|water|calm/.test(value))return 'ocean'
  if(/neon|cyber|rgb|arcade|electric/.test(value)||category==='gaming')return 'neon'
  return 'midnight'
}
function generateSite(prompt,brand,slug){
  const category=classify(prompt)
  const preset=PRESETS[category]
  const name=clamp(brand,60)||'My Website'
  const idea=clamp(prompt.replace(/\s+/g,' '),180)
  return {...STARTER,slug:cleanSlug(slug),brand:name,category,theme:inferTheme(prompt,category),heroTitle:preset.hero,heroCopy:clamp(preset.copy+' Built around: '+idea,320),aboutTitle:'About '+name,aboutCopy:'Welcome to '+name+'. This page gives visitors a fast overview of the brand, the main content, and where to go next.',cards:preset.cards.map(function(card){return {title:card[0],copy:card[1]}}),ctaTitle:category==='community'?'Join the community':category==='restaurant'?'Ready to visit?':'Ready to connect?',ctaCopy:'Use the main link below to keep going.',ctaLabel:category==='community'?'Join now':category==='restaurant'?'View details':'Contact / Main link'}
}
function safeSite(site){
  return {version:1,slug:cleanSlug(site.slug),brand:clamp(site.brand,60),category:clamp(site.category,24),theme:THEMES.includes(site.theme)?site.theme:'midnight',heroTitle:clamp(site.heroTitle,100),heroCopy:clamp(site.heroCopy,320),aboutTitle:clamp(site.aboutTitle,100),aboutCopy:clamp(site.aboutCopy,500),cards:(site.cards||[]).slice(0,3).map(function(card){return {title:clamp(card.title,70),copy:clamp(card.copy,260)}}),ctaTitle:clamp(site.ctaTitle,100),ctaCopy:clamp(site.ctaCopy,260),ctaLabel:clamp(site.ctaLabel,50),ctaUrl:safeUrl(site.ctaUrl),footer:clamp(site.footer,100)}
}
function encodePayload(value){
  const bytes=new TextEncoder().encode(JSON.stringify(value))
  let binary=''
  bytes.forEach(function(byte){binary+=String.fromCharCode(byte)})
  return btoa(binary).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')
}
function publishUrl(site){
  const safe=safeSite(site)
  const body=['<!-- ESN_SITE_BUILD_V1 -->','Subdomain: '+tick+safe.slug+tick,'Site payload: '+tick+encodePayload(safe)+tick,'Terms: I confirm this build does not request passwords, payment-card data, recovery phrases, or other sensitive credentials.','','I understand ESN may remove sites used for phishing, malware, impersonation, spam, or other abuse.'].join('\n')
  return ISSUE_BASE+'?'+new URLSearchParams({title:'[SITE-BUILD] '+safe.slug,body:body}).toString()
}
function esc(value){return String(value||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;")}
function exportHtml(site){
  const s=safeSite(site)
  const palettes={midnight:['#07111f','#0d1e35','#ffffff','#8ea7c4','#65e8ff'],neon:['#070710','#15122b','#ffffff','#b6afff','#8cffec'],clean:['#f7f8fb','#ffffff','#10131a','#5b6473','#3157ff'],ember:['#140b09','#28100d','#ffffff','#d9aaa0','#ff8066'],ocean:['#06131a','#0b2430','#ffffff','#9bc3d1','#63dbff']}
  const p=palettes[s.theme]||palettes.midnight
  const cards=s.cards.map(function(card){return '<article><h3>'+esc(card.title)+'</h3><p>'+esc(card.copy)+'</p></article>'}).join('')
  const cta=s.ctaUrl?'<a class="button" href="'+esc(s.ctaUrl)+'" rel="noreferrer">'+esc(s.ctaLabel)+'</a>':''
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(s.brand)+'</title><meta name="description" content="'+esc(s.heroCopy)+'"><style>*{box-sizing:border-box}body{margin:0;background:'+p[0]+';color:'+p[2]+';font-family:Inter,system-ui,-apple-system,sans-serif}.wrap{width:min(1100px,calc(100% - 36px));margin:auto}.nav{display:flex;justify-content:space-between;align-items:center;padding:24px 0}.brand{font-weight:900}.nav span{color:'+p[3]+'}.hero{padding:110px 0 80px}.eyebrow{color:'+p[4]+';font-size:.72rem;letter-spacing:.15em;font-weight:900;text-transform:uppercase}.hero h1{font-size:clamp(3rem,9vw,7rem);line-height:.92;max-width:900px;margin:16px 0 24px}.hero p,.about p,.cta p,.grid p{color:'+p[3]+';line-height:1.7}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:24px 0 90px}.grid article,.about,.cta{background:'+p[1]+';border-radius:24px;padding:28px}.about,.cta{margin-bottom:22px}.button{display:inline-block;margin-top:14px;background:'+p[4]+';color:'+p[0]+';padding:13px 18px;border-radius:12px;text-decoration:none;font-weight:900}.footer{padding:38px 0 60px;color:'+p[3]+'}@media(max-width:760px){.hero{padding:70px 0 45px}.grid{grid-template-columns:1fr;padding-bottom:55px}}</style></head><body><div class="wrap"><nav class="nav"><div class="brand">'+esc(s.brand)+'</div><span>'+esc(s.slug)+'.'+ROOT_DOMAIN+'</span></nav><main><section class="hero"><span class="eyebrow">'+esc(s.category)+'</span><h1>'+esc(s.heroTitle)+'</h1><p>'+esc(s.heroCopy)+'</p></section><section class="about"><h2>'+esc(s.aboutTitle)+'</h2><p>'+esc(s.aboutCopy)+'</p></section><section class="grid">'+cards+'</section><section class="cta"><h2>'+esc(s.ctaTitle)+'</h2><p>'+esc(s.ctaCopy)+'</p>'+cta+'</section></main><footer class="footer">'+esc(s.footer)+'</footer></div></body></html>'
}
function downloadHtml(site){
  const blob=new Blob([exportHtml(site)],{type:'text/html;charset=utf-8'})
  const url=URL.createObjectURL(blob)
  const anchor=document.createElement('a')
  anchor.href=url
  anchor.download=(cleanSlug(site.slug)||'esn-site')+'.html'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(function(){URL.revokeObjectURL(url)},1000)
}
function SitePreview({site}){
  const s=safeSite(site)
  return <div className={'esn-built-site theme-'+s.theme}>
    <nav><strong>{s.brand}</strong><span>{s.slug||'yourname'}.{ROOT_DOMAIN}</span></nav>
    <section className="built-hero"><span>{s.category}</span><h1>{s.heroTitle}</h1><p>{s.heroCopy}</p></section>
    <section className="built-about"><h2>{s.aboutTitle}</h2><p>{s.aboutCopy}</p></section>
    <section className="built-card-grid">{s.cards.map(function(card,index){return <article key={index}><h3>{card.title}</h3><p>{card.copy}</p></article>})}</section>
    <section className="built-cta"><h2>{s.ctaTitle}</h2><p>{s.ctaCopy}</p>{s.ctaUrl&&<a href={s.ctaUrl} target="_blank" rel="noreferrer">{s.ctaLabel}</a>}</section>
    <footer>{s.footer}</footer>
  </div>
}

export default function SiteBuilderPage(){
  const [prompt,setPrompt]=useState('')
  const [site,setSite]=useState(function(){try{return {...STARTER,...JSON.parse(localStorage.getItem(DRAFT_KEY)||'{}')}}catch{return STARTER}})
  const [device,setDevice]=useState('desktop')
  const [message,setMessage]=useState('')
  const update=function(key,value){setSite(function(current){return {...current,[key]:value}})}
  const updateCard=function(index,key,value){setSite(function(current){return {...current,cards:current.cards.map(function(card,i){return i===index?{...card,[key]:value}:card})}})}
  useEffect(function(){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(safeSite(site)))}catch{}},[site])
  const generate=function(){if(!prompt.trim()){setMessage('Tell the builder what kind of website you want first.');return}setSite(generateSite(prompt,site.brand,site.slug));setMessage('Prompt generated. Everything below is editable.')}
  const publish=function(){
    const s=safeSite(site)
    if(!s.slug){setMessage('Enter the ESN subdomain you claimed first.');return}
    if(!s.brand||!s.heroTitle){setMessage('Add a site name and headline first.');return}
    if(BLOCKED_TEXT.test(JSON.stringify(s))){setMessage('Remove credential/payment-login wording before publishing. ESN free sites cannot collect sensitive information.');return}
    window.open(publishUrl(s),'_blank','noopener,noreferrer')
  }
  return <>
    <section className="page-hero builder-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">ESN WEBSITE BUILDER // BETA</span><h1>Build the website for your ESN subdomain.</h1><p>Describe the site you want, generate a complete starting layout, edit every section, preview phone or desktop, then export or publish the build. The beta prompt engine runs in your browser and does not expose an external AI API key.</p></div><div className="page-hero-mark"><span>AI</span><small>PROMPT → SITE</small></div></div></section>
    <section className="section"><div className="shell builder-layout">
      <div className="builder-controls">
        <div className="builder-panel"><span className="eyebrow">01 // YOUR SITE</span><label>YOUR ESN SUBDOMAIN<div className="builder-domain"><input value={site.slug} onChange={function(e){update('slug',cleanSlug(e.target.value))}} placeholder="yourname"/><span>.{ROOT_DOMAIN}</span></div></label><label>SITE / BRAND NAME<input value={site.brand} onChange={function(e){update('brand',e.target.value.slice(0,60))}} placeholder="My Brand"/></label><label>DESCRIBE THE WEBSITE<textarea value={prompt} onChange={function(e){setPrompt(e.target.value.slice(0,700))}} placeholder="Make me a dark gaming website for my Minecraft community with a clean hero, community info, events, and a Discord button."/></label><button className="builder-generate" type="button" onClick={generate}>GENERATE WEBSITE</button>{message&&<div className="builder-message">{message}</div>}</div>
        <div className="builder-panel"><span className="eyebrow">02 // STYLE</span><div className="builder-themes">{THEMES.map(function(theme){return <button type="button" className={site.theme===theme?'active':''} onClick={function(){update('theme',theme)}} key={theme}>{theme.toUpperCase()}</button>})}</div><label>HERO HEADLINE<input value={site.heroTitle} onChange={function(e){update('heroTitle',e.target.value)}}/></label><label>HERO TEXT<textarea value={site.heroCopy} onChange={function(e){update('heroCopy',e.target.value)}}/></label><label>ABOUT TITLE<input value={site.aboutTitle} onChange={function(e){update('aboutTitle',e.target.value)}}/></label><label>ABOUT TEXT<textarea value={site.aboutCopy} onChange={function(e){update('aboutCopy',e.target.value)}}/></label></div>
        <div className="builder-panel"><span className="eyebrow">03 // CARDS</span>{site.cards.map(function(card,index){return <div className="builder-card-editor" key={index}><input value={card.title} onChange={function(e){updateCard(index,'title',e.target.value)}}/><textarea value={card.copy} onChange={function(e){updateCard(index,'copy',e.target.value)}}/></div>})}</div>
        <div className="builder-panel"><span className="eyebrow">04 // FINAL CTA</span><label>CTA TITLE<input value={site.ctaTitle} onChange={function(e){update('ctaTitle',e.target.value)}}/></label><label>CTA TEXT<textarea value={site.ctaCopy} onChange={function(e){update('ctaCopy',e.target.value)}}/></label><label>BUTTON TEXT<input value={site.ctaLabel} onChange={function(e){update('ctaLabel',e.target.value)}}/></label><label>BUTTON LINK<input value={site.ctaUrl} onChange={function(e){update('ctaUrl',e.target.value)}} placeholder="https://..."/></label><div className="builder-action-grid"><button type="button" onClick={function(){downloadHtml(site)}}>DOWNLOAD HTML</button><button className="primary" type="button" onClick={publish}>PUBLISH BUILD</button></div><small>Publishing verifies that the GitHub account submitting the build owns the active free ESN subdomain. User sites are structured and script-free; arbitrary JavaScript is not accepted.</small></div>
      </div>
      <div className="builder-preview-column"><div className="builder-preview-toolbar"><div><span>LIVE PREVIEW</span><strong>{site.slug||'yourname'}.{ROOT_DOMAIN}</strong></div><div><button className={device==='desktop'?'active':''} onClick={function(){setDevice('desktop')}}>DESKTOP</button><button className={device==='mobile'?'active':''} onClick={function(){setDevice('mobile')}}>PHONE</button></div></div><div className={'builder-preview-frame '+device}><SitePreview site={site}/></div><div className="builder-publish-note"><strong>SUBDOMAIN NOTE</strong><span>The builder can create/export the site and publish an ESN-hosted preview. The actual subdomain still needs a hosting destination that accepts that hostname and provisions HTTPS.</span></div></div>
    </div></section>
  </>
}

export function HostedSitePage(){
  const params=useParams()
  const clean=cleanSlug(params.slug||'')
  const [state,setState]=useState({loading:true,site:null,error:''})
  useEffect(function(){
    if(!clean){setState({loading:false,site:null,error:'Invalid site name.'});return}
    let cancelled=false
    fetch('/generated-sites/'+encodeURIComponent(clean)+'.json',{cache:'no-store'}).then(function(response){if(!response.ok)throw new Error('Site not published yet.');return response.json()}).then(function(site){if(!cancelled)setState({loading:false,site:safeSite(site),error:''})}).catch(function(error){if(!cancelled)setState({loading:false,site:null,error:error.message||'Site unavailable.'})})
    return function(){cancelled=true}
  },[clean])
  if(state.loading)return <section className="section"><div className="shell"><div className="builder-public-state">Loading site…</div></div></section>
  if(state.error)return <section className="section"><div className="shell"><div className="builder-public-state"><strong>ESN SITE NOT READY</strong><span>{state.error}</span></div></div></section>
  return <div className="hosted-site-shell"><SitePreview site={state.site}/></div>
}
