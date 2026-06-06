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

  async claimTicket(id, first, lastInitial) {
    const res = await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, first, last_initial: lastInitial })
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
  },

  async respondToAppeal(id, response, lock, photoBase64) {
    const res = await fetch('/api/appeal-respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, response, lock, photo_base64: photoBase64 || null })
    });
    return res.json();
  },

  async declineAppeal(id) {
    const res = await fetch('/api/appeal-decline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
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
      const lastInitial = isUnknown ? '' : (document.getElementById('person_last_initial').value.trim().toUpperCase() || '');
      const displayName = isUnknown ? 'Unknown' : (lastInitial ? `${firstName} ${lastInitial}.` : firstName);

      const payload = {
        id: generateId(),
        person_first: firstName,
        person_last_initial: lastInitial || null,
        person_name: displayName,
        is_unknown: isUnknown ? 1 : 0,
        violation_type: violation,
        points: violationPoints(violation),
        location: document.getElementById('location').value.trim(),
        description: document.getElementById('description').value.trim() || null,
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

      // Already claimed — show verify gate
      if (t.is_unknown && t.claimed_first) {
        renderVerifyGate(container, t, true);
        return;
      }

      // Named ticket — show verify gate
      renderVerifyGate(container, t, false);
    });
  }
}

function renderVerifyGate(container, t, isClaimed) {
  const hasLastInitial = isClaimed ? !!t.claimed_last_initial : !!t.person_last_initial;
  const ticketId = t.id;
  container.innerHTML = `
    <div class="card">
      <h2>Verify your identity</h2>
      <p style="margin-bottom:16px; font-size:14px; color:var(--muted)">Enter your name to view this citation.</p>
      <div id="verify-msg"></div>
      <div class="row">
        <div class="field-group">
          <label for="verify-first">First Name <span class="req">*</span></label>
          <input
            type="text"
            id="verify-first"
            name="first_name"
            autocomplete="given-name"
            placeholder="First name"
            required
          >
        </div>
        <div class="field-group">
          <label for="verify-last-initial">Last Initial ${hasLastInitial ? '<span class="req">*</span>' : '<span class="opt">(optional)</span>'}</label>
          <input
            type="text"
            id="verify-last-initial"
            name="last_initial"
            autocomplete="family-name"
            maxlength="1"
            placeholder="e.g. S"
            style="text-transform:uppercase; width:80px;"
            ${hasLastInitial ? 'required' : ''}
          >
        </div>
      </div>
      <button onclick="submitVerify('${ticketId}', ${isClaimed})">View My Ticket</button>
    </div>
  `;

  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitVerify(ticketId, isClaimed);
    });
  });
}

function renderClaimGate(container, t) {
  const ticketId = t.id;
  container.innerHTML = `
    <div class="card">
      <h2>Is this citation yours?</h2>
      <p style="margin-bottom:16px; font-size:14px; color:var(--muted)">A citation was issued at <strong>${t.location}</strong>${t.item_name ? ` regarding <strong>${t.item_name}</strong>` : ''}. Enter your name to claim it.</p>
      <div id="claim-msg"></div>
      <div class="row">
        <div class="field-group">
          <label for="claim-first">First Name <span class="req">*</span></label>
          <input
            type="text"
            id="claim-first"
            name="first_name"
            autocomplete="given-name"
            placeholder="First name"
            required
          >
        </div>
        <div class="field-group">
          <label for="claim-last-initial">Last Initial <span class="opt">(optional)</span></label>
          <input
            type="text"
            id="claim-last-initial"
            name="last_initial"
            autocomplete="family-name"
            maxlength="1"
            placeholder="e.g. S"
            style="text-transform:uppercase; width:80px;"
          >
        </div>
      </div>
      <button onclick="submitClaim('${ticketId}')">Claim &amp; View Ticket</button>
    </div>
  `;

  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitClaim(ticketId);
    });
  });
}

async function submitClaim(id) {
  const first = document.getElementById('claim-first').value.trim();
  const lastInitial = (document.getElementById('claim-last-initial').value.trim() || '').toUpperCase() || null;
  const msgEl = document.getElementById('claim-msg');
  if (!first) { showMsg(msgEl, 'First name is required.', 'error'); return; }
  const result = await API.claimTicket(id, first, lastInitial);
  if (result.success) {
    const data = await API.getTicket(id);
    renderFullTicket(document.getElementById('ticket-view'), data.ticket);
  } else {
    showMsg(msgEl, result.error || 'Could not claim ticket.', 'error');
  }
}

