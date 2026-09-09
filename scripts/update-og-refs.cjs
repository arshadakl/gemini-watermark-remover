const fs = require('fs');
const path = require('path');

const files = [
  'pages/index.vue',
  'pages/about.vue',
  'pages/privacy-policy.vue',
  'pages/terms.vue',
  'pages/contact.vue',
  'pages/how-it-works.vue',
  'pages/image-watermark-remover.vue',
  'pages/video-watermark-remover.vue',
  'pages/nano-banana-watermark-remover.vue',
  'pages/veo-watermark-remover.vue',
  'pages/google-flow-watermark-remover.vue',
  'pages/blog/index.vue',
  'pages/blog/google-removes-visible-gemini-watermark.vue',
  'pages/blog/how-to-remove-gemini-watermark.vue',
  'pages/blog/why-google-watermarks-gemini-images.vue',
  'pages/blog/gemini-vs-chatgpt-vs-midjourney-watermark.vue',
  'pages/blog/remove-gemini-watermark-photoshop.vue',
  'pages/blog/remove-gemini-watermark-gimp.vue',
  'pages/blog/synthid-vs-visible-watermark.vue',
  'pages/blog/gemini-watermark-chrome-extension-vs-online-tool.vue',
  'pages/blog/remove-gemini-watermark-youtube-thumbnail.vue',
  'pages/blog/remove-gemini-watermark-print-on-demand.vue',
  'pages/blog/remove-gemini-watermark-social-media.vue',
  'pages/blog/reverse-alpha-blending-explained.vue',
];

function slugFor(file) {
  const withoutExt = file.replace(/^pages\//, '').replace(/\.vue$/, '');
  if (withoutExt === 'index') return 'index';
  return withoutExt;
}

let updated = 0;
let skipped = 0;
for (const file of files) {
  const slug = slugFor(file);
  const newPath = '/og/' + slug + '.svg';
  let content = fs.readFileSync(file, 'utf8');

  // Replace the ogImage line
  const oldPattern = /ogImage:\s*`\$\{siteUrl\}\/og-image\.png`/;
  const newLine = 'ogImage: `' + '${siteUrl}' + newPath + '`';

  if (!oldPattern.test(content)) {
    console.log('SKIP ' + file + ' (pattern not found)');
    skipped++;
    continue;
  }

  content = content.replace(oldPattern, newLine);
  fs.writeFileSync(file, content);
  console.log('OK   ' + file + ' -> ' + newPath);
  updated++;
}

console.log('\nUpdated ' + updated + '/' + files.length + ' files' + (skipped ? ' (skipped ' + skipped + ')' : ''));
