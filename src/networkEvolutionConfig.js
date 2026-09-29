export const NETWORK_EVOLUTION_VERSION='ESN Network Evolution 12X'

export const NETWORK_TAKEOVER={
  id:'network-evolution-12x-2026-09-27',
  active:true,
  kicker:'ES NETWORK // MAJOR SYSTEM UPDATE',
  title:'NETWORK EVOLUTION IS LIVE',
  copy:'Missions, Passport progression, Terminal commands, universal search, seasonal events, customizable shortcuts, achievement cards, live event tracking, and rare network anomalies are now active.',
  actionLabel:'ENTER THE NETWORK',
}

export const SEASONAL_EVENTS=[
  {months:[8],key:'equinox',label:'EQUINOX SIGNAL',copy:'Late-season cyan + violet signal shift active.'},
  {months:[9],key:'blackout',label:'BLACKOUT SEASON',copy:'October Blackout visual layer active.'},
  {months:[10],key:'frost',label:'FROST SIGNAL',copy:'Cold-season network lighting active.'},
  {months:[11,0],key:'winter',label:'WINTER NETWORK',copy:'Winter ESN signal layer active.'},
  {months:[1,2],key:'rift',label:'RIFT SEASON',copy:'Rift-spectrum network lighting active.'},
  {months:[3,4],key:'spring',label:'SPRING CORE',copy:'Spring network energy active.'},
  {months:[5,6,7],key:'summer',label:'SUMMER OVERDRIVE',copy:'Summer network overdrive active.'},
]

export const MISSIONS=[
  {id:'network-tour',title:'Network Tour',copy:'Visit Services, Arcade, SMP, and ES Tools.',xp:80,type:'routes',targets:['/serviceshowcase','/arcade','/smpconnection','/estools']},
  {id:'status-check',title:'Systems Check',copy:'Open the Live Network Status Center.',xp:35,type:'routes',targets:['/status']},
  {id:'release-reader',title:'Read the Logs',copy:'Visit the ESN Release Center.',xp:35,type:'routes',targets:['/updates']},
  {id:'arcade-launch',title:'Launch Sequence',copy:'Open any original ESN Arcade game.',xp:50,type:'any-route',targets:['/esclicker','/esfactory','/esmines','/esmoto','/estower','/estowerdefense']},
  {id:'secret-hunter',title:'Signal Hunter',copy:'Discover at least 3 hidden Easter eggs.',xp:75,type:'eggs',target:3},
  {id:'terminal-user',title:'Operator Access',copy:'Run a command in the ESN Terminal.',xp:40,type:'flag',target:'esn_terminal_used'},
  {id:'search-user',title:'Network Search',copy:'Use Universal ESN Search.',xp:30,type:'flag',target:'esn_search_used'},
  {id:'deck-builder',title:'Command Deck Builder',copy:'Customize your personal shortcut deck.',xp:45,type:'flag',target:'esn_deck_customized'},
]

