export default defineNuxtConfig({
  ssr: false,
  modules: ['@nuxtjs/tailwindcss'],
  devtools: { enabled: true },
  nitro: {
    prerender: {
      autoSubfolderIndex: false,
    },
  },
  app: {
    head: {
      title: 'Gemini Watermark Remover',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Remove Gemini AI watermarks from images and videos — 100% client-side, no upload to any server.',
        },
      ],
    },
  },
})
