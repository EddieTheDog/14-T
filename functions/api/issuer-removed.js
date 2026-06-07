// functions/api/issuer-removed.js
// 14-T Issuer Removed API — issuer physically removed the item, closes ticket with points

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
    const { id, photo_base64, note } = await request.json();
    if (!id) return new Response(JSON.stringify({ error: 'Missing ticket id.' }), { status: 400, headers });
    if (!photo_base64) return new Response(JSON.stringify({ error: 'Photo required.' }), { status: 400, headers });

    const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return new Response(JSON.stringify({ error: 'Ticket not found.' }), { status: 404, headers });
    if (ticket.status === 'resolved') return new Response(JSON.stringify({ error: 'Already resolved.' }), { status: 400, headers });

    const now = new Date().toISOString();

    // Mark issuer removed + resolve ticket (keep points)
    await env.DB.prepare(
      `UPDATE tickets SET issuer_removed_at = ?, issuer_removed_photo = ?, issuer_removed_note = ?, status = 'resolved' WHERE id = ?`
    ).bind(now, photo_base64, note || null, id).run();

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