export const SEARCH_INDEX=[
  {label:'Home',meta:'ES Network digital hub',path:'/',category:'Network'},
  {label:'Service Showcase',meta:'Fortnite coaching, editing, Discord setups, websites',path:'/serviceshowcase',category:'Services'},
  {label:'Portfolio',meta:'ESN service before/after demos',path:'/portfolio',category:'Services'},
  {label:'Verified Reviews',meta:'35 verified ESN customer reviews',path:'/testimonials',category:'Services'},
  {label:'ESN SMP Connection',meta:'Minecraft server connection details',path:'/smpconnection',category:'SMP'},
  {label:'SMP Console Guide',meta:'Xbox, PlayStation, and Switch connection help',path:'/smpconsole',category:'SMP'},
  {label:'ESNSMP Plugin',meta:'Public plugin download and release',path:'/smpplugin',category:'SMP'},
  {label:'SMP Encyclopedia',meta:'Search ESNSMP systems and commands',path:'/smpguide',category:'SMP'},
  {label:'SMP Store',meta:'Official ESN SMP products',path:'/storesmp',category:'SMP'},
  {label:'ESN Arcade',meta:'Six original browser games',path:'/arcade',category:'Arcade'},
  {label:'ES Clicker',meta:'Original Arcade game',path:'/esclicker',category:'Arcade'},
  {label:'ES Factory',meta:'Original Arcade game',path:'/esfactory',category:'Arcade'},
  {label:'ES Mines',meta:'Original Arcade game',path:'/esmines',category:'Arcade'},
  {label:'ES MOTO',meta:'Original Arcade game',path:'/esmoto',category:'Arcade'},
  {label:'ES Tower',meta:'Original Arcade game',path:'/estower',category:'Arcade'},
  {label:'ES Tower Defense',meta:'Original Arcade game',path:'/estowerdefense',category:'Arcade'},
  {label:'ES Tools',meta:'Free browser utilities',path:'/estools',category:'Tools'},
  {label:'Network Status',meta:'Live ESN status center and incident history',path:'/status',category:'Network'},
  {label:'Network Statistics',meta:'Live network and local progress metrics',path:'/networkstats',category:'Network'},
  {label:'Notification Center',meta:'Local ESN alerts, achievements, releases, rewards, and SMP notices',path:'/notifications',category:'Network'},
  {label:'Reward Vault',meta:'Account-free Network Shard marketplace, inventory, and local identity cosmetics',path:'/rewards',category:'Network'},
  {label:'Challenge Lab',meta:'Create and accept shareable ESN Arcade challenges without accounts',path:'/challenges',category:'Arcade'},
  {label:'ESN Store AI',meta:'Catalog-aware assistant for ESN products, services, prices, delivery, checkout, comparisons, and staff store tools',path:'/store-ai',category:'Services'},
  {label:'ESN Hosting',meta:'Get a free ESN subdomain, connect your own domain, or join the full web-hosting waitlist',path:'/hosting',category:'Services'},
  {label:'Staff Dashboard',meta:'Code-gated ESN operator console and local network notice controls',path:'/staff',category:'Network'},
  {label:'Operations Map',meta:'Connected ESN system map with website, SMP, Arcade, Terminal, Store, Nexus, and Staff status',path:'/operations',category:'Network'},
  {label:'Diagnostic Center',meta:'Run account-free browser, cache, service worker, SMP, plugin, and Discord checks',path:'/diagnostics',category:'Help'},
  {label:'SMP Connection Tester',meta:'Test ESN SMP address, port, public telemetry, plugin release, and website reachability',path:'/smpcheck',category:'SMP'},
  {label:'System Blueprint',meta:'Interactive diagram explaining how major ESN website systems connect',path:'/blueprint',category:'Network'},
  {label:'Incident History',meta:'View staff-published local incident history and resolution state',path:'/incidents',category:'Network'},
  {label:'Session Stats',meta:'View current local ESN visit time, routes, Arcade XP, Terminal commands, and hidden signals',path:'/session',category:'Network'},
  {label:'Network Changelog',meta:'Animated major ESN release timeline with system filters',path:'/changelog',category:'Updates'},
  {label:'Release Center',meta:'Website, SMP, Arcade, and network update logs',path:'/updates',category:'Updates'},
  {label:"What's New",meta:'Changes since your last visit',path:'/whatsnew',category:'Updates'},
  {label:'Interactive Timeline',meta:'Explore ESN eras',path:'/timeline',category:'About'},
  {label:'Explore ESN',meta:'Feature discovery, recents, and favorites',path:'/explore',category:'Network'},
  {label:'Media Gallery',meta:'Official ESN visuals and milestones',path:'/gallery',category:'Media'},
  {label:'Performance & Accessibility',meta:'Performance, motion, contrast, text, and install controls',path:'/settings',category:'Help'},
  {label:'Report a Problem',meta:'Build a diagnostic website bug report',path:'/support',category:'Help'},
  {label:'Leadership',meta:'ES Network team',path:'/leadership',category:'About'},
  {label:'About ES Network',meta:'What ESN is and what it does',path:'/about',category:'About'},
  {label:'FAQ',meta:'Quick answers and support information',path:'/faq',category:'Help'},
  {label:'Share Deck',meta:'Create ESN share cards',path:'/share',category:'Network'},
  {label:'Vault',meta:'Hidden ESN network layer',path:'/vault',category:'Network'},
]

export const DECK_DESTINATIONS=[
  {id:'smp',label:'SMP',path:'/smpconnection',glyph:'⬡'},
  {id:'arcade',label:'Arcade',path:'/arcade',glyph:'A'},
  {id:'tools',label:'Tools',path:'/estools',glyph:'T'},
  {id:'updates',label:'Updates',path:'/updates',glyph:'U'},
  {id:'status',label:'Status',path:'/status',glyph:'●'},
  {id:'services',label:'Services',path:'/serviceshowcase',glyph:'S'},
  {id:'share',label:'Share',path:'/share',glyph:'↗'},
  {id:'timeline',label:'Timeline',path:'/timeline',glyph:'◫'},
  {id:'notifications',label:'Alerts',path:'/notifications',glyph:'!'},
  {id:'rewards',label:'Rewards',path:'/rewards',glyph:'R'},
  {id:'challenges',label:'Challenge',path:'/challenges',glyph:'C'},
  {id:'store-ai',label:'Store AI',path:'/store-ai',glyph:'AI'},
  {id:'domains',label:'Domains',path:'/domains',glyph:'DNS'},
  {id:'operations',label:'Ops',path:'/operations',glyph:'O'},
  {id:'diagnostics',label:'Diagnose',path:'/diagnostics',glyph:'D'},
  {id:'session',label:'Session',path:'/session',glyph:'S'},
]

export const SMP_EVENT_BOARD=[
  {type:'SMP',status:'LIVE',title:'ESN SMP Network',copy:'Server access is active at esn.ggwp.cc:17058.',to:'/smpconnection'},
  {type:'WEBSITE',status:'LIVE',title:'Network Evolution 12X',copy:'The major interactive website systems expansion is live.',to:'/updates'},
  {type:'EVENTS',status:'DISCORD',title:'Bosses, giveaways & timed events',copy:'No timed public event is hard-coded here; Discord remains the source of truth for new event announcements.',external:true},
  {type:'MAINTENANCE',status:'CLEAR',title:'Scheduled maintenance',copy:'No scheduled website maintenance is currently configured in the public event board.',to:'/status'},
]

export const RARE_EVENTS=[
  {key:'blackout',title:'BLACKOUT PROTOCOL',copy:'A rare visual blackout crossed the ESN Core.'},
  {key:'rift',title:'RIFT BREACH',copy:'A rare Rift signal opened across the network layer.'},
  {key:'warden',title:'WARDEN PULSE',copy:'A rare Warden resonance was detected by the ESN Core.'},
]
