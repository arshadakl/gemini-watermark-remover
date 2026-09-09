<script setup lang="ts">
/**
 * Contact form — submits via FormSubmit.co (free, no signup, no API key).
 * To change the destination email, update FORMSUBMIT_EMAIL below and confirm
 * the activation link FormSubmit sends to that address on the first submission.
 *
 * Migration path: replace submit() with a POST to /api/contact (Cloudflare
 * Pages Function) when you outgrow FormSubmit's free 250 submissions/month.
 */
const route = useRoute()
const siteUrl = 'https://watermark-remover.arshadakl.in'
const pageUrl = siteUrl + route.path

const FORMSUBMIT_EMAIL = 'hello@arshadakl.in'

useSeoMeta({
  title: 'Contact — Watermark Remover',
  description: 'Get in touch with the Watermark Remover team for bug reports, feature requests, or general questions.',
  ogTitle: 'Contact — Watermark Remover',
  ogDescription: 'Reach the Watermark Remover team.',
  ogImage: `${siteUrl}/og/contact.png`,
  ogUrl: pageUrl,
  twitterCard: 'summary',
  robots: 'index, follow',
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
})

const name = ref('')
const email = ref('')
const message = ref('')
const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')
const errorMsg = ref('')

async function submit() {
  errorMsg.value = ''
  if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
    errorMsg.value = 'Please fill in every field.'
    return
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
    errorMsg.value = 'That email address looks off — please double-check.'
    return
  }

  status.value = 'sending'

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        message: message.value,
        _subject: `[Watermark Remover] New message from ${name.value}`,
        _template: 'table',
        _captcha: 'false',
        _replyto: email.value,
        _page: pageUrl,
      }),
    })

    if (!res.ok) {
      throw new Error(`FormSubmit responded ${res.status}`)
    }

    const json = await res.json().catch(() => ({} as any))
    if (json && json.success === 'false') {
      throw new Error(json.message || 'Submission failed')
    }

    status.value = 'success'
    name.value = ''
    email.value = ''
    message.value = ''
  } catch (e) {
    status.value = 'error'
    errorMsg.value =
      e instanceof Error
        ? `Could not send: ${e.message}. Please try again, or email us directly if the problem persists.`
        : 'Could not send. Please try again.'
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a]">
    <SiteNav />
    <div class="h-16" />

    <section class="relative overflow-hidden pt-12 pb-8">
      <div class="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent" />
      <div class="relative mx-auto max-w-3xl px-6 text-center">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-400">
          We'd love to hear from you
        </div>
        <h1 class="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Contact <span class="text-brand-400">us</span>
        </h1>
        <p class="text-sm text-gray-400">Bug reports, feature requests, and general questions all welcome.</p>
      </div>
    </section>

    <section class="py-12">
      <div class="mx-auto max-w-2xl px-6">
        <form
          v-if="status !== 'success'"
          class="space-y-5 rounded-2xl border border-white/5 bg-white/[0.02] p-8"
          @submit.prevent="submit"
        >
          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Your name</label>
            <input
              v-model="name"
              type="text"
              class="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500/40"
              placeholder="Ada Lovelace"
              autocomplete="name"
              :disabled="status === 'sending'"
            />
          </div>
          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Email address</label>
            <input
              v-model="email"
              type="email"
              class="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500/40"
              placeholder="you@example.com"
              autocomplete="email"
              :disabled="status === 'sending'"
            />
          </div>
          <div>
            <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Message</label>
            <textarea
              v-model="message"
              rows="6"
              class="w-full resize-none rounded-lg border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500/40"
              placeholder="Tell us what's on your mind…"
              :disabled="status === 'sending'"
            />
          </div>

          <div v-if="errorMsg" class="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{{ errorMsg }}</div>

          <button
            type="submit"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-brand-400 disabled:opacity-60"
            :disabled="status === 'sending'"
          >
            <svg v-if="status === 'sending'" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ status === 'sending' ? 'Sending…' : 'Send message' }}
          </button>
        </form>

        <div
          v-else
          class="space-y-5 rounded-2xl border border-brand-500/20 bg-brand-500/[0.04] p-8 text-center"
        >
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/20">
            <svg class="h-6 w-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-white">Message sent</h2>
          <p class="text-sm text-gray-400">
            Thanks for getting in touch. We read every message and aim to reply within 48 hours.
          </p>
          <button
            class="text-xs font-semibold text-brand-400 transition hover:text-brand-300"
            @click="status = 'idle'"
          >
            Send another message
          </button>
        </div>

        <div class="mt-10">
          <div class="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <h3 class="mb-1 text-sm font-semibold">Bug reports</h3>
            <p class="text-xs text-gray-500">
              If a file fails to process, please include the file format, resolution, and what step it failed at. Browser and version help too.
            </p>
          </div>
        </div>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>
