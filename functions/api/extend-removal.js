// functions/api/extend-removal.js
// Extends the deadline on an active removal notice.
// notify=true  → recipient sees an "Extended" callout in orange
// notify=false → deadline updates silently; no callout shown

export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers });

  try {
    const { id, new_deadline, note, notify } = await request.json();

    if (!id || !new_deadline) {
      return new Response(JSON.stringify({ error: 'Missing id or new_deadline.' }), { status: 400, headers });
    }

    const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return new Response(JSON.stringify({ error: 'Ticket not found.' }), { status: 404, headers });
    if (!ticket.removal_notice) return new Response(JSON.stringify({ error: 'This ticket has no removal notice.' }), { status: 400, headers });
    if (ticket.status === 'resolved') return new Response(JSON.stringify({ error: 'Ticket already resolved.' }), { status: 400, headers });
    if (ticket.issuer_removed_at) return new Response(JSON.stringify({ error: 'Item has already been impounded.' }), { status: 400, headers });

    const now = new Date().toISOString();

    await env.DB.prepare(`
      UPDATE tickets SET
        removal_deadline       = ?,
        removal_adjusted_at    = ?,
        removal_extended_at    = ?,
        removal_extension_note = ?,
        removal_extension_notify = ?
      WHERE id = ?
    `).bind(
      new_deadline,
      now,
      now,
      note || null,
      notify ? 1 : 0,
      id
    ).run();

    return new Response(JSON.stringify({
      success: true,
      notified: !!notify,
      new_deadline
    }), { headers });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
