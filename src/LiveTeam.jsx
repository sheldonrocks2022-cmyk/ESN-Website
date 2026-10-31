import { useEffect, useState } from 'react'

// Staff list for /leadership. The live list comes from the ESN Discord servers (staff roles, refreshed every 10 minutes on the panel).
// TEAM_FALLBACK is a snapshot used for the first paint and whenever the live feed can't be reached.
export const TEAM_FEED_URL = 'https://panel.esnoffical.com/esn-theme/team/team.json'

export const TEAM_FALLBACK = [
  {
    "name": "VΛΞRYX",
    "username": "vaeryx",
    "role": "Creator of all things ESN",
    "color": "#3f6069",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/694354d4672823211c6e062b44d6e6ff.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-1.png",
    "servers": [
      "ESN Hosting",
      "ES Network"
    ]
  },
  {
    "name": "ESN OFFICIAL",
    "username": "ep1cservicesoffical",
    "role": "Creator of all things ESN",
    "color": "#3f6069",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/aa81118016be08aeb23054a84e6d1815.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-4.png",
    "servers": [
      "ESN Hosting",
      "ES Network"
    ]
  },
  {
    "name": "HAUNTED_PLAYZ",
    "username": "haunted_playz",
    "role": "Creator of all things ESN",
    "color": "#3f6069",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/90c8685e36020cd332568107ee831291.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-3.png",
    "servers": [
      "ESN Hosting",
      "ES Network"
    ]
  },
  {
    "name": "TheRealVoidPlays",
    "username": "therealvoidplays_57150",
    "role": "Creator of all things ESN",
    "color": "#3f6069",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/41e03ac65a07ab48ad04c83981904d81.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-1.png",
    "servers": [
      "ESN Hosting",
      "ES Network"
    ]
  },
  {
    "name": "! Storm | Tech Ops.",
    "username": "chefbonqueque",
    "role": "Founder",
    "color": "#f59e0b",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/cc73f7b5585aa6797c8780cc8c4682ef.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-4.png",
    "servers": [
      "ESN Hosting",
      "ES Network"
    ]
  },
  {
    "name": "Caelian",
    "username": "caelian_.",
    "role": "Founder",
    "color": "#f59e0b",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/1a698121600d6e1ced69f3060807922d.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-5.png",
    "servers": [
      "ESN Hosting",
      "ES Network"
    ]
  },
  {
    "name": "Gigi_Loves_Raccoons",
    "username": "gigi_loves_raccoons",
    "role": "Founder",
    "color": "#f59e0b",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/a_f45fa7477047b83660063e84b0ab68fd.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-3.png",
    "servers": [
      "ESN Hosting",
      "ES Network"
    ]
  },
  {
    "name": "Stitch Lover <3",
    "username": "gigi_love_stitch",
    "role": "Founder",
    "color": "#f59e0b",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/ad5cd59975821bce32292c1d0ec54acf.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-0.png",
    "servers": [
      "ESN Hosting",
      "ES Network"
    ]
  },
  {
    "name": "Juicewrld₉⁹₉",
    "username": "69isdabest.",
    "role": "Owner",
    "color": "#eab308",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/a_7b24c93b1755284d9ccde41cd1464468.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-4.png",
    "servers": [
      "ESN Hosting",
      "ES Network"
    ]
  },
  {
    "name": "Kidrocks1313 | Manage | ESN BOTS",
    "username": "kidrocks_3_alt",
    "role": "Owner",
    "color": "#eab308",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/2af7c247ee9d6ca2f04adda1dc301b2b.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-3.png",
    "servers": [
      "ES Network"
    ]
  },
  {
    "name": "X_fall_X",
    "username": "void2845",
    "role": "Owner",
    "color": "#eab308",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/824e967c6da36c358907c5d3515ee100.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-4.png",
    "servers": [
      "ES Network"
    ]
  },
  {
    "name": "† Kidrocks1313 †",
    "username": "kidrocks1313",
    "role": "Owner",
    "color": "#eab308",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/4b325826974155e88ea8aa32e2248cb6.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-5.png",
    "servers": [
      "ESN Hosting",
      "ES Network"
    ]
  },
  {
    "name": "Angie",
    "username": "that1girlangie",
    "role": "Founder",
    "color": "#9468a7",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/57d4791de5f0e905db9968e3ae44485a.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-1.png",
    "servers": [
      "ESN Hosting"
    ]
  },
  {
    "name": "luvsky7",
    "username": "ellie_14",
    "role": "Co-Owner",
    "color": "#d97706",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/2286c217f4e784f6cdc61598e6c90804.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-4.png",
    "servers": [
      "ES Network"
    ]
  },
  {
    "name": "𝙿𝚞𝚙𝚙𝚢_𝙵𝚎𝚖𝚋𝚒 (𝟷k-𝟸𝟽)",
    "username": "moonwatcher099",
    "role": "Co-Owner",
    "color": "#d97706",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/900365583947dab844c47b449f5d7b65.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-0.png",
    "servers": [
      "ES Network"
    ]
  },
  {
    "name": "Mık3 - ! ~",
    "username": "ghost020319",
    "role": "Co-Founder",
    "color": "#9b59b6",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/18c3c5d04d4a875f5f02aeea909d17a1.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-5.png",
    "servers": [
      "ESN Hosting"
    ]
  },
  {
    "name": "「蕭麗娜」",
    "username": "lala.s.2",
    "role": "Administrator",
    "color": "#c4b5fd",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/6f569a182d0ac25e6b1afc485db28861.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-2.png",
    "servers": [
      "ESN Hosting",
      "ES Network"
    ]
  },
  {
    "name": "Xx_Cup1dN0tBl3sSed_xX",
    "username": "xx_cup1dn0tbl3ssed_xx",
    "role": "Operations Manager",
    "color": "#14b8a6",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/5704257454fc5bde3e414883c669a636.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-2.png",
    "servers": [
      "ES Network"
    ]
  },
  {
    "name": "MKRoller",
    "username": "mateoz0705",
    "role": "Operations Supervisor",
    "color": "#ee568a",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/0244008f49fbd2f38309ef51aef36603.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-2.png",
    "servers": [
      "ESN Hosting"
    ]
  },
  {
    "name": "Nathan",
    "username": "nathxnq",
    "role": "Manager",
    "color": "#2ecc71",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/92b052717952b039b070d568dc0ca292.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-1.png",
    "servers": [
      "ESN Hosting"
    ]
  },
  {
    "name": "Ashton",
    "username": "asw03243",
    "role": "Assistant Head of Promotion",
    "color": "#e67e22",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/7b9165484b85a2b490e4cee003844515.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-4.png",
    "servers": [
      "ESN Hosting"
    ]
  },
  {
    "name": "NØX",
    "username": "swatlater",
    "role": "Support Team",
    "color": "#4169e1",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/44259c9538385a0f4ad56e7902dca1ed.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-3.png",
    "servers": [
      "ESN Hosting"
    ]
  },
  {
    "name": "R4Y:~$",
    "username": "who.rayy._",
    "role": "Support Team",
    "color": "#4169e1",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/7aa640eddf91f2b7c3c4fccee9175e26.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-4.png",
    "servers": [
      "ESN Hosting"
    ]
  },
  {
    "name": "Tom",
    "username": "tomsir17",
    "role": "Support Team",
    "color": "#4169e1",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/73ba9deb1ffd7f3e435121f3de185cc8.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-3.png",
    "servers": [
      "ESN Hosting"
    ]
  },
  {
    "name": "Geeks",
    "username": "geeks_theenby",
    "role": "Moderator",
    "color": "#059669",
    "avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/b70056a9d5a9307e552621f91e924306.webp",
    "fallback_avatar": "https://panel.esnoffical.com/esn-theme/team/avatars/default-5.png",
    "servers": [
      "ES Network"
    ]
  }
]

