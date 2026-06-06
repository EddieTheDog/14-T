// public/app.js
// 14-T Client Application

const API = {
  async createTicket(data) {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getTicket(id) {
    const res = await fetch(`/api/tickets?id=${id}`);
    return res.json();
  },

  async getAllTickets() {
    const res = await fetch('/api/tickets');
    return res.json();
  },

  async claimTicket(id, first, last) {
    const res = await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, first, last })
    });
    return res.json();
  },

  async resolve(id, dismiss) {
    const res = await fetch('/api/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, dismiss })
    });
    return res.json();
  },

  async appeal(id, note, photoBase64, confirmed) {
    const res = await fetch('/api/appeal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, note, photo_base64: photoBase64 || null, confirmed })
    });
    return res.json();
  }
};

function generateId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `14T-${ts}-${rand}`;
}

function violationPoints(type) {
  return { warning: 0, minor: 1, major: 2, severe: 3 }[type] ?? 0;
}

function showMsg(el, text, type) {
  el.className = `msg ${type}`;
  el.textContent = text;
  el.style.display = 'block';
}

async function compressImage(file, maxWidth = 800, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function lookupBarcode(barcode) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await res.json();
    if (data.status === 1) return data.product.product_name || null;
    const res2 = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
    const data2 = await res2.json();
    if (data2.items && data2.items.length > 0) return data2.items[0].title || null;
    return null;
  } catch { return null; }
}

