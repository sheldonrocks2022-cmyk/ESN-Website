import { HOME_FAQ } from './esnNetwork.js'
export const SITE_URL='https://esnoffical.com'
export const SITE_NAME='ES Network'
export const SITE_LANGUAGE='en-US'
export const SEO_LAUNCH_MODE='production'
export const SOCIAL_IMAGE_URL=SITE_URL+'/esn-social-card.png'
export const SOCIAL_IMAGE_ALT='ES Network — Build, Play, Create'
export function socialImageFor(pathname=''){
  const path=normalizePath(pathname)
  if(path.startsWith('/guides')||['/minecraft-server','/minecraft-smp'].includes(path))return SITE_URL+'/social/esn-guides.png'
  if(path.startsWith('/smp/')||path.startsWith('/smp-')||['/storesmp','/smpguide','/smpconnection'].includes(path))return SITE_URL+'/social/esn-smp.png'
  if(['/services','/fortnite-coaching','/video-editing','/discord-server-setup','/serviceshowcase','/configure','/estimate','/portfolio','/testimonials'].includes(path))return SITE_URL+'/social/esn-services.png'
  if(['/website-builder','/site-builder','/showcase','/hosting'].includes(path))return SITE_URL+'/social/esn-builder.png'
  if(['/free-browser-tools','/estools'].includes(path))return SITE_URL+'/social/esn-tools.png'
  if(path==='/hosting/vps'||path==='/business'||path.startsWith('/business/'))return SITE_URL+'/social/esn-hosting.png'
  return SITE_URL+'/social/esn-network.png'
}

