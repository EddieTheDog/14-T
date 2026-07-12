// functions/api/report-action.js
export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers });

  try {
    const body = await request.json();
    const { id, action, reason, ticket_id } = body;
    if (!id || !action) return new Response(JSON.stringify({ error: 'Missing id or action.' }), { status: 400, headers });

    const report = await env.DB.prepare(`SELECT * FROM reports WHERE id = ?`).bind(id).first();
    if (!report) return new Response(JSON.stringify({ error: 'Report not found.' }), { status: 404, headers });

    if (action === 'delete') {
      await env.DB.prepare(`DELETE FROM reports WHERE id = ?`).bind(id).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (action === 'review') {
      const newStatus = report.status === 'reviewed' ? 'open' : 'reviewed';
      await env.DB.prepare(`UPDATE reports SET status = ? WHERE id = ?`).bind(newStatus, id).run();
      return new Response(JSON.stringify({ success: true, status: newStatus }), { headers });
    }

    if (action === 'decline') {
      await env.DB.prepare(`UPDATE reports SET status = 'declined', decline_reason = ? WHERE id = ?`).bind(reason || null, id).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (action === 'accept_silent') {
      await env.DB.prepare(`UPDATE reports SET status = 'accepted_silent' WHERE id = ?`).bind(id).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (action === 'ticket_created') {
      await env.DB.prepare(`UPDATE reports SET status = 'ticket_created', linked_ticket_id = ? WHERE id = ?`)
        .bind(ticket_id || null, id).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (action === 'link_ticket') {
      if (!ticket_id) return new Response(JSON.stringify({ error: 'Missing ticket_id.' }), { status: 400, headers });
      const ticket = await env.DB.prepare(
        `SELECT id, violation_type, points, penal_code, location, item_name FROM tickets WHERE id = ?`
      ).bind(ticket_id.trim()).first();
      if (!ticket) return new Response(JSON.stringify({ error: 'Ticket not found. Check the ID.' }), { status: 404, headers });
      await env.DB.prepare(`UPDATE reports SET status = 'ticket_created', linked_ticket_id = ? WHERE id = ?`)
        .bind(ticket_id.trim(), id).run();
      return new Response(JSON.stringify({ success: true, ticket }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Unknown action.' }), { status: 400, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
