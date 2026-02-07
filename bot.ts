import { Telegraf } from 'telegraf'
import Fastify from 'fastify'
import 'dotenv/config'

const bot = new Telegraf(process.env.BOT_TOKEN!)
const fastify = Fastify()

// A simple set to store chat IDs.
// In production, use a database like PostgreSQL or MongoDB.
const subscribedChats = new Set<number>()

// --- Telegram Bot Logic ---

bot.start(ctx => {
  subscribedChats.add(ctx.chat.id)
  ctx.reply('✅ Subscribed! I will notify you of repo updates.')
})

bot.command('stop', ctx => {
  subscribedChats.delete(ctx.chat.id)
  ctx.reply('❌ Unsubscribed.')
})

// --- Webhook Listener Logic ---

fastify.post('/webhook', async (request, reply) => {
  const event = request.headers['x-github-event']
  const data: any = request.body

  let message = ''

  if (event === 'push') {
    const repo = data.repository.full_name
    const commits = data.commits.map((c: any) => `- ${c.message}`).join('\n')
    message = `🚀 **New Push to ${repo}**\n${commits}`
  }

  if (event === 'issues' && data.action === 'opened') {
    message = `⚠️ **New Issue**: ${data.issue.title}\nBy: ${data.sender.login}`
  }

  // Broadcast to all chats
  if (message) {
    for (const chatId of subscribedChats) {
      await bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'Markdown'
      })
    }
  }

  return { ok: true }
})

// Start everything
const start = async () => {
  await bot.launch()
  await fastify.listen({ port: 3300 })
  console.log('Bot is running and Webhook listener is live on port 3300')
}

start()
