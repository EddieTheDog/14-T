// functions/api/tickets.js
// 14-T Tickets API
export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };
  if (method === 'OPTIONS') return new Response(null, { headers });
  if (method === 'POST') {
    try {
      const body = await request.json();
      const {
        id, person_first, person_last_initial, person_name,
        is_unknown, violation_type, points, location, penal_code, description,
        item_name, product_number, serial_number, photo_base64, extra_photos,
        removal_notice, removal_deadline, removal_note, created_at
      } = body;
      if (!id || !person_name || !violation_type || !location || !photo_base64) {
        return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400, headers });
      }
      await env.DB.prepare(
        `INSERT INTO tickets (id, person_first, person_last_initial, person_name, is_unknown, violation_type, points, location, penal_code, description, item_name, product_number, serial_number, photo_base64, extra_photos, removal_notice, removal_deadline, removal_note, status, appeal_flagged, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', 0, ?)`
      ).bind(
        id, person_first || null, person_last_initial || null, person_name,
        is_unknown ? 1 : 0, violation_type, points, location,
        penal_code || null, description || null, item_name || null,
        product_number || null, serial_number || null, photo_base64,
        extra_photos || null,
        removal_notice ? 1 : 0, removal_deadline || null, removal_note || null,
        created_at
      ).run();
      if (!is_unknown && person_name !== 'Unknown' && points > 0) {
        const existing = await env.DB.prepare(`SELECT * FROM people WHERE name = ?`).bind(person_name).first();
        if (existing) {
          await env.DB.prepare(`UPDATE people SET total_points = total_points + ? WHERE name = ?`).bind(points, person_name).run();
        } else {
          await env.DB.prepare(`INSERT INTO people (name, total_points) VALUES (?, ?)`).bind(person_name, points).run();
        }
      }
      return new Response(JSON.stringify({ success: true, id }), { headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }
  if (method === 'GET') {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (id) {
      try {
        const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
        if (!ticket) return new Response(JSON.stringify({ error: 'Not found.' }), { status: 404, headers });
        return new Response(JSON.stringify({ ticket }), { headers });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
      }
    } else {
      try {
        const tickets = await env.DB.prepare(`SELECT * FROM tickets ORDER BY created_at DESC`).all();
        const people = await env.DB.prepare(`SELECT * FROM people ORDER BY total_points DESC`).all();
        return new Response(JSON.stringify({ tickets: tickets.results, people: people.results }), { headers });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
      }
    }
  }
  return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers });
}
