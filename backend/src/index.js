import { runMigrations } from './migrations.js';
import { handleRegister, handleHostBot, handleCommand, handleWebhook } from './handlers.js';
import { authenticate } from './utils.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let body;
    try {
      body = request.method === 'POST' ? await request.json() : null;
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
      // if (url.pathname === '/host-bot' && request.method === 'POST') {
      //   const result = await handleHostBot(body, env, url);
      //   return Response.json(result);
      // }
      if (url.pathname === '/host-bot' && request.method === 'POST') {
        const result = await handleHostBot(body, env, url, user);
        return Response.json(result);
      }

      if (url.pathname === '/command' && request.method === 'POST') {
        const result = await handleCommand(body, env);
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
      if (url.pathname === '/validate-key' && request.method === 'GET') {
        const user = await authenticate(request, env);
        return Response.json({ valid: true, user_id: user.user_id });
      }



      return new Response('Not Found', { status: 404 });
    } catch (error) {
      return new Response(error.message, { status: 500 });
    }
  }
};
