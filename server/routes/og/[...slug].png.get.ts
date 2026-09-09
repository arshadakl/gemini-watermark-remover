/**
 * Dynamic OG image generator — PNG output for WhatsApp / Twitter / universal use.
 *
 * Route: GET /og/<anything>.png
 *
 * Catch-all route that returns a 1200x630 PNG Open Graph image with the
 * page-specific title and subtitle baked in. Slugs can include slashes
 * (e.g. 'blog/reverse-alpha-blending-explained'), which lets one route
 * serve every page's OG image.
 *
 * Why PNG and not SVG:
 *   SVG is supported by Facebook, LinkedIn, Discord, Slack, etc.
 *   WhatsApp and Twitter/X REQUIRE PNG/JPG — their crawlers do not
 *   render SVG previews. Serving PNG makes the link preview work
 *   everywhere.
 *
 * Build-time: every /og/*.png URL is added to nitro.prerender.routes, so
 * `nuxt generate` hits this route once per slug, saves the PNG output as
 * a static file in .output/public/og/, and Cloudflare Pages serves it
 * as a plain asset. No runtime, no Functions, no monthly cost.
 */

import { Resvg } from '@resvg/resvg-js'

interface PageMeta {
  title: string
  subtitle: string
  badge?: string
}

const PAGES: Record<string, PageMeta> = {
  'index': {
    title: 'Free Gemini Watermark Remover',
    subtitle: 'AI Image & Video · 100% in your browser',
    badge: 'watermark-remover.arshadakl.in',
  },
  'image-watermark-remover': {
    title: 'Gemini Image Watermark Remover',
    subtitle: 'Free, Private, Pixel-Perfect',
    badge: 'watermark-remover.arshadakl.in',
  },
  'video-watermark-remover': {
    title: 'Gemini Video Watermark Remover',
    subtitle: 'Strip Veo & Flow sparkle, every frame',
    badge: 'watermark-remover.arshadakl.in',
  },
  'nano-banana-watermark-remover': {
    title: 'Nano Banana Watermark Remover',
    subtitle: 'Free, browser-based',
    badge: 'watermark-remover.arshadakl.in',
  },
  'veo-watermark-remover': {
    title: 'Veo Watermark Remover',
    subtitle: 'Free, frame-perfect video cleanup',
    badge: 'watermark-remover.arshadakl.in',
  },
  'google-flow-watermark-remover': {
    title: 'Google Flow Watermark Remover',
    subtitle: 'Clean Flow exports, free',
    badge: 'watermark-remover.arshadakl.in',
  },
  'how-it-works': {
    title: 'How Gemini Watermark Removal Works',
    subtitle: 'Reverse alpha blending explained',
    badge: 'watermark-remover.arshadakl.in',
  },
  'about': {
    title: 'About Watermark Remover',
    subtitle: 'Built by Arshad · arshadakl.in',
    badge: 'watermark-remover.arshadakl.in',
  },
  'contact': {
    title: 'Contact Watermark Remover',
    subtitle: 'Bug reports, feature requests',
    badge: 'watermark-remover.arshadakl.in',
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    subtitle: 'We collect nothing. All in your browser.',
    badge: 'watermark-remover.arshadakl.in',
  },
  'terms': {
    title: 'Terms of Service',
    subtitle: 'Permitted use, prohibited use, disclaimers',
    badge: 'watermark-remover.arshadakl.in',
  },
  'blog': {
    title: 'The Blog',
    subtitle: 'Guides, news, and technical deep-dives',
    badge: 'watermark-remover.arshadakl.in',
  },
  'blog/index': {
    title: 'The Blog',
    subtitle: 'Guides, news, and technical deep-dives',
    badge: 'watermark-remover.arshadakl.in',
  },
  'blog/google-removes-visible-gemini-watermark': {
    title: "Google Just Made Gemini Watermarks Optional",
    subtitle: "August 2026 update · what changed, what didn't",
    badge: 'watermark-remover.arshadakl.in',
  },
  'blog/how-to-remove-gemini-watermark': {
    title: 'How to Remove the Gemini Watermark',
    subtitle: 'In 10 seconds. No Photoshop, no upload.',
    badge: 'watermark-remover.arshadakl.in',
  },
  'blog/why-google-watermarks-gemini-images': {
    title: 'Why Google Watermarks Gemini Images',
    subtitle: 'The history and the August 2026 reversal',
    badge: 'watermark-remover.arshadakl.in',
  },
  'blog/gemini-vs-chatgpt-vs-midjourney-watermark': {
    title: 'Gemini vs ChatGPT vs Midjourney',
    subtitle: 'Which AI image generator has the cleanest output?',
    badge: 'watermark-remover.arshadakl.in',
  },
  'blog/remove-gemini-watermark-photoshop': {
    title: 'Remove the Gemini Watermark in Photoshop',
    subtitle: 'And a faster one-click alternative',
    badge: 'watermark-remover.arshadakl.in',
  },
  'blog/remove-gemini-watermark-gimp': {
    title: 'Remove the Gemini Watermark in GIMP',
    subtitle: 'Free desktop tutorial',
    badge: 'watermark-remover.arshadakl.in',
  },
  'blog/synthid-vs-visible-watermark': {
    title: 'SynthID vs the Visible Watermark',
    subtitle: 'What stays after you strip the logo',
    badge: 'watermark-remover.arshadakl.in',
  },
  'blog/gemini-watermark-chrome-extension-vs-online-tool': {
    title: 'Chrome Extension vs Online Tool',
    subtitle: 'Two workflows, one job — which fits yours?',
    badge: 'watermark-remover.arshadakl.in',
  },
  'blog/remove-gemini-watermark-youtube-thumbnail': {
    title: 'Gemini Images for YouTube Thumbnails',
    subtitle: 'Strip the watermark the right way',
    badge: 'watermark-remover.arshadakl.in',
  },
  'blog/remove-gemini-watermark-print-on-demand': {
    title: 'Cleaning Gemini Images for Print on Demand',
    subtitle: 'Redbubble, Merch by Amazon, TeePublic',
    badge: 'watermark-remover.arshadakl.in',
  },
  'blog/remove-gemini-watermark-social-media': {
    title: 'Gemini Watermark Remover for Social Media',
    subtitle: 'Instagram, TikTok, and X',
    badge: 'watermark-remover.arshadakl.in',
  },
  'blog/reverse-alpha-blending-explained': {
    title: 'Reverse Alpha Blending Explained',
    subtitle: 'The math behind removing AI watermarks',
    badge: 'watermark-remover.arshadakl.in',
  },
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapTitle(title: string, maxChars: number): string[] {
  if (title.length <= maxChars) return [title]
  const words = title.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim())
      current = word
    } else {
      current = (current + ' ' + word).trim()
    }
  }
  if (current) lines.push(current.trim())
  return lines.slice(0, 3)
}

