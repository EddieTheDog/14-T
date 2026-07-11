// functions/api/report-action.js
export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers });

  try {
    const { id, action, reason } = await request.json();
    if (!id || !action) return new Response(JSON.stringify({ error: 'Missing id or action.' }), { status: 400, headers });

    const report = await env.DB.prepare(`SELECT * FROM reports WHERE id = ?`).bind(id).first();
    if (!report) return new Response(JSON.stringify({ error: 'Report not found.' }), { status: 404, headers });

    if (action === 'delete') {
      await env.DB.prepare(`DELETE FROM reports WHERE id = ?`).bind(id).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (action === 'review') {
      // Toggle between open and reviewed, or reopen a declined
      const newStatus = report.status === 'reviewed' ? 'open' : 'reviewed';
      await env.DB.prepare(`UPDATE reports SET status = ? WHERE id = ?`).bind(newStatus, id).run();
      return new Response(JSON.stringify({ success: true, status: newStatus }), { headers });
    }

    if (action === 'decline') {
      await env.DB.prepare(`UPDATE reports SET status = 'declined', decline_reason = ? WHERE id = ?`).bind(reason || null, id).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (action === 'ticket_created') {
      await env.DB.prepare(`UPDATE reports SET status = 'ticket_created' WHERE id = ?`).bind(id).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Unknown action.' }), { status: 400, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
