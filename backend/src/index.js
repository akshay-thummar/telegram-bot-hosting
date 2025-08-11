import { runMigrations } from './migrations.js';
import { handleRegister, handleHostBot, handleCommand, handleGetCommands, handleUpdateCommand, handleDeleteCommand, handleWebhook, handleLogin } from './handlers.js';
import { authenticate } from './utils.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let body;
    try {
      body = request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE' ? await request.json() : null;
    } catch (e) {
      return new Response('Invalid JSON', { status: 400 });
    }

    try {
      if (url.pathname === '/migrate') {
        await runMigrations(env);
        return new Response('Migration complete');
      }

      if (url.pathname === '/register' && request.method === 'POST') {
        const result = await handleRegister(body, env);
        return Response.json(result);
      }

      if (url.pathname === '/host-bot' && request.method === 'POST') {
        const user = await authenticate(request, env);
        const result = await handleHostBot(body, env, url, user.user_id);
        return Response.json(result);
      }

      // commands apis
      if (url.pathname === '/command' && request.method === 'POST') {
        const user = await authenticate(request, env);
        const result = await handleCommand(body, env, user.user_id);
        return Response.json(result);
      }

      // Get commands
      if (url.pathname === '/get-commands' && request.method === 'GET') {
        const user = await authenticate(request, env);
        const bot_id = url.searchParams.get('bot_id');
        const result = await handleGetCommands(bot_id, env, user.user_id);
        return Response.json(result);
      }

      // update command
      if (url.pathname === '/update-command' && request.method === 'PUT') {
        const user = await authenticate(request, env);
        const result = await handleUpdateCommand(body, env, user.user_id);
        return Response.json(result);
      }

      // Delete command
      if (url.pathname === '/delete-command' && request.method === 'DELETE') {
        const user = await authenticate(request, env);
        const result = await handleDeleteCommand(body, env, user.user_id);
        return Response.json(result);
      }

      if (url.pathname.startsWith('/webhook/') && request.method === 'POST') {
        const token = url.pathname.split('/webhook/')[1];
        await handleWebhook(body, env, token);
        return new Response('OK');
      }

      if (url.pathname === '/get-bots' && request.method === 'GET') {
        const user = await authenticate(request, env);
        const bots = await env.DB.prepare('SELECT * FROM bots WHERE user_id = ?').bind(user.user_id).all();
        return Response.json(bots.results);
      }

      if (url.pathname === '/get-points' && request.method === 'GET') {
        const user = await authenticate(request, env);
        const bots = await env.DB.prepare('SELECT points FROM users WHERE user_id = ?').bind(user.user_id).all();
        return Response.json(bots.results);
      }

      if (url.pathname === '/get-logs' && request.method === 'GET') {
        const user = await authenticate(request, env);
        const bots = await env.DB.prepare('SELECT * FROM logs WHERE user_id = ?').bind(user.user_id).all();
        return Response.json(bots.results);
      }

      if (url.pathname === '/login' && request.method === 'POST') {
        // const user = await authenticate(request, env);
        const result = await handleLogin(body, env);
        return Response.json({ valid: true, apiKey: result.api_key, username: result.username });
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      return new Response(error.message, { status: 500 });
    }
  }
};