async function submitVerify(id, isClaimed) {
  const enteredFirst = document.getElementById('verify-first').value.trim().toLowerCase();
  const enteredInitial = (document.getElementById('verify-last-initial').value.trim() || '').toUpperCase();

  const data = await API.getTicket(id);
  const t = data.ticket;

  const correctFirst = isClaimed ? t.claimed_first : t.person_first;
  const correctInitial = isClaimed ? t.claimed_last_initial : t.person_last_initial;

  const firstMatch = enteredFirst === (correctFirst || '').toLowerCase();
  const initialMatch = !correctInitial || enteredInitial === (correctInitial || '').toUpperCase();

  if (firstMatch && initialMatch) {
    renderFullTicket(document.getElementById('ticket-view'), t);
  } else {
    renderNotYoursTicket(document.getElementById('ticket-view'), t);
  }
}

function renderNotYoursTicket(container, t) {
  const dateStr = new Date(t.created_at).toLocaleDateString();
  container.innerHTML = `
    <div class="ticket-header">
      <div class="ticket-id">${t.id}</div>
      <div class="ticket-name" style="color:var(--muted); font-style:italic;">Unverified</div>
      <div style="margin-top:6px">
        <span class="badge ${t.violation_type}">${t.violation_type.toUpperCase()}</span>
        &nbsp;
        <span class="badge ${t.status}">${t.status.toUpperCase()}</span>
      </div>
    </div>
    <div class="ticket-body">
      <div class="msg" style="display:block; margin-bottom:20px; background:var(--blue-light); color:var(--blue-dark); padding:14px; border-radius:6px;">
        We cannot provide full information because this ticket does not belong to you.
      </div>
      <div class="info-row"><span class="label">Date Issued</span><span>${dateStr}</span></div>
      <div class="info-row"><span class="label">Violation</span><span><span class="badge ${t.violation_type}">${t.violation_type.toUpperCase()}</span></span></div>
      <div class="info-row"><span class="label">Location</span><span>${t.location}</span></div>
      ${t.item_name ? `<div class="info-row"><span class="label">Item</span><span>${t.item_name}</span></div>` : ''}
    </div>
  `;
}

