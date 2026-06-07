// functions/api/item-removed.js
// 14-T Item Removed API — recipient reports they have removed the item

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
    const { id } = await request.json();
    if (!id) return new Response(JSON.stringify({ error: 'Missing ticket id.' }), { status: 400, headers });

    const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return new Response(JSON.stringify({ error: 'Ticket not found.' }), { status: 404, headers });
    if (ticket.status === 'resolved') return new Response(JSON.stringify({ error: 'Ticket already resolved.' }), { status: 400, headers });
    if (ticket.item_removed_at) return new Response(JSON.stringify({ error: 'Already reported as removed.' }), { status: 400, headers });

    const now = new Date().toISOString();
    await env.DB.prepare(
      `UPDATE tickets SET item_removed_at = ? WHERE id = ?`
    ).bind(now, id).run();

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