export const SEO_ROUTES={
  '/':{
    label:'Home',
    title:'ESN Hosting & ES Network | Discord Bot and Minecraft Server Hosting',
    description:'Discord bot hosting from $0.50/month, Minecraft servers up to 16 GB, game, web and VPS-lite servers, plus the ESN SMP. Set up automatically after checkout.',
    canonical:'/',
    index:true,
  },
  '/home':{
    label:'Home',
    title:'ESN Hosting & ES Network | Discord Bot and Minecraft Server Hosting',
    description:'Discord bot hosting from $0.50/month, Minecraft servers up to 16 GB, game, web and VPS-lite servers, plus the ESN SMP. Set up automatically after checkout.',
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
    description:'Ask ESN Store AI about verified products, services, prices, delivery, comparisons, checkout links, and staff-only store tools.',
    index:true,
  },
  '/storeai':{
    label:'ESN Store AI',
    title:'ESN Store AI | Products, Services, Prices & Checkout Help',
    description:'Ask ESN Store AI about official ES Network products and services.',
    canonical:'/store-ai',
    index:false,
  },
  '/hosting':{
    label:'ESN Hosting',
    title:'ESN Hosting | Bot & Minecraft Hosting, Free Subdomains, Domains',
    description:'Host your Discord bot or Minecraft server 24/7 from $0.50/month, get a free ESN subdomain or connect a domain. Set up automatically after checkout.',
    index:true,
  },
  '/business':{
    label:'ESN Business Hub',
    title:'ESN Hosting Business Hub | Plans, Help & Partnerships',
    description:'ESN hosting plans, setup guides, support and partnerships. Buy on the ESN panel and your server is set up automatically after Stripe checkout.',
    index:true,
  },
  '/business/dashboard':{label:'ESN Workspace',title:'My ESN Hosting Workspace | Local Drafts',description:'Create local ESN hosting request drafts and open official support tickets. This is not a live customer account.',index:false},
  '/business/plans':{label:'ESN Hosting Plan Finder',title:'Compare ESN Bot Hosting Plans from $0.50/month',description:'Find and compare ESN bot hosting tiers from $0.50/month, then buy on the ESN panel. Servers are set up automatically after checkout.',index:true},
  '/business/partners':{label:'ESN Partnerships',title:'ESN Hosting Partnerships & Referrals',description:'Learn about ESN hosting partnership and referral enquiries. Applications require ESN staff review.',index:true},
  '/business/rewards':{label:'ESN Hosting Benefits',title:'ESN Hosting Rewards & Loyalty Information',description:'Review staff-approved customer perks, rewards policies and community milestones.',index:true},
  '/business/support':{label:'ESN Hosting Support',title:'ESN Hosting Help & Support',description:'Find ESN hosting help, Discord bot troubleshooting, account and billing guidance, setup resources, and official support channels before opening a ticket.',index:true},
  '/business/setup':{label:'ESN Bot Setup Guides',title:'Host Python and Node.js Discord Bots | ESN Guides',description:'A practical checklist for hosting Python or Node.js Discord bots: startup commands, file uploads, dependencies, token safety and troubleshooting.',index:true},
  '/hosting/vps':{
    label:'ESN Bot Hosting',
    title:'ESN Hosting Plans from $0.50/mo | Bots, Minecraft, Games & Web',
    description:'Compare every ESN Hosting plan by RAM, CPU and storage: Discord bots, Pro Minecraft servers up to 16 GB, game servers, web hosting and VPS-lite.',
    index:true,
  },
  '/site-builder':{
    label:'ESN Website Builder',
    title:'ESN Website Builder | Build a Site for Your Free Subdomain',
    description:'Create a website for your ESN subdomain with a prompt-driven builder, editable sections, live phone and desktop previews, HTML export, and safe publishing.',
    index:true,
  },
  '/domains':{
    label:'ESN Hosting',
    title:'ESN Hosting | Free Subdomains, Custom Domains & Web Hosting',
    description:'ESN hosting and domain requests now use the free-subdomain and hosting portal.',
    canonical:'/hosting',
    index:false,
  },
  '/storesmp':{
    label:'SMP Store',
    title:'ESN SMP Store | Minecraft Keys, Relics & Bundles',
    description:'Browse official ESN SMP digital items and bundles, including Realm 100 Keys, Season Pass relics, Riftwalker, Immortal Warden, and the Exclusives Mega Bundle.',
    index:true,
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
    description:'Join ESN SMP at play.esnoffical.com using Java port 25565 or Bedrock/Xbox port 19132, with current connection details for the ES Network SMP.',
    index:true,
  },
  '/smpconsole':{
    label:'Console Connection',
    title:'Join ESN SMP on Console | Xbox, PlayStation & Switch Guide',
    description:'Follow the ESN SMP console connection guide for Xbox, PlayStation, and Nintendo Switch using Bedrock Connect and the current ESN server address.',
    index:true,
  },
  '/smpplugin':{
    label:'ESNSMP Plugin',
    title:'ESNSMP Plugin Download | ES Network Minecraft Plugin',
    description:'Download ESNSMP v2.15.0 Realm Ascension: realm worlds, quests, mastery, factions, dungeons, raids, events, pets, mounts, PvP and endgame progression.',
    index:true,
  },
  '/smp/realm-ascension':{
    label:'Realm Ascension',
    title:'ESN SMP Realm Ascension | Realms, Quests, Raids & Mastery',
    description:'ESN SMP Realm Ascension v2.15.0: eight realm worlds, story quests, mastery, factions, dungeons, raids, bosses, pets, mounts, PvP and Shattered Realm.',
    index:true,
  },
  '/analytics':{
    label:'ESN Analytics',
    title:'ESN Website Analytics | Private Staff Dashboard',
    description:'Private first-party ES Network website analytics dashboard.',
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
    title:'ESN SMP Encyclopedia | Commands, Bosses & Progression',
    description:'Search ESN SMP commands and learn the current ESNSMP systems for Realm progression, economy, bosses, crates, gear, travel, seasons, and Adventure content.',
    index:true,
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
    description:'Explore the ES Network Nexus with XP, missions, achievements, Arcade competition, live activity, events, 3D systems, and the ESN Guide.',
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
    title:'ESN Reward Vault | Shards, Cosmetics & Inventory',
    description:'Spend locally earned ESN Network Shards on account-free cosmetic unlocks and manage a device-local ESN identity card.',
    index:true,
  },
  '/challenges':{
    label:'Challenge Lab',
    title:'ESN Arcade Challenge Lab | Share Game Challenges',
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
    description:'Run ES Network diagnostics for browser connectivity, storage, notifications, service workers, cache, SMP telemetry, plugin releases, and Discord.',
    index:true,
  },
  '/smpcheck':{
    label:'SMP Connection Tester',
    title:'ESN SMP Connection Tester | Server, Port & Telemetry Check',
    description:'Test the current ESN SMP hostname, port, website reachability, public Minecraft telemetry, plugin release channel, and Discord connection from one page.',
    index:true,
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
  '/rules':{
    label:'Rules',
    title:'Rules & Acceptable Use | ESN Hosting',
    description:'The rules for using ESN Hosting: what is not allowed on our servers and what happens if the rules are broken.',
    index:true,
  },
  '/faq':{
    label:'FAQ',
    title:'ES Network FAQ | Services, SMP, Ordering & Support',
    description:'Get answers about ES Network services, Discord ordering and support, ESN SMP purchases, console access, browser tools, and community access.',
    index:true,
  },
  '/launchpad':{
    label:'ESN Launchpad',
    title:'ESN Launchpad | Start Anywhere in ES Network',
    description:'Choose the fastest route into ES Network for services, SMP, Arcade, tools, search, or network status without creating an account.',
    index:true,
  },
  '/configure':{
    label:'Service Configurator',
    title:'ESN Service Configurator | Build a Project Brief',
    description:'Build a local ES Network project brief for website, editing, Discord, coaching, branding, or custom work before opening a support ticket.',
    index:true,
  },
  '/smp-hub':{
    label:'Live SMP World Hub',
    title:'ESN SMP World Hub | Live Server Status & Minecraft Links',
    description:'View ESN SMP public telemetry, player data when available, plugin release status, verified connection details, and direct SMP resources.',
    index:true,
  },
  '/trust':{
    label:'Trust Center',
    title:'ESN Trust Center | Official Links, Privacy & Payment Safety',
    description:'Review official ES Network access paths, payment safety, local browser privacy, no-account features, support, and operational transparency.',
    index:true,
  },
  '/search':{
    label:'Search 2.0',
    title:'Search ES Network | Services, SMP Items, Tools & Pages',
    description:'Search ES Network pages, services, SMP items, FAQs, tools, releases, and platform features from one local search experience.',
    index:true,
  },
  '/labs':{
    label:'ESN Labs',
    title:'ESN Labs | Local Beta Experience Controls',
    description:'Try optional ES Network presentation experiments stored only on this browser without an account.',
    index:false,
  },
  '/estimate':{
    label:'Project Estimate',
    title:'ESN Project Estimate | Websites, Editing & Discord',
    description:'Estimate ES Network project complexity and scope before opening a service ticket. Final pricing and delivery are confirmed separately.',
    index:true,
  },
  '/smp-items':{
    label:'SMP Item Encyclopedia',
    title:'ESN SMP Items | Warden, Riftwalker, Relics & More',
    description:'Search current ESN SMP store bundles and their published item contents, including Warden, Riftwalker, Season Pass relics, keys, and Void gear.',
    index:true,
  },
  '/activity':{
    label:'Network Activity',
    title:'ESN Network Activity | Website Releases & Local Recents',
    description:'Review recent ES Network platform milestones alongside route history stored locally on this device without an account.',
    index:true,
  },
  '/share-generator':{
    label:'Share Generator 2.0',
    title:'ESN Share Generator | QR Codes & Network Links',
    description:'Create share-ready ES Network URLs and QR targets for ESN, the SMP, Arcade, tools, Website Builder, and services.',
    index:true,
  },
  '/showcase':{
    label:'Builder Showcase',
    title:'ESN Website Builder Showcase | Published ESN Sites',
    description:'Browse real websites currently published through the ESN Website Builder and open the builder to create your own.',
    index:true,
  },
  '/network-map':{
    label:'Interactive Network Map',
    title:'ESN Network Map | Explore the Entire ES Network',
    description:'Explore ES Network as one connected platform across services, SMP, Arcade, tools, search, support, sharing, and website creation.',
    index:true,
  },
  '/backup':{
    label:'Local Backup + Restore',
    title:'ESN Local Backup & Restore | No Account Required',
    description:'Export and restore ES Network browser-stored preferences, favorites, local progress, and settings without creating an account.',
    index:false,
  },
  '/minecraft-server':{
    label:'Minecraft Server',
    title:'Minecraft Server | ESN SMP Server, Status & Connection',
    description:'Explore the ESN Minecraft server with current SMP status, server resources, progression guides, item information, and official ES Network links.',
    index:true,
  },
  '/minecraft-smp':{
    label:'Minecraft SMP',
    title:'Minecraft SMP | ESN Survival, Progression, Bosses & Economy',
    description:'Explore ESN SMP survival, Realm progression, economy, bosses, custom gear, Adventure systems, server resources, and current ES Network information.',
    index:true,
  },
  '/fortnite-coaching':{
    label:'Fortnite Coaching',
    title:'Fortnite Coaching for Better Gameplay | ES Network',
    description:'Explore ES Network Fortnite coaching focused on practical improvement, stronger decisions, consistency, and a clear project brief before ordering.',
    index:true,
  },
  '/video-editing':{
    label:'Video Editing',
    title:'Video Editing Services for Creators | ES Network',
    description:'Explore ES Network creator video editing support for gaming and digital content, with clear project scoping and official Discord-based ordering.',
    index:true,
  },
  '/services':{
    label:'Professional Services',
    title:'Discord Server Setup, Custom Bots & Game Servers | ESN',
    description:'Fixed-price Discord server setup from $25, a two-server package for $50, plus bots, live alerts and Minecraft server setup by the ESN team.',
    index:true,
  },
  '/guardian':{
    label:'ESN Guardian',
    title:'ESN Guardian Discord Bot: Setup Dashboard & Commands | ESN',
    description:'ESN Guardian is the all-in-one security, verification and community Discord bot. Add it free, follow the setup checklist and search every public command.',
    index:true,
  },
  '/thanks':{
    label:'Thank You',
    title:'Thanks for Your Purchase | ESN',
    description:'Your ESN payment went through. Next steps for services and SMP store items, how to get help in Discord, and an optional tip of any amount.',
    index:false,
  },
  '/discord-server-setup':{
    label:'Discord Server Setup',
    title:'Discord Server Setup for Gaming Communities | ES Network',
    description:'Explore ES Network Discord setup services for channels, roles, onboarding, moderation, community structure, and custom project requirements.',
    index:true,
  },
  '/website-builder':{
    label:'Website Builder',
    title:'Website Builder | Build and Publish with ES Network',
    description:'Build, preview, edit, share, and publish a website with the ESN Website Builder under the official ES Network /sites path.',
    index:true,
  },
  '/free-browser-tools':{
    label:'Free Browser Tools',
    title:'Free Browser Tools for Creators & Gamers | ES Tools',
    description:'Use free ES Network browser utilities including prompt tools, focus timer, challenge generator, random picker, coin flip, dice, and estimates.',
    index:true,
  },
  '/es-network':{
    label:'ES Network',
    title:'ES Network (ESN) | Gaming, Creator Services, SMP & Web Tools',
    description:'Learn what ES Network is and explore ESN creator services, Minecraft SMP, browser games, free tools, website projects, and official community access.',
    index:true,
  },
  '/guides':{
    label:'ESN Guides',
    title:'ESN Guides | Minecraft, Discord, Websites & Creator Help',
    description:'Read practical ES Network guides for Minecraft custom servers, SMP progression, gaming Discord setup, creator websites, and ESN resources.',
    index:true,
  },
  '/guides/join-minecraft-server-xbox':{
    label:'Xbox Minecraft Server Guide',
    title:'How to Join a Custom Minecraft Server on Xbox | ESN Guide',
    description:'Understand the custom-server limitation on Xbox Bedrock and find current ESN Minecraft server connection resources and troubleshooting paths.',
    index:true,
  },
  '/guides/join-minecraft-server-playstation':{
    label:'PlayStation Minecraft Server Guide',
    title:'How to Join a Custom Minecraft Server on PlayStation | ESN',
    description:'Learn why PlayStation Bedrock custom servers need a different connection flow and where to find current ESN server details and status.',
    index:true,
  },
  '/guides/minecraft-smp-beginner-guide':{
    label:'Minecraft SMP Beginner Guide',
    title:'Minecraft SMP Beginner Guide | What to Do First on ESN SMP',
    description:'Learn the first commands, progression systems, travel, claims, economy, and official resources useful when starting on ESN SMP.',
    index:true,
  },
  '/guides/gaming-discord-server-guide':{
    label:'Gaming Discord Server Guide',
    title:'How to Organize a Gaming Discord Server | ESN Guide',
    description:'Plan roles, channels, onboarding, moderation, support, and community structure for a gaming Discord server.',
    index:true,
  },
  '/guides/creator-website-guide':{
    label:'Creator Website Guide',
    title:'How to Plan a Creator Website Before You Build It | ESN',
    description:'Plan a creator website around one goal, strong information order, mobile-first design, useful pages, and a clear call to action.',
    index:true,
  },
  '/smp/riftwalker':{
    label:'Riftwalker Bundle',
    title:'ESN Riftwalker Bundle | Riftblade, Wings, Bow & More',
    description:'Explore the current published ESN Riftwalker Bundle contents, including Riftblade, Rift Wings, Phase Boots, Rift Bow, Rift Core, and Void Compass.',
    index:true,
  },
  '/smp/immortal-warden':{
    label:'Immortal Warden Bundle',
    title:'ESN Immortal Warden Bundle | Armor, Blade, Bow & Core',
    description:'Explore the current published Immortal Warden Bundle contents for the ESN SMP, including armor, Warden Blade, Longbow, Core, and Totem.',
    index:true,
  },
  '/smp/void-warrior':{
    label:'Void Warrior Set',
    title:'ESN Void Warrior Set | In the $1.99 Exclusives Mega Bundle',
    description:'The ESN SMP Void Warrior set (crown, chestplate, leggings, boots, blade) comes in the ESN Exclusives Mega Bundle with Lightning King and Immortal Warden.',
    index:true,
  },
  '/smp/realm-100':{
    label:'Realm 100 Keys',
    title:'ESN Realm 100 Keys | SMP Progression & Store Information',
    description:'Learn about Realm 100 keys in the current ESN SMP store and progression surface and find the official store and SMP resources.',
    index:true,
  },
  '/smp/season-pass':{
    label:'Season Pass Relics',
    title:'ESN Season Pass Relics | Wings, Scepter, Crystal & More',
    description:'Explore the six current ESN Season Pass relic bundle items: Angel Wings, Inferno Scepter, Storm Crystal, Tideheart, Void Relic, and Celestial Star.',
    index:true,
  },
  '/smp/world-bosses':{
    label:'SMP Boss Systems',
    title:'ESN SMP Boss Systems | Bosses, Raids, Dungeons & Endgame',
    description:'Explore ESNSMP boss and endgame systems including boss drops, summoning, dungeons, raids, codex progression, artifacts, pets, and trials.',
    index:true,
  },
  '/visibility':{
    label:'Visibility Diagnostics',
    title:'ESN Visibility Diagnostics',
    description:'Local privacy-friendly ESN referral and page-view diagnostics for this browser.',
    index:false,
  },
}

export const FAQ_SCHEMA=[
  ['What is ES Network?','ES Network (ESN) is the current brand. EP1C Services was the former name and is not a separate current organization or division.'],
  ['What services does ESN offer?','ESN Hosting (Discord bot, game server, web and VPS-lite hosting), Fortnite coaching, editing services, Discord server setups, and selected digital or website projects handled through ESN.'],
  ['How do I order a service?','Service ordering and support are handled through the official ESN Discord. Open a ticket and provide the details of what you need.'],
  ['How much does ESN Hosting cost?','Discord bot hosting starts at $0.50/month (Nano). There are 33 plans in all: bot plans up to Gift at $14.99/month, new Pro Minecraft plans with 8, 12 or 16 GB RAM from $9.99/month, plus game server, web and VPS-lite plans. Many plans can also be paid yearly. See all plans on the Bot Hosting page.'],
  ['How do I buy hosting and how fast is setup?','Go to panel.esnoffical.com/plans, sign in (or create an account), pick a plan and pay on Stripe’s secure checkout. Your server is set up automatically after you pay and shows up on your panel dashboard.'],
  ['Do I need an account to buy hosting?','Yes, an ESN panel account. You can create one yourself on the panel sign-in page with New here? Create an account. Your server is tied to that account.'],
  ['Where can I check if ESN Hosting is up?','The live status page at status.esnoffical.com shows the panel, the hosting nodes, the website and the SMP, checked every minute.'],
  ['Where can I get help with my server?','Start with the hosting docs at docs.esnoffical.com. You can also use the chat bubble on this website or the panel, or open a ticket in the ESN Hosting Discord.'],
  ['How do SMP purchases get delivered?','Enter your exact in-game Minecraft username at Stripe checkout. The buyer should be online on the SMP for automatic delivery. If your server username starts with a period, include the period at the beginning.'],
  ['Are ES Tools paid?','ES Tools are intended to be free browser-based utilities. They do not require an account and are not supposed to save your personal data.'],
  ['Can console players join the ESN SMP?','Yes. Xbox, PlayStation, and Nintendo Switch generally need a third-party-server workaround because Minecraft console editions do not expose a normal Add Server field. Use the Console Connection page for ESN server details and guidance.'],
  ['Where can I join the ESN community?','Use the official Discord link anywhere on this website to join the ES Network community.'],
]

// Monthly prices of every plan on /hosting/vps (keep in sync with src/Hosting.jsx BOT_PLANS + MORE_PLANS).
export const HOSTING_FAQ_SCHEMA=[
  ['How fast is my server ready?','Your server is set up automatically after payment, and your panel login is sent to you. Log in at panel.esnoffical.com.'],
  ['Can I cancel?','Yes. Use the Stripe billing portal to cancel at the end of your billing period, update your card, or download invoices.'],
  ['Which languages can my bot use?','Bot plans support Python and Node.js. You choose the runtime at checkout and can change startup settings in the panel.'],
  ['Is VPS-lite a full VPS?','No. It is a Linux container with a shell in the panel console, SFTP and one public port. There is no root, apt, systemd or Docker inside.'],
  ['Where do I get help?','Open a ticket in our Discord, read the Hosting Docs, or check Live Uptime for service status.'],
  ['Are backups included?','Plans don’t include backup slots by default. A daily backups add-on is available, just ask in our Discord. You can always download your files with the file manager or SFTP.'],
  ['Can I move my bot from another host?','Yes. The free importer and the step-by-step guide in the Hosting Docs help you move from Replit, Railway, Heroku, a VPS or another host.'],
  ['Where are the servers?','ESN servers are in the US, in Chicago and New York.'],
]

const HOSTING_OFFER_SCHEMA=[
  ['ESN Nano','0.50','esn-nano'],
  ['ESN Micro','0.65','esn-micro'],
  ['ESN Starter','0.75','esn-starter'],
  ['ESN Basic','0.99','esn-basic'],
  ['ESN Plus','1.29','esn-plus'],
  ['ESN Advanced','1.79','esn-advanced'],
  ['ESN Pro','2.49','esn-pro'],
  ['ESN Elite','4.49','esn-elite'],
  ['ESN Ultra','6.99','esn-ultra'],
  ['ESN Boost','7.99','esn-boost'],
  ['ESN Extreme','7.99','esn-extreme'],
  ['ESN Titan','10.99','esn-titan'],
  ['ESN Max','13.49','esn-max'],
  ['ESN Gift','14.99','esn-gift'],
  ['ESN Pro 8GB','9.99','esn-pro-8gb'],
  ['ESN Pro 12GB','14.99','esn-pro-12gb'],
  ['ESN Pro 16GB','19.99','esn-pro-16gb'],
  ['ESN Core','2.19','esn-core'],
  ['ESN Turbo','3.49','esn-turbo'],
  ['ESN Power','5.49','esn-power'],
  ['ESN Terraria','1.29','esn-terraria'],
  ['ESN Factorio','1.79','esn-factorio'],
  ['ESN Valheim','4.49','esn-valheim'],
  ['ESN Palworld','8.99','esn-palworld'],
  ['ESN Unturned','1.99','esn-unturned'],
  ['ESN Zomboid','4.99','esn-zomboid'],
  ['ESN FiveM','5.99','esn-fivem'],
  ['ESN Web','1.19','esn-web-1gb'],
  ['ESN VPS-lite 512MB','1.49','esn-vps-512mb'],
  ['ESN VPS-lite 1GB','1.99','esn-vps-1gb'],
  ['ESN VPS-lite 2GB','3.99','esn-vps-2gb'],
  ['ESN VPS-lite 4GB','6.99','esn-vps-4gb'],
  ['ESN VPS-lite 8GB','14.99','esn-vps-8gb'],
]

export const SERVICE_SCHEMA=[
  ['Fortnite Coaching','Focused coaching built around practical improvement, stronger decision-making, and better in-game consistency.','/serviceshowcase#fortnite-coaching'],
  ['Editing Services','Editing support for creators who want sharper, cleaner content built for their platform and audience.','/serviceshowcase#editing-services'],
  ['Discord Server Setups','Structured Discord setups designed around roles, channels, moderation, onboarding, and community growth.','/serviceshowcase#discord-server-setups'],
]

export const SERVICE_PAGE_SCHEMA={
  '/services':{name:'ESN Professional Services',serviceType:'Discord server setup, custom Discord bot development and game server setup'},
  '/fortnite-coaching':{name:'Fortnite Coaching',serviceType:'Fortnite coaching and gameplay improvement'},
  '/video-editing':{name:'Video Editing Services',serviceType:'Creator video editing'},
  '/discord-server-setup':{name:'Discord Server Setup',serviceType:'Discord community setup and organization'},
  '/hosting':{name:'ESN Hosting',serviceType:'Website hosting and domain connection support'},
}

export const WEB_APP_SCHEMA={
  '/website-builder':{name:'ESN Website Builder',description:'Build, preview, edit, share, and publish a website with ES Network.'},
  '/site-builder':{name:'ESN Website Builder',description:'Prompt-driven website builder with editable sections, responsive previews, HTML export, and ESN publishing.'},
}

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
  {name:'ESN Riftwalker Bundle',price:'1.00',description:'An ESN SMP mobility and utility bundle with Riftblade, Rift Wings, Phase Boots, Rift Bow, Rift Core, and Void Compass.',path:'/storesmp#product-esn-riftwalker-bundle',available:true},
  {name:'ESN Immortal Warden Bundle',price:'1.30',description:'An eight-item Warden-themed ESN SMP combat bundle.',path:'/storesmp#product-esn-immortal-warden-bundle',available:true},
  {name:'ESN Exclusives Mega Bundle',price:'1.99',description:'All three ESN SMP exclusive sets in one checkout: Lightning King, Immortal Warden and Void Warrior. 20 items.',path:'/storesmp#product-esn-exclusives-mega-bundle',available:true},
  {name:'Ultimate Legend Bundle',price:'49.99',description:'Every ESN SMP exclusive (all 76), 6 season relics and 6 kill effects, the OVERLORD and LEGEND ranks, the Season 2 Frostfall Premium Pass, 1,375 Cosmetic Tokens, 20 Crate Keys, 40 Realm 100 Keys and 5 Enchant Reroll Tickets. One-time payment.',path:'/storesmp#product-ultimate-legend-bundle',available:true},
  {name:'ALL Exclusives Bundle',price:'29.99',description:'Every ESN SMP exclusive item (76 in all), 6 season relics and 6 kill effects, 175 Cosmetic Tokens, 5 Crate Keys and 20 Realm 100 Keys. One-time payment.',path:'/storesmp#product-all-exclusives-bundle',available:true},
  {name:'Mythic Bundle',price:'19.99',description:'All 32 Exclusives 20 items, 5 legendary sets, the TITAN rank, the Season 2 Frostfall Premium Pass, 175 Cosmetic Tokens, 5 Crate Keys and 20 Realm 100 Keys. One-time payment.',path:'/storesmp#product-mythic-bundle',available:true},
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

export const GUIDE_SCHEMA_DETAILS={
  '/guides/join-minecraft-server-xbox':{headline:'How to join a custom Minecraft server on Xbox',datePublished:'2026-09-29',dateModified:'2026-09-29'},
  '/guides/join-minecraft-server-playstation':{headline:'How to join a custom Minecraft server on PlayStation',datePublished:'2026-09-29',dateModified:'2026-09-29'},
  '/guides/minecraft-smp-beginner-guide':{headline:'Minecraft SMP beginner guide: what to do first',datePublished:'2026-09-29',dateModified:'2026-09-29'},
  '/guides/gaming-discord-server-guide':{headline:'How to organize a gaming Discord server',datePublished:'2026-09-29',dateModified:'2026-09-29'},
  '/guides/creator-website-guide':{headline:'How to plan a creator website before you build it',datePublished:'2026-09-29',dateModified:'2026-09-29'},
}

export const CONSOLE_HOWTO_STEPS=[
  ['Open Bedrock Connect on your phone','Open the Bedrock Connect method used by the ESN console guide and keep the phone on the same network as the console.'],
  ['Open Custom','Choose Custom inside Bedrock Connect.'],
  ['Tap the + button','Create a new custom server entry.'],
  ['Enter the ESN SMP details','Use server name ESN SMP, address play.esnoffical.com, and Bedrock port 19132.'],
  ['Save the server','Save the custom server entry.'],
  ['Select ESN SMP','Select the ESN SMP entry you created.'],
  ['Press Add & Start','Start the Bedrock Connect console connection process.'],
  ['Finish on your console','Open Minecraft on Xbox, PlayStation, or Nintendo Switch and complete the connection flow.'],
]

// GitHub Pages serves each prerendered route as /route/index.html and redirects
// /route to /route/, so the trailing slash is dropped before the route lookup.
// Without this, every page opened from a link or search fell back to the generic
// "ES Network" title with a noindex robots tag once the app loaded.
export function normalizePath(pathname){
  const path=(pathname||'/').replace(/\/+$/,'')
  return path||'/'
}

export function getSeo(pathname){
  const path=normalizePath(pathname)
  return SEO_ROUTES[path]||{
    label:'ES Network',
    title:'ES Network',
    description:'Official ES Network website.',
    canonical:path,
    index:false,
  }
}

export function canonicalPath(pathname){
  const meta=getSeo(pathname)
  return meta.canonical??normalizePath(pathname)
}

export function canonicalUrl(pathname){
  const path=canonicalPath(pathname)
  // GitHub Pages serves each prerendered route as <route>/index.html and 301s /route to /route/, so the canonical URL ends with a slash.
  return SITE_URL+(path==='/'?'/':path.replace(/\/+$/,'')+'/')
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
      description:'ES Network provides creator and gaming services and operates the ESN SMP, ESN Arcade, ES Tools, website projects, and community experiences.',
      sameAs:['https://github.com/sheldonrocks2022-cmyk','https://github.com/sheldonrocks2022-cmyk/ESN-Website','https://www.trustpilot.com/review/esnoffical.com','https://discord.gg/RGPt3zEfGy','https://www.youtube.com/@esnexplains','https://www.tiktok.com/@esnexplains'],
      brand:{'@type':'Brand',name:'ES Network',alternateName:'ESN'},
      knowsAbout:['Discord bot hosting','Game server hosting','Minecraft SMP','Fortnite coaching','Video editing','Discord server setup','Website creation','Browser games','Creator tools'],
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
      primaryImageOfPage:{'@type':'ImageObject',url:socialImageFor(pathname),width:1200,height:630},
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

  if(GUIDE_SCHEMA_DETAILS[pathname]){
    const article=GUIDE_SCHEMA_DETAILS[pathname]
    graph.push({
      '@type':'Article',
      '@id':url+'#article',
      headline:article.headline,
      description:meta.description,
      datePublished:article.datePublished,
      dateModified:article.dateModified,
      author:{'@id':SITE_URL+'/#organization'},
      publisher:{'@id':SITE_URL+'/#organization'},
      mainEntityOfPage:{'@id':url+'#webpage'},
      image:socialImageFor(pathname),
    })
  }

  if(canonicalPath(pathname)==='/'){
    graph.push({
      '@type':'FAQPage',
      '@id':url+'#home-faq',
      mainEntity:HOME_FAQ.map(([question,answer])=>({
        '@type':'Question',
        name:question,
        acceptedAnswer:{'@type':'Answer',text:answer},
      })),
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

  if(canonicalPath(pathname)==='/hosting/vps'){
    graph.push({
      '@type':'FAQPage',
      '@id':url+'#hosting-faq',
      mainEntity:HOSTING_FAQ_SCHEMA.map(([question,answer])=>({
        '@type':'Question',
        name:question,
        acceptedAnswer:{'@type':'Answer',text:answer},
      })),
    })
  }

  if(canonicalPath(pathname)==='/hosting/vps'){
    graph.push({
      '@type':'OfferCatalog',
      '@id':url+'#hosting-plans',
      name:'ESN Hosting plans',
      itemListElement:HOSTING_OFFER_SCHEMA.map(([name,price,slug])=>({
        '@type':'Offer',
        name,
        price,
        priceCurrency:'USD',
        url:slug?'https://panel.esnoffical.com/plans?buy='+slug:'https://panel.esnoffical.com/plans',
        availability:'https://schema.org/InStock',
        seller:{'@id':SITE_URL+'/#organization'},
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

  if(SERVICE_PAGE_SCHEMA[pathname]){
    const service=SERVICE_PAGE_SCHEMA[pathname]
    graph.push({
      '@type':'Service',
      '@id':url+'#service',
      name:service.name,
      serviceType:service.serviceType,
      description:meta.description,
      url,
      provider:{'@id':SITE_URL+'/#organization'},
      areaServed:'Worldwide',
    })
  }

  if(WEB_APP_SCHEMA[pathname]){
    const app=WEB_APP_SCHEMA[pathname]
    graph.push({
      '@type':'WebApplication',
      '@id':url+'#webapp',
      name:app.name,
      description:app.description,
      url,
      applicationCategory:'DesignApplication',
      operatingSystem:'Web Browser',
      isAccessibleForFree:true,
      publisher:{'@id':SITE_URL+'/#organization'},
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
      downloadUrl:SITE_URL+'/downloads/ESNSMP.jar',
      softwareVersion:'v2.15.0',
      applicationCategory:'DeveloperApplication',
      operatingSystem:'Minecraft Paper-compatible server',
      isAccessibleForFree:true,
      publisher:{'@id':SITE_URL+'/#organization'},
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
      identifier:'play.esnoffical.com:25565',
      game:{'@type':'VideoGame',name:'Minecraft'},
      description:'Java: play.esnoffical.com:25565 • Bedrock/Xbox: play.esnoffical.com:19132',
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
