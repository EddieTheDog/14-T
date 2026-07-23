// functions/api/impounds.js
// 14-T Impound Inventory API

export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (request.method === 'OPTIONS') return new Response(null, { headers });

  // ── GET ─────────────────────────────────────────────────────────────────
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const ticket_id = url.searchParams.get('ticket_id');
    const barcode = url.searchParams.get('barcode');

    try {
      if (id) {
        const row = await env.DB.prepare(`SELECT * FROM impounds WHERE id = ?`).bind(id).first();
        if (!row) return new Response(JSON.stringify({ error: 'Not found.' }), { status: 404, headers });
        return new Response(JSON.stringify({ impound: row }), { headers });
      }
      if (ticket_id) {
        const row = await env.DB.prepare(`SELECT * FROM impounds WHERE ticket_id = ?`).bind(ticket_id).first();
        return new Response(JSON.stringify({ impound: row || null }), { headers });
      }
      if (barcode) {
        const row = await env.DB.prepare(`SELECT * FROM impounds WHERE barcode = ?`).bind(barcode).first();
        if (!row) return new Response(JSON.stringify({ error: 'Not found.' }), { status: 404, headers });
        return new Response(JSON.stringify({ impound: row }), { headers });
      }
      // All impounds
      const rows = await env.DB.prepare(`SELECT * FROM impounds ORDER BY created_at DESC`).all();
      return new Response(JSON.stringify({ impounds: rows.results }), { headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { action } = body;

      // ── Create new impound record ────────────────────────────────────────
      if (action === 'create') {
        const {
          ticket_id, item_name, serial_number, photo_base64,
          retrievable, disposal_method, notes
        } = body;

        if (!ticket_id || !item_name) {
          return new Response(JSON.stringify({ error: 'Missing ticket_id or item_name.' }), { status: 400, headers });
        }

        // Check ticket exists
        const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(ticket_id).first();
        if (!ticket) return new Response(JSON.stringify({ error: 'Ticket not found.' }), { status: 404, headers });

        // Generate impound number IMP-XXXX (sequential)
        const countRow = await env.DB.prepare(`SELECT COUNT(*) as cnt FROM impounds`).first();
        const impoundNum = `IMP-${String((countRow.cnt || 0) + 1).padStart(4, '0')}`;

        // Barcode = impound number (used for label scanning)
        const barcode = impoundNum;
        const id = impoundNum;
        const now = new Date().toISOString();

        await env.DB.prepare(`
          INSERT INTO impounds (
            id, impound_number, ticket_id, item_name, serial_number,
            photo_base64, retrievable, disposal_method, notes,
            status, storage_location, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'held', NULL, ?)
        `).bind(
          id, impoundNum, ticket_id, item_name,
          serial_number || null, photo_base64 || null,
          retrievable ? 1 : 0,
          retrievable ? null : (disposal_method || 'undecided'),
          notes || null, now
        ).run();

        return new Response(JSON.stringify({ success: true, id, impound_number: impoundNum, barcode }), { headers });
      }

      // ── Update storage location ──────────────────────────────────────────
      if (action === 'set_location') {
        const { id, location } = body;
        if (!id) return new Response(JSON.stringify({ error: 'Missing id.' }), { status: 400, headers });
        await env.DB.prepare(`UPDATE impounds SET storage_location = ? WHERE id = ?`).bind(location || null, id).run();
        return new Response(JSON.stringify({ success: true }), { headers });
      }

      // ── Schedule pickup window ───────────────────────────────────────────
      if (action === 'schedule_pickup') {
        const { id, pickup_start, window_hours } = body;
        if (!id || !pickup_start) return new Response(JSON.stringify({ error: 'Missing id or pickup_start.' }), { status: 400, headers });
        const start = new Date(pickup_start);
        const end = new Date(start.getTime() + ((window_hours || 1) * 60 * 60 * 1000));
        await env.DB.prepare(`
          UPDATE impounds SET
            pickup_start = ?,
            pickup_end = ?,
            status = 'scheduled'
          WHERE id = ?
        `).bind(start.toISOString(), end.toISOString(), id).run();
        return new Response(JSON.stringify({ success: true, pickup_start: start.toISOString(), pickup_end: end.toISOString() }), { headers });
      }

      // ── Recipient requests retrieval ─────────────────────────────────────
      if (action === 'request_retrieval') {
        const { id } = body;
        if (!id) return new Response(JSON.stringify({ error: 'Missing id.' }), { status: 400, headers });
        const imp = await env.DB.prepare(`SELECT * FROM impounds WHERE id = ?`).bind(id).first();
        if (!imp) return new Response(JSON.stringify({ error: 'Not found.' }), { status: 404, headers });
        if (!imp.retrievable) return new Response(JSON.stringify({ error: 'This item is not available for retrieval.' }), { status: 400, headers });
        if (imp.status === 'disposed' || imp.status === 'released') {
          return new Response(JSON.stringify({ error: 'Item is no longer in inventory.' }), { status: 400, headers });
        }
        await env.DB.prepare(`UPDATE impounds SET retrieval_requested_at = ?, status = 'retrieval_requested' WHERE id = ?`)
          .bind(new Date().toISOString(), id).run();
        return new Response(JSON.stringify({ success: true }), { headers });
      }

      // ── Mark released ────────────────────────────────────────────────────
      if (action === 'release') {
        const { id } = body;
        if (!id) return new Response(JSON.stringify({ error: 'Missing id.' }), { status: 400, headers });
        await env.DB.prepare(`UPDATE impounds SET status = 'released', released_at = ? WHERE id = ?`)
          .bind(new Date().toISOString(), id).run();
        return new Response(JSON.stringify({ success: true }), { headers });
      }

      // ── Mark disposed ────────────────────────────────────────────────────
      if (action === 'dispose') {
        const { id, disposal_method } = body;
        if (!id) return new Response(JSON.stringify({ error: 'Missing id.' }), { status: 400, headers });
        await env.DB.prepare(`UPDATE impounds SET status = 'disposed', disposal_method = ?, disposed_at = ? WHERE id = ?`)
          .bind(disposal_method || null, new Date().toISOString(), id).run();
        return new Response(JSON.stringify({ success: true }), { headers });
      }

      // ── Delete (hard) ────────────────────────────────────────────────────
      if (action === 'delete') {
        const { id } = body;
        if (!id) return new Response(JSON.stringify({ error: 'Missing id.' }), { status: 400, headers });
        await env.DB.prepare(`DELETE FROM impounds WHERE id = ?`).bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers });
      }

      return new Response(JSON.stringify({ error: 'Unknown action.' }), { status: 400, headers });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers });
}
