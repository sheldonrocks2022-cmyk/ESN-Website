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
  fortnite:{
    label:'Fortnite',themes:['neon','midnight'],tones:['high-energy','competitive','fan-focused'],
    heroes:['Fortnite deserves more players.','There is more to Fortnite than one match.','Drop in. Find your mode. Keep playing.'],
    copies:[
      'A Fortnite-focused home built around the modes, updates, creativity, competition, and reasons players keep coming back.',
      'A focused Fortnite site that can highlight Battle Royale, Zero Build, Creative experiences, events, updates, and community.',
      'A fast fan-style Fortnite page designed to explain what makes the game fun, flexible, and worth trying.'
    ],
    about:'Fortnite keeps evolving across Battle Royale, Zero Build, Creative and UEFN experiences, collaborations, live moments, progression, and multiple ways to play.',
    cards:[
      ['Always changing','Talk about seasons, map changes, items, events, collaborations, and the steady stream of new content.'],
      ['More ways to play','Highlight Battle Royale, Zero Build, Creative experiences, Reload, LEGO Fortnite, Festival, Rocket Racing, and community-made islands.'],
      ['Why try it','Explain the free-to-play entry point, cross-platform support, casual and competitive options, and variety of experiences.']
    ],
    ctas:[['Jump into Fortnite','Pick a mode that fits how you like to play and see what Fortnite has become.','Visit Fortnite'],['Find your way to play','There is no single way to play Fortnite anymore. Start with the mode that sounds best to you.','Explore Fortnite']]
  },
  minecraft:{
    label:'Minecraft',themes:['midnight','ocean'],tones:['adventure','community','server-focused'],
    heroes:['Build your world. Grow your community.','A Minecraft home built for players.','Your next Minecraft adventure starts here.'],
    copies:[
      'A Minecraft-focused website for a server, SMP, realm, creator project, build team, or player community.',
      'A clear home for Minecraft players with room for server information, updates, features, rules, events, and community links.',
      'A Minecraft site designed to turn scattered server information into one clean place players can actually use.'
    ],
    about:'Bring your Minecraft project together with a clear place for players to understand the world, the community, the main features, and how to get involved.',
    cards:[
      ['The world','Explain the server, SMP, realm, modpack, maps, builds, or style of Minecraft experience.'],
      ['What makes it different','Show the features, progression, events, rules, plugins, mods, or community systems that make the project stand out.'],
      ['Start playing','Give players the clearest next step for joining, following updates, or connecting with the community.']
    ],
    ctas:[['Ready to play?','Give players the fastest path from visitor to community member.','Join / Learn more'],['Enter the world','Put the important connection or community link one tap away.','Get started']]
  },
  gaming:{
    label:'Gaming',themes:['neon','midnight'],tones:['high-energy','competitive','community'],
    heroes:['Level up your community.','Make the game the center of the page.','Built for players, not filler.'],
    copies:[
      'A high-energy home for players, updates, events, clips, competition, and everything happening around your gaming brand.',
      'A gaming site that puts the actual game, community, and next action front and center.',
      'A player-first layout for a gaming project, team, creator, clan, tournament, or community.'
    ],
    about:'Give players one strong place to understand the game or project, see what is happening, and know exactly where to go next.',
    cards:[
      ['What you play','Make the game, mode, team, server, or project immediately clear.'],
      ['What is happening','Highlight updates, events, challenges, clips, rankings, releases, or community activity.'],
      ['Join in','Point visitors directly to the server, Discord, stream, social page, or next action.']
    ],
    ctas:[['Ready to jump in?','Take visitors straight to the next place they need to go.','Join now'],['Stay in the game','Keep the community connected with one clear next step.','Get connected']]
  },
  business:{
    label:'Business',themes:['clean','midnight'],tones:['professional','direct','trust-focused'],
    heroes:['Make your business easy to trust.','Turn attention into action.','Make the first impression count.'],
    copies:[
      'A professional website built to explain the offer quickly, build trust, and move visitors toward one clear next step.',
      'A focused business page that puts services, value, proof, and contact information where customers can find them.',
      'A clean business site designed around clarity, credibility, and conversion instead of clutter.'
    ],
    about:'Present the business clearly: what it does, who it helps, what makes it useful, and how a potential customer can take the next step.',
    cards:[
      ['Services','Show the main services or offers without making visitors hunt for them.'],
      ['Why choose us','Explain the value, quality, speed, experience, or approach behind the business.'],
      ['Start a project','Give customers a simple path to contact, request a quote, book, or learn more.']
    ],
    ctas:[['Ready to get started?','Make the next business step simple and obvious.','Contact us'],['Let’s build something','Turn interest into a real conversation.','Start here']]
  },
  portfolio:{
    label:'Portfolio',themes:['clean','midnight'],tones:['visual','confident','minimal'],
    heroes:['Put your best work first.','Make the work speak first.','A portfolio people can scan fast.'],
    copies:[
      'A focused portfolio built to show what you create, what you can do, and how people can work with you.',
      'A project-first portfolio that keeps attention on your strongest work, skills, and contact path.',
      'A clean personal showcase for creative work, development, editing, design, photography, or other projects.'
    ],
    about:'Give visitors the short version of who you are, what kind of work you make, and what you want to do next.',
    cards:[
      ['Featured work','Highlight the strongest projects, results, or examples first.'],
      ['Skills','Summarize the tools, styles, strengths, or specialties behind the work.'],
      ['Work with me','Make the collaboration or contact path clear and easy to use.']
    ],
    ctas:[['Have a project in mind?','Give potential clients or collaborators one obvious next step.','Work with me'],['See something you like?','Turn the portfolio visit into a conversation.','Contact me']]
  },
  community:{
    label:'Community',themes:['ocean','midnight'],tones:['welcoming','organized','active'],
    heroes:['Give your community a home.','Everything your community needs, in one place.','Make joining feel easy.'],
    copies:[
      'A central place for community updates, links, events, information, and the fastest way for new members to join.',
      'A community-first website built to organize what matters and make the next step obvious.',
      'A clear public home for a Discord, club, group, team, network, or online community.'
    ],
    about:'Explain what the community is about, who it is for, what happens there, and why someone should become part of it.',
    cards:[
      ['Updates','Keep members current with important news, changes, launches, and announcements.'],
      ['Events','Highlight upcoming activities, sessions, giveaways, challenges, or community moments.'],
      ['Join','Send new visitors directly to the right place to become part of the community.']
    ],
    ctas:[['Join the community','Make joining take one clear action.','Join now'],['Be part of it','Give new members the fastest path into the community.','Get connected']]
  },
  restaurant:{
    label:'Restaurant',themes:['ember','clean'],tones:['warm','local','inviting'],
    heroes:['Turn visitors into customers.','Make people hungry before they arrive.','Your next favorite meal starts here.'],
    copies:[
      'A polished restaurant page for food, atmosphere, highlights, hours, and the fastest way to visit or order.',
      'A warm local website built around the menu, experience, and practical details customers need.',
      'A restaurant homepage that quickly answers what you serve, what makes it special, and how to visit.'
    ],
    about:'Describe the food, atmosphere, story, location, or experience in a way that helps a new customer know what to expect.',
    cards:[
      ['Menu highlights','Feature the dishes, drinks, specials, or signature items people should know first.'],
      ['The experience','Describe the atmosphere, style, service, or reason people enjoy visiting.'],
      ['Visit','Make location, hours, reservations, ordering, or contact information easy to find.']
    ],
    ctas:[['Ready to visit?','Give customers the fastest route to the next step.','View details'],['Come hungry','Make ordering, booking, or planning a visit simple.','Plan your visit']]
  },
  music:{
    label:'Music',themes:['neon','midnight'],tones:['creative','artist-focused','release-driven'],
    heroes:['Turn up the volume on your brand.','Give the music a home.','Make every release easier to find.'],
    copies:[
      'A music-focused site for an artist, producer, band, DJ, release, playlist, or fan community.',
      'A clean artist page for releases, identity, upcoming drops, links, and the story behind the music.',
      'A music site built to move visitors from first impression to listening, following, or joining the community.'
    ],
    about:'Tell listeners who you are, what kind of music or project you make, what you are working on, and where they should listen next.',
    cards:[
      ['Latest release','Put the newest song, project, mix, video, or release front and center.'],
      ['Sound & story','Explain the style, influences, identity, or idea behind the music.'],
      ['Listen & follow','Give fans direct links to the places where they can hear more and stay connected.']
    ],
    ctas:[['Press play','Send listeners to the main release, profile, or platform.','Listen now'],['Stay connected','Keep fans close to the next release and update.','Follow / Listen']]
  },
  technology:{
    label:'Technology',themes:['ocean','clean'],tones:['modern','clear','product-focused'],
    heroes:['Make the technology easy to understand.','Build the future without confusing the visitor.','Explain the product. Show the value.'],
    copies:[
      'A modern technology site for an app, tool, software project, startup, product, or technical community.',
      'A product-focused page that explains the problem, the solution, the useful features, and the next step.',
      'A clean technical site designed to make complex ideas easier to understand.'
    ],
    about:'Explain what the product or project does, who it helps, and why the technology matters without burying visitors in jargon.',
    cards:[
      ['What it does','Describe the main purpose and outcome in plain language.'],
      ['Key features','Highlight the strongest functions, workflows, or technical advantages.'],
      ['Try it','Give visitors a direct path to a demo, download, documentation, waitlist, or contact option.']
    ],
    ctas:[['Ready to try it?','Put the product’s main action one click away.','Get started'],['See it in action','Turn curiosity into the next product step.','Explore']]
  },
  event:{
    label:'Event',themes:['ember','neon'],tones:['urgent','clear','exciting'],
    heroes:['Make the event impossible to miss.','One page. Every important event detail.','Build the hype. Make the plan clear.'],
    copies:[
      'An event page built around the date, reason to attend, key details, highlights, and one obvious action.',
      'A fast event website for a launch, tournament, meetup, party, stream, showcase, or community moment.',
      'A focused event page that puts the most important information above the clutter.'
    ],
    about:'Explain what is happening, why it matters, who it is for, and what visitors should know before they join.',
    cards:[
      ['What is happening','Summarize the main event, experience, or reason to show up.'],
      ['What to expect','Highlight the schedule, activities, guests, prizes, features, or important details.'],
      ['Join the event','Make registration, attendance, streaming, or community access easy to find.']
    ],
    ctas:[['Be there','Move visitors directly toward attending or joining.','Event details'],['Don’t miss it','Give people one clear action before the event starts.','Join / Register']]
  },
  creator:{
    label:'Creator',themes:['midnight','clean'],tones:['personal','modern','content-first'],
    heroes:['Make your next idea look official.','Give your content a real home.','Turn your links into a brand.'],
    copies:[
      'A modern creator page for your work, links, story, audience, and the content you want people to see first.',
      'A creator-first homepage that turns scattered profiles and projects into one clear destination.',
      'A flexible personal website for content, projects, community, services, and the next thing you are building.'
    ],
    about:'Give your audience the short version of who you are, what you create, and what they should check out next.',
    cards:[
      ['Content','Show visitors what you create and where they can find the best of it.'],
      ['About','Explain the person, project, style, or story behind the content.'],
      ['Connect','Send people to your main social, community, contact page, or current project.']
    ],
    ctas:[['Stay connected','Give your audience one clear next place to go.','Main link'],['See what’s next','Point visitors toward the project, profile, or community that matters most.','Explore']]
  }
}

