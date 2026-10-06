function safeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

function nodeFromEnvironment() {
  if (!process.env.ESN_NODE_1_NAME) return null
  return {
    id: 'node-1',
    name: process.env.ESN_NODE_1_NAME,
    provider: process.env.ESN_NODE_1_PROVIDER || 'Cloud',
    status: process.env.ESN_NODE_1_STATUS || 'provisioning',
    ramGb: safeNumber(process.env.ESN_NODE_1_RAM_GB),
    cpu: process.env.ESN_NODE_1_CPU || null,
    region: process.env.ESN_NODE_1_REGION || null,
    role: process.env.ESN_NODE_1_ROLE || 'Compute',
  }
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0')
  const nodes = [nodeFromEnvironment()].filter(Boolean)
  return res.status(200).json({
    connected: nodes.length > 0,
    controller: nodes.length ? 'configured' : 'not-configured',
    nodes,
    updatedAt: new Date().toISOString(),
  })
}
