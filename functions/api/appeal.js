// functions/api/appeal.js
// 14-T Appeal API

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
    const { id, note, photo_base64 } = await request.json();

    if (!id || !note) {
      return new Response(JSON.stringify({ error: 'Missing id or note.' }), { status: 400, headers });
    }

    const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return new Response(JSON.stringify({ error: 'Ticket not found.' }), { status: 404, headers });
    if (ticket.status === 'resolved') return new Response(JSON.stringify({ error: 'Ticket already resolved.' }), { status: 400, headers });
    if (ticket.status === 'locked') return new Response(JSON.stringify({ error: 'This appeal thread is closed.' }), { status: 400, headers });

    // Allow a re-appeal only if issuer responded and left thread open
    if (ticket.appeal_flagged && !ticket.appeal_response) {
      return new Response(JSON.stringify({ error: 'Appeal already submitted.' }), { status: 400, headers });
    }
    if (ticket.appeal_flagged && ticket.appeal_response_locked) {
      return new Response(JSON.stringify({ error: 'This appeal thread is closed.' }), { status: 400, headers });
    }

    // Overwrite appeal note with new reply (keep history visible via response chain)
    await env.DB.prepare(
      `UPDATE tickets SET appeal_note = ?, appeal_photo_base64 = ?, appeal_flagged = 1 WHERE id = ?`
    ).bind(note, photo_base64 || null, id).run();

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