// ── NEW TICKET FORM ──────────────────────────────────────────────────────────
if (document.getElementById('new-ticket-form')) {
  const form = document.getElementById('new-ticket-form');
  const msgEl = document.getElementById('form-msg');
  const violationSelect = document.getElementById('violation_type');
  const pointsDisplay = document.getElementById('points-display');
  const scanBtn = document.getElementById('scan-btn');
  const videoContainer = document.getElementById('video-container');
  const video = document.getElementById('barcode-video');
  const itemNameInput = document.getElementById('item_name');
  const unknownCheck = document.getElementById('person_unknown');
  const nameFields = document.getElementById('name-fields');
  let stream = null, scanning = false;

  if (unknownCheck) {
    unknownCheck.addEventListener('change', () => {
      nameFields.style.display = unknownCheck.checked ? 'none' : 'block';
      document.getElementById('person_first').required = !unknownCheck.checked;
    });
  }

  if (violationSelect) {
    violationSelect.addEventListener('change', () => {
      const pts = violationPoints(violationSelect.value);
      pointsDisplay.textContent = pts === 0 ? '0 pts — Warning only' : `${pts} pt${pts !== 1 ? 's' : ''}`;
    });
  }

  if (scanBtn) {
    scanBtn.addEventListener('click', async () => {
      if (scanning) {
        scanning = false;
        if (stream) stream.getTracks().forEach(t => t.stop());
        videoContainer.style.display = 'none';
        scanBtn.textContent = 'Scan Barcode';
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.play();
        videoContainer.style.display = 'block';
        scanBtn.textContent = 'Stop Scanning';
        scanning = true;
        const { BrowserMultiFormatReader } = await import('https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.4/esm/index.js');
        const reader = new BrowserMultiFormatReader();
        reader.decodeFromVideoElement(video, async (result) => {
          if (result) {
            const code = result.getText();
            document.getElementById('product_number').value = code;
            const name = await lookupBarcode(code);
            if (name) itemNameInput.value = name;
            scanning = false;
            stream.getTracks().forEach(t => t.stop());
            videoContainer.style.display = 'none';
            scanBtn.textContent = 'Scan Barcode';
          }
        });
      } catch {
        showMsg(msgEl, 'Camera access denied or not available.', 'error');
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgEl.style.display = 'none';

    const isUnknown = unknownCheck && unknownCheck.checked;
    const photoFile = document.getElementById('photo').files[0];
    if (!photoFile) { showMsg(msgEl, 'A photo is required.', 'error'); return; }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const photoBase64 = await compressImage(photoFile);
      const violation = violationSelect.value;
      const firstName = isUnknown ? '' : document.getElementById('person_first').value.trim();
      const lastName = isUnknown ? '' : (document.getElementById('person_last').value.trim() || '');
      const displayName = isUnknown ? 'Unknown' : (lastName ? `${firstName} ${lastName}` : firstName);

      const payload = {
        id: generateId(),
        person_first: firstName,
        person_last: lastName || null,
        person_name: displayName,
        is_unknown: isUnknown ? 1 : 0,
        violation_type: violation,
        points: violationPoints(violation),
        location: document.getElementById('location').value.trim(),
        item_name: document.getElementById('item_name').value.trim() || null,
        product_number: document.getElementById('product_number').value.trim() || null,
        serial_number: document.getElementById('serial_number').value.trim() || null,
        photo_base64: photoBase64,
        created_at: new Date().toISOString()
      };

      const result = await API.createTicket(payload);
      if (result.success) {
        sessionStorage.setItem('last_ticket', JSON.stringify(payload));
        window.location.href = `print.html?id=${payload.id}`;
      } else {
        showMsg(msgEl, result.error || 'Failed to create ticket.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Issue Ticket';
      }
    } catch (err) {
      showMsg(msgEl, 'Error submitting ticket. Try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Issue Ticket';
    }
  });
}

// ── TICKET VIEW ──────────────────────────────────────────────────────────────
if (document.getElementById('ticket-view')) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('ticket-view');

  if (!id) {
    container.innerHTML = '<div class="msg error">No ticket ID provided.</div>';
  } else {
    API.getTicket(id).then(data => {
      if (!data || data.error) {
        container.innerHTML = '<div class="msg error">Ticket not found.</div>';
        return;
      }
      const t = data.ticket;

      // Unknown ticket — not yet claimed
      if (t.is_unknown && !t.claimed_first) {
        renderClaimGate(container, t);
        return;
      }

      // Already claimed — show identity gate
      if (t.is_unknown && t.claimed_first) {
        renderAlreadyClaimedGate(container, t);
        return;
      }

      // Named ticket — show identity gate
      renderNamedGate(container, t);
    });
  }
}

function renderClaimGate(container, t) {
  container.innerHTML = `
    <div class="card">
      <h2>Is this citation yours?</h2>
      <p style="margin-bottom:16px; font-size:14px; color:var(--muted)">A citation was issued at <strong>${t.location}</strong>${t.item_name ? ` regarding <strong>${t.item_name}</strong>` : ''}. Does this belong to you?</p>
      <div style="display:flex; gap:10px;">
        <button onclick="showClaimForm()">Yes, this is mine</button>
        <button class="secondary" onclick="showNotYours()">No, it is not mine</button>
      </div>
      <div id="claim-form" style="display:none; margin-top:20px;">
        <div id="claim-msg"></div>
        <div class="row">
          <div class="field-group">
            <label for="claim-first">First Name <span class="req">*</span></label>
            <input type="text" id="claim-first" placeholder="First name" required>
          </div>
          <div class="field-group">
            <label for="claim-last">Last Name <span class="opt">(optional)</span></label>
            <input type="text" id="claim-last" placeholder="Last name">
          </div>
        </div>
        <button onclick="submitClaim('${t.id}')">Confirm &amp; View Ticket</button>
      </div>
      <div id="not-yours" style="display:none; margin-top:16px;" class="msg error">This citation is not for you.</div>
    </div>
  `;
}

function showClaimForm() {
  document.getElementById('claim-form').style.display = 'block';
}

function showNotYours() {
  document.getElementById('not-yours').style.display = 'block';
}

async function submitClaim(id) {
  const first = document.getElementById('claim-first').value.trim();
  const last = document.getElementById('claim-last').value.trim() || null;
  const msgEl = document.getElementById('claim-msg');
  if (!first) { showMsg(msgEl, 'First name is required.', 'error'); return; }
  const result = await API.claimTicket(id, first, last);
  if (result.success) {
    const data = await API.getTicket(id);
    renderFullTicket(document.getElementById('ticket-view'), data.ticket);
  } else {
    showMsg(msgEl, result.error || 'Could not claim ticket.', 'error');
  }
}

function renderAlreadyClaimedGate(container, t) {
  container.innerHTML = `
    <div class="card">
      <h2>Is this citation yours?</h2>
      <p style="margin-bottom:16px; font-size:14px; color:var(--muted)">This citation has already been claimed. If it belongs to you, enter your name to verify.</p>
      <div id="claimed-gate-msg"></div>
      <div class="row">
        <div class="field-group">
          <label for="verify-first">First Name <span class="req">*</span></label>
          <input type="text" id="verify-first" placeholder="First name">
        </div>
        <div class="field-group">
          <label for="verify-last">Last Name <span class="opt">(optional)</span></label>
          <input type="text" id="verify-last" placeholder="Last name">
        </div>
      </div>
      <div style="display:flex; gap:10px;">
        <button onclick="verifyClaim('${t.id}', '${t.claimed_first}', ${t.claimed_last ? `'${t.claimed_last}'` : 'null'})">Verify</button>
        <button class="secondary" onclick="showPartialView()">This is not mine</button>
      </div>
      <div id="partial-view" style="display:none; margin-top:20px;">
        ${renderPartialHTML(t)}
      </div>
    </div>
  `;
}

function renderNamedGate(container, t) {
  container.innerHTML = `
    <div class="card">
      <h2>Verify your identity</h2>
      <p style="margin-bottom:16px; font-size:14px; color:var(--muted)">Enter your name to view this citation.</p>
      <div id="named-gate-msg"></div>
      <div class="row">
        <div class="field-group">
          <label for="verify-first">First Name <span class="req">*</span></label>
          <input type="text" id="verify-first" placeholder="First name">
        </div>
        <div class="field-group">
          <label for="verify-last">Last Name <span class="opt">(optional)</span></label>
          <input type="text" id="verify-last" placeholder="Last name">
        </div>
      </div>
      <div style="display:flex; gap:10px;">
        <button onclick="verifyNamed('${t.id}', '${t.person_name}')">View My Ticket</button>
        <button class="secondary" onclick="showPartialNamed()">This is not mine</button>
      </div>
      <div id="partial-named" style="display:none; margin-top:20px;">
        ${renderPartialHTML(t)}
      </div>
    </div>
  `;
}

function verifyClaim(id, claimedFirst, claimedLast) {
  const enteredFirst = document.getElementById('verify-first').value.trim().toLowerCase();
  const enteredLast = document.getElementById('verify-last').value.trim().toLowerCase();
  const msgEl = document.getElementById('claimed-gate-msg');
  const firstMatch = enteredFirst === claimedFirst.toLowerCase();
  const lastMatch = !claimedLast || enteredLast === claimedLast.toLowerCase();
  if (firstMatch && lastMatch) {
    API.getTicket(id).then(data => renderFullTicket(document.getElementById('ticket-view'), data.ticket));
  } else {
    showPartialView();
  }
}

function verifyNamed(id, personName) {
  const enteredFirst = document.getElementById('verify-first').value.trim().toLowerCase();
  const enteredLast = document.getElementById('verify-last').value.trim().toLowerCase();
  const entered = (enteredFirst + (enteredLast ? ' ' + enteredLast : '')).toLowerCase();
  if (entered === personName.toLowerCase()) {
    API.getTicket(id).then(data => renderFullTicket(document.getElementById('ticket-view'), data.ticket));
  } else {
    showPartialNamed();
  }
}

function showPartialView() { document.getElementById('partial-view').style.display = 'block'; }
function showPartialNamed() { document.getElementById('partial-named').style.display = 'block'; }

function renderPartialHTML(t) {
  const dateStr = new Date(t.created_at).toLocaleDateString();
  return `
    <div style="border-top:1px solid var(--border); padding-top:16px;">
      <p style="font-size:13px; color:var(--muted); margin-bottom:12px;">Showing partial information only.</p>
      <div class="info-row"><span class="label">Date Issued</span><span>${dateStr}</span></div>
      <div class="info-row"><span class="label">Violation</span><span><span class="badge ${t.violation_type}">${t.violation_type.toUpperCase()}</span></span></div>
      <div class="info-row"><span class="label">Location</span><span>${t.location}</span></div>
      ${t.item_name ? `<div class="info-row"><span class="label">Item</span><span>${t.item_name}</span></div>` : ''}
    </div>
  `;
}

function renderFullTicket(container, t) {
  const displayName = t.claimed_first
    ? (t.claimed_last ? `${t.claimed_first} ${t.claimed_last}` : t.claimed_first)
    : t.person_name;
  const dateStr = new Date(t.created_at).toLocaleString();

  container.innerHTML = `
    <div class="ticket-header">
      <div class="ticket-id">${t.id}</div>
      <div class="ticket-name">${displayName}</div>
      <div style="margin-top:6px">
        <span class="badge ${t.violation_type}">${t.violation_type.toUpperCase()}</span>
        &nbsp;
        <span class="badge ${t.status}">${t.status.toUpperCase()}</span>
      </div>
    </div>
    <div class="ticket-body">
      <img class="ticket-photo" src="${t.photo_base64}" alt="Violation photo">
      <div class="row" style="align-items:flex-start; margin-bottom:16px">
        <div>
          <div class="info-row"><span class="label">Date Issued</span><span>${dateStr}</span></div>
          <div class="info-row"><span class="label">Location</span><span>${t.location}</span></div>
          ${t.item_name ? `<div class="info-row"><span class="label">Item</span><span>${t.item_name}</span></div>` : ''}
          ${t.product_number ? `<div class="info-row"><span class="label">Product #</span><span>${t.product_number}</span></div>` : ''}
          ${t.serial_number ? `<div class="info-row"><span class="label">Serial #</span><span>${t.serial_number}</span></div>` : ''}
        </div>
        <div style="text-align:right">
          <div class="points-big">${t.points}</div>
          <div class="points-label">Point${t.points !== 1 ? 's' : ''}</div>
        </div>
      </div>

      ${t.appeal_note ? `
        <div class="appeal-box">
          <strong>Appeal Filed:</strong><br>${t.appeal_note}
          ${t.appeal_photo_base64 ? `<br><img src="${t.appeal_photo_base64}" style="width:100%;margin-top:10px;border:1px solid var(--border);" alt="Appeal photo">` : ''}
        </div>
      ` : ''}

      ${t.status !== 'resolved' && !t.appeal_flagged ? `
        <hr class="divider">
        <h2>File an Appeal</h2>
        <div id="appeal-msg"></div>
        <div class="field-group">
          <label for="appeal-note">Explanation <span class="req">*</span></label>
          <textarea id="appeal-note" placeholder="Explain your situation..."></textarea>
        </div>
        <div class="field-group">
          <label for="appeal-photo">Supporting Photo <span class="opt">(optional)</span></label>
          <input type="file" id="appeal-photo" accept="image/*" capture="environment">
        </div>
        <div class="field-group" style="display:flex; align-items:flex-start; gap:10px; margin-bottom:16px;">
          <input type="checkbox" id="appeal-confirm" style="margin-top:3px; width:auto; flex-shrink:0;">
          <label for="appeal-confirm" style="font-weight:400; font-size:13px; margin-bottom:0; cursor:pointer;">
            I confirm that this citation was issued to me and that the information I am providing is accurate.
          </label>
        </div>
        <button onclick="submitAppeal('${t.id}')">Submit Appeal</button>
      ` : ''}

      ${t.status === 'resolved' ? '<div class="msg ok" style="display:block;margin-top:16px">This ticket has been resolved.</div>' : ''}
      ${t.appeal_flagged && t.status !== 'resolved' ? '<div class="appeal-box" style="margin-top:16px">Your appeal has been submitted and is under review.</div>' : ''}
    </div>
  `;
}

async function submitAppeal(id) {
  const note = document.getElementById('appeal-note').value.trim();
  const confirmed = document.getElementById('appeal-confirm').checked;
  const msgEl = document.getElementById('appeal-msg');

  if (!note) { showMsg(msgEl, 'Please enter an explanation.', 'error'); return; }
  if (!confirmed) { showMsg(msgEl, 'You must confirm this citation was issued to you.', 'error'); return; }

  let photoBase64 = null;
  const photoFile = document.getElementById('appeal-photo').files[0];
  if (photoFile) {
    try { photoBase64 = await compressImage(photoFile); } catch { photoBase64 = null; }
  }

  const result = await API.appeal(id, note, photoBase64, true);
  if (result.success) {
    showMsg(msgEl, 'Appeal submitted. It is under review.', 'ok');
    document.getElementById('appeal-note').disabled = true;
    document.getElementById('appeal-photo').disabled = true;
    document.getElementById('appeal-confirm').disabled = true;
    document.querySelector(`[onclick="submitAppeal('${id}')"]`).disabled = true;
  } else {
    showMsg(msgEl, 'Failed to submit appeal.', 'error');
  }
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
if (document.getElementById('dashboard')) {
  API.getAllTickets().then(data => {
    if (!data || data.error) return;
    const tickets = data.tickets || [];
    const people = data.people || [];

    const leaderboardEl = document.getElementById('leaderboard');
    leaderboardEl.innerHTML = people.length === 0
      ? '<tr><td colspan="2" style="color:var(--muted)">No records yet.</td></tr>'
      : people.sort((a, b) => b.total_points - a.total_points)
          .map((p, i) => `<tr><td><span class="leaderboard-rank">#${i + 1}</span> ${p.name}</td><td><strong style="color:var(--accent)">${p.total_points}</strong> pts</td></tr>`)
          .join('');

    const ticketsEl = document.getElementById('tickets-table');
    const flagged = tickets.filter(t => t.appeal_flagged && t.status !== 'resolved');
    const rest = tickets.filter(t => !t.appeal_flagged || t.status === 'resolved');
    const sorted = [...flagged, ...rest];

    ticketsEl.innerHTML = sorted.length === 0
      ? '<tr><td colspan="6" style="color:var(--muted)">No tickets issued yet.</td></tr>'
      : sorted.map(t => {
          const displayName = t.is_unknown
            ? (t.claimed_first ? `${t.claimed_first}${t.claimed_last ? ' ' + t.claimed_last : ''} <em style="color:var(--muted);font-size:11px">(claimed)</em>` : '<em style="color:var(--muted)">Unknown</em>')
            : t.person_name;
          const statusLabel = t.appeal_flagged && t.status !== 'resolved' ? 'APPEAL' : t.status;
          const statusClass = t.appeal_flagged && t.status !== 'resolved' ? 'flagged' : t.status;
          return `<tr>
            <td><a href="ticket.html?id=${t.id}">${t.id}</a></td>
            <td>${displayName}</td>
            <td><span class="badge ${t.violation_type}">${t.violation_type}</span></td>
            <td>${t.points} pt${t.points !== 1 ? 's' : ''}</td>
            <td><span class="badge ${statusClass}">${statusLabel}</span></td>
            <td>${t.status !== 'resolved'
              ? `<button class="success" style="padding:4px 10px;font-size:12px" onclick="resolveTicket('${t.id}', false)">Resolve</button>${t.appeal_flagged ? ` <button class="secondary" style="padding:4px 10px;font-size:12px;margin-left:4px" onclick="resolveTicket('${t.id}', true)">Dismiss</button>` : ''}`
              : '—'}</td>
          </tr>`;
        }).join('');
  });
}

