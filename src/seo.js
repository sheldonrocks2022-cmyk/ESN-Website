export const SITE_URL='https://esnoffical.com'
export const SITE_NAME='ES Network'
export const SITE_LANGUAGE='en-US'
export const SEO_LAUNCH_MODE='production'
export const SOCIAL_IMAGE_URL=SITE_URL+'/esn-social-card.svg'
export const SOCIAL_IMAGE_ALT='ES Network — Build, Play, Create'

export const SEO_ROUTES={
  '/':{
    label:'Home',
    title:'ES Network (ESN) | Creator Services, Gaming & ESN SMP',
    description:'ES Network offers Fortnite coaching, creator editing, Discord server setups, website projects, ESN SMP, six browser games, free tools, and community support.',
    canonical:'/',
    index:true,
  },
  '/home':{
    label:'Home',
    title:'ES Network (ESN) | Creator Services, Gaming & ESN SMP',
    description:'ES Network offers Fortnite coaching, creator editing, Discord server setups, website projects, ESN SMP, six browser games, free tools, and community support.',
    canonical:'/',
    index:false,
  },
  '/serviceshowcase':{
    label:'Services',
    title:'Fortnite Coaching, Editing & Discord Setup | ES Network',
    description:'Explore ES Network services for Fortnite coaching, creator editing, Discord server setup, website creation, branding, and selected custom digital projects.',
    index:true,
  },
  '/store-ai':{
    label:'ESN Store AI',
    title:'ESN Store AI | Products, Services, Prices & Checkout Help',
    description:'Ask ESN Store AI about official ES Network SMP products and services, compare verified prices, check delivery requirements, find checkout links, and unlock staff store tools with the ESN staff code.',
    index:true,
  },
  '/storeai':{
    label:'ESN Store AI',
    title:'ESN Store AI | Products, Services, Prices & Checkout Help',
    description:'Ask ESN Store AI about official ES Network products and services.',
    canonical:'/store-ai',
    index:false,
  },
  '/storesmp':{
    label:'SMP Store',
    title:'ESN SMP Store | Minecraft Keys, Relics & Bundles',
    description:'Browse official ESN SMP digital items and bundles, including Realm 100 Keys, Season Pass relics, Riftwalker, Immortal Warden, and Void Warrior gear.',
    index:false,
    nofollow:true,
  },
  '/store':{
    label:'SMP Store',
    title:'ESN SMP Store | Minecraft Keys, Relics & Bundles',
    description:'Browse official ESN SMP digital items and bundles through ES Network.',
    canonical:'/storesmp',
    index:false,
  },
  '/store/smp':{
    label:'SMP Store',
    title:'ESN SMP Store | Minecraft Keys, Relics & Bundles',
    description:'Browse official ESN SMP digital items and bundles through ES Network.',
    canonical:'/storesmp',
    index:false,
  },
  '/smpconnection':{
    label:'SMP Connection',
    title:'ESN SMP Server IP & Port | Join ES Network Minecraft',
    description:'Join the ESN SMP Minecraft server at fr3.plugged.host on port 43353 and find the current connection details for the ES Network SMP.',
    index:false,
    nofollow:true,
  },
  '/smpconsole':{
    label:'Console Connection',
    title:'Join ESN SMP on Console | Xbox, PlayStation & Switch Guide',
    description:'Follow the ESN SMP console connection guide for Xbox, PlayStation, and Nintendo Switch using Bedrock Connect and the current ESN server address.',
    index:false,
    nofollow:true,
  },
  '/smpplugin':{
    label:'ESNSMP Plugin',
    title:'ESNSMP Plugin Download | ES Network Minecraft Plugin',
    description:'Download the latest public ESNSMP Minecraft plugin release from the official ESNSMP GitHub repository and view verified plugin release information.',
    index:false,
    nofollow:true,
  },
  '/status':{
    label:'Network Status',
    title:'ESN Network Status | SMP, Website, Arcade & Plugin',
    description:'Check current ES Network status information for the website, ESN SMP, public ESNSMP plugin release, Arcade, and Discord connection.',
    index:true,
  },
  '/timeline':{
    label:'Timeline',
    title:'ES Network History | EP1C Services to ESN Timeline',
    description:'Explore the ES Network timeline from its former EP1C Services name through the current ESN brand, SMP, Arcade, and ongoing projects.',
    index:true,
  },
  '/updates':{
    label:'Release Center',
    title:'ES Network Updates | Website, ESNSMP & Arcade Releases',
    description:'See current ES Network website updates, ESNSMP plugin releases, Arcade improvements, live-network changes, and clearly labeled roadmap candidates.',
    index:true,
  },
  '/portfolio':{
    label:'Portfolio',
    title:'ES Network Portfolio | Editing, Discord & Website Demos',
    description:'Explore clearly labeled illustrative ES Network before-and-after process demos for creator editing, Discord setup, and website creation.',
    index:true,
  },
  '/share':{
    label:'Share Deck',
    title:'ESN Share Deck | Create Branded ES Network Cards',
    description:'Generate branded ES Network share cards for the SMP, Arcade, services, releases, and current ESN SMP store products.',
    index:true,
  },
  '/vault':{
    label:'Vault',
    title:'ESN Vault | Secret Network Layer',
    description:'A hidden ES Network experience unlocked through site easter eggs.',
    index:false,
    nofollow:true,
  },
  '/estools':{
    label:'ES Tools',
    title:'ES Tools | Free Creator, Gaming & Browser Utilities',
    description:'Use free ES Network browser tools including challenge generation, focus timer, prompt creation, random picker, coin flip, dice, and website estimates.',
    index:true,
  },
  '/tools':{
    label:'ES Tools',
    title:'ES Tools | Free Creator, Gaming & Browser Utilities',
    description:'Use free browser-based ES Network creator and gaming utilities.',
    canonical:'/estools',
    index:false,
  },
  '/arcade':{
    label:'Arcade',
    title:'ESN Arcade | Six Free Browser Games by ES Network',
    description:'Play six original ES Network browser games: ES Clicker, ES Factory, ES Mines, ES MOTO, ES Tower, and ES Tower Defense.',
    index:true,
  },
  '/esclicker':{
    label:'ES Clicker',
    title:'ES Clicker | Free ESN Arcade Clicker Game',
    description:'Play ES Clicker with tap progression, ES Coins, live statistics, local progress, and a 110-upgrade Power Forge.',
    index:true,
  },
  '/esfactory':{
    label:'ES Factory',
    title:'ES Factory | Free ESN Arcade Factory Game',
    description:'Play ES Factory with 53 zones, production floors, upgrades, boosts, shared ES Coins, and a 112-machine progression catalog.',
    index:true,
  },
  '/esmines':{
    label:'ES Mines',
    title:'ES Mines | Free Virtual-Coin Mines Game',
    description:'Play ES Mines with virtual ES Coins, wager choices, mine-density selection, multipliers, and cash-out gameplay. No real-money wagering.',
    index:true,
  },
  '/esmoto':{
    label:'ES MOTO',
    title:'ES MOTO | Free ESN Arcade Motorcycle Game',
    description:'Play ES MOTO with touch controls, checkpoints, saved best times, daily challenges, and more than 1,000 tracks.',
    index:true,
  },
  '/estower':{
    label:'ES Tower',
    title:'ES Tower | Free ESN Arcade Risk Game',
    description:'Play ES Tower across 122 floors with three-door risk progression, shared ES Coins, multipliers, and cash-out decisions.',
    index:true,
  },
  '/estowerdefense':{
    label:'ES Tower Defense',
    title:'ES Tower Defense | Free ESN Arcade Defense Game',
    description:'Play ES Tower Defense across 200 rounds using ten tower types, path-defense strategy, upgrades, coins, and 150 base HP.',
    index:true,
  },
  '/smpguide':{
    label:'SMP Encyclopedia',
    title:'ESN SMP Encyclopedia | Commands, Bosses, Realms & Progression',
    description:'Search ESN SMP commands and learn the current ESNSMP systems for Realm progression, economy, bosses, crates, gear, travel, seasons, and Adventure content.',
    index:false,
    nofollow:true,
  },
  '/networkstats':{
    label:'Network Statistics',
    title:'ES Network Statistics | Live Status & Local Progress',
    description:'View ES Network live system information alongside local Arcade, Passport, Easter egg, recent-route, and favorite progress.',
    index:true,
  },
  '/nexus':{
    label:'Network Nexus',
    title:'ES Network Nexus | XP, Missions, Arcade & Live Systems',
    description:'Explore the ES Network Nexus with connected XP, missions, achievements, Arcade competition, live activity, secret lore, dynamic events, 3D systems, and the ESN Guide.',
    index:true,
  },
  '/notifications':{
    label:'Notification Center',
    title:'ESN Notification Center | Local Alerts & Network Activity',
    description:'View account-free ES Network alerts for releases, achievements, rewards, SMP telemetry, and local browser notifications.',
    index:true,
  },
  '/rewards':{
    label:'Reward Vault',
    title:'ESN Reward Vault | Network Shards, Cosmetics & Local Inventory',
    description:'Spend locally earned ESN Network Shards on account-free cosmetic unlocks and manage a device-local ESN identity card.',
    index:true,
  },
  '/challenges':{
    label:'Challenge Lab',
    title:'ESN Arcade Challenge Lab | Share Account-Free Game Challenges',
    description:'Create and accept shareable ESN Arcade target challenges using real local game progress without accounts or fake global scores.',
    index:true,
  },
  '/staff':{
    label:'Staff Dashboard',
    title:'ESN Staff Dashboard',
    description:'Code-gated local ES Network operator dashboard.',
    index:false,
    nofollow:true,
  },
  '/operations':{
    label:'Operations Map',
    title:'ESN Operations Map | Live Network Systems & Status',
    description:'Explore a connected ES Network operations map for the website, Nexus, SMP, Arcade, Terminal, Store, Staff tools, and current system telemetry.',
    index:true,
  },
  '/incidents':{
    label:'Incident History',
    title:'ESN Incident History | Network Issues & Resolutions',
    description:'View ES Network incident records explicitly published from the local Staff Dashboard, including severity, current status, details, and resolution times.',
    index:true,
  },
  '/changelog':{
    label:'Network Changelog',
    title:'ESN Network Changelog | Website, Staff, Terminal & Arcade',
    description:'Explore an interactive ES Network changelog timeline covering major website, Staff, Network, Terminal, Arcade, and infrastructure releases.',
    index:true,
  },
  '/diagnostics':{
    label:'Diagnostic Center',
    title:'ESN Diagnostic Center | Browser, Network & SMP Checks',
    description:'Run safe account-free ES Network diagnostics for browser connectivity, local storage, notifications, service workers, cache, SMP telemetry, plugin releases, and Discord.',
    index:true,
  },
  '/smpcheck':{
    label:'SMP Connection Tester',
    title:'ESN SMP Connection Tester | Server, Port & Telemetry Check',
    description:'Test the current ESN SMP hostname, port, website reachability, public Minecraft telemetry, plugin release channel, and Discord connection from one page.',
    index:false,
    nofollow:true,
  },
  '/blueprint':{
    label:'System Blueprint',
    title:'ESN System Blueprint | Nexus, Terminal, SMP, Arcade & Staff',
    description:'Explore an interactive ES Network system blueprint showing how Nexus, Terminal, Vault, Arcade, SMP, Staff tools, Operations, and other systems connect.',
    index:true,
  },
  '/session':{
    label:'Session Stats',
    title:'ESN Session Stats | Local Visit, Arcade & Terminal Activity',
    description:'View account-free local ES Network session statistics including visit duration, pages explored, Arcade XP, hidden signals, Terminal commands, and session rank.',
    index:true,
  },
  '/whatsnew':{
    label:"What's New",
    title:"What's New at ES Network | Latest Website Features",
    description:'See the newest ES Network website features including PWA install, performance controls, SMP encyclopedia, Arcade challenges, accessibility, and discovery tools.',
    index:true,
  },
  '/explore':{
    label:'Explore ESN',
    title:'Explore ES Network | Website Features, Favorites & Recents',
    description:'Discover ES Network website features and revisit recent or favorite destinations across services, SMP, Arcade, tools, updates, accessibility, and support.',
    index:true,
  },
  '/gallery':{
    label:'Media Gallery',
    title:'ES Network Media Gallery | Brand, SMP & Milestones',
    description:'Explore official ES Network brand visuals, website milestones, ESNSMP releases, and space for approved SMP and community media.',
    index:true,
  },
  '/settings':{
    label:'Performance & Accessibility',
    title:'ES Network Performance & Accessibility Settings',
    description:'Control ES Network performance mode, motion, flashing, contrast, text size, touch target size, and install the website as a supported web app.',
    index:true,
  },
  '/support':{
    label:'Website Support',
    title:'Report an ES Network Website Problem | ESN Support',
    description:'Create a local diagnostic website bug report, copy the report details, and open ES Network Discord support.',
    index:true,
  },
  '/about':{
    label:'About',
    title:'About ES Network | Gaming, Creator Services & Community',
    description:'Learn about ES Network, the current organization formerly known as EP1C Services, and its creator services, gaming projects, SMP, Arcade, and community.',
    index:true,
  },
  '/leadership':{
    label:'Leadership',
    title:'ES Network Leadership | Founders & Administration',
    description:'Meet the founders, co-founders, and administrators behind ES Network and learn about the team responsible for the organization and its projects.',
    index:true,
  },
  '/testimonials':{
    label:'Reviews',
    title:'ES Network Reviews | Fortnite, Editing & Discord Services',
    description:'Read 35 verified-on-Discord ES Network reviews covering Fortnite coaching, creator editing, and Discord server setup services.',
    index:true,
  },
  '/faq':{
    label:'FAQ',
    title:'ES Network FAQ | Services, SMP, Ordering & Support',
    description:'Get answers about ES Network services, Discord ordering and support, ESN SMP purchases, console access, browser tools, and community access.',
    index:true,
  },
}

