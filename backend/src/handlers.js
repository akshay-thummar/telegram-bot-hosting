import { authenticate } from "./utils";
import bcrypt from 'bcryptjs';

// export async function handleRegister(body, env) {
//   const { username, email } = body;
//   const api_key = crypto.randomUUID();
//   await env.DB.prepare('INSERT INTO users (username, email, api_key, created_at) VALUES (?, ?, ?, ?)').bind(username, email, api_key, new Date().toISOString()).run();
//   return { api_key };
// }

export async function handleRegister(body, env) {
  const { username, email, password } = body;
  if (!password) throw new Error('Password required');
  const password_hash = await bcrypt.hash(password, 10); // salt rounds
  const api_key = crypto.randomUUID();
  try {
    await env.DB.prepare(`
      INSERT INTO users (username, email, api_key, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(username, email, api_key, password_hash, new Date().toISOString()).run();
    return { api_key };
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'User already exists with this email or username.' };
    }
    throw error;
  }
}

export async function handleLogin(body, env) {
  const { email, password } = body;
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user) throw new Error('User not found');
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Invalid password');
  return { api_key: user.api_key, username: user.username };
}

export async function handleHostBot(body, env, url, user_id) {
  const { token, name } = body;
  if (!user_id || !token || !name) throw new Error('Missing required fields');
  await env.DB.prepare('INSERT INTO bots (user_id, token, name, status, created_at) VALUES (?, ?, ?, ?, ?)').bind(user_id, token, name, 'active', new Date().toISOString()).run();
  const webhookUrl = `https://${url.host}/webhook/${token}`;
  await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
  return { success: true };
}


// export async function handleCommand(body, env) {
//   const { bot_id, command_name, script } = body;
//   await env.DB.prepare(`
//     INSERT INTO commands (bot_id, command_name, script, version, created_at)
//     VALUES (?, ?, ?, 1, ?)
//     ON CONFLICT (bot_id, command_name) DO UPDATE SET script = excluded.script, version = version + 1
//   `).bind(bot_id, command_name, script, new Date().toISOString()).run();
//   return { success: true };
// }

export async function handleCommand(body, env, user_id) {
  const { bot_id, command_name, script } = body;
  const bot = await env.DB.prepare('SELECT * FROM bots WHERE bot_id = ? AND user_id = ?').bind(bot_id, user_id).first();
  if (!bot) throw new Error('Bot not found or not owned by user');
  try {
    await env.DB.prepare(`
      INSERT INTO commands (bot_id, command_name, script, version, created_at)
      VALUES (?, ?, ?, 1, ?)
    `).bind(bot_id, command_name, script, new Date().toISOString()).run();
    return { success: true };
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      // UNIQUE (bot_id, command_name) is enforced in your schema
      return { success: false, error: 'Command already exists with this name.' };
    }
    throw error; // other errors bubble up
  }
}

export async function handleGetCommands(bot_id, env, user_id) {
  if (!bot_id) return { error: 'Missing bot_id' };
  const bot = await env.DB.prepare(
    'SELECT * FROM bots WHERE bot_id = ? AND user_id = ?'
  ).bind(bot_id, user_id).first();
  if (!bot) return { error: 'Bot not found or not owned by user' };
  const commands = await env.DB.prepare(
    'SELECT * FROM commands WHERE bot_id = ?'
  ).bind(bot_id).all();
  return commands.results;
}

export async function handleUpdateCommand(body, env, user_id) {
  const { bot_id, command_id, command_name, script } = body;
  if (!bot_id || !command_id || !command_name || !script) {
    return { error: 'Missing required fields' };
  }
  const bot = await env.DB.prepare(
    'SELECT * FROM bots WHERE bot_id = ? AND user_id = ?'
  ).bind(bot_id, user_id).first();
  if (!bot) return { error: 'Bot not found or not owned by user' };
  try {
    await env.DB.prepare(
      `UPDATE commands
      SET command_name = ?, script = ?, version = version + 1, last_executed = NULL
      WHERE command_id = ? AND bot_id = ?`
    ).bind(command_name, script, command_id, bot_id).run();
    return { success: true };
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE')) {
      return { success: false, error: 'Command name already exists for this bot.' };
    }
    throw error;
  }
}


export async function handleDeleteCommand(body, env, user_id) {
  const { bot_id, command_id } = body;
  if (!bot_id || !command_id) {
    return { error: 'Missing required fields' };
  }
  const bot = await env.DB.prepare(
    'SELECT * FROM bots WHERE bot_id = ? AND user_id = ?'
  ).bind(bot_id, user_id).first();
  if (!bot) return { error: 'Bot not found or not owned by user' };
  await env.DB.prepare(
    'DELETE FROM commands WHERE command_id = ? AND bot_id = ?'
  ).bind(command_id, bot_id).run();
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
