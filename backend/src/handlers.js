import { authenticate } from "./utils";

export async function handleRegister(body, env) {
  const { username, email } = body;
  const api_key = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO users (username, email, api_key, created_at) VALUES (?, ?, ?, ?)').bind(username, email, api_key, new Date().toISOString()).run();
  return { api_key };
}

// export async function handleHostBot(body, env, url) {
// //   const { user_id, token, name } = body;  // Add auth check in production
//   await env.DB.prepare('INSERT INTO bots (user_id, token, name, status, created_at) VALUES (?, ?, ?, ?, ?)').bind(user_id, token, name, 'active', new Date().toISOString()).run();
//   const webhookUrl = `https://${url.host}/webhook/${token}`;
// //   await fetch(`${env.TELEGRAM_API}/bot${token}/setWebhook?url=${webhookUrl}`);
//   return { success: true };
// }

export async function handleHostBot(body, env, url) {
    const { token, name } = body; // Don't expect user_id from body
    const request = { headers: { get: (key) => env.AUTH_HEADER || body.headers?.Authorization } }; // Fallback for testing; use proper headers in production
    const user = await authenticate(request, env); // Function from utils.js
    const user_id = user.user_id;
    
    if (!user_id || !token || !name) {
        throw new Error('Missing required fields');
    }
    
    await env.DB.prepare('INSERT INTO bots (user_id, token, name, status, created_at) VALUES (?, ?, ?, ?, ?)').bind(user_id, token, name, 'active', new Date().toISOString()).run();
    const webhookUrl = `https://${url.host}/webhook/${token}`;
    // await fetch(`${env.TELEGRAM_API}/bot${token}/setWebhook?url=${webhookUrl}`);
    return { success: true };
}


export async function handleCommand(body, env) {
  const { bot_id, command_name, script } = body;
  await env.DB.prepare(`
    INSERT INTO commands (bot_id, command_name, script, version, created_at)
    VALUES (?, ?, ?, 1, ?)
    ON CONFLICT (bot_id, command_name) DO UPDATE SET script = excluded.script, version = version + 1
  `).bind(bot_id, command_name, script, new Date().toISOString()).run();
  return { success: true };
}

export async function handleWebhook(body, env, token) {
  const bot = await env.DB.prepare('SELECT * FROM bots WHERE token = ?').bind(token).first();
  if (!bot) throw new Error('Bot not found');

  const message = body.message;
  if (message && message.text) {
    const command_name = message.text.split(' ')[0];
    const command = await env.DB.prepare('SELECT * FROM commands WHERE bot_id = ? AND command_name = ?').bind(bot.bot_id, command_name).first();
    if (command) {
      try {
        const func = new Function('message', command.script);
        const response = func(message);
        await fetch(`${env.TELEGRAM_API}/bot${token}/sendMessage?chat_id=${message.chat.id}&text=${response}`);
        await env.DB.prepare('UPDATE users SET points = points - 1 WHERE user_id = ?').bind(bot.user_id).run();
        await env.DB.prepare('INSERT INTO logs (bot_id, command_id, action, details, points_deducted, timestamp) VALUES (?, ?, ?, ?, ?, ?)').bind(bot.bot_id, command.command_id, 'script_executed', JSON.stringify({ output: response }), 1, new Date().toISOString()).run();
      } catch (error) {
        await env.DB.prepare('INSERT INTO logs (bot_id, command_id, action, details, timestamp) VALUES (?, ?, ?, ?, ?)').bind(bot.bot_id, command.command_id, 'error_in_script', error.message, new Date().toISOString()).run();
      }
    }
  }
  return { success: true };
}