export const FAQ_SCHEMA=[
  ['What is ES Network?','ES Network (ESN) is the current brand. EP1C Services was the former name and is not a separate current organization or division.'],
  ['What services does ESN offer?','The current public service focus includes Fortnite coaching, editing services, Discord server setups, and selected digital or website projects handled through ESN.'],
  ['How do I order a service?','Service ordering and support are handled through the official ESN Discord. Open a ticket and provide the details of what you need.'],
  ['How do SMP purchases get delivered?','Enter your exact in-game Minecraft username at Stripe checkout. The buyer should be online on the SMP for automatic delivery. If your server username starts with a period, include the period at the beginning.'],
  ['Are ES Tools paid?','ES Tools are intended to be free browser-based utilities. They do not require an account and are not supposed to save your personal data.'],
  ['Can console players join the ESN SMP?','Yes. Xbox, PlayStation, and Nintendo Switch generally need a third-party-server workaround because Minecraft console editions do not expose a normal Add Server field. Use the Console Connection page for ESN server details and guidance.'],
  ['Where can I join the ESN community?','Use the official Discord link anywhere on this website to join the ES Network community.'],
]

export const SERVICE_SCHEMA=[
  ['Fortnite Coaching','Focused coaching built around practical improvement, stronger decision-making, and better in-game consistency.','/serviceshowcase#fortnite-coaching'],
  ['Editing Services','Editing support for creators who want sharper, cleaner content built for their platform and audience.','/serviceshowcase#editing-services'],
  ['Discord Server Setups','Structured Discord setups designed around roles, channels, moderation, onboarding, and community growth.','/serviceshowcase#discord-server-setups'],
]

