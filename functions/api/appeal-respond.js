// functions/api/appeal-respond.js
// 14-T Appeal Respond API — issuer sends a response, optionally locking the thread

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
    const { id, response, lock, photo_base64 } = await request.json();

    if (!id || !response) {
      return new Response(JSON.stringify({ error: 'Missing id or response.' }), { status: 400, headers });
    }

    const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return new Response(JSON.stringify({ error: 'Ticket not found.' }), { status: 404, headers });
    if (ticket.status === 'resolved') return new Response(JSON.stringify({ error: 'Ticket already resolved.' }), { status: 400, headers });

    const newStatus = lock ? 'locked' : ticket.status;

    await env.DB.prepare(
      `UPDATE tickets SET appeal_response = ?, appeal_response_photo = ?, appeal_response_locked = ?, status = ? WHERE id = ?`
    ).bind(
      response,
      photo_base64 || null,
      lock ? 1 : 0,
      newStatus,
      id
    ).run();

    return new Response(JSON.stringify({ success: true, locked: !!lock }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