async function resolveTicket(id, dismiss) {
  const result = await API.resolve(id, dismiss);
  if (result.success) location.reload();
  else alert('Failed to update ticket.');
}

// ── PRINT VIEW ───────────────────────────────────────────────────────────────
if (document.getElementById('print-view')) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const tryData = async () => {
    const cached = sessionStorage.getItem('last_ticket');
    if (cached) { const t = JSON.parse(cached); if (t.id === id) return t; }
    const data = await API.getTicket(id);
    return data.ticket;
  };

  tryData().then(t => {
    if (!t) return;
    const base = window.location.origin;
    const url = `${base}/ticket.html?id=${t.id}`;
    const dateStr = new Date(t.created_at).toLocaleString();

    document.getElementById('print-view').innerHTML = `
      <div style="width:80mm; margin:0 auto; font-size:11px; font-family:monospace;">
        <div style="text-align:center; font-size:16px; font-weight:bold; letter-spacing:3px; border-bottom:1px solid #000; padding-bottom:6px; margin-bottom:6px;">
          14-T CITATION
        </div>
        <div><strong>ID:</strong> ${t.id}</div>
        <div><strong>NAME:</strong> ${t.person_name}</div>
        <div><strong>VIOLATION:</strong> ${t.violation_type.toUpperCase()}</div>
        <div><strong>POINTS:</strong> ${t.points}</div>
        <div><strong>LOCATION:</strong> ${t.location}</div>
        ${t.item_name ? `<div><strong>ITEM:</strong> ${t.item_name}</div>` : ''}
        <div><strong>DATE:</strong> ${dateStr}</div>
        <div style="border-top:1px solid #000; margin-top:8px; padding-top:8px; text-align:center;">
          <div id="qr-code"></div>
          <div style="font-size:9px; margin-top:4px; word-break:break-all;">${url}</div>
          <div style="margin-top:6px; font-size:10px;">Scan to view &amp; appeal</div>
        </div>
      </div>
    `;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = () => {
      new QRCode(document.getElementById('qr-code'), {
        text: url, width: 160, height: 160,
        colorDark: '#000000', colorLight: '#ffffff'
      });
      setTimeout(() => window.print(), 800);
    };
    document.head.appendChild(script);
  });
}