export const ARCADE_SCHEMA=[
  ['ES Clicker','/esclicker'],
  ['ES Factory','/esfactory'],
  ['ES Mines','/esmines'],
  ['ES MOTO','/esmoto'],
  ['ES Tower','/estower'],
  ['ES Tower Defense','/estowerdefense'],
]

export const GAME_SCHEMA_DETAILS={
  '/esclicker':{name:'ES Clicker',description:'A free ESN Arcade clicker game with ES Coins, local progress, statistics, and a 110-upgrade Power Forge.'},
  '/esfactory':{name:'ES Factory',description:'A free ESN Arcade factory progression game with 53 zones, 112 machines, upgrades, boosts, and shared ES Coins.'},
  '/esmines':{name:'ES Mines',description:'A free virtual-coin mines game with a 5×5 board, mine-density choices, multipliers, and no real-money wagering.'},
  '/esmoto':{name:'ES MOTO',description:'A free ESN Arcade motorcycle game with touch controls, checkpoints, saved best times, daily challenges, and more than 1,000 tracks.'},
  '/estower':{name:'ES Tower',description:'A free ESN Arcade risk game with 122 floors, three-door progression, shared ES Coins, multipliers, and cash-out decisions.'},
  '/estowerdefense':{name:'ES Tower Defense',description:'A free ESN Arcade tower-defense game with 200 rounds, ten tower types, upgrades, coins, and 150 base HP.'},
}