const QUICK_PROMPTS=[
  'Make a dark Fortnite fan site explaining why more people should play Fortnite.',
  'Build a Minecraft SMP website with server features, events, and a community join button.',
  'Create a clean small-business website that explains services and gets customers to contact us.',
  'Make a modern portfolio for a video editor with featured work, skills, and a contact button.',
  'Build a neon music artist page for releases, an about section, and a listen-now button.'
]

function cleanSlug(value){return value.toLowerCase().replace(/[^a-z0-9-]/g,'').replace(/^-+|-+$/g,'').slice(0,48)}
function clamp(value,max){return String(value||'').trim().slice(0,max||280)}
function safeUrl(value){try{const url=new URL(String(value||'').trim());return ['https:','http:'].includes(url.protocol)?url.toString():''}catch{return ''}}
function extractUrl(prompt){
  const match=String(prompt||'').match(/https?:\/\/[^\s)]+/i)
  return match?safeUrl(match[0]):''
}
function classify(prompt){
  const value=String(prompt||'').toLowerCase()
  if(/fortnite|battle royale|zero build|uefn|epic games/.test(value))return 'fortnite'
  if(/minecraft|smp|survival server|bedrock|java server|realm|modpack/.test(value))return 'minecraft'
  if(/restaurant|food|cafe|coffee shop|pizza|burger|menu|bakery|diner/.test(value))return 'restaurant'
  if(/music|artist|rapper|singer|producer|band|dj|album|song|ep\b|single\b/.test(value))return 'music'
  if(/software|technology|tech\b|app\b|saas|developer tool|startup|platform|api\b/.test(value))return 'technology'
  if(/event|tournament|meetup|party|launch event|conference|showcase|giveaway/.test(value))return 'event'
  if(/business|company|agency|service|shop|store|client|contractor|local business/.test(value))return 'business'
  if(/portfolio|designer|developer|photograph|editor|artist|resume|showreel/.test(value))return 'portfolio'
  if(/gaming|game\b|clan|esports|server|streamer/.test(value))return 'gaming'
  if(/community|discord|club|group|network|team|fanbase/.test(value))return 'community'
  return 'creator'
}
function inferTheme(prompt,category){
  const value=String(prompt||'').toLowerCase()
  if(/light|white|minimal|clean|simple|professional/.test(value))return 'clean'
  if(/red|orange|fire|warm|ember|sunset/.test(value))return 'ember'
  if(/blue|ocean|water|calm|aqua|cyan/.test(value))return 'ocean'
  if(/neon|cyber|rgb|arcade|electric|purple/.test(value))return 'neon'
  const preferred=PRESETS[category]?.themes||['midnight']
  return preferred[0]
}
function inferTone(prompt,category){
  const value=String(prompt||'').toLowerCase()
  if(/professional|corporate|serious|clean/.test(value))return 'professional'
  if(/funny|fun|playful|casual/.test(value))return 'playful'
  if(/hype|energetic|exciting|bold|intense/.test(value))return 'high-energy'
  if(/luxury|premium|elegant/.test(value))return 'premium'
  if(/friendly|welcoming|warm/.test(value))return 'welcoming'
  return PRESETS[category]?.tones?.[0]||'modern'
}
function promptKeywords(prompt){
  const stop=new Set(['make','build','create','website','site','page','with','that','this','from','into','about','have','more','for','the','and','but','your','their','some','want','dark','light','clean','modern','please','need','should','could','would','also','like'])
  const words=String(prompt||'').toLowerCase().replace(/https?:\/\/\S+/g,' ').match(/[a-z0-9][a-z0-9+-]{2,}/g)||[]
  const unique=[]
  for(const word of words){
    if(stop.has(word)||unique.includes(word))continue
    unique.push(word)
    if(unique.length>=6)break
  }
  return unique
}
function promptGoals(prompt){
  const value=String(prompt||'').toLowerCase()
  const goals=[]
  if(/explain|talk about|information|info|learn/.test(value))goals.push('inform')
  if(/join|discord|community|members/.test(value))goals.push('grow community')
  if(/sell|shop|store|buy|customer/.test(value))goals.push('convert visitors')
  if(/contact|book|quote|hire|client/.test(value))goals.push('get contacts')
  if(/showcase|portfolio|work|projects/.test(value))goals.push('show work')
  if(/play|players|gaming|fortnite|minecraft/.test(value))goals.push('engage players')
  return goals.slice(0,3)
}
function analyzePrompt(prompt){
  const category=classify(prompt)
  const profile=PRESETS[category]||PRESETS.creator
  return {
    category,
    label:profile.label,
    theme:inferTheme(prompt,category),
    tone:inferTone(prompt,category),
    keywords:promptKeywords(prompt),
    goals:promptGoals(prompt),
    url:extractUrl(prompt),
  }
}
function contextualize(copy,analysis,name){
  const keywords=analysis.keywords.slice(0,3)
  if(!keywords.length)return copy
  const topic=keywords.join(', ')
  return clamp(copy+' Focus: '+topic+'.',320)
}
function generateSite(prompt,brand,slug,variant){
  const analysis=analyzePrompt(prompt)
  const preset=PRESETS[analysis.category]||PRESETS.creator
  const name=clamp(brand,60)||'My Website'
  const pick=Math.abs(Number(variant)||0)%preset.heroes.length
  const ctaPick=Math.abs(Number(variant)||0)%preset.ctas.length
  const cta=preset.ctas[ctaPick]
  const promptUrl=analysis.url
  return {
    ...STARTER,
    slug:cleanSlug(slug),
    brand:name,
    category:analysis.category,
    theme:analysis.theme,
    heroTitle:preset.heroes[pick],
    heroCopy:contextualize(preset.copies[pick%preset.copies.length],analysis,name),
    aboutTitle:'About '+name,
    aboutCopy:contextualize(preset.about,analysis,name),
    cards:preset.cards.map(function(card,index){
      const keyword=analysis.keywords[index]
      return {title:card[0],copy:keyword?clamp(card[1]+' This section can emphasize '+keyword+'.',260):card[1]}
    }),
    ctaTitle:cta[0],
    ctaCopy:cta[1],
    ctaLabel:cta[2],
    ctaUrl:promptUrl||STARTER.ctaUrl,
    footer:name+' • Built with ESN Website Builder',
  }
}
function regenerateSection(site,prompt,section,variant){
  const next=generateSite(prompt,site.brand,site.slug,variant)
  if(section==='hero')return {...site,category:next.category,theme:next.theme,heroTitle:next.heroTitle,heroCopy:next.heroCopy}
  if(section==='about')return {...site,category:next.category,aboutTitle:next.aboutTitle,aboutCopy:next.aboutCopy}
  if(section==='cards')return {...site,category:next.category,cards:next.cards}
  if(section==='cta')return {...site,category:next.category,ctaTitle:next.ctaTitle,ctaCopy:next.ctaCopy,ctaLabel:next.ctaLabel,ctaUrl:next.ctaUrl}
  return next
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
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(s.brand)+'</title><meta name="description" content="'+esc(s.heroCopy)+'"><style>*{box-sizing:border-box}body{margin:0;background:'+p[0]+';color:'+p[2]+';font-family:Inter,system-ui,-apple-system,sans-serif}.wrap{width:min(1100px,calc(100% - 36px));margin:auto}.nav{display:flex;justify-content:space-between;align-items:center;padding:24px 0}.brand{font-weight:900}.nav span{color:'+p[3]+'}.hero{padding:110px 0 80px}.eyebrow{color:'+p[4]+';font-size:.72rem;letter-spacing:.15em;font-weight:900;text-transform:uppercase}.hero h1{font-size:clamp(3rem,9vw,7rem);line-height:.92;max-width:900px;margin:16px 0 24px}.hero p,.about p,.cta p,.grid p{color:'+p[3]+';line-height:1.7}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:24px 0 90px}.grid article,.about,.cta{background:'+p[1]+';border-radius:24px;padding:28px}.about,.cta{margin-bottom:22px}.button{display:inline-block;margin-top:14px;background:'+p[4]+';color:'+p[0]+';padding:13px 18px;border-radius:12px;text-decoration:none;font-weight:900}.footer{padding:38px 0 60px;color:'+p[3]+'}@media(max-width:760px){.hero{padding:70px 0 45px}.grid{grid-template-columns:1fr;padding-bottom:55px}}</style></head><body><div class="wrap"><nav class="nav"><div class="brand">'+esc(s.brand)+'</div><span>'+ROOT_DOMAIN+'/sites/'+esc(s.slug)+'</span></nav><main><section class="hero"><span class="eyebrow">'+esc(s.category)+'</span><h1>'+esc(s.heroTitle)+'</h1><p>'+esc(s.heroCopy)+'</p></section><section class="about"><h2>'+esc(s.aboutTitle)+'</h2><p>'+esc(s.aboutCopy)+'</p></section><section class="grid">'+cards+'</section><section class="cta"><h2>'+esc(s.ctaTitle)+'</h2><p>'+esc(s.ctaCopy)+'</p>'+cta+'</section></main><footer class="footer">'+esc(s.footer)+'</footer></div></body></html>'
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
    <nav><strong>{s.brand}</strong><span>{ROOT_DOMAIN}/sites/{s.slug||'yourname'}</span></nav>
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
  const [generation,setGeneration]=useState(0)
  const analysis=useMemo(function(){return analyzePrompt(prompt)},[prompt])
  const update=function(key,value){setSite(function(current){return {...current,[key]:value}})}
  const updateCard=function(index,key,value){setSite(function(current){return {...current,cards:current.cards.map(function(card,i){return i===index?{...card,[key]:value}:card})}})}
  useEffect(function(){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(safeSite(site)))}catch{}},[site])
  const generate=function(){
    if(!prompt.trim()){setMessage('Tell the builder what kind of website you want first.');return}
    const next=generation+1
    setGeneration(next)
    setSite(generateSite(prompt,site.brand,site.slug,next))
    setMessage('Smart Prompt Engine generated a '+analysis.label+' site. Everything below is editable.')
  }
  const regenerate=function(section){
    if(!prompt.trim()){setMessage('Keep a prompt in the box so the generator knows what to rebuild.');return}
    const next=generation+1
    setGeneration(next)
    setSite(function(current){return regenerateSection(current,prompt,section,next)})
    setMessage('Regenerated '+section+' from your current prompt.')
  }
  const publish=function(){
    const s=safeSite(site)
    if(!s.slug){setMessage('Enter the ESN subdomain you claimed first.');return}
    if(!s.brand||!s.heroTitle){setMessage('Add a site name and headline first.');return}
    if(BLOCKED_TEXT.test(JSON.stringify(s))){setMessage('Remove credential/payment-login wording before publishing. ESN free sites cannot collect sensitive information.');return}
    window.open(publishUrl(s),'_blank','noopener,noreferrer')
  }
  return <>
    <section className="page-hero builder-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">ESN WEBSITE BUILDER // SMART GENERATOR V2</span><h1>Describe the idea. Build the actual topic.</h1><p>The upgraded generator now detects specific topics, tone, goals, links, and keywords before it writes the page. Generate the full site, regenerate individual sections, edit everything, preview phone or desktop, then publish to your ESN /sites address.</p></div><div className="page-hero-mark"><span>V2</span><small>SMART PROMPT ENGINE</small></div></div></section>
    <section className="section"><div className="shell builder-layout">
      <div className="builder-controls">
        <div className="builder-panel"><span className="eyebrow">01 // YOUR SITE</span>
          <label>ESN SITE NAME<div className="builder-domain"><span>/sites/</span><input value={site.slug} onChange={function(e){update('slug',cleanSlug(e.target.value))}} placeholder="yourname"/></div></label>
          <small className="builder-public-url">Public link: https://{ROOT_DOMAIN}/sites/{site.slug||'yourname'}</small>
          <label>SITE / BRAND NAME<input value={site.brand} onChange={function(e){update('brand',e.target.value.slice(0,60))}} placeholder="My Brand"/></label>
          <label>DESCRIBE THE WEBSITE<textarea value={prompt} onChange={function(e){setPrompt(e.target.value.slice(0,900))}} placeholder="Make a dark Fortnite fan site explaining why more people should play Fortnite, with reasons to try it and a button to the official Fortnite website."/></label>
          <div className="builder-quick-prompts">{QUICK_PROMPTS.map(function(example,index){return <button type="button" key={index} onClick={function(){setPrompt(example)}}>{index+1}</button>})}<span>EXAMPLE PROMPTS</span></div>
          <div className="builder-ai-readout">
            <div><span>TOPIC</span><strong>{analysis.label}</strong></div>
            <div><span>TONE</span><strong>{analysis.tone}</strong></div>
            <div><span>THEME</span><strong>{analysis.theme}</strong></div>
            <div><span>GOALS</span><strong>{analysis.goals.length?analysis.goals.join(' + '):'general'}</strong></div>
            <p>{analysis.keywords.length?'Detected: '+analysis.keywords.join(' • '):'Add more detail to your prompt for stronger topic matching.'}</p>
          </div>
          <button className="builder-generate" type="button" onClick={generate}>GENERATE SMARTER WEBSITE</button>
          {message&&<div className="builder-message">{message}</div>}
        </div>
        <div className="builder-panel"><div className="builder-panel-head"><span className="eyebrow">02 // STYLE + HERO</span><button type="button" onClick={function(){regenerate('hero')}}>REGENERATE HERO</button></div><div className="builder-themes">{THEMES.map(function(theme){return <button type="button" className={site.theme===theme?'active':''} onClick={function(){update('theme',theme)}} key={theme}>{theme.toUpperCase()}</button>})}</div><label>HERO HEADLINE<input value={site.heroTitle} onChange={function(e){update('heroTitle',e.target.value)}}/></label><label>HERO TEXT<textarea value={site.heroCopy} onChange={function(e){update('heroCopy',e.target.value)}}/></label><div className="builder-panel-head"><span className="eyebrow">ABOUT SECTION</span><button type="button" onClick={function(){regenerate('about')}}>REGENERATE ABOUT</button></div><label>ABOUT TITLE<input value={site.aboutTitle} onChange={function(e){update('aboutTitle',e.target.value)}}/></label><label>ABOUT TEXT<textarea value={site.aboutCopy} onChange={function(e){update('aboutCopy',e.target.value)}}/></label></div>
        <div className="builder-panel"><div className="builder-panel-head"><span className="eyebrow">03 // CONTENT CARDS</span><button type="button" onClick={function(){regenerate('cards')}}>REGENERATE CARDS</button></div>{site.cards.map(function(card,index){return <div className="builder-card-editor" key={index}><input value={card.title} onChange={function(e){updateCard(index,'title',e.target.value)}}/><textarea value={card.copy} onChange={function(e){updateCard(index,'copy',e.target.value)}}/></div>})}</div>
        <div className="builder-panel"><div className="builder-panel-head"><span className="eyebrow">04 // FINAL CTA</span><button type="button" onClick={function(){regenerate('cta')}}>REGENERATE CTA</button></div><label>CTA TITLE<input value={site.ctaTitle} onChange={function(e){update('ctaTitle',e.target.value)}}/></label><label>CTA TEXT<textarea value={site.ctaCopy} onChange={function(e){update('ctaCopy',e.target.value)}}/></label><label>BUTTON TEXT<input value={site.ctaLabel} onChange={function(e){update('ctaLabel',e.target.value)}}/></label><label>BUTTON LINK<input value={site.ctaUrl} onChange={function(e){update('ctaUrl',e.target.value)}} placeholder="https://..."/></label><div className="builder-action-grid"><button type="button" onClick={function(){downloadHtml(site)}}>DOWNLOAD HTML</button><button className="primary" type="button" onClick={publish}>PUBLISH BUILD</button></div><small>The generator creates structured, script-free pages. Publishing verifies the GitHub account owns the claimed ESN site name before updating the public /sites page.</small></div>
      </div>
      <div className="builder-preview-column"><div className="builder-preview-toolbar"><div><span>LIVE PREVIEW</span><strong>{ROOT_DOMAIN}/sites/{site.slug||'yourname'}</strong></div><div><button className={device==='desktop'?'active':''} onClick={function(){setDevice('desktop')}}>DESKTOP</button><button className={device==='mobile'?'active':''} onClick={function(){setDevice('mobile')}}>PHONE</button></div></div><div className={'builder-preview-frame '+device}><SitePreview site={site}/></div><div className="builder-publish-note"><strong>PUBLIC SITE</strong><span>For now, published ESN Builder websites use https://{ROOT_DOMAIN}/sites/yourname as their public address. Direct yourname.{ROOT_DOMAIN} hosting is not being advertised as the public builder URL yet.</span></div></div>
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
