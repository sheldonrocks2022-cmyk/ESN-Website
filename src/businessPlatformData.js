// Shared browser-preview configuration. Not an authentication or billing backend.
// Production business actions require a verified server-side service.
export const BUSINESS_SETTINGS_KEY = 'esn_business_settings_v1'
export const BUSINESS_DRAFTS_KEY = 'esn_business_drafts_v1'
export const BUSINESS_AUDIT_KEY = 'esn_business_audit_v1'
export const DISCORD_HOSTING = 'https://discord.gg/RGPt3zEfGy'

export const CAPABILITIES = [
  {id:'dashboard',title:'Customer workspace',copy:'Keep a local copy of your plan choices, requests, and setup checklist.',path:'/business/dashboard'},
  {id:'orders',title:'Buy hosting',copy:'Pick a plan and pay on the ESN panel. Your server is set up automatically after checkout.',path:'/hosting/vps'},
  {id:'status',title:'Service status',copy:'Find public uptime information, incidents, and maintenance notices.',path:'/status'},
  {id:'planfinder',title:'Plan finder',copy:'Get an indicative recommendation by project workload.',path:'/business/plans'},
  {id:'rewards',title:'Customer rewards',copy:'Review benefit rules; staff must confirm rewards and credits.',path:'/business/rewards'},
  {id:'partners',title:'Partner applications',copy:'Apply for partnerships and prepare a referral request.',path:'/business/partners'},
  {id:'trials',title:'Plans from $0.50/month',copy:'Discord bot hosting from $0.50/month, set up automatically after checkout.',path:'/business/plans'},
  {id:'upgrades',title:'Server upgrades',copy:'Plan an upgrade and request a confirmed quote.',path:'/business/dashboard'},
  {id:'support',title:'Support center',copy:'Find the right route for billing, setup, and troubleshooting.',path:'/business/support'},
  {id:'compare',title:'Compare hosting plans',copy:'Compare monthly prices, CPU, RAM, and storage side by side.',path:'/business/plans'},
  {id:'referrals',title:'Customer referrals',copy:'Get information about verified referral rewards and eligibility.',path:'/business/partners'},
  {id:'loyalty',title:'Loyalty levels',copy:'See proposed loyalty tiers and staff-verified benefits.',path:'/business/rewards'},
  {id:'setup',title:'Bot setup wizard',copy:'Follow a basic Python or Node.js deployment walkthrough.',path:'/business/setup'},
  {id:'milestones',title:'Community milestones',copy:'Only show numbers when ESN staff confirms them.',path:'/business/rewards'},
  {id:'reviews',title:'Customer reviews',copy:'Read verified reviews and submit feedback through support.',path:'/testimonials'},
]

export const DEFAULT_BUSINESS_SETTINGS = {
  version:1,
  headline:'Good hosting, without the headache.',
  introduction:'We help creators and communities run Discord bots, build websites, and get useful support from real people.',
  planFinderEnabled:true,
  compareEnabled:true,
  customerWorkspaceEnabled:true,
  trialsEnabled:false,
  trialDays:7,
  trialPlan:'Plus',
  partnerApplicationsEnabled:true,
  referralApplicationsEnabled:true,
  rewardsInfoEnabled:true,
  loyaltyInfoEnabled:true,
  milestoneEnabled:false,
  milestoneMembers:'',
  milestoneCustomers:'',
  featuredPlan:'Pro',
  supportMessage:'Buy plans on the ESN panel. For billing questions and technical support, use the hosting docs, the live chat bubble, or an official Discord ticket.',
  maintenanceNotice:'',
  rewardPolicy:'Credits and benefits require staff approval after a qualifying purchase or referral. No rewards are automatically granted.',
  loyaltyPolicy:'Long-term customer perks are reviewed manually. The website does not currently track verified renewal history.',
  lastPublishedAt:null,
}

export function readBusinessSettings(){
  try{
    const incoming=JSON.parse(localStorage.getItem(BUSINESS_SETTINGS_KEY)||'null')
    if(!incoming||typeof incoming!=='object'||Array.isArray(incoming))return {...DEFAULT_BUSINESS_SETTINGS}
    return {...DEFAULT_BUSINESS_SETTINGS,...incoming}
  }catch{return {...DEFAULT_BUSINESS_SETTINGS}}
}
export function writeBusinessSettings(next){
  const merged={...DEFAULT_BUSINESS_SETTINGS,...next,version:1}
  try{localStorage.setItem(BUSINESS_SETTINGS_KEY,JSON.stringify(merged))}catch{}
  window.dispatchEvent(new Event('esn-business-change'))
  return merged
}
export function readBusinessDrafts(){
  try{
    const value=JSON.parse(localStorage.getItem(BUSINESS_DRAFTS_KEY)||'[]')
    return Array.isArray(value)?value.filter(v=>v&&typeof v==='object').slice(0,30):[]
  }catch{return[]}
}
export function writeBusinessDrafts(next){
  try{localStorage.setItem(BUSINESS_DRAFTS_KEY,JSON.stringify(next.slice(0,30)))}catch{}
  window.dispatchEvent(new Event('esn-business-drafts-change'))
}
export function addBusinessAudit(message){
  let entries=[]
  try{entries=JSON.parse(localStorage.getItem(BUSINESS_AUDIT_KEY)||'[]')}catch{}
  if(!Array.isArray(entries))entries=[]
  const next=[{at:new Date().toISOString(),message:String(message).slice(0,180)},...entries].slice(0,50)
  try{localStorage.setItem(BUSINESS_AUDIT_KEY,JSON.stringify(next))}catch{}
}
export function createLocalDraft(type,plan,notes=''){
  const safeType=String(type).slice(0,48)
  const safePlan=String(plan).slice(0,48)
  const item={
    id:'ESN-LOCAL-'+Date.now().toString(36).toUpperCase(),
    type:safeType,plan:safePlan,notes:String(notes).slice(0,240),
    status:'DRAFT ONLY',createdAt:new Date().toISOString(),
  }
  writeBusinessDrafts([item,...readBusinessDrafts()])
  return item
}
export function ticketMessage(type,plan,details=''){
  return ['ESN HOSTING — '+String(type).toUpperCase(),'Selected plan: '+String(plan),
    details?'Details: '+String(details).slice(0,400):'',
    'Please confirm eligibility, availability, pricing and next steps with an authorized ESN staff member.',
    'This message is a request only. No payment or server has been created.'].filter(Boolean).join('\n')
}
export const SETUP_GUIDES={
  Python:[
    'Create a Python bot project with a requirements.txt file listing your dependencies.',
    'Store your Discord token in the Pterodactyl environment variables; never paste tokens into public files.',
    'Set the startup command to run the entry script (for example: python main.py).',
    'Upload your project using the file manager or SFTP, then install dependencies if required.',
    'Start the server and inspect the console. If it crashes, check the error before restarting.',
  ],
  'Node.js':[
    'Create a Node.js project with package.json and a lockfile.',
    'Store your Discord token as an environment variable, not directly in the source.',
    'Set the startup command to npm start (or node index.js when appropriate).',
    'Upload files with the panel or SFTP, then install your locked dependencies.',
    'Start the server and review logs for errors and Discord gateway connection.',
  ],
}
