// functions/api/manage.js
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
    const body = await request.json();
    const { action, id } = body;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id.' }), { status: 400, headers });
    }

    if (action === 'update') {
      const {
        person_first, person_last_initial, person_name, is_unknown,
        violation_type, points, penal_code, location, description,
        item_name, product_number, serial_number, removal_notice,
        removal_deadline, removal_note, status, created_at,
        photo_base64, extra_photos
      } = body;

      const existing = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
      if (!existing) {
        return new Response(JSON.stringify({ success: false, error: 'Ticket not found.' }), { status: 404, headers });
      }

      await env.DB.prepare(
        `UPDATE tickets SET
          person_first = ?, person_last_initial = ?, person_name = ?, is_unknown = ?,
          violation_type = ?, points = ?, penal_code = ?, location = ?, description = ?,
          item_name = ?, product_number = ?, serial_number = ?, removal_notice = ?,
          removal_deadline = ?, removal_note = ?, status = ?, created_at = ?,
          photo_base64 = ?, extra_photos = ?
         WHERE id = ?`
      ).bind(
        person_first || null, person_last_initial || null, person_name, is_unknown ? 1 : 0,
        violation_type, points, penal_code || null, location || null, description || null,
        item_name || null, product_number || null, serial_number || null,
        removal_notice ? 1 : 0, removal_deadline || null, removal_note || null,
        status || 'open', created_at, photo_base64 || null, extra_photos || null,
        id
      ).run();

      // Reconcile points on the people table if points or person changed
      const oldPoints = existing.points || 0;
      const newPoints = points || 0;
      const oldPerson = existing.person_name;
      const newPerson = person_name;

      if (!existing.is_unknown && oldPerson && oldPerson !== 'Unknown' && oldPoints !== 0) {
        await env.DB.prepare(`UPDATE people SET total_points = total_points - ? WHERE name = ?`)
          .bind(oldPoints, oldPerson).run();
      }
      if (!is_unknown && newPerson && newPerson !== 'Unknown' && newPoints !== 0) {
        const existingPerson = await env.DB.prepare(`SELECT * FROM people WHERE name = ?`).bind(newPerson).first();
        if (existingPerson) {
          await env.DB.prepare(`UPDATE people SET total_points = total_points + ? WHERE name = ?`)
            .bind(newPoints, newPerson).run();
        } else {
          await env.DB.prepare(`INSERT INTO people (name, total_points) VALUES (?, ?)`)
            .bind(newPerson, newPoints).run();
        }
      }

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (action === 'delete') {
      const existing = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
      if (!existing) {
        return new Response(JSON.stringify({ success: false, error: 'Ticket not found.' }), { status: 404, headers });
      }

      await env.DB.prepare(`DELETE FROM tickets WHERE id = ?`).bind(id).run();

      if (!existing.is_unknown && existing.person_name && existing.person_name !== 'Unknown' && existing.points > 0) {
        await env.DB.prepare(`UPDATE people SET total_points = total_points - ? WHERE name = ?`)
          .bind(existing.points, existing.person_name).run();
      }

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Unknown action.' }), { status: 400, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
