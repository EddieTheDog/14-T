// functions/api/issuer-note.js
// Adds an issuer note/comment to a ticket, optionally adding points

export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers });

  try {
    const { id, text, points } = await request.json();
    if (!id || !text) return new Response(JSON.stringify({ error: 'Missing id or text.' }), { status: 400, headers });

    const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return new Response(JSON.stringify({ error: 'Ticket not found.' }), { status: 404, headers });

    // Parse existing notes
    let notes = [];
    if (ticket.issuer_notes) { try { notes = JSON.parse(ticket.issuer_notes); } catch {} }

    const addPts = parseInt(points) || 0;
    notes.push({ text, points: addPts, type: addPts > 0 ? 'points' : 'comment', time: new Date().toISOString() });

    await env.DB.prepare(`UPDATE tickets SET issuer_notes = ? WHERE id = ?`)
      .bind(JSON.stringify(notes), id).run();

    // Add points to ticket and person totals
    if (addPts > 0) {
      const newTotal = (ticket.points || 0) + addPts;
      await env.DB.prepare(`UPDATE tickets SET points = ? WHERE id = ?`).bind(newTotal, id).run();
      if (!ticket.is_unknown && ticket.person_name !== 'Unknown') {
        await env.DB.prepare(`UPDATE people SET total_points = total_points + ? WHERE name = ?`)
          .bind(addPts, ticket.person_name).run();
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