function generateSvg(meta: PageMeta): string {
  const titleLines = wrapTitle(meta.title, 22)
  const lineHeight = 86
  const titleStartY = 340 - ((titleLines.length - 1) * lineHeight) / 2

  // Use generic font-family so resvg falls back to whatever sans-serif
  // is available on the build host (DejaVu Sans on Linux, Arial on Windows).
  const fontFamily = 'Arial, Helvetica, sans-serif'

  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="600" y="${titleStartY + i * lineHeight}" text-anchor="middle" font-family="${fontFamily}" font-size="76" font-weight="700" fill="#ffffff" letter-spacing="-1.5">${escapeXml(line)}</text>`,
    )
    .join('\n      ')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0a" />
      <stop offset="100%" stop-color="#0d1a0d" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="55%">
      <stop offset="0%" stop-color="#84cc16" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#84cc16" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />
  <rect width="1200" height="630" fill="url(#glow)" />

  <g transform="translate(60, 50)">
    <rect x="0" y="0" width="46" height="46" rx="11" fill="#84cc16" fill-opacity="0.18" />
    <path d="M23 5 L29 17 L42 19 L33 28 L35 41 L23 35 L11 41 L13 28 L4 19 L17 17 Z" fill="#84cc16" />
    <text x="62" y="32" font-family="${fontFamily}" font-size="22" font-weight="700" fill="#ffffff">Watermark Remover</text>
  </g>

  <g transform="translate(1140, 60)">
    <rect x="-220" y="0" width="220" height="34" rx="17" fill="#84cc16" fill-opacity="0.12" stroke="#84cc16" stroke-opacity="0.25" stroke-width="1" />
    <circle cx="-200" cy="17" r="3.5" fill="#84cc16" />
    <text x="-188" y="23" font-family="${fontFamily}" font-size="14" font-weight="600" fill="#84cc16">Free · No upload · No signup</text>
  </g>

  <g transform="translate(600, 175)" opacity="0.95">
    <path d="M0 -55 L13 -13 L55 0 L13 13 L0 55 L-13 13 L-55 0 L-13 -13 Z" fill="#84cc16" />
    <circle cx="0" cy="0" r="6" fill="#0a0a0a" />
  </g>

  ${titleSvg.split('\n').map((l) => '  ' + l.trim()).join('\n  ')}

  <text x="600" y="${titleStartY + titleLines.length * lineHeight + 10}" text-anchor="middle" font-family="${fontFamily}" font-size="30" font-weight="500" fill="#84cc16">${escapeXml(meta.subtitle)}</text>

  <line x1="500" y1="555" x2="700" y2="555" stroke="#84cc16" stroke-opacity="0.3" stroke-width="1" />
  <text x="600" y="590" text-anchor="middle" font-family="${fontFamily}" font-size="20" font-weight="600" fill="#999999" letter-spacing="0.5">${escapeXml(meta.badge || 'watermark-remover.arshadakl.in')}</text>
</svg>
`
}

export default defineEventHandler((event) => {
  // Catch-all route + .png.get.ts extension doesn't reliably capture the
  // multi-segment slug via getRouterParam in h3, so we parse the URL
  // path directly. Path looks like "/og/<slug>.png" where <slug> may
  // contain forward slashes for nested pages.
  const urlPath = event.path || ''
  let slug = urlPath.replace(/^\/og\//, '').replace(/\.png$/, '').replace(/\/$/, '')
  if (!slug) slug = 'index'

  const meta = PAGES[slug] || PAGES['index']

  const svg = generateSvg(meta)

  // Render SVG → PNG using resvg (no font files needed, system fallback).
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    background: '#0a0a0a',
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Arial',
    },
  })

  const png = resvg.render().asPng()

  setHeader(event, 'Content-Type', 'image/png')
  setHeader(event, 'Content-Length', String(png.byteLength))
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  return png
})