function renderFullTicket(container, t) {
  const displayName = t.claimed_first
    ? (t.claimed_last_initial ? `${t.claimed_first} ${t.claimed_last_initial}.` : t.claimed_first)
    : t.person_name;
  const dateStr = new Date(t.created_at).toLocaleString();
  const isOwner = !window.location.search.includes('view=public');

  // Appeal thread rendering
  let appealThread = '';
  if (t.appeal_note) {
    appealThread += `
      <div class="appeal-box" style="margin-top:16px;">
        <strong>Appeal Filed:</strong><br>${t.appeal_note}
        ${t.appeal_photo_base64 ? `<br><img src="${t.appeal_photo_base64}" style="width:100%;margin-top:10px;border:1px solid var(--border);" alt="Appeal photo">` : ''}
      </div>`;
  }
  if (t.appeal_response) {
    appealThread += `
      <div style="background:#e8f5e8;border:1px solid var(--success);padding:14px;margin-top:10px;">
        <strong>Response from issuer:</strong><br>${t.appeal_response}
        ${t.appeal_response_photo ? `<br><img src="${t.appeal_response_photo}" style="width:100%;margin-top:10px;border:1px solid var(--border);" alt="Response photo">` : ''}
      </div>`;
  }
  if (t.appeal_declined) {
    appealThread += `<div class="msg error" style="display:block;margin-top:10px;">Appeal declined. Points remain.</div>`;
  }

  // What the ticket-holder sees for appeal actions
  let appealSection = '';
  if (t.status !== 'resolved' && t.status !== 'locked') {
    if (!t.appeal_flagged) {
      // No appeal yet — show form
      appealSection = `
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
        <button onclick="submitAppeal('${t.id}')">Submit Appeal</button>`;
    } else if (t.appeal_flagged && t.appeal_response && !t.appeal_response_locked) {
      // Issuer responded and left it open — allow rebuttal
      appealSection = `
        <hr class="divider">
        <h2>Reply to Response</h2>
        <div id="appeal-msg"></div>
        <div class="field-group">
          <label for="appeal-note">Your Reply <span class="req">*</span></label>
          <textarea id="appeal-note" placeholder="Reply to the issuer's response..."></textarea>
        </div>
        <div class="field-group">
          <label for="appeal-photo">Supporting Photo <span class="opt">(optional)</span></label>
          <input type="file" id="appeal-photo" accept="image/*" capture="environment">
        </div>
        <button onclick="submitAppeal('${t.id}')">Send Reply</button>`;
    } else if (t.appeal_flagged && !t.appeal_response) {
      appealSection = `<div class="appeal-box" style="margin-top:16px;">Your appeal has been submitted and is under review.</div>`;
    } else if (t.appeal_response_locked) {
      appealSection = `<div class="msg" style="display:block;margin-top:16px;background:var(--blue-light);color:var(--blue-dark);padding:14px;">This appeal has been closed by the issuer. No further replies.</div>`;
    }
  }

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

      ${t.description ? `
        <div style="background:var(--blue-light);border-left:4px solid var(--blue);padding:12px 14px;margin-bottom:16px;">
          <strong style="font-size:13px;color:var(--blue-dark);text-transform:uppercase;letter-spacing:0.5px;">Violation Details</strong>
          <div style="margin-top:6px;font-size:14px;white-space:pre-wrap;">${t.description}</div>
        </div>` : ''}

      ${appealThread}
      ${appealSection}

      ${t.status === 'resolved' ? '<div class="msg ok" style="display:block;margin-top:16px">This ticket has been resolved.</div>' : ''}
      ${t.status === 'locked' ? '<div class="msg" style="display:block;margin-top:16px;background:var(--blue-light);color:var(--blue-dark);padding:14px;">This ticket has been locked.</div>' : ''}
    </div>
  `;
}

async function submitAppeal(id) {
  const noteEl = document.getElementById('appeal-note');
  const note = noteEl ? noteEl.value.trim() : '';
  const confirmEl = document.getElementById('appeal-confirm');
  const msgEl = document.getElementById('appeal-msg');

  if (!note) { showMsg(msgEl, 'Please enter an explanation.', 'error'); return; }
  // Confirm checkbox only exists on the initial appeal form, not the reply form
  if (confirmEl && !confirmEl.checked) {
    showMsg(msgEl, 'You must confirm this citation was issued to you.', 'error');
    return;
  }

  let photoBase64 = null;
  const photoFile = document.getElementById('appeal-photo') ? document.getElementById('appeal-photo').files[0] : null;
  if (photoFile) {
    try { photoBase64 = await compressImage(photoFile); } catch { photoBase64 = null; }
  }

  const submitBtn = document.querySelector(`[onclick="submitAppeal('${id}')"]`);
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting...'; }

  const result = await API.appeal(id, note, photoBase64, true);
  if (result.success) {
    showMsg(msgEl, 'Submitted successfully.', 'ok');
    if (noteEl) noteEl.disabled = true;
    const photoInput = document.getElementById('appeal-photo');
    if (photoInput) photoInput.disabled = true;
    if (confirmEl) confirmEl.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
    // Refresh ticket view after short delay
    setTimeout(() => {
      API.getTicket(id).then(data => {
        if (data && data.ticket) renderFullTicket(document.getElementById('ticket-view'), data.ticket);
      });
    }, 1200);
  } else {
    showMsg(msgEl, result.error || 'Failed to submit.', 'error');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Appeal'; }
  }
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
const _ticketCache = {};

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

    // Store all tickets in cache so openAppealModal can look them up by ID
    tickets.forEach(t => { _ticketCache[t.id] = t; });

    ticketsEl.innerHTML = sorted.length === 0
      ? '<tr><td colspan="6" style="color:var(--muted)">No tickets issued yet.</td></tr>'
      : sorted.map(t => {
          const displayName = t.is_unknown
            ? (t.claimed_first
                ? `${t.claimed_first}${t.claimed_last_initial ? ' ' + t.claimed_last_initial + '.' : ''} <em style="color:var(--muted);font-size:11px">(claimed)</em>`
                : '<em style="color:var(--muted)">Unknown</em>')
            : t.person_name;

          const needsResponse = t.appeal_flagged && !t.appeal_response && !t.appeal_declined && t.status !== 'resolved';
          const hasReply = t.appeal_flagged && t.appeal_response && !t.appeal_response_locked && t.status !== 'resolved';

          let statusLabel, statusClass;
          if (t.status === 'resolved') { statusLabel = 'RESOLVED'; statusClass = 'resolved'; }
          else if (t.appeal_declined) { statusLabel = 'DECLINED'; statusClass = 'severe'; }
          else if (t.status === 'locked') { statusLabel = 'LOCKED'; statusClass = 'locked'; }
          else if (needsResponse) { statusLabel = 'APPEAL'; statusClass = 'flagged'; }
          else if (hasReply) { statusLabel = 'REPLY'; statusClass = 'flagged'; }
          else { statusLabel = t.status.toUpperCase(); statusClass = t.status; }

          const hasAnyAppeal = t.appeal_flagged;
          const actionBtn = t.status === 'resolved'
            ? '—'
            : hasAnyAppeal
              ? `<button style="padding:4px 12px;font-size:12px;background:var(--blue)" onclick="openAppealModal('${t.id}')">View Appeal</button>`
              : `<button class="success" style="padding:4px 10px;font-size:12px" onclick="resolveTicket('${t.id}', false)">Resolve</button>`;

          return `<tr>
            <td><a href="ticket.html?id=${t.id}">${t.id}</a></td>
            <td>${displayName}</td>
            <td><span class="badge ${t.violation_type}">${t.violation_type}</span></td>
            <td>${t.points} pt${t.points !== 1 ? 's' : ''}</td>
            <td><span class="badge ${statusClass}">${statusLabel}</span></td>
            <td>${actionBtn}</td>
          </tr>`;
        }).join('');
  });
}

async function resolveTicket(id, dismiss) {
  const result = await API.resolve(id, dismiss);
  if (result.success) location.reload();
  else alert('Failed to update ticket.');
}

async function declineAppeal(id) {
  if (!confirm('Decline this appeal? Points will remain.')) return;
  const result = await API.declineAppeal(id);
  if (result.success) location.reload();
  else alert('Failed to decline appeal.');
}

async function lockThread(id) {
  const res = await fetch('/api/appeal-lock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  const data = await res.json();
  if (data.success) location.reload();
  else alert('Failed to lock thread.');
}

function openAppealModal(id) {
  const t = _ticketCache[id];
  if (!t) { alert('Could not load ticket data.'); return; }
  const existing = document.getElementById('appeal-modal');
  if (existing) existing.remove();

  const needsResponse = t.appeal_flagged && !t.appeal_response && !t.appeal_declined && t.status !== 'resolved';
  const canRespond = t.appeal_flagged && !t.appeal_declined && t.status !== 'resolved';
  const canLock = t.appeal_response && !t.appeal_response_locked && t.status !== 'locked' && t.status !== 'resolved';
  const canDecline = !t.appeal_declined && t.status !== 'resolved';

  // Build thread HTML
  let thread = '';
  if (t.appeal_note) {
    thread += `<div style="background:#fff8e6;border:1px solid var(--warn);padding:12px;margin-bottom:10px;">
      <div style="font-size:11px;font-weight:700;color:#a07000;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Their Appeal</div>
      <div style="font-size:14px;">${t.appeal_note}</div>
      ${t.appeal_photo_base64 ? `<img src="${t.appeal_photo_base64}" style="width:100%;max-height:200px;object-fit:cover;margin-top:8px;border:1px solid var(--border);">` : ''}
    </div>`;
  }
  if (t.appeal_response) {
    thread += `<div style="background:#e8f5e8;border:1px solid var(--success);padding:12px;margin-bottom:10px;">
      <div style="font-size:11px;font-weight:700;color:var(--success);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Your Response ${t.appeal_response_locked ? '· <span style="color:var(--muted)">Thread Locked</span>' : '· <span style="color:var(--muted)">Awaiting Reply</span>'}</div>
      <div style="font-size:14px;">${t.appeal_response}</div>
      ${t.appeal_response_photo ? `<img src="${t.appeal_response_photo}" style="width:100%;max-height:200px;object-fit:cover;margin-top:8px;border:1px solid var(--border);">` : ''}
    </div>`;
  }
  if (t.appeal_declined) {
    thread += `<div style="background:#fde8e8;border:1px solid var(--accent);padding:10px;margin-bottom:10px;font-size:13px;font-weight:700;color:var(--accent);">✗ Appeal Declined — Points Remain</div>`;
  }

  // Respond form (shown if canRespond)
  const respondForm = canRespond ? `
    <div id="respond-section" style="border-top:2px solid var(--border);margin-top:16px;padding-top:16px;">
      <div style="font-size:13px;font-weight:700;color:var(--blue-dark);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Send a Response</div>
      <div id="respond-msg"></div>
      <div class="field-group">
        <label for="modal-respond-text">Message <span class="req">*</span></label>
        <textarea id="modal-respond-text" placeholder="Write your response..." style="min-height:80px;"></textarea>
      </div>
      <div class="field-group">
        <label for="modal-respond-photo">Attach Photo <span class="opt">(optional)</span></label>
        <input type="file" id="modal-respond-photo" accept="image/*" capture="environment">
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
        <button style="background:#555;padding:8px 14px;font-size:13px;" onclick="submitModalResponse('${t.id}', true)">Send &amp; Lock Thread</button>
        <button class="secondary" style="padding:8px 14px;font-size:13px;" onclick="submitModalResponse('${t.id}', false)">Send &amp; Allow Reply</button>
      </div>
    </div>` : '';

  // Action buttons at bottom
  let actionBtns = '';
  if (t.status !== 'resolved') {
    actionBtns += `<button class="success" style="padding:8px 16px;font-size:13px;" onclick="resolveTicket('${t.id}', false); document.getElementById('appeal-modal').remove();">Resolve</button>`;
    actionBtns += ` <button class="secondary" style="padding:8px 16px;font-size:13px;" onclick="resolveTicket('${t.id}', true); document.getElementById('appeal-modal').remove();">Dismiss (Remove Points)</button>`;
    if (canDecline) {
      actionBtns += ` <button class="danger" style="padding:8px 16px;font-size:13px;" onclick="declineAppeal('${t.id}')">Decline Appeal</button>`;
    }
    if (canLock) {
      actionBtns += ` <button style="background:#333;padding:8px 16px;font-size:13px;" onclick="lockThread('${t.id}')">Lock Thread</button>`;
    }
  }

  const modal = document.createElement('div');
  modal.id = 'appeal-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;';
  modal.innerHTML = `
    <div style="background:var(--white);max-width:560px;width:100%;border-top:4px solid var(--blue);margin:auto;">
      <div style="background:var(--blue);color:var(--white);padding:14px 18px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:11px;opacity:0.75;letter-spacing:1px;">${t.id}</div>
          <div style="font-size:17px;font-weight:700;">${t.person_name} — Appeal</div>
        </div>
        <button onclick="document.getElementById('appeal-modal').remove()" style="background:transparent;border:1px solid rgba(255,255,255,0.4);color:var(--white);padding:4px 10px;font-size:13px;">✕ Close</button>
      </div>
      <div style="padding:18px;">
        ${thread}
        ${respondForm}
        ${actionBtns ? `<div style="border-top:2px solid var(--border);margin-top:18px;padding-top:16px;display:flex;gap:8px;flex-wrap:wrap;">${actionBtns}</div>` : ''}
      </div>
    </div>
  `;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

async function submitModalResponse(id, lock) {
  const text = document.getElementById('modal-respond-text').value.trim();
  const msgEl = document.getElementById('respond-msg');
  if (!text) {
    msgEl.className = 'msg error'; msgEl.textContent = 'Response text is required.'; msgEl.style.display = 'block';
    return;
  }
  let photoBase64 = null;
  const photoFile = document.getElementById('modal-respond-photo').files[0];
  if (photoFile) { try { photoBase64 = await compressImage(photoFile); } catch { photoBase64 = null; } }

  const btns = document.querySelectorAll('#appeal-modal button');
  btns.forEach(b => b.disabled = true);

  const result = await API.respondToAppeal(id, text, lock, photoBase64);
  if (result.success) {
    document.getElementById('appeal-modal').remove();
    location.reload();
  } else {
    msgEl.className = 'msg error'; msgEl.textContent = result.error || 'Failed to send.'; msgEl.style.display = 'block';
    btns.forEach(b => b.disabled = false);
  }
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
        <div style="text-align:center; font-size:16px; font-weight:bold; letter-spacing:3px; border-bottom:2px solid #000; padding-bottom:6px; margin-bottom:10px;">
          14-T CITATION
        </div>
        <div style="margin-bottom:4px;"><strong>NAME:</strong> ${t.person_name}</div>
        <div style="margin-bottom:4px;"><strong>LOCATION:</strong> ${t.location}</div>
        ${t.item_name ? `<div style="margin-bottom:4px;"><strong>ITEM:</strong> ${t.item_name}</div>` : ''}
        <div style="margin-bottom:4px;"><strong>DATE:</strong> ${dateStr}</div>
        <div style="border-top:1px solid #000; margin-top:10px; padding-top:10px; text-align:center;">
          <div id="qr-code" style="display:inline-block;"></div>
          <div style="font-size:9px; margin-top:6px; word-break:break-all;">${url}</div>
          <div style="margin-top:6px; font-size:10px; font-style:italic;">Scan to view your citation</div>
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
