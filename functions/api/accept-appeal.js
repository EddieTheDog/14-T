// functions/api/accept-appeal.js
// Accepts an appeal: removes points, closes the appeal thread.
// If a removal notice is still active (and not impounded), keeps ticket open.
// If no removal notice or impound already happened, fully resolves the ticket.

export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers });

  try {
    const { id, keep_removal_open } = await request.json();
    if (!id) return new Response(JSON.stringify({ error: 'Missing id.' }), { status: 400, headers });

    const ticket = await env.DB.prepare(`SELECT * FROM tickets WHERE id = ?`).bind(id).first();
    if (!ticket) return new Response(JSON.stringify({ error: 'Not found.' }), { status: 404, headers });

    // Determine new status:
    // - If removal notice is active and caller wants to keep it open → stay 'open', reset appeal
    // - Otherwise → resolve ticket
    const hasActiveRemoval = ticket.removal_notice && !ticket.issuer_removed_at;
    const newStatus = (keep_removal_open && hasActiveRemoval) ? 'open' : 'resolved';

    // Remove points from ticket and leaderboard
    if (ticket.points > 0 && !ticket.is_unknown && ticket.person_name !== 'Unknown') {
      await env.DB.prepare(
        `UPDATE people SET total_points = MAX(0, total_points - ?) WHERE name = ?`
      ).bind(ticket.points, ticket.person_name).run();
    }

    // Zero out points, clear appeal thread, set status
    await env.DB.prepare(`
      UPDATE tickets SET
        points = 0,
        status = ?,
        appeal_flagged = 0,
        appeal_note = NULL,
        appeal_photo_base64 = NULL,
        appeal_response = NULL,
        appeal_response_photo = NULL,
        appeal_response_locked = 0,
        appeal_declined = 0
      WHERE id = ?
    `).bind(newStatus, id).run();

    return new Response(JSON.stringify({
      success: true,
      status: newStatus,
      removal_still_active: hasActiveRemoval && keep_removal_open
    }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
