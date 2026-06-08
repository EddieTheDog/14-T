// functions/api/adjust-points.js
// 14-T Adjust Points API — sets ticket to a specific point value and updates the people table

export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers });

  try {
    const { id, points } = await request.json();
    if (!id || points === undefined) return new Response(JSON.stringify({ error: 'Missing id or points.' }), { status: 400, headers });

    const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return new Response(JSON.stringify({ error: 'Ticket not found.' }), { status: 404, headers });

    const diff = points - ticket.points;

    // Update ticket points
    await env.DB.prepare(`UPDATE tickets SET points = ? WHERE id = ?`).bind(points, id).run();

    // Adjust person's total if named
    if (!ticket.is_unknown && ticket.person_name !== 'Unknown' && diff !== 0) {
      await env.DB.prepare(
        `UPDATE people SET total_points = MAX(0, total_points + ?) WHERE name = ?`
      ).bind(diff, ticket.person_name).run();
    }

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
