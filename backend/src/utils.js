export async function authenticate(request, env) {
  const apiKey = request.headers.get('Authorization');
  if (!apiKey) throw new Error('Missing Authorization header');
  const user = await env.DB.prepare('SELECT * FROM users WHERE api_key = ?').bind(apiKey).first();
  if (!user) throw new Error('Invalid API key');
  return user;
}
