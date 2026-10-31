import { useEffect, useState } from 'react'

// Staff list for /leadership. The live list comes from the ESN Discord (staff roles, refreshed every 10 minutes on the panel).
// TEAM_FALLBACK is a snapshot used for the first paint and whenever the live feed can't be reached.
export const TEAM_FEED_URL = 'https://panel.esnoffical.com/esn-theme/team/team.json'

export const TEAM_FALLBACK = [
  {
    "name": "VΛΞRYX",
    "username": "vaeryx",
    "role": "Creator of all things ESN",
    "color": "#3f6069",
    "avatar": "https://cdn.discordapp.com/avatars/1515077206886453469/694354d4672823211c6e062b44d6e6ff.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/1.png"
  },
  {
    "name": "ESN OFFICIAL",
    "username": "ep1cservicesoffical",
    "role": "Creator of all things ESN",
    "color": "#3f6069",
    "avatar": "https://cdn.discordapp.com/avatars/1526746583029383299/aa81118016be08aeb23054a84e6d1815.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/4.png"
  },
  {
    "name": "HAUNTED_PLAYZ",
    "username": "haunted_playz",
    "role": "Creator of all things ESN",
    "color": "#3f6069",
    "avatar": "https://cdn.discordapp.com/avatars/1434663490160955407/90c8685e36020cd332568107ee831291.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/3.png"
  },
  {
    "name": "TheRealVoidPlays",
    "username": "therealvoidplays_57150",
    "role": "Creator of all things ESN",
    "color": "#3f6069",
    "avatar": "https://cdn.discordapp.com/avatars/1489869069472501761/41e03ac65a07ab48ad04c83981904d81.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/1.png"
  },
  {
    "name": "! Storm | Tech Ops.",
    "username": "chefbonqueque",
    "role": "Founder",
    "color": "#9468a7",
    "avatar": "https://cdn.discordapp.com/avatars/811100216052547594/cc73f7b5585aa6797c8780cc8c4682ef.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/4.png"
  },
  {
    "name": "Angie",
    "username": "that1girlangie",
    "role": "Founder",
    "color": "#9468a7",
    "avatar": "https://cdn.discordapp.com/avatars/1111463721416540330/57d4791de5f0e905db9968e3ae44485a.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/1.png"
  },
  {
    "name": "Caelian",
    "username": "caelian_.",
    "role": "Founder",
    "color": "#9468a7",
    "avatar": "https://cdn.discordapp.com/avatars/1515347473407934496/1a698121600d6e1ced69f3060807922d.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/5.png"
  },
  {
    "name": "Gigi_Loves_Raccoons",
    "username": "gigi_loves_raccoons",
    "role": "Founder",
    "color": "#9468a7",
    "avatar": "https://cdn.discordapp.com/avatars/567255562677387264/a_f45fa7477047b83660063e84b0ab68fd.gif?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/3.png"
  },
  {
    "name": "Juicewrld₉⁹₉",
    "username": "69isdabest.",
    "role": "Founder",
    "color": "#9468a7",
    "avatar": "https://cdn.discordapp.com/avatars/1527709617508061337/a_7b24c93b1755284d9ccde41cd1464468.gif?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/4.png"
  },
  {
    "name": "Stitch Lover <3",
    "username": "gigi_love_stitch",
    "role": "Founder",
    "color": "#9468a7",
    "avatar": "https://cdn.discordapp.com/avatars/1541675875886694442/ad5cd59975821bce32292c1d0ec54acf.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/0.png"
  },
  {
    "name": "Mık3 - ! ~",
    "username": "ghost020319",
    "role": "Co-Founder",
    "color": "#9b59b6",
    "avatar": "https://cdn.discordapp.com/avatars/1258606834944704584/18c3c5d04d4a875f5f02aeea909d17a1.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/5.png"
  },
  {
    "name": "MKRoller",
    "username": "mateoz0705",
    "role": "Operations Supervisor",
    "color": "#ee568a",
    "avatar": "https://cdn.discordapp.com/avatars/882818461913456681/0244008f49fbd2f38309ef51aef36603.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/2.png"
  },
  {
    "name": "Nathan",
    "username": "nathxnq",
    "role": "Manager",
    "color": "#2ecc71",
    "avatar": "https://cdn.discordapp.com/avatars/1163204807310463017/92b052717952b039b070d568dc0ca292.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/1.png"
  },
  {
    "name": "† Kidrocks1313 †",
    "username": "kidrocks1313",
    "role": "Head of Promotion",
    "color": "#d35400",
    "avatar": "https://cdn.discordapp.com/avatars/1392224478175690752/4b325826974155e88ea8aa32e2248cb6.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/5.png"
  },
  {
    "name": "Ashton",
    "username": "asw03243",
    "role": "Assistant Head of Promotion",
    "color": "#e67e22",
    "avatar": "https://cdn.discordapp.com/avatars/1515510755863302206/7b9165484b85a2b490e4cee003844515.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/4.png"
  },
  {
    "name": "「蕭麗娜」",
    "username": "lala.s.2",
    "role": "Support Agent",
    "color": "#6a8dff",
    "avatar": "https://cdn.discordapp.com/avatars/1194745661053222975/6f569a182d0ac25e6b1afc485db28861.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/2.png"
  },
  {
    "name": "NØX",
    "username": "swatlater",
    "role": "Support Team",
    "color": "#4169e1",
    "avatar": "https://cdn.discordapp.com/avatars/1541566613491417113/44259c9538385a0f4ad56e7902dca1ed.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/3.png"
  },
  {
    "name": "R4Y:~$",
    "username": "who.rayy._",
    "role": "Support Team",
    "color": "#4169e1",
    "avatar": "https://cdn.discordapp.com/avatars/1026381887813464094/7aa640eddf91f2b7c3c4fccee9175e26.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/4.png"
  },
  {
    "name": "Tom",
    "username": "tomsir17",
    "role": "Support Team",
    "color": "#4169e1",
    "avatar": "https://cdn.discordapp.com/avatars/1499831812195614982/73ba9deb1ffd7f3e435121f3de185cc8.webp?size=128",
    "fallback_avatar": "https://cdn.discordapp.com/embed/avatars/3.png"
  }
]

function useLiveTeam() {
  const [team, setTeam] = useState(TEAM_FALLBACK)
  const [live, setLive] = useState(false)
  useEffect(() => {
    let alive = true
    const load = () => fetch(TEAM_FEED_URL, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d || !Array.isArray(d.team) || !d.team.length) return
        setTeam(d.team.filter((m) => m && m.name && m.avatar))
        setLive(true)
      })
      .catch(() => {})
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
      referrerPolicy="no-referrer"
      onError={() => { if (member.fallback_avatar && src !== member.fallback_avatar) setSrc(member.fallback_avatar) }}
    />
  )
}

export default function LiveTeam() {
  const { team, live } = useLiveTeam()
  return (
    <section className="section dark-section">
      <div className="shell">
        <div className="section-heading">
          <div><span className="eyebrow">ESN staff · {team.length} members</span><h2>Meet the team</h2></div>
          <p className="team-live-note">{live ? 'Live from our Discord. Updates automatically.' : 'From our Discord. Updates automatically.'}</p>
        </div>
        <ul className="team-grid live-team-grid">
          {team.map((m) => (
            <li className="leader-tile live-team-tile" key={m.username + m.role}>
              <TeamAvatar member={m} />
              <div>
                <span className="team-role" style={{ '--role-color': m.color || '#5865f2' }}>{m.role}</span>
                <h3>{m.name}</h3>
                <p className="team-username">@{m.username}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
