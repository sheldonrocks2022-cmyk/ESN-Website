// ESN network: shared destinations, live status source and homepage FAQ.
// Used by the network bar, the footer, the homepage and the prerendered SEO data.

export const ESN_DISCORD_URL = 'https://discord.gg/RGPt3zEfGy'
export const ESN_PANEL_URL = 'https://panel.esnoffical.com'
export const ESN_PLANS_URL = 'https://panel.esnoffical.com/plans'
export const ESN_SMP_STORE_URL = 'https://smp.esnoffical.com'
export const ESN_DOCS_URL = 'https://docs.esnoffical.com'
export const ESN_STATUS_URL = 'https://status.esnoffical.com'
export const ESN_STATUS_JSON = 'https://status.esnoffical.com/status.json'

// [label, href, short description, internal route?]
export const ESN_NETWORK_LINKS = [
  { id:'home', label:'Home', href:'/', copy:'ES Network home', internal:true },
  { id:'panel', label:'Hosting Panel', href:ESN_PANEL_URL, copy:'Manage your servers and bots' },
  { id:'plans', label:'Plans', href:ESN_PLANS_URL, copy:'Bot hosting from $0.50/mo' },
  { id:'store', label:'SMP Store', href:ESN_SMP_STORE_URL, copy:'Ranks, keys and bundles' },
  { id:'docs', label:'Docs', href:ESN_DOCS_URL, copy:'Guides for the panel and hosting' },
  { id:'status', label:'Status', href:ESN_STATUS_URL, copy:'Live uptime for every node' },
  { id:'discord', label:'Discord', href:ESN_DISCORD_URL, copy:'Support tickets and community' },
  { id:'rules', label:'Rules', href:'/rules', copy:'What you can run on ESN', internal:true },
]

export const HOME_FAQ = [
  ['How much does ESN hosting cost?', 'Plans start from $0.50/mo. Every plan and its monthly price is listed on the hosting page and at panel.esnoffical.com/plans.'],
  ['How do I buy a server and get it set up?', 'Pick a plan at panel.esnoffical.com/plans and pay through the official Stripe checkout. Your server is set up automatically after payment, and you manage it from the ESN panel.'],
  ['Can I move my server from another host?', 'Yes, for free. In the panel, open your server, go to Settings and use "Import from your old host". It copies your files over SFTP, FTP or a download link, up to 20 GB.'],
  ['How can I check whether ESN is online?', 'status.esnoffical.com shows the live status and uptime of every ESN node and service, checked every minute.'],
  ['How do I get help?', 'Open a ticket in the ESN Discord at discord.gg/RGPt3zEfGy, or use the live chat bubble on this site. Real people answer.'],
  ['What is the ESN SMP Store?', 'The official store for the ESN Minecraft SMP at smp.esnoffical.com. Ranks run from SUPPORTER ($0.99) up to OVERLORD ($14.99), paid through Stripe.'],
]

// Summarise status.json: overall state plus how many monitors are not operational.
export function summariseStatus(json){
  if(!json||typeof json!=='object'||!Array.isArray(json.groups))return null
  const monitors=json.groups.flatMap(group=>Array.isArray(group?.monitors)?group.monitors:[])
  if(!monitors.length)return null
  const operational=monitors.filter(monitor=>monitor?.status==='operational').length
  const issues=monitors.length-operational
  const overall=String(json.overall||'')
  return { overall, total:monitors.length, operational, issues, ok:overall==='operational'&&issues===0 }
}
