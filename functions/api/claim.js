// functions/api/claim.js
// 14-T Claim API — unknown ticket recipient claims ownership

export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers });
  }

  try {
    const { id, name } = await request.json();

    if (!id || !name) {
      return new Response(JSON.stringify({ error: 'Missing id or name.' }), { status: 400, headers });
    }

    const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return new Response(JSON.stringify({ error: 'Ticket not found.' }), { status: 404, headers });
    if (!ticket.is_unknown) return new Response(JSON.stringify({ error: 'This ticket is not claimable.' }), { status: 400, headers });
    if (ticket.claimed_name) return new Response(JSON.stringify({ error: 'This ticket has already been claimed.' }), { status: 400, headers });

    await env.DB.prepare(
      `UPDATE tickets SET claimed_name = ? WHERE id = ?`
    ).bind(name.trim(), id).run();

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
