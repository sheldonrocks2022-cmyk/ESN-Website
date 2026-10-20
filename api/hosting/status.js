// Public hosting responses must never disclose infrastructure node identities,
// providers, capacity, regions or raw environment configuration.
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0')
  return res.status(200).json({
    visibility: 'private',
    availability: 'contact_support',
    message: 'Please open an official ESN Hosting ticket to check service availability.',
  })
}
