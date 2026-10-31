import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ESN v3 palette: the older stylesheets use cyan/blue accents and navy surfaces.
// At build time they are mapped to the violet/lime palette so every page shares the new look.
const PALETTE = [
  [/#62f1ff\b/gi, '#a29bfe'],
  [/rgba\(\s*98\s*,\s*241\s*,\s*255\s*,/gi, 'rgba(162,155,254,'],
  [/#5aa[79]ff\b/gi, '#8b7cf6'],
  [/rgba\(\s*90\s*,\s*16[79]\s*,\s*255\s*,/gi, 'rgba(139,124,246,'],
  [/#3aa8ff\b/gi, '#6c5ce7'],
  [/rgba\(\s*(?:67\s*,\s*116|22\s*,\s*135)\s*,\s*25[05]\s*,/gi, 'rgba(108,92,231,'],
  [/#2(?:44b92|34a91)\b/gi, '#3d2f8f'],
  [/#(?:02050d|020711|030711|030712|050711)\b/gi, '#060509'],
  [/#(?:07101f|06101f|050b17|0a1728|0b111b|090d1a|0b1020)\b/gi, '#0e0c17'],
  [/#0f1730\b/gi, '#171428'],
  [/#(?:a9fbff|dffaff|dffcff|e8f7ff|eefaff|dcecff)\b/gi, '#ece9ff'],
]

function esnPalette() {
  return {
    name: 'esn-palette',
    enforce: 'pre',
    transform(code, id) {
      if (!/\.css(\?|$)/.test(id) || id.includes('/sites/')) return null
      let out = code
      for (const [from, to] of PALETTE) out = out.replace(from, to)
      return out === code ? null : { code: out, map: null }
    },
  }
}

export default defineConfig({
  plugins: [esnPalette(), react()],
  build: {
    sourcemap: true,
  },
})
