import { renderToString } from 'react-dom/server'
import { prerenderToNodeStream } from 'react-dom/static'
import { StaticRouter } from 'react-router-dom'
import App from './App'

const page = (url) => <StaticRouter location={url}><App /></StaticRouter>

// Build-time render of one route. The first pass loads the route's on-demand page code;
// the second pass then writes the finished page markup in place.
export async function render(url) {
  const { prelude } = await prerenderToNodeStream(page(url))
  for await (const chunk of prelude) void chunk
  return renderToString(page(url))
}
