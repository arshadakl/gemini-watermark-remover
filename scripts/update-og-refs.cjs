const fs = require('fs');

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

const oldPattern = /ogImage:\s*`\$\{siteUrl\}\/og\/([^`]+)\.svg`/;

let updated = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!oldPattern.test(content)) {
    console.log('SKIP ' + file + ' (pattern not found)');
    continue;
  }
  content = content.replace(oldPattern, (match, slug) => `ogImage: \`${'${siteUrl}'}/og/${slug}.png\``);
  fs.writeFileSync(file, content);
  console.log('OK   ' + file);
  updated++;
}

console.log('\nUpdated ' + updated + '/' + files.length + ' files');
