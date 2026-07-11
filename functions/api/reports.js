// functions/api/reports.js
export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (request.method === 'OPTIONS') return new Response(null, { headers });

  if (request.method === 'GET') {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    try {
      if (id) {
        const report = await env.DB.prepare(`SELECT * FROM reports WHERE id = ?`).bind(id).first();
        if (!report) return new Response(JSON.stringify({ error: 'Not found.' }), { status: 404, headers });
        return new Response(JSON.stringify({ report }), { headers });
      } else {
        const reports = await env.DB.prepare(`SELECT * FROM reports ORDER BY created_at DESC`).all();
        return new Response(JSON.stringify({ reports: reports.results }), { headers });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }

  if (request.method === 'POST') {
    try {
      const { id, reporter_first, reporter_last_initial, location, item, description, owner, photo_base64, created_at } = await request.json();
      if (!id || !reporter_first || !reporter_last_initial || !location || !item || !description) {
        return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400, headers });
      }
      await env.DB.prepare(`
        INSERT INTO reports (id, reporter_first, reporter_last_initial, location, item, description, owner, photo_base64, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
      `).bind(id, reporter_first, reporter_last_initial, location, item, description, owner || null, photo_base64 || null, created_at).run();
      return new Response(JSON.stringify({ success: true, id }), { headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers });
}
