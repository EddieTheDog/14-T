// functions/api/issuer-note.js
export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers });
  try {
    const body = await request.json();
    const { id, text, points, editIdx, editMode, deleteMode } = body;
    if (!id) return new Response(JSON.stringify({ error: 'Missing id.' }), { status: 400, headers });

    const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return new Response(JSON.stringify({ error: 'Not found.' }), { status: 404, headers });

    let notes = [];
    if (ticket.issuer_notes) { try { notes = JSON.parse(ticket.issuer_notes); } catch {} }

    const now = new Date().toISOString();

    if (deleteMode && editIdx !== undefined) {
      if (!notes[editIdx]) return new Response(JSON.stringify({ error: 'Note not found.' }), { status: 404, headers });
      notes[editIdx].deleted = true;
      notes[editIdx].deletedAt = now;
    } else if (editMode && editIdx !== undefined) {
      if (!notes[editIdx]) return new Response(JSON.stringify({ error: 'Note not found.' }), { status: 404, headers });
      if (!text) return new Response(JSON.stringify({ error: 'Text required.' }), { status: 400, headers });
      notes[editIdx].text = text;
      notes[editIdx].edited = true;
      notes[editIdx].editedAt = now;
    } else {
      if (!text) return new Response(JSON.stringify({ error: 'Text required.' }), { status: 400, headers });
      const addPts = parseInt(points) || 0;
      notes.push({ text, points: addPts, type: addPts > 0 ? 'points' : 'comment', time: now });
      if (addPts > 0) {
        const newTotal = (ticket.points || 0) + addPts;
        await env.DB.prepare(`UPDATE tickets SET points = ? WHERE id = ?`).bind(newTotal, id).run();
        if (!ticket.is_unknown && ticket.person_name !== 'Unknown') {
          await env.DB.prepare(`UPDATE people SET total_points = total_points + ? WHERE name = ?`).bind(addPts, ticket.person_name).run();
        }
      }
    }

    await env.DB.prepare(`UPDATE tickets SET issuer_notes = ? WHERE id = ?`).bind(JSON.stringify(notes), id).run();
    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
