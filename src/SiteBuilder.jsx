import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import './siteBuilder.css'

const ROOT_DOMAIN='esnoffical.com'
const ISSUE_BASE='https://github.com/sheldonrocks2022-cmyk/ESN-Website/issues/new'
const DRAFT_KEY='esn_site_builder_draft_v1'
const THEMES=['midnight','neon','clean','ember','ocean','void','aurora','forest','rose','gold']
const EXPERIENCE_PACKS=['essential','showcase','network','full']
const LAYOUTS=['spotlight','split','editorial','flagship']
const BLOCKED_TEXT=/password|passcode|seed phrase|wallet recovery|credit card|social security|bank login|verify your account|sign in to continue/i
const tick=String.fromCharCode(96)

const STARTER={
  slug:'',brand:'My Website',category:'creator',theme:'midnight',layout:'spotlight',audience:'Visitors',
  seoTitle:'My Website',seoDescription:'A website built with the ESN Website Builder.',
  heroTitle:'Build something worth visiting.',
  heroCopy:'A clean, fast website built with the ESN Website Builder.',
  aboutTitle:'About',
  aboutCopy:'Tell visitors who you are, what you do, and why they should care.',
  cards:[
    {title:'What I do',copy:'Describe your main service, project, community, or offer.'},
    {title:'Why choose me',copy:'Explain what makes your work, brand, or community different.'},
    {title:'Get started',copy:'Give visitors one clear next step.'},
  ],
  stats:[
    {value:'01',label:'Clear purpose'},
    {value:'02',label:'Useful sections'},
    {value:'03',label:'One next step'},
  ],
  faq:[
    {q:'What is this site about?',a:'Use this answer to explain the main idea in one or two sentences.'},
    {q:'Who is it for?',a:'Describe the people who will get the most value from this site.'},
    {q:'What should I do next?',a:'Tell visitors the single most useful next action.'},
  ],
  pack:'full',
  sections:{announcement:true,status:true,timeline:true,testimonials:true,gallery:true,socials:true},
  announcement:{label:'NEW',title:'Something is happening.',copy:'Use this strip for a launch, update, event, announcement, or important message.'},
  status:[
    {label:'Main experience',value:'ONLINE',state:'live'},
    {label:'Community',value:'ACTIVE',state:'live'},
    {label:'Latest update',value:'READY',state:'ready'},
  ],
  timeline:[
    {kicker:'01',title:'The beginning',copy:'Introduce where the project, brand, community, or idea started.'},
    {kicker:'02',title:'The build',copy:'Show how the idea grew, changed, or became something more complete.'},
    {kicker:'03',title:'Right now',copy:'Tell visitors what is happening now and what they should pay attention to.'},
    {kicker:'04',title:'What is next',copy:'Give people a reason to come back for the next update, release, or milestone.'},
  ],
  testimonials:[
    {quote:'A strong website should make the idea clear fast.',name:'Featured voice',role:'Community'},
    {quote:'Good design should guide people instead of making them search.',name:'Featured voice',role:'Visitor'},
    {quote:'The best next step should always be obvious.',name:'Featured voice',role:'Supporter'},
  ],
  gallery:[
    {title:'Feature one',copy:'Use this visual tile to showcase a project, mode, service, release, product, or highlight.'},
    {title:'Feature two',copy:'Give another important part of the site its own premium visual moment.'},
    {title:'Feature three',copy:'Show something visitors should remember after leaving the page.'},
    {title:'Feature four',copy:'Use the final tile for what comes next or the strongest supporting feature.'},
  ],
  socials:[
    {label:'Discord',url:''},
    {label:'YouTube',url:''},
    {label:'Main link',url:''},
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
function inferAudience(prompt,category){
  const value=String(prompt||'').toLowerCase()
  if(/customer|client|buyer|business owner/.test(value))return 'Potential customers'
  if(/player|players|gamer|gaming|fortnite|minecraft/.test(value))return 'Players'
  if(/fan|fans|listener|music/.test(value))return 'Fans'
  if(/member|community|discord|club/.test(value))return 'Community members'
  if(/employer|recruiter|portfolio|resume/.test(value))return 'Clients & recruiters'
  if(category==='restaurant')return 'Local customers'
  if(category==='technology')return 'Product users'
  return 'Visitors'
}
function promptScore(prompt){
  const value=String(prompt||'').trim()
  if(!value)return 0
  let score=Math.min(35,Math.floor(value.length/8))
  if(promptKeywords(value).length>=3)score+=20
  if(promptGoals(value).length)score+=15
  if(inferTone(value,classify(value)))score+=10
  if(extractUrl(value))score+=10
  if(/for\s+[a-z]|audience|people|players|customers|fans|community/i.test(value))score+=10
  return Math.min(100,score)
}
function inferLayout(category,variant,prompt){
  const value=String(prompt||'').toLowerCase()
  if(/esn style|like esn|flagship|cinematic|ultra premium|futuristic|network style/.test(value))return 'flagship'
  if(Number(variant)===3)return 'flagship'
  const layouts=category==='portfolio'||category==='business'?['split','editorial','spotlight']:category==='event'||category==='music'?['spotlight','split','editorial']:['spotlight','editorial','split']
  return layouts[Math.abs(Number(variant)||0)%layouts.length]
}
function analyzePrompt(prompt){
  const category=classify(prompt)
  const profile=PRESETS[category]||PRESETS.creator
  return {
    category,
    label:profile.label,
    theme:inferTheme(prompt,category),
    tone:inferTone(prompt,category),
    audience:inferAudience(prompt,category),
    keywords:promptKeywords(prompt),
    goals:promptGoals(prompt),
    score:promptScore(prompt),
    url:extractUrl(prompt),
  }
}
function contextualize(copy,analysis,name){
  const keywords=analysis.keywords.slice(0,3)
  if(!keywords.length)return copy
  const topic=keywords.join(', ')
  return clamp(copy+' Focus: '+topic+'.',320)
}
function generatedStats(analysis){
  const key=analysis.keywords
  if(analysis.category==='fortnite')return [{value:'FREE',label:'Free to start'},{value:'MULTI',label:'Multiple game modes'},{value:'CROSS',label:'Cross-platform play'}]
  if(analysis.category==='minecraft')return [{value:'BUILD',label:'Create your world'},{value:'PLAY',label:'Explore & progress'},{value:'JOIN',label:'Grow the community'}]
  if(analysis.category==='business')return [{value:'01',label:'Clear offer'},{value:'02',label:'Trust-first copy'},{value:'03',label:'Easy contact'}]
  return [{value:'01',label:key[0]||'Main idea'},{value:'02',label:key[1]||'Key value'},{value:'03',label:key[2]||'Next step'}]
}
function generatedFaq(analysis,name){
  const topic=analysis.keywords[0]||analysis.label
  if(analysis.category==='fortnite')return [
    {q:'What makes Fortnite worth trying?',a:'Fortnite combines Battle Royale, Zero Build, Creative experiences, live updates, collaborations, and several different ways to play.'},
    {q:'Do I have to build?',a:'No. Zero Build and other modes give players ways to enjoy Fortnite without traditional building combat.'},
    {q:'Who is this site for?',a:'This '+name+' page is for players, returning players, and anyone curious about what Fortnite offers now.'},
  ]
  if(analysis.category==='minecraft')return [
    {q:'What kind of Minecraft experience is this?',a:'Use the main sections above to explain the world, server, SMP, realm, or project and what makes it different.'},
    {q:'Who can join?',a:'Explain the intended players, edition, rules, and any requirements before someone joins.'},
    {q:'Where do I start?',a:'Use the main button on this page for the next connection, community, or information step.'},
  ]
  return [
    {q:'What is '+name+'?',a:'This page is focused on '+topic+' and gives visitors the important information without making them search for it.'},
    {q:'Who is this for?',a:'The site is written for '+analysis.audience.toLowerCase()+' and is organized around the actions most useful to them.'},
    {q:'What should I do next?',a:'Use the main call-to-action on the page to continue, connect, learn more, or take the next step.'},
  ]
}
function generatedExperience(analysis,name){
  const topic=analysis.keywords[0]||analysis.label
  const secondary=analysis.keywords[1]||'community'
  const third=analysis.keywords[2]||'updates'
  const announcement={
    label:analysis.category==='event'?'EVENT':analysis.category==='business'?'OPEN':'NOW',
    title:analysis.category==='fortnite'?'A new way to look at Fortnite.':analysis.category==='minecraft'?'The world is ready for players.':analysis.category==='music'?'The latest sound starts here.':name+' is live.',
    copy:'A focused update around '+topic+', '+secondary+', and '+third+'.'
  }
  const status=[
    {label:analysis.category==='minecraft'?'World':'Main experience',value:'ONLINE',state:'live'},
    {label:analysis.category==='business'?'Availability':'Community',value:'ACTIVE',state:'live'},
    {label:'Latest update',value:'READY',state:'ready'},
  ]
  const timeline=[
    {kicker:'01',title:'The idea',copy:'Start with '+topic+' and explain what made '+name+' worth building.'},
    {kicker:'02',title:'The build',copy:'Show how '+secondary+' became part of the experience and helped shape the project.'},
    {kicker:'03',title:'Right now',copy:'Focus on '+third+' and what visitors should know or explore today.'},
    {kicker:'04',title:'Next',copy:'Keep the story moving with the next release, milestone, event, feature, or community goal.'},
  ]
  const testimonials=[
    {quote:'The purpose is clear immediately, and the next step is easy to find.',name:'Featured voice',role:analysis.audience},
    {quote:'The experience feels organized instead of looking like a pile of random sections.',name:'Featured voice',role:'Community'},
    {quote:'The strongest parts of the project actually get room to stand out.',name:'Featured voice',role:'Visitor'},
  ]
  const gallery=[
    {title:analysis.keywords[0]||'Main experience',copy:'A visual feature tile built around the first major topic in the prompt.'},
    {title:analysis.keywords[1]||'Latest highlight',copy:'A premium showcase block for another important part of '+name+'.'},
    {title:analysis.keywords[2]||'Community',copy:'Use this space for the people, content, service, mode, product, or feature behind the site.'},
    {title:analysis.keywords[3]||'What comes next',copy:'A final showcase tile for the next release, milestone, event, or reason to return.'},
  ]
  return {
    announcement,status,timeline,testimonials,gallery,
    socials:[
      {label:'Discord',url:''},
      {label:analysis.category==='music'?'Spotify':'YouTube',url:''},
      {label:'Main link',url:analysis.url||''},
    ],
    pack:'full',
    sections:{announcement:true,status:true,timeline:true,testimonials:true,gallery:true,socials:true},
  }
}
function applyExperiencePack(site,pack){
  const next=EXPERIENCE_PACKS.includes(pack)?pack:'full'
  const flags={
    essential:{announcement:false,status:false,timeline:false,testimonials:false,gallery:false,socials:true},
    showcase:{announcement:true,status:false,timeline:false,testimonials:true,gallery:true,socials:true},
    network:{announcement:true,status:true,timeline:true,testimonials:false,gallery:false,socials:true},
    full:{announcement:true,status:true,timeline:true,testimonials:true,gallery:true,socials:true},
  }[next]
  return {...site,pack:next,sections:flags}
}
function generateSite(prompt,brand,slug,variant){
  const analysis=analyzePrompt(prompt)
  const preset=PRESETS[analysis.category]||PRESETS.creator
  const name=clamp(brand,60)||'My Website'
  const pick=Math.abs(Number(variant)||0)%preset.heroes.length
  const ctaPick=Math.abs(Number(variant)||0)%preset.ctas.length
  const cta=preset.ctas[ctaPick]
  const promptUrl=analysis.url
  const heroCopy=contextualize(preset.copies[pick%preset.copies.length],analysis,name)
  return {
    ...STARTER,
    slug:cleanSlug(slug),
    brand:name,
    category:analysis.category,
    theme:analysis.theme,
    layout:inferLayout(analysis.category,variant,prompt),
    audience:analysis.audience,
    seoTitle:clamp(name+' | '+preset.label,70),
    seoDescription:clamp(heroCopy,160),
    heroTitle:preset.heroes[pick],
    heroCopy,
    aboutTitle:'About '+name,
    aboutCopy:contextualize(preset.about,analysis,name),
    cards:preset.cards.map(function(card,index){
      const keyword=analysis.keywords[index]
      return {title:card[0],copy:keyword?clamp(card[1]+' This section can emphasize '+keyword+'.',260):card[1]}
    }),
    stats:generatedStats(analysis),
    faq:generatedFaq(analysis,name),
    ...generatedExperience(analysis,name),
    ctaTitle:cta[0],
    ctaCopy:cta[1],
    ctaLabel:cta[2],
    ctaUrl:promptUrl||STARTER.ctaUrl,
    footer:name+' • Built with ESN Website Builder',
  }
}
function regenerateSection(site,prompt,section,variant){
  const next=generateSite(prompt,site.brand,site.slug,variant)
  if(section==='hero')return {...site,category:next.category,theme:next.theme,layout:next.layout,heroTitle:next.heroTitle,heroCopy:next.heroCopy}
  if(section==='about')return {...site,category:next.category,audience:next.audience,aboutTitle:next.aboutTitle,aboutCopy:next.aboutCopy}
  if(section==='cards')return {...site,category:next.category,cards:next.cards}
  if(section==='stats')return {...site,stats:next.stats}
  if(section==='faq')return {...site,faq:next.faq}
  if(section==='seo')return {...site,seoTitle:next.seoTitle,seoDescription:next.seoDescription}
  if(section==='experience')return {...site,announcement:next.announcement,status:next.status,timeline:next.timeline,testimonials:next.testimonials,gallery:next.gallery,socials:next.socials}
  if(section==='cta')return {...site,category:next.category,ctaTitle:next.ctaTitle,ctaCopy:next.ctaCopy,ctaLabel:next.ctaLabel,ctaUrl:next.ctaUrl}
  return next
}
function safeSite(site){
  const sections={...STARTER.sections,...(site.sections||{})}
  return {
    version:3,
    slug:cleanSlug(site.slug),
    brand:clamp(site.brand,60),
    category:clamp(site.category,24),
    theme:THEMES.includes(site.theme)?site.theme:'midnight',
    layout:LAYOUTS.includes(site.layout)?site.layout:'spotlight',
    audience:clamp(site.audience,60),
    seoTitle:clamp(site.seoTitle||site.brand,70),
    seoDescription:clamp(site.seoDescription||site.heroCopy,160),
    heroTitle:clamp(site.heroTitle,100),
    heroCopy:clamp(site.heroCopy,320),
    aboutTitle:clamp(site.aboutTitle,100),
    aboutCopy:clamp(site.aboutCopy,500),
    cards:(site.cards||[]).slice(0,3).map(function(card){return {title:clamp(card.title,70),copy:clamp(card.copy,260)}}),
    stats:(site.stats||STARTER.stats).slice(0,3).map(function(item){return {value:clamp(item.value,20),label:clamp(item.label,70)}}),
    faq:(site.faq||STARTER.faq).slice(0,3).map(function(item){return {q:clamp(item.q,120),a:clamp(item.a,360)}}),
    pack:EXPERIENCE_PACKS.includes(site.pack)?site.pack:'full',
    sections:{
      announcement:sections.announcement!==false,
      status:sections.status!==false,
      timeline:sections.timeline!==false,
      testimonials:sections.testimonials!==false,
      gallery:sections.gallery!==false,
      socials:sections.socials!==false,
    },
    announcement:{
      label:clamp(site.announcement?.label||STARTER.announcement.label,24),
      title:clamp(site.announcement?.title||STARTER.announcement.title,100),
      copy:clamp(site.announcement?.copy||STARTER.announcement.copy,240),
    },
    status:(site.status||STARTER.status).slice(0,3).map(function(item){return {label:clamp(item.label,60),value:clamp(item.value,30),state:['live','ready','offline'].includes(item.state)?item.state:'ready'}}),
    timeline:(site.timeline||STARTER.timeline).slice(0,4).map(function(item){return {kicker:clamp(item.kicker,20),title:clamp(item.title,80),copy:clamp(item.copy,260)}}),
    testimonials:(site.testimonials||STARTER.testimonials).slice(0,3).map(function(item){return {quote:clamp(item.quote,280),name:clamp(item.name,60),role:clamp(item.role,60)}}),
    gallery:(site.gallery||STARTER.gallery).slice(0,4).map(function(item){return {title:clamp(item.title,80),copy:clamp(item.copy,220)}}),
    socials:(site.socials||STARTER.socials).slice(0,3).map(function(item){return {label:clamp(item.label,40),url:safeUrl(item.url)}}),
    ctaTitle:clamp(site.ctaTitle,100),
    ctaCopy:clamp(site.ctaCopy,260),
    ctaLabel:clamp(site.ctaLabel,50),
    ctaUrl:safeUrl(site.ctaUrl),
    footer:clamp(site.footer,100),
  }
}
function siteQuality(site,prompt){
  const s=safeSite(site)
  let score=0
  if(s.brand&&s.brand!=='My Website')score+=10
  if(s.slug)score+=10
  if(s.heroTitle.length>=18)score+=10
  if(s.heroCopy.length>=80)score+=10
  if(s.aboutCopy.length>=100)score+=10
  if(s.cards.every(function(card){return card.title&&card.copy.length>=50}))score+=10
  if(s.stats.length===3&&s.stats.every(function(item){return item.value&&item.label}))score+=10
  if(s.faq.length===3&&s.faq.every(function(item){return item.q&&item.a.length>=40}))score+=10
  if(s.seoTitle.length>=20&&s.seoDescription.length>=80)score+=10
  if(promptScore(prompt)>=70)score+=10
  return Math.min(100,score)
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
  const cards=s.cards.map(function(card,index){return '<article><span>0'+(index+1)+'</span><h3>'+esc(card.title)+'</h3><p>'+esc(card.copy)+'</p></article>'}).join('')
  const stats=s.stats.map(function(item){return '<article><strong>'+esc(item.value)+'</strong><span>'+esc(item.label)+'</span></article>'}).join('')
  const faq=s.faq.map(function(item,index){return '<details'+(index===0?' open':'')+'><summary>'+esc(item.q)+'</summary><p>'+esc(item.a)+'</p></details>'}).join('')
  const cta=s.ctaUrl?'<a class="button" href="'+esc(s.ctaUrl)+'" target="_blank" rel="noreferrer">'+esc(s.ctaLabel)+'</a>':''
  if(s.layout==='flagship'){
    const route=s.cards.map(function(card,index){return '<a href="#panel-'+index+'"><span>0'+(index+1)+'</span><b>'+esc(card.title)+'</b><small>'+esc(card.copy)+'</small><em>↗</em></a>'}).join('')+'<a href="#final"><span>04</span><b>'+esc(s.ctaLabel)+'</b><small>'+esc(s.ctaTitle)+'</small><em>↗</em></a>'
    const story=s.cards.map(function(card,index){return '<article id="panel-'+index+'"><span class="idx">0'+(index+1)+'</span><div><span class="eyebrow">'+esc(s.category)+'</span><h3>'+esc(card.title)+'</h3><p>'+esc(card.copy)+'</p></div><strong>'+esc(card.title.split(' ')[0].toUpperCase())+'</strong></article>'}).join('')
    const bento=s.cards.map(function(card,index){return '<article class="bento b'+(index+1)+'"><div><span>0'+(index+1)+'</span><i>AVAILABLE</i></div><h3>'+esc(card.title)+'</h3><p>'+esc(card.copy)+'</p><strong>'+esc(s.stats[index]?.value||'+')+'</strong></article>'}).join('')
    const features=s.stats.map(function(item,index){return '<article><span>0'+(index+1)+'</span><strong>'+esc(item.value)+'</strong><small>'+esc(item.label)+'</small><em>↗</em></article>'}).join('')+'<article><span>04</span><strong>'+esc(s.category)+'</strong><small>Built for '+esc(s.audience)+'</small><em>↗</em></article>'
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(s.seoTitle)+'</title><meta name="description" content="'+esc(s.seoDescription)+'"><style>*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:'+p[0]+';color:'+p[2]+';font-family:Inter,system-ui,-apple-system,sans-serif;overflow-x:hidden}.shell{width:min(1180px,calc(100% - 36px));margin:auto}.eyebrow{font-size:.58rem;letter-spacing:.17em;text-transform:uppercase;font-weight:950;color:'+p[4]+'}.nav{position:sticky;top:10px;z-index:10;margin-top:14px;min-height:66px;padding:0 18px;border:1px solid color-mix(in srgb,'+p[4]+' 18%,transparent);border-radius:20px;background:color-mix(in srgb,'+p[1]+' 82%,transparent);backdrop-filter:blur(24px);display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:20px}.nav strong{font-size:.82rem}.nav-links{display:flex;gap:16px}.nav a{color:'+p[3]+';text-decoration:none;font-size:.72rem}.live{font-size:.52rem;color:'+p[4]+';font-weight:950}.hero{min-height:760px;display:grid;grid-template-columns:1.08fr .92fr;gap:46px;align-items:center;padding:66px 0 42px}.hero h1{font-size:clamp(4rem,8vw,8rem);line-height:.84;letter-spacing:-.07em;margin:14px 0 24px}.hero p,.story p,.bento p,.feature p,.faq p,.final p{color:'+p[3]+';line-height:1.72}.hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin:24px 0}.button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 16px;border-radius:12px;text-decoration:none;background:'+p[4]+';color:'+p[0]+';font-weight:950}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;border:1px solid color-mix(in srgb,'+p[4]+' 13%,transparent);border-radius:18px;overflow:hidden;background:color-mix(in srgb,'+p[4]+' 8%,transparent);margin-top:34px}.metrics div{padding:16px;background:'+p[1]+'}.metrics span{font-size:.5rem;color:'+p[4]+'}.metrics strong{display:block}.metrics small{color:'+p[3]+'}.core{min-height:560px;border:1px solid color-mix(in srgb,'+p[4]+' 18%,transparent);border-radius:30px;background:linear-gradient(180deg,'+p[1]+','+p[0]+');display:grid;grid-template-rows:auto 1fr auto;overflow:hidden}.core-top,.core-foot{padding:14px;font-size:.54rem;color:'+p[3]+';letter-spacing:.12em}.reactor{position:relative;display:grid;place-items:center}.ring,.core-center{position:absolute;border-radius:50%}.ring{border:1px solid color-mix(in srgb,'+p[4]+' 30%,transparent);animation:spin 18s linear infinite}.ring:before,.ring:after{content:"";position:absolute;width:8px;height:8px;border-radius:50%;background:'+p[4]+';box-shadow:0 0 18px '+p[4]+'}.r1{width:76%;aspect-ratio:1}.r2{width:55%;aspect-ratio:1;animation-direction:reverse;animation-duration:12s}.r3{width:36%;aspect-ratio:1;animation-duration:8s}.core-center{width:145px;height:145px;display:grid;place-items:center;align-content:center;background:radial-gradient(circle,color-mix(in srgb,'+p[4]+' 36%,#fff),'+p[1]+' 44%,'+p[0]+' 78%);border:1px solid color-mix(in srgb,'+p[4]+' 40%,transparent);box-shadow:0 0 62px color-mix(in srgb,'+p[4]+' 22%,transparent)}.core-center strong{font-size:2.7rem}.core-center small{font-size:.52rem;color:'+p[3]+'}@keyframes spin{to{transform:rotate(360deg)}}.routes{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid color-mix(in srgb,'+p[4]+' 13%,transparent);border-radius:22px;overflow:hidden;margin-bottom:90px}.routes a{padding:20px;border-right:1px solid color-mix(in srgb,'+p[4]+' 11%,transparent);display:grid;grid-template-columns:auto 1fr auto;gap:5px 10px;text-decoration:none}.routes span{color:'+p[4]+';font-size:.55rem}.routes b{color:'+p[2]+';font-size:.8rem}.routes small{grid-column:2;color:'+p[3]+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.routes em{grid-column:3;grid-row:1/3;color:'+p[4]+';font-style:normal}.story{display:grid;grid-template-columns:.72fr 1.28fr;gap:54px;margin-bottom:110px}.story-aside{position:sticky;top:100px;align-self:start}.story-aside h2,.section-head h2,.faq h2{font-size:clamp(2.8rem,5.5vw,5.2rem);line-height:.92;letter-spacing:-.055em;margin:12px 0 17px}.stack{display:grid;gap:12px}.stack article{min-height:300px;padding:28px;border:1px solid color-mix(in srgb,'+p[4]+' 14%,transparent);border-radius:26px;background:linear-gradient(145deg,'+p[1]+','+p[0]+');position:relative;overflow:hidden;display:grid;grid-template-columns:auto 1fr;gap:20px}.idx{color:'+p[4]+';font-size:.6rem}.stack h3{font-size:2rem;margin:10px 0}.stack article>strong{position:absolute;right:-2%;bottom:-12%;font-size:6rem;opacity:.035}.section{margin-bottom:110px}.section-head{display:flex;justify-content:space-between;gap:30px;align-items:end;margin-bottom:30px}.bento-grid{display:grid;grid-template-columns:1.25fr .75fr;grid-template-rows:repeat(2,minmax(250px,auto));gap:14px}.bento{padding:28px;border:1px solid color-mix(in srgb,'+p[4]+' 14%,transparent);border-radius:27px;background:linear-gradient(150deg,'+p[1]+','+p[0]+');position:relative;overflow:hidden}.b1{grid-row:1/3;min-height:560px}.bento>div{display:flex;justify-content:space-between}.bento i{font-style:normal;color:'+p[4]+';font-size:.48rem}.bento h3{font-size:clamp(2rem,4vw,4.1rem);line-height:.96;letter-spacing:-.05em;margin:40px 0 18px}.bento>strong{position:absolute;right:20px;bottom:12px;font-size:4rem;opacity:.06}.about-card{grid-column:1/-1;min-height:260px}.feature{margin-bottom:110px;padding:40px;border:1px solid color-mix(in srgb,'+p[4]+' 14%,transparent);border-radius:30px;background:radial-gradient(circle at 10% 110%,color-mix(in srgb,'+p[4]+' 13%,transparent),transparent 30rem),linear-gradient(145deg,'+p[1]+','+p[0]+');display:grid;grid-template-columns:1fr 1fr;gap:30px}.feature h2{font-size:clamp(2.8rem,5vw,5rem);line-height:.92;letter-spacing:-.06em}.feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;border-radius:22px;overflow:hidden}.feature-grid article{min-height:150px;padding:18px;background:'+p[1]+';display:grid;grid-template-columns:auto 1fr auto;gap:8px}.feature-grid span{color:'+p[4]+'}.feature-grid strong{grid-column:1/-1;align-self:end}.feature-grid small{color:'+p[3]+'}.process{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;border:1px solid color-mix(in srgb,'+p[4]+' 12%,transparent);border-radius:25px;overflow:hidden;margin-bottom:110px}.process div{min-height:260px;padding:28px;background:'+p[1]+';display:flex;flex-direction:column}.process span{color:'+p[4]+'}.process strong{font-size:1.9rem;margin:auto 0 10px}.faq{display:grid;grid-template-columns:.68fr 1.32fr;gap:60px;margin-bottom:110px}.faq details{border-top:1px solid color-mix(in srgb,'+p[4]+' 14%,transparent);padding:20px 0}.faq summary{font-weight:850;cursor:pointer}.final{min-height:620px;padding:55px;margin-bottom:50px;border:1px solid color-mix(in srgb,'+p[4]+' 16%,transparent);border-radius:36px;background:radial-gradient(circle at 50% 110%,color-mix(in srgb,'+p[4]+' 18%,transparent),transparent 34rem),linear-gradient(145deg,'+p[1]+','+p[0]+');display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;position:relative;overflow:hidden}.final h2{font-size:clamp(4rem,8vw,8rem);line-height:.84;letter-spacing:-.075em;margin:14px 0 20px}.footer{display:flex;justify-content:space-between;gap:18px;padding:24px 0 50px;color:'+p[3]+';font-size:.8rem}@media(max-width:860px){.hero,.story,.feature,.faq{grid-template-columns:1fr}.story-aside{position:static}.bento-grid{grid-template-columns:1fr}.b1,.about-card{grid-column:auto;grid-row:auto;min-height:300px}.routes{grid-template-columns:1fr 1fr}.process{grid-template-columns:1fr}}@media(max-width:600px){.nav{grid-template-columns:1fr auto}.nav-links{display:none}.hero{min-height:auto;padding:50px 0 30px}.metrics{grid-template-columns:1fr}.core{min-height:430px}.reactor{min-height:330px}.feature{padding:24px}.feature-grid{grid-template-columns:1fr}.final{min-height:520px;padding:30px}.footer{flex-direction:column}}@media(prefers-reduced-motion:reduce){.ring{animation:none}}</style></head><body><div class="shell"><nav class="nav"><strong>'+esc(s.brand)+'</strong><div class="nav-links"><a href="#story">Story</a><a href="#highlights">Highlights</a><a href="#faq">FAQ</a></div><span class="live">LIVE</span></nav><main><section class="hero"><div><span class="eyebrow">'+esc(s.category)+' // for '+esc(s.audience)+'</span><h1>'+esc(s.heroTitle)+'</h1><p>'+esc(s.heroCopy)+'</p><div class="hero-actions">'+cta+'</div><div class="metrics">'+stats+'</div></div><aside class="core"><div class="core-top">'+esc(s.brand.toUpperCase())+' CORE • ACTIVE</div><div class="reactor"><div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div><div class="core-center"><strong>'+esc(s.brand.slice(0,2).toUpperCase())+'</strong><small>'+esc(s.category)+'</small></div></div><div class="core-foot">PREMIUM SITE ENGINE • STRUCTURED • RESPONSIVE</div></aside></section><div class="routes">'+route+'</div><section id="story" class="story"><aside class="story-aside"><span class="eyebrow">THE EXPERIENCE</span><h2>'+esc(s.aboutTitle)+'</h2><p>'+esc(s.aboutCopy)+'</p></aside><div class="stack">'+story+'</div></section><section id="highlights" class="section"><div class="section-head"><div><span class="eyebrow">WHAT MATTERS</span><h2>Built around the important parts.</h2></div></div><div class="bento-grid">'+bento+'<article class="bento about-card"><span class="eyebrow">ABOUT '+esc(s.brand.toUpperCase())+'</span><h3>'+esc(s.aboutTitle)+'</h3><p>'+esc(s.aboutCopy)+'</p></article></div></section><section class="feature"><div><span class="eyebrow">FOCUSED EXPERIENCE</span><h2>'+esc(s.ctaTitle)+'</h2><p>'+esc(s.ctaCopy)+'</p>'+cta+'</div><div class="feature-grid">'+features+'</div></section><section class="process"><div><span>01</span><strong>Discover</strong><p>'+esc(s.heroCopy)+'</p></div><div><span>02</span><strong>Explore</strong><p>'+esc(s.aboutCopy)+'</p></div><div><span>03</span><strong>Act</strong><p>'+esc(s.ctaCopy)+'</p></div></section><section id="faq" class="faq"><div><span class="eyebrow">QUESTIONS</span><h2>Everything important, without the clutter.</h2></div><div>'+faq+'</div></section><section id="final" class="final"><span class="eyebrow">'+esc(s.category)+' EXPERIENCE</span><h2>'+esc(s.ctaTitle)+'</h2><p>'+esc(s.ctaCopy)+'</p>'+cta+'</section></main><footer class="footer"><span>'+esc(s.footer)+'</span><span>'+ROOT_DOMAIN+'/sites/'+esc(s.slug)+'</span></footer></div></body></html>'
  }
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(s.seoTitle)+'</title><meta name="description" content="'+esc(s.seoDescription)+'"><style>*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:'+p[0]+';color:'+p[2]+';font-family:Inter,system-ui,-apple-system,sans-serif}.wrap{width:min(1120px,calc(100% - 36px));margin:auto}.nav{display:flex;justify-content:space-between;align-items:center;padding:24px 0;border-bottom:1px solid color-mix(in srgb,'+p[4]+' 16%,transparent)}.brand{font-weight:950}.nav-links{display:flex;gap:16px}.nav a{color:'+p[3]+';text-decoration:none;font-size:.82rem}.hero{padding:110px 0 70px}.hero .eyebrow{color:'+p[4]+';font-size:.7rem;letter-spacing:.15em;font-weight:900;text-transform:uppercase}.hero h1{font-size:clamp(3rem,9vw,7rem);line-height:.92;max-width:900px;margin:16px 0 24px}.hero p,.about p,.cta p,.grid p,.faq p{color:'+p[3]+';line-height:1.7}.hero p{max-width:760px}.button{display:inline-block;margin-top:14px;background:'+p[4]+';color:'+p[0]+';padding:13px 18px;border-radius:12px;text-decoration:none;font-weight:900}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px}.stats article,.grid article,.about,.faq,.cta{background:'+p[1]+';border:1px solid color-mix(in srgb,'+p[4]+' 15%,transparent);border-radius:24px;padding:26px}.stats strong{display:block;font-size:1.45rem;color:'+p[4]+'}.stats span{color:'+p[3]+';font-size:.82rem}.about,.faq,.cta{margin-bottom:18px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:18px}.grid article>span{font-size:.65rem;color:'+p[4]+';font-weight:900}.faq{display:grid;grid-template-columns:.7fr 1.3fr;gap:24px}.faq details{border-top:1px solid color-mix(in srgb,'+p[4]+' 14%,transparent);padding:14px 0}.faq summary{font-weight:800;cursor:pointer}.faq p{margin-bottom:0}.footer{display:flex;justify-content:space-between;gap:18px;padding:38px 0 60px;color:'+p[3]+';font-size:.82rem}.layout-split .hero{display:grid;grid-template-columns:1.15fr .85fr;gap:38px;align-items:end}.layout-split .hero p{align-self:end}.layout-editorial .hero h1{max-width:760px}.layout-editorial .about{display:grid;grid-template-columns:.6fr 1.4fr;gap:24px}.layout-editorial .about h2{margin-top:0}@media(max-width:760px){.nav-links{display:none}.hero,.layout-split .hero{display:block;padding:70px 0 45px}.stats,.grid,.faq,.layout-editorial .about{grid-template-columns:1fr}.footer{flex-direction:column}.grid{margin-bottom:16px}}</style></head><body><div class="wrap layout-'+esc(s.layout)+'"><nav class="nav"><div class="brand">'+esc(s.brand)+'</div><div class="nav-links"><a href="#about">About</a><a href="#highlights">Highlights</a><a href="#faq">FAQ</a></div></nav><main><section class="hero"><div><span class="eyebrow">'+esc(s.category)+' • for '+esc(s.audience)+'</span><h1>'+esc(s.heroTitle)+'</h1></div><div><p>'+esc(s.heroCopy)+'</p>'+cta+'</div></section><section class="stats">'+stats+'</section><section id="about" class="about"><h2>'+esc(s.aboutTitle)+'</h2><p>'+esc(s.aboutCopy)+'</p></section><section id="highlights" class="grid">'+cards+'</section><section id="faq" class="faq"><div><span class="eyebrow">FAQ</span><h2>Quick answers.</h2></div><div>'+faq+'</div></section><section class="cta"><h2>'+esc(s.ctaTitle)+'</h2><p>'+esc(s.ctaCopy)+'</p>'+cta+'</section></main><footer class="footer"><span>'+esc(s.footer)+'</span><span>'+ROOT_DOMAIN+'/sites/'+esc(s.slug)+'</span></footer></div></body></html>'
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
function FlagshipSitePreview({site}){
  const s=safeSite(site)
  const routeItems=[
    {index:'01',title:s.cards[0]?.title||'Explore',meta:s.cards[0]?.copy||''},
    {index:'02',title:s.cards[1]?.title||'Discover',meta:s.cards[1]?.copy||''},
    {index:'03',title:s.cards[2]?.title||'Connect',meta:s.cards[2]?.copy||''},
    {index:'04',title:s.ctaLabel||'Continue',meta:s.ctaTitle||''},
  ]
  return <div className={'esn-built-site generated-flagship theme-'+s.theme}>
    <div className="gfs-ambient" aria-hidden="true"><i/><i/><i/></div>
    <nav className="gfs-nav"><strong>{s.brand}</strong><div><a href="#story">Story</a><a href="#highlights">Highlights</a><a href="#faq">FAQ</a></div><span>LIVE</span></nav>

    <section className="gfs-hero">
      <div className="gfs-hero-copy">
        <div className="gfs-status"><i/> GENERATED EXPERIENCE <b>{s.category.toUpperCase()}</b></div>
        <span className="gfs-eyebrow">{s.category} // built for {s.audience}</span>
        <h1>{s.heroTitle}</h1>
        <p>{s.heroCopy}</p>
        <div className="gfs-actions">{s.ctaUrl&&<a className="gfs-primary" href={s.ctaUrl} target="_blank" rel="noreferrer">{s.ctaLabel} <b>↗</b></a>}<a className="gfs-secondary" href="#story">Explore site</a></div>
        <div className="gfs-metrics">{s.stats.map(function(item,index){return <div key={index}><span>0{index+1}</span><strong>{item.value}</strong><small>{item.label}</small></div>})}</div>
      </div>
      <aside className="gfs-core-stage" aria-label="Interactive-style visual">
        <div className="gfs-core-top"><span>{s.brand.toUpperCase()} CORE</span><i/><b>ACTIVE</b></div>
        <div className="gfs-reactor">
          <div className="gfs-ring ring-a"/><div className="gfs-ring ring-b"/><div className="gfs-ring ring-c"/>
          <div className="gfs-reactor-core"><span>{s.brand.slice(0,2).toUpperCase()}</span><small>{s.category}</small></div>
          <div className="gfs-orbit orbit-a"/><div className="gfs-orbit orbit-b"/>
        </div>
        <div className="gfs-core-footer"><span>PREMIUM SITE ENGINE</span><strong>STRUCTURED • RESPONSIVE • CINEMATIC</strong></div>
      </aside>
    </section>

    <div className="gfs-route-strip">{routeItems.map(function(item,index){return <a href={index<3?'#panel-'+index:'#final'} key={item.index}><span>{item.index}</span><b>{item.title}</b><small>{item.meta}</small><em>↗</em></a>})}</div>

    <section id="story" className="gfs-story">
      <aside className="gfs-story-sticky"><span className="gfs-eyebrow">THE EXPERIENCE</span><h2>{s.aboutTitle}</h2><p>{s.aboutCopy}</p><a href="#highlights">Explore the highlights →</a></aside>
      <div className="gfs-story-stack">{s.cards.map(function(card,index){return <article id={'panel-'+index} key={index}><span className="gfs-story-index">0{index+1}</span><div><span className="gfs-eyebrow">{s.category}</span><h3>{card.title}</h3><p>{card.copy}</p></div><strong>{card.title.split(' ')[0].toUpperCase()}</strong></article>})}</div>
    </section>

    <section id="highlights" className="gfs-section">
      <div className="gfs-section-heading"><div><span className="gfs-eyebrow">WHAT MATTERS</span><h2>Built around the important parts.</h2></div><small>{s.audience}</small></div>
      <div className="gfs-bento">
        {s.cards.map(function(card,index){return <article className={'gfs-bento-card bento-'+(index+1)} key={index}><div><span>0{index+1}</span><i>AVAILABLE</i></div><h3>{card.title}</h3><p>{card.copy}</p><strong>{s.stats[index]?.value||'+'}</strong></article>})}
        <article className="gfs-bento-card bento-more"><span className="gfs-eyebrow">ABOUT {s.brand.toUpperCase()}</span><h3>{s.aboutTitle}</h3><p>{s.aboutCopy}</p></article>
      </div>
    </section>

    <section className="gfs-feature-stage">
      <div><span className="gfs-big-index">{s.brand.toUpperCase()} // {s.category.toUpperCase()}</span><span className="gfs-eyebrow">FOCUSED EXPERIENCE</span><h2>{s.ctaTitle}</h2><p>{s.ctaCopy}</p>{s.ctaUrl&&<a className="gfs-primary" href={s.ctaUrl} target="_blank" rel="noreferrer">{s.ctaLabel}</a>}</div>
      <div className="gfs-feature-grid">{s.stats.map(function(item,index){return <article key={index}><span>0{index+1}</span><strong>{item.value}</strong><small>{item.label}</small><em>↗</em></article>})}<article><span>04</span><strong>{s.category}</strong><small>Built for {s.audience}</small><em>↗</em></article></div>
    </section>

    <section className="gfs-process"><div><span>01</span><strong>Discover</strong><p>{s.heroCopy}</p></div><div><span>02</span><strong>Explore</strong><p>{s.aboutCopy}</p></div><div><span>03</span><strong>Act</strong><p>{s.ctaCopy}</p></div></section>

    <section id="faq" className="gfs-faq">
      <div><span className="gfs-eyebrow">QUESTIONS</span><h2>Everything important, without the clutter.</h2><p>Quick answers generated around the site topic and audience.</p></div>
      <div>{s.faq.map(function(item,index){return <details key={index} open={index===0}><summary>{item.q}<span>+</span></summary><p>{item.a}</p></details>})}</div>
    </section>

    <section id="final" className="gfs-final"><span>{s.category.toUpperCase()} EXPERIENCE</span><h2>{s.ctaTitle}</h2><p>{s.ctaCopy}</p>{s.ctaUrl&&<a className="gfs-primary" href={s.ctaUrl} target="_blank" rel="noreferrer">{s.ctaLabel} <b>↗</b></a>}<strong aria-hidden="true">{s.brand.slice(0,3).toUpperCase()}</strong></section>
    <footer className="gfs-footer"><span>{s.footer}</span><small>{ROOT_DOMAIN}/sites/{s.slug||'yourname'}</small></footer>
  </div>
}

function SitePreview({site}){
  const s=safeSite(site)
  if(s.layout==='flagship')return <FlagshipSitePreview site={s}/>
  return <div className={'esn-built-site theme-'+s.theme+' layout-'+s.layout}>
    <nav><strong>{s.brand}</strong><div><a href="#about">About</a><a href="#highlights">Highlights</a><a href="#faq">FAQ</a></div></nav>
    <section className="built-hero"><span>{s.category} • for {s.audience}</span><h1>{s.heroTitle}</h1><p>{s.heroCopy}</p>{s.ctaUrl&&<a className="built-hero-button" href={s.ctaUrl} target="_blank" rel="noreferrer">{s.ctaLabel}</a>}</section>
    <section className="built-stats">{s.stats.map(function(item,index){return <article key={index}><strong>{item.value}</strong><span>{item.label}</span></article>})}</section>
    <section id="about" className="built-about"><h2>{s.aboutTitle}</h2><p>{s.aboutCopy}</p></section>
    <section id="highlights" className="built-card-grid">{s.cards.map(function(card,index){return <article key={index}><span>0{index+1}</span><h3>{card.title}</h3><p>{card.copy}</p></article>})}</section>
    <section id="faq" className="built-faq"><div><span>FAQ</span><h2>Quick answers.</h2></div><div>{s.faq.map(function(item,index){return <details key={index} open={index===0}><summary>{item.q}</summary><p>{item.a}</p></details>})}</div></section>
    <section className="built-cta"><h2>{s.ctaTitle}</h2><p>{s.ctaCopy}</p>{s.ctaUrl&&<a href={s.ctaUrl} target="_blank" rel="noreferrer">{s.ctaLabel}</a>}</section>
    <footer><span>{s.footer}</span><small>{ROOT_DOMAIN}/sites/{s.slug||'yourname'}</small></footer>
  </div>
}

export default function SiteBuilderPage(){
  const [prompt,setPrompt]=useState('')
  const [site,setSite]=useState(function(){try{return {...STARTER,...JSON.parse(localStorage.getItem(DRAFT_KEY)||'{}')}}catch{return STARTER}})
  const [device,setDevice]=useState('desktop')
  const [message,setMessage]=useState('')
  const [generation,setGeneration]=useState(0)
  const [history,setHistory]=useState([])
  const analysis=useMemo(function(){return analyzePrompt(prompt)},[prompt])
  const quality=useMemo(function(){return siteQuality(site,prompt)},[site,prompt])

  const remember=function(snapshot){setHistory(function(current){return [safeSite(snapshot),...current].slice(0,8)})}
  const update=function(key,value){setSite(function(current){return {...current,[key]:value}})}
  const updateCard=function(index,key,value){setSite(function(current){return {...current,cards:current.cards.map(function(card,i){return i===index?{...card,[key]:value}:card})}})}
  const updateStat=function(index,key,value){setSite(function(current){return {...current,stats:(current.stats||STARTER.stats).map(function(item,i){return i===index?{...item,[key]:value}:item})}})}
  const updateFaq=function(index,key,value){setSite(function(current){return {...current,faq:(current.faq||STARTER.faq).map(function(item,i){return i===index?{...item,[key]:value}:item})}})}

  useEffect(function(){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(safeSite(site)))}catch{}},[site])

  const generateVariant=function(variant){
    if(!prompt.trim()){setMessage('Tell the builder what kind of website you want first.');return}
    remember(site)
    setGeneration(variant)
    setSite(generateSite(prompt,site.brand,site.slug,variant))
    setMessage('Generated version '+String.fromCharCode(64+variant)+' for '+analysis.label+'. You can edit or try another version.')
  }
  const generate=function(){generateVariant((generation%3)+1)}
  const regenerate=function(section){
    if(!prompt.trim()){setMessage('Keep a prompt in the box so the generator knows what to rebuild.');return}
    const next=(generation%3)+1
    remember(site)
    setGeneration(next)
    setSite(function(current){return regenerateSection(current,prompt,section,next)})
    setMessage('Regenerated '+section+' from your current prompt.')
  }
  const undoAi=function(){
    if(!history.length){setMessage('No AI generation change to undo yet.');return}
    const previous=history[0]
    setHistory(function(current){return current.slice(1)})
    setSite(previous)
    setMessage('Restored the previous generated version.')
  }
  const publish=function(){
    const s=safeSite(site)
    if(!s.slug){setMessage('Enter your ESN site name first.');return}
    if(!s.brand||!s.heroTitle){setMessage('Add a site name and headline first.');return}
    if(BLOCKED_TEXT.test(JSON.stringify(s))){setMessage('Remove credential/payment-login wording before publishing. ESN free sites cannot collect sensitive information.');return}
    window.open(publishUrl(s),'_blank','noopener,noreferrer')
  }

  return <>
    <section className="page-hero builder-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">ESN WEBSITE BUILDER // FLAGSHIP GENERATOR V4</span><h1>Build sites with ESN-level architecture.</h1><p>V4 can generate a full flagship experience inspired by the architecture of the ESN website: cinematic hero stages, reactor-style visuals, route strips, story stacks, bento grids, feature panels, process sections, premium FAQs, and oversized final CTAs — without allowing arbitrary user scripts.</p></div><div className="page-hero-mark"><span>V4</span><small>FLAGSHIP SITE ENGINE</small></div></div></section>
    <section className="section"><div className="shell builder-layout">
      <div className="builder-controls">
        <div className="builder-panel"><span className="eyebrow">01 // IDEA + GENERATION</span>
          <label>ESN SITE NAME<div className="builder-domain"><span>/sites/</span><input value={site.slug} onChange={function(e){update('slug',cleanSlug(e.target.value))}} placeholder="yourname"/></div></label>
          <small className="builder-public-url">Public link: https://{ROOT_DOMAIN}/sites/{site.slug||'yourname'}</small>
          <label>SITE / BRAND NAME<input value={site.brand} onChange={function(e){update('brand',e.target.value.slice(0,60))}} placeholder="My Brand"/></label>
          <label>DESCRIBE THE WEBSITE<textarea value={prompt} onChange={function(e){setPrompt(e.target.value.slice(0,1200))}} placeholder="Make a dark Fortnite fan site for returning players. Explain why Fortnite is worth playing, compare the different modes, add a FAQ, and link to https://www.fortnite.com/"/></label>
          <div className="builder-quick-prompts">{QUICK_PROMPTS.map(function(example,index){return <button type="button" key={index} onClick={function(){setPrompt(example)}}>{index+1}</button>})}<span>EXAMPLE PROMPTS</span></div>
          <div className="builder-ai-readout">
            <div><span>TOPIC</span><strong>{analysis.label}</strong></div>
            <div><span>AUDIENCE</span><strong>{analysis.audience}</strong></div>
            <div><span>TONE</span><strong>{analysis.tone}</strong></div>
            <div><span>THEME</span><strong>{analysis.theme}</strong></div>
            <div><span>GOALS</span><strong>{analysis.goals.length?analysis.goals.join(' + '):'general'}</strong></div>
            <div><span>PROMPT SCORE</span><strong>{analysis.score}/100</strong></div>
            <p>{analysis.keywords.length?'Detected: '+analysis.keywords.join(' • '):'Add a topic, audience, goal, and desired style for stronger generation.'}</p>
          </div>
          <div className="builder-variants"><button type="button" onClick={function(){generateVariant(1)}}>VERSION A</button><button type="button" onClick={function(){generateVariant(2)}}>VERSION B</button><button className="flagship-variant" type="button" onClick={function(){generateVariant(3)}}>VERSION C • FLAGSHIP</button></div>
          <div className="builder-generation-actions"><button className="builder-generate" type="button" onClick={generate}>GENERATE NEXT VERSION</button><button type="button" disabled={!history.length} onClick={undoAi}>UNDO AI CHANGE</button></div>
          {message&&<div className="builder-message">{message}</div>}
        </div>

        <div className="builder-panel"><div className="builder-panel-head"><span className="eyebrow">02 // LAYOUT + STYLE</span><button type="button" onClick={function(){regenerate('hero')}}>REGENERATE HERO</button></div>
          <div className="builder-layout-picks">{LAYOUTS.map(function(layout){return <button type="button" className={site.layout===layout?'active':''} onClick={function(){update('layout',layout)}} key={layout}>{layout.toUpperCase()}</button>})}</div>
          <div className="builder-themes">{THEMES.map(function(theme){return <button type="button" className={site.theme===theme?'active':''} onClick={function(){update('theme',theme)}} key={theme}>{theme.toUpperCase()}</button>})}</div>
          <label>AUDIENCE<input value={site.audience||''} onChange={function(e){update('audience',e.target.value)}}/></label>
          <label>HERO HEADLINE<input value={site.heroTitle} onChange={function(e){update('heroTitle',e.target.value)}}/></label>
          <label>HERO TEXT<textarea value={site.heroCopy} onChange={function(e){update('heroCopy',e.target.value)}}/></label>
          <div className="builder-panel-head"><span className="eyebrow">ABOUT SECTION</span><button type="button" onClick={function(){regenerate('about')}}>REGENERATE ABOUT</button></div>
          <label>ABOUT TITLE<input value={site.aboutTitle} onChange={function(e){update('aboutTitle',e.target.value)}}/></label>
          <label>ABOUT TEXT<textarea value={site.aboutCopy} onChange={function(e){update('aboutCopy',e.target.value)}}/></label>
        </div>

        <div className="builder-panel"><div className="builder-panel-head"><span className="eyebrow">03 // CONTENT CARDS</span><button type="button" onClick={function(){regenerate('cards')}}>REGENERATE CARDS</button></div>{(site.cards||STARTER.cards).map(function(card,index){return <div className="builder-card-editor" key={index}><input value={card.title} onChange={function(e){updateCard(index,'title',e.target.value)}}/><textarea value={card.copy} onChange={function(e){updateCard(index,'copy',e.target.value)}}/></div>})}</div>

        <div className="builder-panel"><div className="builder-panel-head"><span className="eyebrow">04 // STATS / HIGHLIGHTS</span><button type="button" onClick={function(){regenerate('stats')}}>REGENERATE STATS</button></div>{(site.stats||STARTER.stats).map(function(item,index){return <div className="builder-inline-editor" key={index}><input value={item.value} onChange={function(e){updateStat(index,'value',e.target.value)}}/><input value={item.label} onChange={function(e){updateStat(index,'label',e.target.value)}}/></div>})}</div>

        <div className="builder-panel"><div className="builder-panel-head"><span className="eyebrow">05 // FAQ</span><button type="button" onClick={function(){regenerate('faq')}}>REGENERATE FAQ</button></div>{(site.faq||STARTER.faq).map(function(item,index){return <div className="builder-card-editor" key={index}><input value={item.q} onChange={function(e){updateFaq(index,'q',e.target.value)}}/><textarea value={item.a} onChange={function(e){updateFaq(index,'a',e.target.value)}}/></div>})}</div>

        <div className="builder-panel"><div className="builder-panel-head"><span className="eyebrow">06 // SEO</span><button type="button" onClick={function(){regenerate('seo')}}>REGENERATE SEO</button></div>
          <label>SEARCH TITLE<input value={site.seoTitle||''} onChange={function(e){update('seoTitle',e.target.value)}}/></label>
          <small className="builder-char-count">{(site.seoTitle||'').length}/70</small>
          <label>SEARCH DESCRIPTION<textarea value={site.seoDescription||''} onChange={function(e){update('seoDescription',e.target.value)}}/></label>
          <small className="builder-char-count">{(site.seoDescription||'').length}/160</small>
        </div>

        <div className="builder-panel"><div className="builder-panel-head"><span className="eyebrow">07 // FINAL CTA</span><button type="button" onClick={function(){regenerate('cta')}}>REGENERATE CTA</button></div>
          <label>CTA TITLE<input value={site.ctaTitle} onChange={function(e){update('ctaTitle',e.target.value)}}/></label>
          <label>CTA TEXT<textarea value={site.ctaCopy} onChange={function(e){update('ctaCopy',e.target.value)}}/></label>
          <label>BUTTON TEXT<input value={site.ctaLabel} onChange={function(e){update('ctaLabel',e.target.value)}}/></label>
          <label>BUTTON LINK<input value={site.ctaUrl} onChange={function(e){update('ctaUrl',e.target.value)}} placeholder="https://..."/></label>
          <div className="builder-quality"><div><span>SITE QUALITY</span><strong>{quality}/100</strong></div><meter min="0" max="100" value={quality}>{quality}</meter><small>{quality>=90?'Publish-ready structure.':quality>=70?'Strong structure — review the copy before publishing.':'Add more detail to the prompt and fill the weaker sections.'}</small></div>
          <div className="builder-action-grid"><button type="button" onClick={function(){downloadHtml(site)}}>DOWNLOAD HTML</button><button className="primary" type="button" onClick={publish}>PUBLISH BUILD</button></div>
          <small>The generator creates structured, script-free pages. Publishing verifies the GitHub account owns the claimed ESN site name before updating the public /sites page.</small>
        </div>
      </div>

      <div className="builder-preview-column">
        <div className="builder-preview-toolbar"><div><span>LIVE PREVIEW</span><strong>{ROOT_DOMAIN}/sites/{site.slug||'yourname'}</strong></div><div><button className={device==='desktop'?'active':''} onClick={function(){setDevice('desktop')}}>DESKTOP</button><button className={device==='mobile'?'active':''} onClick={function(){setDevice('mobile')}}>PHONE</button></div></div>
        <div className={'builder-preview-frame '+device}><SitePreview site={site}/></div>
        <div className="builder-publish-note"><strong>PUBLIC SITE</strong><span>Published ESN Builder websites currently use https://{ROOT_DOMAIN}/sites/yourname. Direct subdomain hosting is not the advertised public builder URL yet.</span></div>
      </div>
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