let feedCache = null
function loadFeed() {
  const now = Date.now()
  if (!feedCache || now - feedCache.at > 60000) {
    feedCache = { at: now, promise: fetch(TEAM_FEED_URL, { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).catch(() => null) }
  }
  return feedCache.promise
}

function useLiveTeam() {
  const [team, setTeam] = useState(TEAM_FALLBACK)
  const [live, setLive] = useState(false)
  useEffect(() => {
    let alive = true
    const load = () => loadFeed().then((d) => {
      if (!alive || !d || !Array.isArray(d.team) || !d.team.length) return
      setTeam(d.team.filter((m) => m && m.name && m.avatar))
      setLive(true)
    })
    load()
    const id = setInterval(load, 600000)
    return () => { alive = false; clearInterval(id) }
  }, [])
  return { team, live }
}

function TeamAvatar({ member }) {
  const [src, setSrc] = useState(member.avatar)
  useEffect(() => { setSrc(member.avatar) }, [member.avatar])
  return (
    <img
      className="team-avatar"
      src={src}
      alt={member.name + ' Discord avatar'}
      width="72"
      height="72"
      loading="lazy"
      decoding="async"
      onError={() => { if (member.fallback_avatar && src !== member.fallback_avatar) setSrc(member.fallback_avatar) }}
    />
  )
}

// Live Discord avatar for a leader's feature card; shows the letter tile if the feed or image is unavailable.
export function LeaderAvatar({ username, name, initial }) {
  const { team } = useLiveTeam()
  const member = team.find((m) => m.username === username)
  const [failed, setFailed] = useState(false)
  useEffect(() => { setFailed(false) }, [member && member.avatar])
  if (!member || failed) return <div className="leadership-monogram">{initial}</div>
  return (
    <div className="leadership-monogram leadership-monogram-photo">
      <img src={member.avatar} alt={name + ' Discord avatar'} width="150" height="150" decoding="async" onError={() => setFailed(true)} />
    </div>
  )
}

export default function LiveTeam() {
  const { team, live } = useLiveTeam()
  return (
    <section className="section dark-section">
      <div className="shell">
        <div className="section-heading">
          <div><span className="eyebrow">ESN staff · {team.length} members</span><h2>Meet the team</h2></div>
          <p className="team-live-note">{live ? 'Live from our Discord servers. Updates automatically.' : 'From our Discord servers. Updates automatically.'}</p>
        </div>
        <ul className="team-grid live-team-grid">
          {team.map((m) => (
            <li className="leader-tile live-team-tile" key={m.username}>
              <TeamAvatar member={m} />
              <div>
                <span className="team-role" style={{ '--role-color': m.color || '#5865f2' }}>{m.role}</span>
                <h3>{m.name}</h3>
                <p className="team-username">@{m.username}{Array.isArray(m.servers) && m.servers.length ? ' · ' + m.servers.join(' + ') : ''}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