export const STORE_SCHEMA=[
  {name:'20 Realm 100 Keys',price:'1.25',description:'Twenty Realm 100 keys for the ESN SMP.',path:'/storesmp#product-20-realm-100-keys',available:true},
  {name:'ESN Season Pass Relic Bundle',price:'0.50',description:'Six ESN SMP Season Pass relics: Angel Wings, Inferno Scepter, Storm Crystal, Tideheart, Void Relic, and Celestial Star.',path:'/storesmp#product-esn-season-pass-relic-bundle',available:true},
  {name:'ESN Riftwalker Bundle',price:'0.50',description:'An ESN SMP mobility and utility bundle with Riftblade, Rift Wings, Phase Boots, Rift Bow, Rift Core, and Void Compass.',path:'/storesmp#product-esn-riftwalker-bundle',available:true},
  {name:'ESN Immortal Warden Bundle',price:'1.30',description:'An eight-item Warden-themed ESN SMP combat bundle.',path:'/storesmp#product-esn-immortal-warden-bundle',available:true},
  {name:'Void Warrior Bundle',price:'0.50',description:'A Void-themed ESN SMP armor and weapon bundle. Checkout is not currently enabled.',path:'/storesmp#product-void-warrior-bundle',available:false},
]

export const TOOL_SCHEMA=[
  ['Challenge Generator','Generate creator and gaming challenges in the browser.'],
  ['Focus Timer','Run a simple browser-based focus timer.'],
  ['Prompt Generator','Build reusable prompts in the browser.'],
  ['Random Picker','Choose randomly from user-provided options.'],
  ['Coin Flip','Flip a virtual coin in the browser.'],
  ['D6 Dice','Roll a virtual six-sided die.'],
  ['Website Estimate','View ES Network website project starting estimates.'],
]

