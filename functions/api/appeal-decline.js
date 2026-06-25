// functions/api/appeal-decline.js
export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers });
  try {
    const { id, reopen } = await request.json();
    if (!id) return new Response(JSON.stringify({ error: 'Missing id.' }), { status: 400, headers });

    const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return new Response(JSON.stringify({ error: 'Not found.' }), { status: 404, headers });
    if (ticket.status === 'resolved') return new Response(JSON.stringify({ error: 'Ticket already resolved.' }), { status: 400, headers });

    if (reopen) {
      // Reopen: clear declined flag, unlock thread so they can respond again
      await env.DB.prepare(
        `UPDATE tickets SET appeal_declined = 0, appeal_response_locked = 0 WHERE id = ?`
      ).bind(id).run();
    } else {
      // Decline: mark declined, lock thread, points remain
      await env.DB.prepare(
        `UPDATE tickets SET appeal_declined = 1, appeal_response_locked = 1 WHERE id = ?`
      ).bind(id).run();
    }

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
