// functions/api/resolve.js
// 14-T Resolve API

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
    const { id, dismiss } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing ticket id.' }), { status: 400, headers });
    }

    const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return new Response(JSON.stringify({ error: 'Ticket not found.' }), { status: 404, headers });
    if (ticket.status === 'resolved') return new Response(JSON.stringify({ error: 'Already resolved.' }), { status: 400, headers });

    await env.DB.prepare(`UPDATE tickets SET status = 'resolved' WHERE id = ?`).bind(id).run();

    if (dismiss && ticket.points > 0) {
      await env.DB.prepare(`UPDATE people SET total_points = MAX(0, total_points - ?) WHERE name = ?`)
        .bind(ticket.points, ticket.person_name).run();
    }

    return new Response(JSON.stringify({ success: true, dismissed: !!dismiss }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