export const CONSOLE_HOWTO_STEPS=[
  ['Open Bedrock Connect on your phone','Open the Bedrock Connect method used by the ESN console guide and keep the phone on the same network as the console.'],
  ['Open Custom','Choose Custom inside Bedrock Connect.'],
  ['Tap the + button','Create a new custom server entry.'],
  ['Enter the ESN SMP details','Use server name ESN SMP, address fr3.plugged.host, and port 43353.'],
  ['Save the server','Save the custom server entry.'],
  ['Select ESN SMP','Select the ESN SMP entry you created.'],
  ['Press Add & Start','Start the Bedrock Connect console connection process.'],
  ['Finish on your console','Open Minecraft on Xbox, PlayStation, or Nintendo Switch and complete the connection flow.'],
]

export function getSeo(pathname){
  return SEO_ROUTES[pathname]||{
    label:'ES Network',
    title:'ES Network',
    description:'Official ES Network website.',
    canonical:pathname||'/',
    index:false,
  }
}

export function canonicalPath(pathname){
  const meta=getSeo(pathname)
  return meta.canonical??pathname??'/'
}

export function canonicalUrl(pathname){
  const path=canonicalPath(pathname)
  return SITE_URL+(path==='/'?'/':path)
}

export function robotsContent(pathname,hostname=''){
  const meta=getSeo(pathname)
  if(SEO_LAUNCH_MODE==='staging'||hostname==='ep1cservices.shop')return 'noindex, nofollow'
  if(meta.index===false)return meta.nofollow?'noindex, nofollow':'noindex, follow'
  return 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
}

