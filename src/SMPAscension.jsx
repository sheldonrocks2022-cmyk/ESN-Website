import { Link } from 'react-router-dom'
import './smpAscension.css'

const realms=[
  ['⚡','Storm Kingdom','Sky fortresses, lightning threats, Stormguard progression and Tempest bosses.'],
  ['🕳️','The Abyss','Sculk corruption, void creatures, Abyss Order lore and hidden horrors.'],
  ['❄️','Frostlands','Frozen mountains, blizzards, Frost Clan trials and ancient ice bosses.'],
  ['🔥','Infernal Empire','Volcanic terrain, Infernal Legion warfare and multi-phase fire encounters.'],
  ['🌿','Verdant Wilds','Overgrown ruins, Wildheart Tribe progression and living jungle threats.'],
  ['✨','Celestial Isles','Floating astral terrain, Astral Council secrets and star-born enemies.'],
  ['🌑','Bloodmoon Wastes','Cursed crimson badlands, Bloodmoon Cult reputation and brutal hunts.'],
  ['🌀','The Shattered Realm','Hidden eighth realm unlocked by recovering all seven Portal Fragments.'],
]

const systems=[
  ['24-Chapter Stories','Every main realm has a full quest arc tied into combat, exploration, factions, dungeons and bosses.'],
  ['50-Level Mastery','Separate mastery for every realm with skill points, milestone rewards and portal fragments.'],
  ['Skill Trees','Mobility, defense, realm damage, treasure sense, recovery and signature realm powers.'],
  ['Faction Towns','Blacksmiths, Quest Masters, merchants, bounties, Lorekeepers, Alchemists and boss tracking.'],
  ['Dungeons','Generated multi-room routes with traps, puzzles, elites, minibosses and vaults.'],
  ['Raids','Multi-stage group encounters with scaling waves, endgame bosses and Mythic paths.'],
  ['World Events','Threat meters drive Meteor Showers, Blood Moons, Frozen Eclipses, Void Breaches, Treasure Storms and more.'],
  ['Realm Gear','Forge randomized Uncommon → Ancient gear, full-set abilities, Boss Cores, Crystals and Ancient Materials.'],
  ['Pets & Mounts','Unlock realm companions and mounts through mastery progression.'],
  ['PvP Arenas','1v1, 2v2, FFA, Realm vs Realm and ranked rating inside themed arenas.'],
  ['Guild Territory','Teams can claim territory in realms after meeting progression requirements.'],
  ['Collections & Lore','Collectibles, written lore books, secret clues and lore-unlocked hidden bosses.'],
  ['Caravans','Defend traveling faction merchants for mastery, reputation and realm rewards.'],
  ['Profiles & Leaderboards','Track mastery, quests, bosses, dungeons, raids, Realm Score and network rankings.'],
]

export default function SMPAscensionPage(){
  return <div className="ascension-page">
    <section className="ascension-hero">
      <div className="ascension-grid"/>
      <div className="ascension-shell">
        <span className="ascension-kicker">ESN SMP • v2.15.0</span>
        <h1>Realm<br/><em>Ascension.</em></h1>
        <p>ESN SMP has evolved into a connected multi-realm RPG layer with its own worlds, factions, storylines, mobs, mastery, dungeons, raids, gear, events, pets, mounts, PvP, secrets and endgame progression.</p>
        <div className="ascension-actions">
          <Link to="/smpconnection">JOIN ESN SMP</Link>
          <Link to="/smpplugin" className="secondary">DOWNLOAD ESNSMP</Link>
        </div>
        <div className="ascension-stats">
          <div><strong>8</strong><span>REALM WORLDS</span></div>
          <div><strong>24</strong><span>QUEST CHAPTERS / REALM</span></div>
          <div><strong>50</strong><span>MASTERY LEVELS / REALM</span></div>
          <div><strong>3</strong><span>DIFFICULTY TIERS</span></div>
        </div>
      </div>
    </section>

    <section className="ascension-section">
      <div className="ascension-shell">
        <div className="ascension-heading"><span>THE REALM NETWORK</span><h2>Eight worlds. One progression system.</h2><p>The seven main realms build toward the hidden Shattered Realm. Each world has distinct terrain, structures, mobs, factions and progression.</p></div>
        <div className="realm-grid">{realms.map(([icon,name,text])=><article key={name}><i>{icon}</i><h3>{name}</h3><p>{text}</p></article>)}</div>
      </div>
    </section>

    <section className="ascension-section ascension-dark">
      <div className="ascension-shell">
        <div className="ascension-heading"><span>REALM ASCENSION SYSTEMS</span><h2>Built to keep progressing.</h2><p>The new realm loop ties exploration, combat, crafting, social systems and endgame content together instead of leaving features disconnected.</p></div>
        <div className="system-grid">{systems.map(([name,text],i)=><article key={name}><span>{String(i+1).padStart(2,'0')}</span><h3>{name}</h3><p>{text}</p></article>)}</div>
      </div>
    </section>

    <section className="ascension-section">
      <div className="ascension-shell ascension-split">
        <div><span className="ascension-kicker">BOSSES & CREATURES</span><h2>Realms fight back.</h2><p>Each realm has native mob families, elites, minibosses, main bosses and Chronicle-unlocked secret bosses. Bosses now change phases, summon reinforcements and enter enraged final stages instead of acting like simple health sponges.</p></div>
        <div className="ascension-list">
          <span>Elite realm variants</span><span>Multi-phase bosses</span><span>Secret lore bosses</span><span>Dynamic invasions</span><span>Normal / Heroic / Mythic scaling</span><span>Realm Essence + Relic drops</span>
        </div>
      </div>
    </section>

    <section className="ascension-section ascension-final">
      <div className="ascension-shell">
        <span className="ascension-kicker">THE ENDGAME</span>
        <h2>Recover all seven Portal Fragments.</h2>
        <p>Reach Mastery 10 in every main realm to assemble the hidden portal. Once completed, your profile unlocks access to <strong>The Shattered Realm</strong> — an endgame world with fractured terrain, exclusive mobs, its own Sigil, secret bosses and the final Realmwalker path.</p>
        <div className="ascension-actions"><Link to="/smpconnection">ENTER THE SMP</Link><Link to="/smpguide" className="secondary">OPEN SMP GUIDE</Link></div>
      </div>
    </section>
  </div>
}
