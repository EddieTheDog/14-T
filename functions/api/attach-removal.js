// functions/api/attach-removal.js
export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers });
  try {
    const { id, deadline, note, remove, isEdit } = await request.json();
    if (!id) return new Response(JSON.stringify({ error: 'Missing id.' }), { status: 400, headers });

    const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return new Response(JSON.stringify({ error: 'Not found.' }), { status: 404, headers });
    if (ticket.status === 'resolved') return new Response(JSON.stringify({ error: 'Ticket already resolved.' }), { status: 400, headers });

    if (remove) {
      await env.DB.prepare(`UPDATE tickets SET removal_notice = 0, removal_deadline = NULL, removal_note = NULL WHERE id = ?`).bind(id).run();
    } else {
      if (!deadline) return new Response(JSON.stringify({ error: 'Deadline required.' }), { status: 400, headers });
      const now = new Date().toISOString();
      // If editing, stamp the adjustment time for QA log
      if (isEdit) {
        await env.DB.prepare(`UPDATE tickets SET removal_notice = 1, removal_deadline = ?, removal_note = ?, removal_adjusted_at = ? WHERE id = ?`)
          .bind(deadline, note || null, now, id).run();
      } else {
        await env.DB.prepare(`UPDATE tickets SET removal_notice = 1, removal_deadline = ?, removal_note = ? WHERE id = ?`)
          .bind(deadline, note || null, id).run();
      }
    }
    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