export function structuredDataFor(pathname){
  const meta=getSeo(pathname)
  const url=canonicalUrl(pathname)
  const graph=[
    {
      '@type':'Organization',
      '@id':SITE_URL+'/#organization',
      name:SITE_NAME,
      alternateName:'EP1C Services',
      url:SITE_URL+'/',
      logo:{'@type':'ImageObject',url:SITE_URL+'/esn-mark.svg'},
      description:'ES Network provides creator and gaming services and operates the ESN SMP, ESN Arcade, ES Tools, and community experiences.',
    },
    {
      '@type':'WebSite',
      '@id':SITE_URL+'/#website',
      url:SITE_URL+'/',
      name:SITE_NAME,
      publisher:{'@id':SITE_URL+'/#organization'},
      inLanguage:SITE_LANGUAGE,
    },
    {
      '@type':'WebPage',
      '@id':url+'#webpage',
      url,
      name:meta.title,
      description:meta.description,
      isPartOf:{'@id':SITE_URL+'/#website'},
      about:{'@id':SITE_URL+'/#organization'},
      inLanguage:SITE_LANGUAGE,
      primaryImageOfPage:{'@type':'ImageObject',url:SOCIAL_IMAGE_URL,width:1200,height:630},
    },
  ]

  if(canonicalPath(pathname)!=='/'){
    graph.push({
      '@type':'BreadcrumbList',
      '@id':url+'#breadcrumb',
      itemListElement:[
        {'@type':'ListItem',position:1,name:'ES Network',item:SITE_URL+'/'},
        {'@type':'ListItem',position:2,name:meta.label,item:url},
      ],
    })
  }

  if(pathname==='/faq'){
    graph.push({
      '@type':'FAQPage',
      '@id':url+'#faq',
      mainEntity:FAQ_SCHEMA.map(([question,answer])=>({
        '@type':'Question',
        name:question,
        acceptedAnswer:{'@type':'Answer',text:answer},
      })),
    })
  }

  if(pathname==='/serviceshowcase'){
    graph.push({
      '@type':'ItemList',
      '@id':url+'#services',
      name:'ES Network Services',
      itemListElement:SERVICE_SCHEMA.map(([name,description,path],index)=>({
        '@type':'ListItem',
        position:index+1,
        item:{'@type':'Service',name,description,url:SITE_URL+path,provider:{'@id':SITE_URL+'/#organization'}},
      })),
    })
  }

  if(pathname==='/arcade'){
    graph.push({
      '@type':'ItemList',
      '@id':url+'#games',
      name:'ESN Arcade Games',
      itemListElement:ARCADE_SCHEMA.map(([name,path],index)=>({
        '@type':'ListItem',
        position:index+1,
        item:{
          '@type':'VideoGame',
          name,
          url:SITE_URL+path,
          gamePlatform:'Web Browser',
          playMode:'SinglePlayer',
          isAccessibleForFree:true,
          publisher:{'@id':SITE_URL+'/#organization'},
        },
      })),
    })
  }

  if(GAME_SCHEMA_DETAILS[pathname]){
    const game=GAME_SCHEMA_DETAILS[pathname]
    graph.push({
      '@type':'VideoGame',
      '@id':url+'#game',
      name:game.name,
      description:game.description,
      url,
      gamePlatform:'Web Browser',
      playMode:'SinglePlayer',
      isAccessibleForFree:true,
      publisher:{'@id':SITE_URL+'/#organization'},
      offers:{'@type':'Offer',price:'0',priceCurrency:'USD',url},
    })
  }

  if(pathname==='/storesmp'){
    graph.push({
      '@type':'ItemList',
      '@id':url+'#products',
      name:'ESN SMP Store Products',
      itemListElement:STORE_SCHEMA.map((product,index)=>({
        '@type':'ListItem',
        position:index+1,
        item:{
          '@type':'Product',
          name:product.name,
          description:product.description,
          url:SITE_URL+product.path,
          brand:{'@type':'Brand',name:SITE_NAME},
          category:'Minecraft digital item',
          ...(product.available?{
            offers:{
              '@type':'Offer',
              price:product.price,
              priceCurrency:'USD',
              url:SITE_URL+product.path,
              availability:'https://schema.org/InStock',
              seller:{'@id':SITE_URL+'/#organization'},
            },
          }:{}),
        },
      })),
    })
  }

  if(pathname==='/smpplugin'){
    graph.push({
      '@type':'SoftwareApplication',
      '@id':url+'#software',
      name:'ESNSMP',
      description:'The public ES Network Minecraft server plugin distributed as ESNSMP.jar.',
      url,
      downloadUrl:'https://github.com/sheldonrocks2022-cmyk/ESNSMP/releases/latest/download/ESNSMP.jar',
      softwareVersion:'v2.9.4',
      applicationCategory:'DeveloperApplication',
      operatingSystem:'Minecraft Paper-compatible server',
      isAccessibleForFree:true,
      publisher:{'@id':SITE_URL+'/#organization'},
      offers:{'@type':'Offer',price:'0',priceCurrency:'USD',url},
    })
  }

  if(pathname==='/estools'){
    graph.push({
      '@type':'ItemList',
      '@id':url+'#tools',
      name:'ES Tools',
      itemListElement:TOOL_SCHEMA.map(([name,description],index)=>({
        '@type':'ListItem',
        position:index+1,
        item:{
          '@type':'SoftwareApplication',
          name,
          description,
          url,
          applicationCategory:'UtilitiesApplication',
          operatingSystem:'Web Browser',
          isAccessibleForFree:true,
          offers:{'@type':'Offer',price:'0',priceCurrency:'USD',url},
        },
      })),
    })
  }

  if(pathname==='/smpconnection'){
    graph.push({
      '@type':'GameServer',
      '@id':url+'#server',
      name:'ESN SMP',
      url,
      identifier:'fr3.plugged.host:43353',
      game:{'@type':'VideoGame',name:'Minecraft'},
    })
  }

  if(pathname==='/smpconsole'){
    graph.push({
      '@type':'HowTo',
      '@id':url+'#howto',
      name:'How to join ESN SMP from a console',
      description:'Connect Xbox, PlayStation, or Nintendo Switch to ESN SMP using the ESN Bedrock Connect flow.',
      step:CONSOLE_HOWTO_STEPS.map(([name,text],index)=>({
        '@type':'HowToStep',
        position:index+1,
        name,
        text,
      })),
    })
  }

  return {'@context':'https://schema.org','@graph':graph}
}
