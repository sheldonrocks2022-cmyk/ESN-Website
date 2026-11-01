import { useEffect, useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { DISCORD_URL, SMP_ADDRESS, SMP_PORT } from './liveNetwork'
import './visibilityExpansion.css'

const LANDINGS={
  'minecraft-server':{
    eyebrow:'MINECRAFT SERVER',
    title:'Join ESN SMP on Java or Bedrock.',
    intro:'Get the server address and ports, check its status, and browse the ESN SMP guides before joining.',
    bullets:['Live server and plugin status','Java / Bedrock-aware telemetry where available','Progression, commands, bosses, gear, and economy guides','Official ESN community and support paths'],
    primary:['Open SMP World Hub','/smp-hub'],
    secondary:['Browse SMP guides','/guides/minecraft-smp-beginner-guide'],
    related:[['SMP Item Encyclopedia','/smp-items'],['Network Status','/status'],['ESNSMP Plugin','/smpplugin']],
  },
  'minecraft-smp':{
    eyebrow:'MINECRAFT SMP',
    title:'See what ESN SMP has to offer.',
    intro:'Play survival with quests, boss fights, custom equipment, an economy, and more. Find the current server details and guides here.',
    bullets:['100-Realm progression surfaced by ESNSMP','Economy, trading, jobs, skills, quests, and titles','Boss, dungeon, raid, relic, rune, and Adventure systems','Official store items and searchable item encyclopedia'],
    primary:['Explore ESN SMP','/smp-hub'],
    secondary:['SMP beginner guide','/guides/minecraft-smp-beginner-guide'],
    related:[['SMP Encyclopedia','/smpguide'],['SMP Items','/smp-items'],['SMP Store','/storesmp']],
  },
  'fortnite-coaching':{
    eyebrow:'FORTNITE COACHING',
    title:'Fortnite coaching through ESN Systems.',
    intro:'Work on the parts of Fortnite that matter to you, from match decisions and positioning to consistency.',
    bullets:['Focused improvement instead of generic advice','Project brief builder before opening a ticket','Discord-based ordering and support','Scope is confirmed before work begins'],
    primary:['Configure coaching','/configure'],
    secondary:['Explore ESN services','/serviceshowcase'],
    related:[['Project Estimate','/estimate'],['Verified Reviews','/testimonials'],['Trust Center','/trust']],
  },
  'video-editing':{
    eyebrow:'VIDEO EDITING',
    title:'Video editing support for creators.',
    intro:'Need a video edited? Share the footage, examples, and deadline in a Discord ticket so we can discuss the work.',
    bullets:['Gaming and creator-focused editing support','Build a clear project brief before contacting ESN','Flexible project scope instead of invented fixed promises','Official Discord handoff for ordering and support'],
    primary:['Build editing brief','/configure'],
    secondary:['See service showcase','/serviceshowcase'],
    related:[['Project Estimate','/estimate'],['Portfolio','/portfolio'],['Verified Reviews','/testimonials']],
  },
  'discord-server-setup':{
    eyebrow:'DISCORD SERVER SETUP',
    title:'Discord server setup for communities and creators.',
    intro:'Need a better Discord setup? We can discuss roles, channels, welcome messages, moderation, and server organization.',
    bullets:['Role and channel organization','Moderation and onboarding planning','Community-focused structure','Custom scope confirmed through ESN support'],
    primary:['Configure Discord project','/configure'],
    secondary:['Discord setup guide','/guides/gaming-discord-server-guide'],
    related:[['Services','/serviceshowcase'],['Project Estimate','/estimate'],['Trust Center','/trust']],
  },
  'website-builder':{
    eyebrow:'WEBSITE BUILDER',
    title:'Build and publish a website with ESN.',
    intro:'Start with a description, edit the result, preview it on mobile or desktop, and publish through the ESN site builder.',
    bullets:['Prompt-driven site generation and editing','Desktop, tablet, and mobile previews','Real published-site showcase','Public /sites/yourname publishing flow'],
    primary:['Open Website Builder','/site-builder'],
    secondary:['See real showcase','/showcase'],
    related:[['Creator website guide','/guides/creator-website-guide'],['Website services','/serviceshowcase'],['Network Map','/network-map']],
  },
  'free-browser-tools':{
    eyebrow:'FREE BROWSER TOOLS',
    title:'Free ES Tools, directly in your browser.',
    intro:'Free timers, randomizers, prompt tools, and other utilities you can use right in your browser.',
    bullets:['Challenge generator','Focus timer','Prompt generator and random picker','Coin flip, dice, and website estimates'],
    primary:['Open ES Tools','/estools'],
    secondary:['Explore ESN Systems','/explore'],
    related:[['Launchpad','/launchpad'],['Search ESN','/search'],['Local Backup','/backup']],
  },
}

const GUIDES={
  "host-discord-bot-24-7":{
    title:"How to host a Discord bot 24/7 (cheaply)",
    description:"Compare your own PC, free tiers, a VPS and bot hosting, then put a Discord bot online 24/7 on ESN step by step, with your token kept safe.",
    category:"Discord Bot Guide",
    updated:'November 1, 2026',
    sections:[
      ["What \"online 24/7\" really means","A Discord bot is a program that keeps a live connection open to Discord (the gateway). Your bot shows as online only while that program is running on a computer that is switched on and connected to the internet. Close the laptop, let the PC go to sleep, or lose Wi-Fi, and the bot goes offline with it. So hosting a bot 24/7 is really one question: which computer will run your code all day, every day, and restart it when something goes wrong? There are four common answers, and each one trades money against effort."],
      ["Option 1: your own PC or a Raspberry Pi","Running the bot on your own machine costs nothing extra and is the best place to build and test it. Bots connect out to Discord, so you do not need to open ports or forward anything on your router. The catch is that the machine must stay on and awake, and the bot drops whenever your power, internet or Windows updates do. A Raspberry Pi or an old laptop left plugged in works for a small bot, but you still handle restarts, updates and backups yourself, and the electricity is not free either."],
      ["Option 2: free tiers on cloud platforms","Several platforms offer a free plan, and they are fine for experiments. Before you rely on one for a public bot, read its current limits, because free plans commonly put apps to sleep when idle, cap the hours you can run each month, ask for a card, or change their terms. Tricks that ping a sleeping app to keep it awake usually break the platform rules and still leave gaps. Many free plans also share IP addresses between lots of apps, which can lead to Discord rate limits that are not your fault."],
      ["Option 3: a VPS","A virtual private server is a Linux machine you rent and fully control. It can run several bots, a database and a website at once, and you can install anything. In exchange you are the system administrator: you secure SSH, apply updates, configure a firewall, set up a process manager such as systemd or pm2 so the bot restarts after a crash or reboot, and arrange your own backups. If you want to learn Linux, a VPS is a great teacher. If you just want the bot online, it is more work than you need."],
      ["Option 4: dedicated bot hosting","Bot hosting gives you a ready-made container for one bot with a web panel. You upload your files, choose which file starts the bot, and press Start. The host installs your packages when the server starts, shows a live console, and keeps the machine running and backed up. You give up root access, but you skip the server admin work. ESN Hosting is built for exactly this: Python, Node.js and Java bot servers, set up automatically after checkout, with plans from $0.50/month."],
      ["How much power does a bot need?","Most small bots that answer slash commands in a handful of servers use very little memory and CPU. What makes a bot hungrier is caching lots of members and messages, playing music, joining many large servers, or keeping a big database in memory. Start with a small plan, run the bot for a day with real users, then look at the memory graph on the console page. If it sits close to the limit, move up a plan. The ESN docs have a longer guide on how much RAM a Discord bot needs."],
      ["Step 1: get a bot server on ESN","Go to panel.esnoffical.com, sign in (or create an account), and open Buy a server. Choose a Discord bot type that matches your language: Python, Node.js or Java. Pick a plan and pay on Stripe. The server is created automatically and appears on your dashboard within moments. If your bot is not written yet, the ESN docs walk through creating an application in the Discord Developer Portal, adding a bot user, and inviting it to your server with the right scopes and permissions."],
      ["Step 2: upload your code","Open the server and go to Files. Upload your files, or upload a single .zip and use Unarchive from its menu. Make sure your main file sits in the top folder rather than inside a folder from the zip. Do not upload node_modules, venv, __pycache__ or .git: they are large, and the server installs packages itself. If you prefer a desktop app such as FileZilla or WinSCP, you can use SFTP with your panel login instead of the browser."],
      ["Step 3: set the start file and packages","Open Startup and check the variable that says which file runs: Main Python File (main.py by default) for Python, Main JavaScript File (index.js) for Node.js, or JAR FILE for Java. File names are case sensitive, so Bot.py and bot.py are different. For Python, list your libraries in requirements.txt; for Node.js, upload package.json (and package-lock.json). Both are installed every time the server starts. For Java, upload one jar that already includes its libraries."],
      ["Step 4: keep your token secret","Your bot token is a password for your bot. Anyone who has it can log in as your bot, so never paste it into your code, a screenshot, a support ticket or a public repository. On ESN, create a file named .env in the top folder with one line, DISCORD_TOKEN= followed by your token, then read it in code with python-dotenv (Python) or dotenv (Node.js). Add .env to your .gitignore so it never reaches GitHub. If a token leaks, open the Developer Portal, go to Bot and choose Reset Token straight away, then update .env."],
      ["Step 5: start it and read the console","Press Start on the Console page. You will see packages install, then whatever your bot prints when it connects; a line such as \"Logged in as YourBot\" is a good sign. If it stops instead, read the last red lines. \"Improper token\" means the token in .env is wrong or was reset. An error about privileged intents means you must switch on the matching intent (Message Content, Server Members or Presence) under Bot in the Developer Portal, or remove it from your code."],
      ["Keeping the bot online for months","Good hosting keeps the machine up; your code keeps the bot up. Catch errors inside command handlers so one bad command cannot crash everything, and in Node.js handle rejected promises. discord.py and discord.js reconnect to the gateway on their own after short network drops, so you rarely need your own reconnect loop. Respect rate limits rather than sending messages in tight loops. Use the panel Schedules page for a nightly restart if your bot slowly uses more memory, and take a backup before every big update."],
      ["Quick checklist","Pick hosting that matches how much admin work you want. Keep the token in .env, out of your code and out of Git. Set the right start file and list your packages. Watch the console on the first start and fix intent or token errors. Check memory after a day and size up only if you need to. Back up before changes. When you are ready, ESN bot hosting starts from $0.50/month on the panel, and the ESN Discord can help if you get stuck."],
    ],
    links:[["ESN bot hosting plans","https://panel.esnoffical.com/plans",true],["Upload and start your bot","https://docs.esnoffical.com/upload-and-start-bot.html",true],["Create a bot and get its token","https://docs.esnoffical.com/bot-token-setup.html",true],["Keep a bot online 24/7","https://docs.esnoffical.com/keep-bot-online.html",true],["Privileged intents explained","https://docs.esnoffical.com/discord-bot-intents.html",true],["Official Discord",DISCORD_URL,true]],
  },
  "java-bedrock-crossplay-smp":{
    title:"Java + Bedrock crossplay: how Minecraft crossplay SMPs work",
    description:"How Geyser and Floodgate let Bedrock players join Java servers, which ports they use, what works for Bedrock players, and how to set it up yourself.",
    category:"Minecraft Guide",
    updated:'November 1, 2026',
    sections:[
      ["Two editions, one world","Minecraft comes in two editions. Java Edition runs on Windows, Mac and Linux PCs. Bedrock Edition runs on phones, tablets, Windows, Xbox, PlayStation and Switch. They look alike, but they speak different network protocols, so out of the box a Bedrock player cannot join a Java server. A crossplay SMP is a Java server with a translator in front of it, so both groups of players end up in the same world, chatting in the same chat and trading in the same economy."],
      ["What Geyser does","Geyser is a free, open-source project that translates between the two protocols. A Bedrock player connects to Geyser, Geyser turns their actions into Java packets, and the Java server sees what looks like one more Java player. Everything the server sends back is translated the other way. Geyser can run as a plugin on Paper or Spigot, as a mod on Fabric, or as a standalone proxy in front of a network. Because the server itself stays Java, your plugins and world keep working as before."],
      ["What Floodgate does","Java servers normally check that every player owns a Java account. Bedrock players sign in with a Microsoft (Xbox) account instead, so without help they would be turned away. Floodgate is Geyser's companion plugin that lets Bedrock players join with their Microsoft account and no Java account. To stop name clashes, it puts a prefix in front of Bedrock names; by default a player called Steve appears as .Steve. Whitelisting a Bedrock player uses the fwhitelist command instead of the normal whitelist."],
      ["Ports: 25565 and 19132","Java Edition connects over TCP and uses port 25565 by default. Bedrock Edition connects over UDP and uses port 19132 by default. Geyser listens for Bedrock players on a UDP port, which you set in its config. TCP and UDP are separate, so on hosts that give you a single port number, Geyser can use the same number as the Java server. Java players can usually leave the port out when it is 25565; Bedrock always has a separate Port box when adding a server."],
      ["What works for Bedrock players","Almost everything a survival player does works the same: mining, building, crafting, fighting, chests, villagers, chat and server commands. Plugin menus built from chest inventories work, and some plugins show native Bedrock forms through Floodgate. On a crossplay SMP, Bedrock players take part in the same events, economy and progression as Java players, which is the whole point: friends on a phone can play with friends on a PC."],
      ["What is different or does not work","A few Java-only things have no exact Bedrock match, so some blocks, items or particles look slightly different. Combat timing and movement feel different between editions. Java resource packs do not apply to Bedrock players automatically; custom textures and item models need a separate Bedrock pack or extra mappings. Client-side Java mods obviously do not exist on Bedrock. Geyser also has to follow new Bedrock releases, so right after a big Minecraft update there can be a short wait until Geyser catches up."],
      ["What about consoles?","Phones, tablets and Windows can add any server by address. Xbox, PlayStation and Switch do not show an Add Server button for custom servers, so console players need a workaround, usually a connection helper that redirects one of the featured server entries. It is a known limitation of console Bedrock, not of the server. ESN keeps a step-by-step console connection guide for the ESN SMP that covers Xbox, PlayStation and Switch."],
      ["How to join ESN SMP","ESN SMP is a crossplay survival server with quests, boss fights, custom gear, an economy and seasonal events. On Java Edition, open Multiplayer, choose Add Server and enter play.esnoffical.com. On Bedrock (phone, tablet or Windows), open Play, then Servers, then Add Server, enter play.esnoffical.com as the address and 19132 as the port. On a console, follow the ESN console guide. Questions, events and updates are announced in the ESN Discord."],
      ["Set up crossplay on your own server: install","Crossplay needs a Paper or Purpur server (or Fabric with the Fabric builds). Vanilla cannot run plugins. Take a backup first. Download Geyser and Floodgate for Spigot/Paper from the official site, geysermc.org/download, and nothing else. Upload both .jar files to the plugins folder and restart. If your Java server runs an older Minecraft version than current Bedrock, also add ViaVersion so newer clients can connect. Geyser uses some extra memory, so leave a little headroom."],
      ["Set up crossplay: configure and test","After the first start, open plugins/Geyser-Spigot/config.yml. Under bedrock, set port to the UDP port Bedrock players should use, and make sure auth-type is floodgate (newer versions set this automatically when Floodgate is installed). Restart, then type plugins in the console and check both Geyser and floodgate are listed. On Bedrock, add the server with your address and that port. To make a Bedrock player an operator, include the prefix, for example op .Steve."],
      ["Crossplay on ESN Hosting","On an ESN Minecraft server, your assigned port already accepts Bedrock traffic, so set Geyser's bedrock port to the same number shown in your server's ip:port and keep server-port in server.properties unchanged. Bedrock players then use your address in the Server Address box and your port in the Port box. ESN plans start from $0.50/month; Minecraft needs a plan with at least 1 GB of RAM, and every plan is listed on the panel."],
      ["If Bedrock players cannot connect","\"Unable to connect to world\" usually means the Bedrock port in Geyser's config does not match the port you gave players, or the server was not restarted after saving. \"Outdated server\" or \"Outdated client\" means Geyser or the player's game needs updating. Being kicked with an Xbox or login error usually means Floodgate is missing or failed to load. Check the console for red errors on start, update both plugins together, and ask in the ESN Discord with the error text if you are stuck."],
    ],
    links:[["ESN SMP World Hub","/smp-hub"],["Console connection guide","/smpconsole"],["Geyser + Floodgate on ESN (docs)","https://docs.esnoffical.com/bedrock-crossplay.html",true],["ESN SMP crossplay guide (docs)","https://docs.esnoffical.com/java-bedrock-crossplay-smp.html",true],["Minecraft hosting plans","https://panel.esnoffical.com/plans",true],["Official Discord",DISCORD_URL,true]],
  },
  "minecraft-server-hosting-for-beginners":{
    title:"Minecraft server hosting for beginners",
    description:"RAM and CPU basics, Paper vs vanilla, plugins, backups and the settings that matter, plus how to start your first Minecraft server on ESN.",
    category:"Minecraft Guide",
    updated:'November 1, 2026',
    sections:[
      ["What a Minecraft server actually is","A Minecraft server is a program that runs the world for everyone. It loads chunks, moves mobs, saves builds and passes every player's actions to everyone else. Your friends' games connect to it using an address, such as an IP and a port or a domain name. To keep the world available when you are offline, that program has to run on a computer that stays on all the time. Hosting is simply choosing which computer that is."],
      ["Hosting at home vs paying a host","You can run a server on your own PC for free. To let friends outside your house join, you usually need to forward a port on your router, which shares your home IP address with every player, and the PC has to stay on whenever anyone wants to play. A hosting company runs the server in a data centre instead: it is always on, you get an address straight away, and you manage everything from a web panel. For most groups of friends, hosted is less hassle."],
      ["RAM basics","RAM holds the parts of the world that are loaded, plus every mob, item and plugin. More players spread far apart load more chunks, so they need more RAM. Big modpacks need far more than plugins do. As a starting point, a small Paper server for a few friends runs on 1 GB, and 2 GB is a comfortable start with a handful of plugins. Forge modpacks need at least 2 GB and often much more. Giving a server far more RAM than it needs does not make it faster, so size up only when the memory graph says so."],
      ["CPU basics and lag","Most of Minecraft's game logic runs on one main thread, so a fast single CPU core matters more than lots of slow cores. The server aims for 20 ticks per second (TPS); when it drops, players see lag. Common causes are large mob farms, redstone clocks, too many loaded entities, and players flying into new terrain, which forces chunk generation. Lowering view-distance and simulation-distance, limiting farms, and pre-generating the world with a plugin such as Chunky help a lot."],
      ["Server software: vanilla, Paper and friends","Vanilla is the official server from Mojang: no plugins and no mods. Paper is a faster version of the server that runs Bukkit and Spigot plugins, and it is the usual choice for survival servers and SMPs. Purpur is Paper with extra settings. Fabric is a lightweight mod loader, and Forge or NeoForge run large modpacks. Plugins only need to be on the server, so players join with a normal game. Mods usually have to be installed by every player too."],
      ["Plugins worth knowing","A few popular, free plugins cover most beginner needs: EssentialsX for homes, warps, spawn and kits; LuckPerms for ranks and permissions; a land-claim plugin such as GriefPrevention so players can protect builds; CoreProtect to look up and roll back griefing; and Geyser with Floodgate if you want Bedrock players to join. Download plugins only from their official pages (Hangar, Modrinth or SpigotMC), keep them updated, and avoid stacking dozens you do not use."],
      ["Backups, before you need them","Worlds get griefed, plugin updates go wrong and files occasionally get corrupted. A backup turns any of those into a five-minute fix instead of a lost world. Take one before every update or new plugin, schedule automatic ones, and keep a copy somewhere other than the server itself by downloading it now and then. On ESN, the Backups page creates and restores backups, and the Schedules page can run them for you automatically."],
      ["Settings that matter","Most settings live in server.properties. motd is the message in the server list. difficulty, gamemode and max-players do what they say. view-distance and simulation-distance have the biggest effect on performance. white-list lets only invited players in, which is a good idea for a private friends server. Keep online-mode set to true so players need a real account and nobody can log in under someone else's name. Restart after changing the file."],
      ["Step by step: your first server on ESN","Go to panel.esnoffical.com and sign in. Open Buy a server, choose Minecraft, then pick Paper (the usual choice). Choose a plan with at least 1 GB of RAM; Advanced (2 GB) or bigger is a comfortable start. Pay on Stripe and the server is set up automatically. Open it, press Start on the Console and accept the EULA when asked. Wait for \"Done\", copy the ip:port shown at the top of the Console, and add it in Minecraft under Multiplayer, then Add Server."],
      ["Become an operator and invite friends","In the panel Console, type op followed by your Minecraft name (no slash) to get admin commands in game. Share the address with friends, and turn on the whitelist with whitelist on and whitelist add Name if you only want invited players. If a friend helps run the server, add them as a subuser in the panel instead of sharing your password. If some friends play on phones or Windows Bedrock, add Geyser and Floodgate so they can join too."],
      ["Keep it safe","Use a strong, unique password on your hosting account and turn on two-factor authentication. Never install cracked or re-uploaded plugins, which are a common way to get backdoors. Give operator status only to people you trust, since ops can do almost anything. Keep the server software and plugins updated, and read the console after updates for errors. These habits prevent most of the problems new server owners run into."],
      ["Where to go next","Once the server is running, the ESN docs cover installing plugins, how much RAM you need, fixing lag, uploading an existing world and letting Bedrock players join. ESN plans start from $0.50/month, and every Minecraft plan is listed on the panel with its RAM and price. If you would rather just play right now, ESN SMP is open at play.esnoffical.com for Java and Bedrock, and the ESN Discord is the place to ask questions."],
    ],
    links:[["Minecraft hosting plans","https://panel.esnoffical.com/plans",true],["Set up a Minecraft server (docs)","https://docs.esnoffical.com/minecraft-server-setup.html",true],["How much RAM you need (docs)","https://docs.esnoffical.com/minecraft-ram.html",true],["Install plugins (docs)","https://docs.esnoffical.com/install-minecraft-plugins.html",true],["Fix lag and crashes (docs)","https://docs.esnoffical.com/fix-minecraft-lag.html",true],["Backups (docs)","https://docs.esnoffical.com/backups.html",true],["Play on ESN SMP","/smp-hub"]],
  },
  'join-minecraft-server-xbox':{
    title:'How to join a custom Minecraft server on Xbox',
    description:'A practical overview of why Xbox Bedrock does not expose a normal custom-server field and the type of connection workaround console players commonly need.',
    category:'Minecraft Guide',
    updated:'September 29, 2026',
    sections:[
      ['Why it works differently on Xbox','Minecraft Bedrock on Xbox does not normally provide the same simple Add Server field available on some other platforms. Joining a custom server can therefore require a console-compatible connection method.'],
      ['Prepare the server details','Have the server hostname and port ready. For ESN SMP, the current website lists '+SMP_ADDRESS+' with port '+SMP_PORT+'.'],
      ['Use the ESN connection guide','ESN keeps its current console connection flow and server details in its dedicated connection resources. Follow the current instructions shown there rather than relying on an old screenshot or saved address.'],
      ['If it stops working','Custom-server workarounds can change as console networking or Minecraft changes. Check ESN Systems Status and the official Discord if the normal flow no longer reaches the server.'],
    ],
    links:[['ESN SMP World Hub','/smp-hub'],['Network Status','/status'],['Official Discord',DISCORD_URL,true]],
  },
  'join-minecraft-server-playstation':{
    title:'How to join a custom Minecraft server on PlayStation',
    description:'A simple guide to the custom-server limitation on Minecraft Bedrock for PlayStation and where to find current ESN connection information.',
    category:'Minecraft Guide',
    updated:'September 29, 2026',
    sections:[
      ['Understand the limitation','PlayStation Bedrock does not normally expose a standard Add Server box for arbitrary third-party servers, so console players may need a compatible connection workaround.'],
      ['Keep the current address nearby','The ESN website currently lists '+SMP_ADDRESS+' and port '+SMP_PORT+' for the ESN SMP.'],
      ['Follow current instructions','Use ESN’s current console connection resources for the latest workflow. Avoid assuming an old DNS, app, or screen-recorded flow is still current.'],
      ['Troubleshoot with live status','If the server cannot be reached, check the SMP World Hub and Network Status before changing settings. Public Minecraft telemetry can occasionally fail even when ESN has confirmed the server is operational.'],
    ],
    links:[['SMP World Hub','/smp-hub'],['SMP Connection','/smpconnection'],['Support','/support']],
  },
  'minecraft-smp-beginner-guide':{
    title:'Minecraft SMP beginner guide: what to do first',
    description:'A beginner-friendly checklist for starting on a progression-heavy Minecraft SMP such as ESN SMP.',
    category:'Minecraft Guide',
    updated:'September 29, 2026',
    sections:[
      ['Learn the entry commands','On ESN SMP, the public encyclopedia surfaces starter commands such as /tutorial, /guide, /menu, /journal, /spawn, and /profile as useful entry points.'],
      ['Understand progression','Do not treat the server like plain survival only. ESNSMP exposes Realm progression, quests, jobs, skills, titles, seasons, achievements, bosses, gear systems, and Adventure content.'],
      ['Protect and organize your progress','Learn homes, claims, teleport tools, backpacks, economy systems, and secure trading before carrying valuable items around.'],
      ['Use official information','Server mechanics change over time. Use the current ESN encyclopedia, release center, and SMP hub instead of old player screenshots when details conflict.'],
    ],
    links:[['SMP Encyclopedia','/smpguide'],['SMP World Hub','/smp-hub'],['SMP Items','/smp-items']],
  },
  'gaming-discord-server-guide':{
    title:'How to organize a gaming Discord server',
    description:'A practical structure for roles, channels, onboarding, moderation, and support in a gaming community Discord.',
    category:'Community Guide',
    updated:'September 29, 2026',
    sections:[
      ['Start with purpose','Decide what the server is primarily for: a game community, creator audience, support hub, team, or mixed community. The channel structure should follow that purpose.'],
      ['Keep onboarding simple','New members should quickly understand the rules, where announcements live, how to get roles, and where normal conversation happens. Too many first-day choices create friction.'],
      ['Separate support from conversation','Tickets or dedicated support channels keep problems from being buried in general chat. Staff permissions should be limited to what each role actually needs.'],
      ['Create a maintenance routine','Review unused roles, permissions, dead channels, automations, and outdated information periodically instead of letting the server grow forever without cleanup.'],
    ],
    links:[['Discord setup service','/discord-server-setup'],['Service Configurator','/configure'],['ESN Trust Center','/trust']],
  },
  'creator-website-guide':{
    title:'How to plan a creator website before you build it',
    description:'A simple way to decide pages, calls to action, proof, mobile layout, and content before opening a website builder.',
    category:'Website Guide',
    updated:'September 29, 2026',
    sections:[
      ['Pick one primary goal','A creator site can showcase work, collect inquiries, explain services, build community, or route people to content. Choose the most important action first.'],
      ['Design the information order','A strong homepage usually explains who you are, what you do, why someone should care, proof or examples, and a clear next action without forcing visitors to hunt.'],
      ['Build mobile-first','Most social traffic can arrive on phones. Test navigation, text size, card density, media, buttons, and loading behavior on a narrow screen early.'],
      ['Give every page a reason to exist','Separate pages should target a real question or task. Do not create dozens of nearly empty pages just to have more URLs.'],
    ],
    links:[['ESN Website Builder','/site-builder'],['Builder Showcase','/showcase'],['Website landing page','/website-builder']],
  },
}

const SMP_FEATURES={
  'riftwalker':{title:'ESN Riftwalker Bundle',tag:'SMP GEAR',copy:'A mobility and utility bundle currently published by the ESN SMP Store.',items:['Riftblade — Rift Dash + bonus strike','Rift Wings — unbreakable Elytra + flight boost','Phase Boots — Speed I + Phase Step','Rift Bow — Slowness II arrows + Rift Burst','Rift Core — Resistance II + Absorption','Void Compass — tracks last death']},
  'immortal-warden':{title:'ESN Immortal Warden Bundle',tag:'SMP GEAR',copy:'A Warden-themed combat bundle currently published by the ESN SMP Store.',items:['Immortal Warden Helmet','Immortal Warden Chestplate','Immortal Warden Leggings','Immortal Warden Boots','Warden Blade','Warden Longbow','Immortal Core','Warden Totem']},
  'void-warrior':{title:'Void Warrior Set',tag:'SMP GEAR',copy:'The five-piece Void Warrior set is sold inside the ESN Exclusives Mega Bundle ($1.99), together with the Lightning King and Immortal Warden sets: 20 items in one checkout on the SMP Store.',items:['Void Crown','Void Chestplate','Void Leggings','Void Boots','Void Blade']},
  'realm-100':{title:'Realm 100 Keys',tag:'SMP PROGRESSION',copy:'Realm 100 keys are part of the current ESN SMP store and progression surface.',items:['20 × Realm 100 Keys','Realm progression is exposed through the current ESNSMP systems','Use the official store for current purchase availability']},
  'season-pass':{title:'ESN Season Pass Relics',tag:'SMP RELICS',copy:'The current Season Pass relic bundle contains six published ESN SMP items.',items:['Angel Wings','Inferno Scepter','Storm Crystal','Tideheart','Void Relic','Celestial Star']},
  'world-bosses':{title:'ESN SMP Boss & Endgame Systems',tag:'SMP BOSSES',copy:'The current public ESNSMP encyclopedia exposes bosses, boss drops, summoning, dungeons, raids, Endless Trials, codex systems, artifacts, pets, and other endgame mechanics.',items:['Boss and boss-drop systems','Dungeons and raids','Boss Codex and progression','Artifacts, pets, treasure, and endgame systems','Live boss timers are only shown when a verified server feed exists']},
}

function Hero({eyebrow,title,copy,children}){
  return <section className="page-hero visibility-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p>{children}</div><div className="visibility-mark"><span>ES</span><strong>DISCOVER</strong><small>BUILD • PLAY • CREATE</small></div></div></section>
}

export function SearchLandingPage(){
  const location=useLocation()
  const {topic}=useParams()
  const resolved=topic||location.pathname.replace(/^\//,'')
  const page=LANDINGS[resolved]
  if(!page)return <Hero eyebrow="ESN SYSTEMS" title="That ESN guide was not found." copy="Use the Explore page to find the current ESN destination."/>
  return <><Hero eyebrow={page.eyebrow} title={page.title} copy={page.intro}><div className="hero-actions"><Link className="button primary" to={page.primary[1]}>{page.primary[0]}</Link><Link className="button secondary" to={page.secondary[1]}>{page.secondary[0]}</Link></div></Hero>
    <section className="section"><div className="shell visibility-landing-grid"><article><span className="eyebrow">WHY THIS PAGE EXISTS</span><h2>Get to the useful part quickly.</h2><p>{page.intro}</p></article><div className="visibility-benefits">{page.bullets.map((item,index)=><div key={item}><span>{String(index+1).padStart(2,'0')}</span><strong>{item}</strong></div>)}</div></div></section>
    <section className="section dark-section"><div className="shell visibility-related"><div><span className="eyebrow">KEEP EXPLORING</span><h2>Keep reading.</h2></div><div>{page.related.map(([label,to])=><Link to={to} key={to}>{label}<span>↗</span></Link>)}</div></div></section></>
}

export function GuidesHubPage(){
  const articles=Object.entries(GUIDES)
  const news=[['Release Center','Current website, SMP, Arcade, network, store, and security updates.','/updates'],['Network Activity','Recent ESN platform milestones plus local route activity.','/activity'],["What's New",'A quick view of major features added to the current ESN website.','/whatsnew'],['Network Changelog','Interactive change history across ESN systems.','/changelog']]
  return <><Hero eyebrow="ESN GUIDES + NEWS" title="Guides from ESN." copy="Connection steps, creator tips, Discord setup advice, and links to current ESN updates."/>
    <section className="section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">EVERGREEN GUIDES</span><h2>Answers people can actually use.</h2></div></div><div className="visibility-guide-grid">{articles.map(([slug,item])=><Link to={'/guides/'+slug} key={slug}><span>{item.category}</span><h2>{item.title}</h2><p>{item.description}</p><small>Updated {item.updated}</small><em>Read guide ↗</em></Link>)}</div></div></section>
    <section className="section dark-section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">ESN NEWS + RELEASES</span><h2>See what changed recently.</h2></div></div><div className="visibility-news-grid">{news.map(([title,copy,to])=><Link to={to} key={to}><strong>{title}</strong><p>{copy}</p><span>Open ↗</span></Link>)}</div></div></section></>
}

export function GuideArticlePage(){
  const {slug}=useParams()
  const article=GUIDES[slug]
  if(!article)return <Hero eyebrow="ESN GUIDES" title="Guide not found." copy="Open the ESN Guides Center to browse current articles."/>
  return <><Hero eyebrow={article.category} title={article.title} copy={article.description}><div className="visibility-article-meta"><span>Updated {article.updated}</span><span>ESN SYSTEMS</span><span>ACCOUNT-FREE</span></div></Hero>
    <article className="section visibility-article"><div className="shell visibility-article-shell">{article.sections.map(([title,copy],index)=><section key={title}><span>{String(index+1).padStart(2,'0')}</span><div><h2>{title}</h2><p>{copy}</p></div></section>)}<aside><span className="eyebrow">NEXT STEPS</span><div>{article.links.map(([label,to,external])=>external?<a href={to} target="_blank" rel="noreferrer" key={to}>{label} ↗</a>:<Link to={to} key={to}>{label} ↗</Link>)}</div></aside></div></article></>
}

const BADGES=[
  ['hosted-on-esn.svg','Badge (light)',150,20],
  ['hosted-on-esn-dark.svg','Badge (dark)',150,20],
  ['hosted-on-esn-card.svg','Card (light)',200,60],
  ['hosted-on-esn-card-dark.svg','Card (dark)',200,60],
]
const BADGE_LINK='https://esnoffical.com/?ref=badge'
function BadgeSnippet({label,code}){
  const copy=()=>{try{navigator.clipboard&&navigator.clipboard.writeText(code)}catch(e){}}
  return <div className="esn-badge-snippet"><div><span>{label}</span><button type="button" onClick={copy}>Copy</button></div><pre><code>{code}</code></pre></div>
}
export function BadgePage(){
  return <><Hero eyebrow="HOSTED ON ESN" title="Show that your project runs on ESN." copy="Free badges for bots, servers, READMEs and websites hosted on ESN. Copy a snippet below and paste it where people will see it."/>
    <section className="section"><div className="shell esn-badge-list">{BADGES.map(([file,label,w,h])=>{
      const src='https://esnoffical.com/badge/'+file
      const md='[![Hosted on ESN]('+src+')]('+BADGE_LINK+')'
      const htmlCode='<a href="'+BADGE_LINK+'" target="_blank" rel="noopener"><img src="'+src+'" alt="Hosted on ESN" width="'+w+'" height="'+h+'"></a>'
      return <article className="esn-badge-item" key={file}><div className="esn-badge-preview"><span className="eyebrow">{label}</span><img src={'/badge/'+file} alt="Hosted on ESN" width={w} height={h} loading="lazy"/></div><BadgeSnippet label="Markdown (GitHub README, top.gg, Discord bot pages)" code={md}/><BadgeSnippet label="HTML (websites)" code={htmlCode}/></article>})}</div></section>
    <section className="section dark-section"><div className="shell visibility-related"><div><span className="eyebrow">GOOD TO KNOW</span><h2>Use it freely.</h2><p>The badges are plain SVG files, so they stay sharp at any size and load fast. Use the light version on light backgrounds and the dark version on dark ones. Please only use them for projects that are actually hosted on ESN.</p></div><div><a href="https://panel.esnoffical.com/plans" target="_blank" rel="noreferrer">Host your project on ESN<span>↗</span></a><Link to="/guides/host-discord-bot-24-7">How to host a Discord bot 24/7<span>↗</span></Link><a href="https://docs.esnoffical.com" target="_blank" rel="noreferrer">Hosting docs<span>↗</span></a></div></div></section></>
}

export function BrandAuthorityPage(){
  return <><Hero eyebrow="ESN SYSTEMS // OFFICIAL" title="Meet ESN Systems." copy="ESN Systems (ESN) is the current organization and brand. EP1C Services was the former name, not a separate current division."/>
    <section className="section"><div className="shell visibility-brand-grid">
      <article><span>01</span><h2>Creator services</h2><p>Fortnite coaching, creator editing, Discord server setups, website projects, and selected custom digital work.</p><Link to="/serviceshowcase">Explore services →</Link></article>
      <article><span>02</span><h2>Gaming network</h2><p>ESN includes the ESN SMP and six original browser games inside the ESN Arcade.</p><Link to="/minecraft-smp">Explore gaming →</Link></article>
      <article><span>03</span><h2>Tools + creation</h2><p>Try free browser tools, build a website, or find information about ESN products and services.</p><Link to="/website-builder">Explore creation →</Link></article>
      <article><span>04</span><h2>Community</h2><p>Join the Discord for updates, support, project tickets, and community conversations.</p><a href={DISCORD_URL} target="_blank" rel="noreferrer">Official Discord ↗</a></article>
    </div></section>
    <section className="section dark-section"><div className="shell visibility-official-card"><div><span className="eyebrow">IDENTITY</span><h2>How ESN got its name.</h2><p>When you see ESN Systems or ESN on this site, it refers to the current organization. References to EP1C Services describe the former name and history.</p></div><div><Link to="/about">About ESN ↗</Link><Link to="/trust">Trust Center ↗</Link><Link to="/timeline">ESN Timeline ↗</Link><Link to="/leadership">Leadership ↗</Link></div></div></section></>
}

export function SMPFeaturePage(){
  const {feature}=useParams()
  const item=SMP_FEATURES[feature]
  if(!item)return <Hero eyebrow="ESN SMP" title="SMP feature not found." copy="Browse the current SMP Item Encyclopedia for published ESN gear and systems."/>
  return <><Hero eyebrow={item.tag} title={item.title} copy={item.copy}><div className="hero-actions"><Link className="button primary" to="/smp-items">Open item encyclopedia</Link><Link className="button secondary" to="/smp-hub">SMP World Hub</Link></div></Hero>
    <section className="section"><div className="shell visibility-feature-layout"><article><span className="eyebrow">ITEM DETAILS</span><h2>{item.title}</h2><p>{item.copy}</p><small>Product availability, checkout state, and live server behavior can change. Use the current ESN Store and SMP Hub as the source of truth.</small></article><div>{item.items.map((value,index)=><div key={value}><span>{String(index+1).padStart(2,'0')}</span><strong>{value}</strong></div>)}</div></div></section>
    <section className="section dark-section"><div className="shell visibility-related"><div><span className="eyebrow">SMP DISCOVERY</span><h2>More from the SMP.</h2></div><div><Link to="/smp-items">Items <span>↗</span></Link><Link to="/smpguide">Encyclopedia <span>↗</span></Link><Link to="/smp-hub">World Hub <span>↗</span></Link></div></div></section></>
}

function readObject(key){try{const value=JSON.parse(localStorage.getItem(key)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch{return{}}}
function bump(key,name){
  const data=readObject(key)
  data[name]=(Number(data[name])||0)+1
  localStorage.setItem(key,JSON.stringify(data))
}

export function VisibilityLayer(){
  const location=useLocation()
  useEffect(()=>{
    if(location.pathname.startsWith('/sites/'))return
    const viewKey=location.pathname||'/'
    const sessionKey='esn-view:'+viewKey
    if(!sessionStorage.getItem(sessionKey)){
      bump('esn_visibility_pageviews_v1',viewKey)
      sessionStorage.setItem(sessionKey,'1')
    }
    const params=new URLSearchParams(location.search)
    const ref=params.get('ref')||params.get('utm_source')
    if(ref){
      const safe=ref.toLowerCase().replace(/[^a-z0-9._-]/g,'').slice(0,40)
      const dedupe='esn-ref:'+safe+':'+viewKey
      if(safe&&!sessionStorage.getItem(dedupe)){
        bump('esn_visibility_referrals_v1',safe)
        sessionStorage.setItem(dedupe,'1')
      }
    }
  },[location.pathname,location.search])
  return null
}

const RELATED={
  '/serviceshowcase':[['Fortnite Coaching','/fortnite-coaching'],['Video Editing','/video-editing'],['Discord Setup','/discord-server-setup'],['Project Estimate','/estimate']],
  '/site-builder':[['Website Builder Guide','/website-builder'],['Creator Website Guide','/guides/creator-website-guide'],['Builder Showcase','/showcase']],
  '/estools':[['Free Browser Tools','/free-browser-tools'],['Guides Center','/guides'],['Explore ESN','/explore']],
  '/smp-hub':[['Minecraft Server','/minecraft-server'],['Minecraft SMP','/minecraft-smp'],['Beginner Guide','/guides/minecraft-smp-beginner-guide'],['SMP Items','/smp-items']],
  '/smp-items':[['Riftwalker','/smp/riftwalker'],['Immortal Warden','/smp/immortal-warden'],['Season Pass','/smp/season-pass'],['Realm 100','/smp/realm-100']],
  '/showcase':[['Website Builder','/website-builder'],['Creator Website Guide','/guides/creator-website-guide'],['Build a Site','/site-builder']],
  '/about':[['ESN Systems','/es-network'],['Trust Center','/trust'],['Timeline','/timeline']],
}

export function RelatedVisibilityLinks(){
  const location=useLocation()
  const links=RELATED[location.pathname]
  if(!links)return null
  return <section className="visibility-global-related"><div className="shell"><span>RELATED ESN</span><div>{links.map(([label,to])=><Link to={to} key={to}>{label}<em>↗</em></Link>)}</div></div></section>
}

export function VisibilityInsightsPage(){
  const views=useMemo(()=>readObject('esn_visibility_pageviews_v1'),[])
  const refs=useMemo(()=>readObject('esn_visibility_referrals_v1'),[])
  const viewRows=Object.entries(views).sort((a,b)=>b[1]-a[1]).slice(0,20)
  const refRows=Object.entries(refs).sort((a,b)=>b[1]-a[1]).slice(0,20)
  return <><Hero eyebrow="PRIVACY-FRIENDLY VISIBILITY" title="See referral and page signals stored on this device." copy="This dashboard intentionally does not create visitor accounts or send analytics to an ESN user-profile database. It is a local diagnostic view, not a network-wide traffic total."/>
    <section className="section"><div className="shell visibility-insights-grid"><article><span>LOCAL PAGE VIEWS</span>{viewRows.length?viewRows.map(([name,count])=><div key={name}><code>{name}</code><strong>{count}</strong></div>):<p>No local page-view signals yet.</p>}</article><article><span>LOCAL REFERRALS</span>{refRows.length?refRows.map(([name,count])=><div key={name}><code>{name}</code><strong>{count}</strong></div>):<p>Open a link such as <code>?ref=discord</code> to record a local referral signal.</p>}</article></div></section>
    <section className="section dark-section"><div className="shell visibility-insight-note"><span>IMPORTANT</span><p>Because ESN is keeping this account-free and no external analytics provider is connected here, these numbers only describe this browser. Site-wide visitor counts would require a privacy-focused aggregate analytics service or server-side logging.</p></div></section></>
}

export const VISIBILITY_GUIDES=GUIDES
