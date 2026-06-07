// public/app.js
// 14-T Client Application

// ── PENAL CODES ──────────────────────────────────────────────────────────────
const PENAL_CODES = [
  // Abandonment / Left Out
  { code: '14T-100', label: 'Left Out / Abandoned', desc: 'Item left out and unattended for an unreasonable period.', category: 'abandonment' },
  { code: '14T-101', label: 'Overnight Abandonment', desc: 'Item left out overnight without prior arrangement.', category: 'abandonment' },
  { code: '14T-102', label: 'Common Area Obstruction', desc: 'Item blocking shared space or walkway.', category: 'abandonment' },
  { code: '14T-103', label: 'Returned to Wrong Location', desc: 'Item placed in incorrect storage area after use.', category: 'abandonment' },
  // Cleanliness
  { code: '14T-200', label: 'Dish / Utensil Left Out', desc: 'Dirty dish, cup, or utensil left in non-kitchen area.', category: 'cleanliness' },
  { code: '14T-201', label: 'Food / Wrapper Left Out', desc: 'Food, packaging, or food waste left in improper area.', category: 'cleanliness' },
  { code: '14T-202', label: 'Spill Not Cleaned', desc: 'Spill or mess left unaddressed by responsible party.', category: 'cleanliness' },
  { code: '14T-203', label: 'Trash Not Disposed', desc: 'Trash not placed in bin or bin not taken out when full.', category: 'cleanliness' },
  { code: '14T-204', label: 'Bathroom Left Unclean', desc: 'Bathroom left in unsanitary condition.', category: 'cleanliness' },
  // Noise / Disturbance
  { code: '14T-300', label: 'Noise Violation', desc: 'Unreasonable noise disturbance during quiet hours.', category: 'noise' },
  { code: '14T-301', label: 'Repeated Disturbance', desc: 'Second or subsequent noise/disturbance offense.', category: 'noise' },
  // Property
  { code: '14T-400', label: 'Unauthorized Use of Property', desc: 'Using another person\'s belongings without permission.', category: 'property' },
  { code: '14T-401', label: 'Property Damage', desc: 'Damage caused to shared or personal property.', category: 'property' },
  { code: '14T-402', label: 'Borrowed — Not Returned', desc: 'Item borrowed and not returned within agreed timeframe.', category: 'property' },
  // Chores / Responsibilities
  { code: '14T-500', label: 'Chore Not Completed', desc: 'Assigned chore not completed by deadline.', category: 'chores' },
  { code: '14T-501', label: 'Chore Done Improperly', desc: 'Chore completed but not to acceptable standard.', category: 'chores' },
  // Removal Notices
  { code: '14T-600', label: 'Removal Notice — 24hr', desc: 'Item must be removed within 24 hours or it will be relocated.', category: 'removal' },
  { code: '14T-601', label: 'Removal Notice — 48hr', desc: 'Item must be removed within 48 hours or it will be relocated.', category: 'removal' },
  { code: '14T-602', label: 'Removal Notice — 72hr', desc: 'Item must be removed within 72 hours or it will be relocated.', category: 'removal' },
  { code: '14T-603', label: 'Immediate Removal Required', desc: 'Item is blocking access or creating hazard and must be moved immediately.', category: 'removal' },
  // Other
  { code: '14T-900', label: 'Other', desc: '', category: 'other' }
];

const CATEGORY_LABELS = {
  abandonment: 'Abandonment / Left Out',
  cleanliness: 'Cleanliness',
  noise: 'Noise / Disturbance',
  property: 'Property',
  chores: 'Chores / Responsibilities',
  removal: 'Removal Notices',
  other: 'Other'
};

// ── VIOLATION TYPES ──────────────────────────────────────────────────────────
const VIOLATION_TYPES = {
  notice:   { label: 'Notice',          points: 0, desc: 'Informational only, no points' },
  warning:  { label: 'Warning',         points: 0, desc: '0 pts — Warning only' },
  removal:  { label: 'Removal Notice',  points: 0, desc: '0 pts — Must remove item or face escalation' },
  minor:    { label: 'Minor',           points: 1, desc: '1 pt' },
  major:    { label: 'Major',           points: 2, desc: '2 pts' },
  severe:   { label: 'Severe',          points: 3, desc: '3 pts' },
  contest:  { label: 'Contested',       points: 0, desc: '0 pts — Ownership/responsibility disputed' }
};

const API = {
  async createTicket(data) {
    const res = await fetch('/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
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
  async claimTicket(id, name) {
    const res = await fetch('/api/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, name }) });
    return res.json();
  },
  async resolve(id, dismiss) {
    const res = await fetch('/api/resolve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, dismiss }) });
    return res.json();
  },
  async appeal(id, note, photoBase64) {
    const res = await fetch('/api/appeal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, note, photo_base64: photoBase64 || null }) });
    return res.json();
  },
  async respondToAppeal(id, response, lock, photoBase64) {
    const res = await fetch('/api/appeal-respond', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, response, lock, photo_base64: photoBase64 || null }) });
    return res.json();
  },
  async declineAppeal(id) {
    const res = await fetch('/api/appeal-decline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    return res.json();
  }
};

function generateId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `14T-${ts}-${rand}`;
}

function violationPoints(type) {
  return VIOLATION_TYPES[type]?.points ?? 0;
}

function showMsg(el, text, type) {
  if (!el) return;
  el.className = `msg ${type}`;
  el.textContent = text;
  el.style.display = 'block';
}

async function compressImage(file, maxWidth = 1000, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
        canvas.width = w; canvas.height = h;
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
  const penalSelect = document.getElementById('penal_code');
  const penalDesc = document.getElementById('penal-desc');
  let stream = null, scanning = false;

  // Populate penal code select grouped by category
  if (penalSelect) {
    const categories = [...new Set(PENAL_CODES.map(p => p.category))];
    categories.forEach(cat => {
      const group = document.createElement('optgroup');
      group.label = CATEGORY_LABELS[cat];
      PENAL_CODES.filter(p => p.category === cat).forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.code;
        opt.textContent = `${p.code} — ${p.label}`;
        group.appendChild(opt);
      });
      penalSelect.appendChild(group);
    });

    penalSelect.addEventListener('change', () => {
      const found = PENAL_CODES.find(p => p.code === penalSelect.value);
      if (found && found.desc) {
        penalDesc.textContent = found.desc;
        penalDesc.style.display = 'block';
        // Auto-fill description if empty or was auto-filled
        const descEl = document.getElementById('description');
        if (descEl && (!descEl.value || descEl.dataset.autofilled === '1')) {
          descEl.value = found.desc;
          descEl.dataset.autofilled = '1';
        }
        // Auto-set removal type for removal codes
        if (found.category === 'removal' && violationSelect) {
          violationSelect.value = 'removal';
          violationSelect.dispatchEvent(new Event('change'));
        }
      } else {
        penalDesc.style.display = 'none';
      }
    });
  }

  // Clear autofill flag when user edits description manually
  const descEl = document.getElementById('description');
  if (descEl) {
    descEl.addEventListener('input', () => { descEl.dataset.autofilled = '0'; });
  }

  if (unknownCheck) {
    unknownCheck.addEventListener('change', () => {
      nameFields.style.display = unknownCheck.checked ? 'none' : 'block';
      document.getElementById('person_first').required = !unknownCheck.checked;
    });
  }

  if (violationSelect) {
    violationSelect.addEventListener('change', () => {
      const vt = VIOLATION_TYPES[violationSelect.value];
      pointsDisplay.textContent = vt ? vt.desc : '';
    });
    // Init
    const vt = VIOLATION_TYPES[violationSelect.value];
    if (vt && pointsDisplay) pointsDisplay.textContent = vt.desc;
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
        video.srcObject = stream; video.play();
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
      } catch { showMsg(msgEl, 'Camera access denied or not available.', 'error'); }
    });
  }

  // ── Multi-photo ──────────────────────────────────────────────────────────
  const photoInput = document.getElementById('photo');
  const extraPhotosContainer = document.getElementById('extra-photos');
  const addPhotoBtn = document.getElementById('add-photo-btn');
  let extraPhotoFiles = [];

  if (addPhotoBtn) {
    addPhotoBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.style.cssText = 'width:100%;margin-bottom:8px;';
      input.addEventListener('change', () => {
        if (input.files[0]) {
          extraPhotoFiles.push(input.files[0]);
          const label = document.createElement('div');
          label.style.cssText = 'font-size:12px;color:var(--success);margin-bottom:8px;';
          label.textContent = `✓ Photo ${extraPhotoFiles.length + 1}: ${input.files[0].name}`;
          input.replaceWith(label);
        }
      });
      extraPhotosContainer.appendChild(input);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgEl.style.display = 'none';

    const isUnknown = unknownCheck && unknownCheck.checked;
    if (!isUnknown) {
      const firstName = document.getElementById('person_first').value.trim();
      if (!firstName) { showMsg(msgEl, 'First name is required.', 'error'); return; }
    }

    const primaryPhoto = photoInput ? photoInput.files[0] : null;
    if (!primaryPhoto) { showMsg(msgEl, 'A photo is required.', 'error'); return; }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const photoBase64 = await compressImage(primaryPhoto);

      // Compress extra photos
      const extraBase64s = [];
      for (const f of extraPhotoFiles) {
        try { extraBase64s.push(await compressImage(f)); } catch { /* skip */ }
      }

      const violation = violationSelect.value;
      const firstName = isUnknown ? '' : document.getElementById('person_first').value.trim();
      const lastInitial = isUnknown ? '' : (document.getElementById('person_last_initial').value.trim().toUpperCase() || '');
      const displayName = isUnknown ? 'Unknown' : (lastInitial ? `${firstName} ${lastInitial}.` : firstName);
      const penalCode = penalSelect ? penalSelect.value : null;
      const descVal = document.getElementById('description')?.value.trim() || null;

      const payload = {
        id: generateId(),
        person_first: firstName || null,
        person_last_initial: lastInitial || null,
        person_name: displayName,
        is_unknown: isUnknown ? 1 : 0,
        violation_type: violation,
        points: violationPoints(violation),
        location: document.getElementById('location').value.trim(),
        penal_code: penalCode || null,
        description: descVal,
        item_name: document.getElementById('item_name').value.trim() || null,
        product_number: document.getElementById('product_number').value.trim() || null,
        serial_number: document.getElementById('serial_number').value.trim() || null,
        photo_base64: photoBase64,
        extra_photos: extraBase64s.length ? JSON.stringify(extraBase64s) : null,
        created_at: new Date().toISOString()
      };

      const result = await API.createTicket(payload);
      if (result.success) {
        sessionStorage.setItem('last_ticket', JSON.stringify({ ...payload, photo_base64: photoBase64 }));
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
  const bypass = params.get('bypass'); // issuer preview mode
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

      // Issuer bypass — show full ticket without name gate
      if (bypass === '1') {
        renderFullTicket(container, t, true);
        return;
      }

      // Unknown ticket — not yet claimed
      if (t.is_unknown && !t.claimed_name) {
        renderClaimGate(container, t);
        return;
      }

      // Named or claimed ticket — show name gate
      renderVerifyGate(container, t);
    });
  }
}

function renderVerifyGate(container, t) {
  const isClaimed = t.is_unknown && !!t.claimed_name;
  const hasLastInitial = isClaimed ? false : !!t.person_last_initial;
  const ticketId = t.id;
  container.innerHTML = `
    <div class="card">
      <h2>Verify your identity</h2>
      <p style="margin-bottom:16px;font-size:14px;color:var(--muted)">Enter your name to view this citation.</p>
      <div id="verify-msg"></div>
      <div class="row">
        <div class="field-group">
          <label for="verify-name">First Name <span class="req">*</span></label>
          <input type="text" id="verify-name" autocomplete="given-name" placeholder="First name">
        </div>
        ${hasLastInitial ? `
        <div class="field-group">
          <label for="verify-initial">Last Initial <span class="req">*</span></label>
          <input type="text" id="verify-initial" autocomplete="family-name" maxlength="1" placeholder="e.g. S" style="text-transform:uppercase;width:80px;">
        </div>` : ''}
      </div>
      <button onclick="submitVerify('${ticketId}', ${isClaimed}, ${hasLastInitial})">View My Ticket</button>
    </div>
  `;
  document.getElementById('verify-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitVerify(ticketId, isClaimed, hasLastInitial);
  });
}

function renderClaimGate(container, t) {
  const ticketId = t.id;
  container.innerHTML = `
    <div class="card">
      <h2>Is this citation yours?</h2>
      <p style="margin-bottom:16px;font-size:14px;color:var(--muted)">A citation was issued at <strong>${t.location}</strong>${t.item_name ? ` regarding <strong>${t.item_name}</strong>` : ''}. Enter your name to claim it.</p>
      <div id="claim-msg"></div>
      <div class="field-group">
        <label for="claim-name">Your Name <span class="req">*</span></label>
        <input type="text" id="claim-name" autocomplete="name" placeholder="First name or full name" style="max-width:280px;">
      </div>
      <button onclick="submitClaim('${ticketId}')">Claim &amp; View Ticket</button>
    </div>
  `;
  document.getElementById('claim-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitClaim(ticketId);
  });
}

async function submitClaim(id) {
  const name = document.getElementById('claim-name').value.trim();
  const msgEl = document.getElementById('claim-msg');
  if (!name) { showMsg(msgEl, 'Name is required.', 'error'); return; }
  const result = await API.claimTicket(id, name);
  if (result.success) {
    const data = await API.getTicket(id);
    renderFullTicket(document.getElementById('ticket-view'), data.ticket, false);
  } else {
    showMsg(msgEl, result.error || 'Could not claim ticket.', 'error');
  }
}

async function submitVerify(id, isClaimed, hasLastInitial) {
  const enteredFirst = document.getElementById('verify-name').value.trim().toLowerCase();
  const enteredInitial = hasLastInitial
    ? (document.getElementById('verify-initial')?.value.trim().toUpperCase() || '')
    : null;
  const msgEl = document.getElementById('verify-msg');
  const data = await API.getTicket(id);
  const t = data.ticket;

  const correctFirst = isClaimed
    ? (t.claimed_name || '').toLowerCase()
    : (t.person_first || '').toLowerCase();
  const correctInitial = hasLastInitial ? (t.person_last_initial || '').toUpperCase() : null;

  const firstMatch = enteredFirst && correctFirst && correctFirst.startsWith(enteredFirst);
  const initialMatch = !hasLastInitial || (enteredInitial === correctInitial);

  if (firstMatch && initialMatch) {
    renderFullTicket(document.getElementById('ticket-view'), t, false);
  } else {
    showMsg(msgEl, 'Name does not match. Check your first name' + (hasLastInitial ? ' and last initial.' : '.'), 'error');
  }
}

function renderFullTicket(container, t, isIssuerView) {
  const displayName = t.claimed_name || t.person_name;
  const dateStr = new Date(t.created_at).toLocaleString();
  const penalInfo = t.penal_code ? PENAL_CODES.find(p => p.code === t.penal_code) : null;

  // Extra photos
  let extraPhotosHtml = '';
  if (t.extra_photos) {
    try {
      const extras = JSON.parse(t.extra_photos);
      extraPhotosHtml = extras.map((src, i) =>
        `<img class="ticket-photo" src="${src}" alt="Evidence photo ${i + 2}" style="margin-top:8px;">`
      ).join('');
    } catch {}
  }

  // Appeal thread — clean, no duplicates
  let appealThread = '';
  if (t.appeal_note) {
    appealThread += `<div class="appeal-box" style="margin-top:16px;">
      <strong style="font-size:12px;color:#a07000;text-transform:uppercase;letter-spacing:0.5px;">Appeal Filed</strong>
      <div style="margin-top:6px;">${t.appeal_note}</div>
      ${t.appeal_photo_base64 ? `<img src="${t.appeal_photo_base64}" style="width:100%;margin-top:8px;border:1px solid var(--border);" alt="Appeal photo">` : ''}
    </div>`;
  }
  if (t.appeal_response) {
    appealThread += `<div style="background:#e8f5e8;border:1px solid var(--success);padding:14px;margin-top:8px;">
      <strong style="font-size:12px;color:var(--success);text-transform:uppercase;letter-spacing:0.5px;">Response from Issuer</strong>
      <div style="margin-top:6px;">${t.appeal_response}</div>
      ${t.appeal_response_photo ? `<img src="${t.appeal_response_photo}" style="width:100%;margin-top:8px;border:1px solid var(--border);" alt="Response photo">` : ''}
    </div>`;
  }

  // Status message — single, non-duplicating
  let statusMsg = '';
  if (t.status === 'resolved') {
    statusMsg = '<div class="msg ok" style="display:block;margin-top:16px;">This ticket has been resolved.</div>';
  } else if (t.appeal_declined) {
    statusMsg = '<div class="msg error" style="display:block;margin-top:16px;">Appeal declined — points remain.</div>';
  } else if (t.appeal_response_locked || t.status === 'locked') {
    statusMsg = '<div class="msg" style="display:block;margin-top:16px;background:var(--blue-light);color:var(--blue-dark);padding:14px;">This appeal thread has been closed.</div>';
  }

  // Appeal action section (recipient only)
  let appealSection = '';
  if (!isIssuerView && t.status !== 'resolved' && !t.appeal_declined && !t.appeal_response_locked && t.status !== 'locked') {
    if (!t.appeal_flagged) {
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
        <div class="field-group" style="display:flex;align-items:flex-start;gap:10px;margin-bottom:16px;">
          <input type="checkbox" id="appeal-confirm" style="margin-top:3px;width:auto;flex-shrink:0;">
          <label for="appeal-confirm" style="font-weight:400;font-size:13px;margin-bottom:0;cursor:pointer;">
            I confirm this citation was issued to me and my information is accurate.
          </label>
        </div>
        <button onclick="submitAppeal('${t.id}')">Submit Appeal</button>`;
    } else if (t.appeal_flagged && t.appeal_response) {
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
    }
  }

  // Activity log
  const log = [];
  log.push({ time: t.created_at, msg: 'Ticket issued' });
  if (t.appeal_flagged && t.appeal_note) log.push({ time: null, msg: 'Appeal filed by recipient' });
  if (t.appeal_response) log.push({ time: null, msg: 'Response sent by issuer' });
  if (t.appeal_declined) log.push({ time: null, msg: 'Appeal declined by issuer' });
  if (t.appeal_response_locked) log.push({ time: null, msg: 'Appeal thread locked' });
  if (t.status === 'resolved') log.push({ time: null, msg: 'Ticket resolved' });

  const logHtml = `
    <div style="margin-top:24px;border-top:1px solid var(--border);padding-top:14px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:10px;">Activity Log</div>
      ${log.map(entry => `
        <div style="display:flex;gap:10px;margin-bottom:6px;font-size:12px;">
          <span style="color:var(--muted);min-width:8px;">•</span>
          <span>${entry.msg}${entry.time ? ` — <span style="color:var(--muted)">${new Date(entry.time).toLocaleString()}</span>` : ''}</span>
        </div>`).join('')}
    </div>`;

  const vtInfo = VIOLATION_TYPES[t.violation_type];

  container.innerHTML = `
    <div class="ticket-header">
      <div class="ticket-id">${t.id}</div>
      <div class="ticket-name">${displayName}</div>
      <div style="margin-top:6px;">
        <span class="badge ${t.violation_type}">${(vtInfo?.label || t.violation_type).toUpperCase()}</span>
        &nbsp;
        <span class="badge ${t.appeal_declined ? 'severe' : t.status}">${t.appeal_declined ? 'DECLINED' : t.status.toUpperCase()}</span>
      </div>
    </div>
    <div class="ticket-body">
      <img class="ticket-photo" src="${t.photo_base64}" alt="Violation photo">
      ${extraPhotosHtml}
      <div class="row" style="align-items:flex-start;margin-top:14px;margin-bottom:16px;">
        <div>
          <div class="info-row"><span class="label">Date Issued</span><span>${dateStr}</span></div>
          <div class="info-row"><span class="label">Location</span><span>${t.location}</span></div>
          ${t.item_name ? `<div class="info-row"><span class="label">Item</span><span>${t.item_name}</span></div>` : ''}
          ${t.product_number ? `<div class="info-row"><span class="label">Product #</span><span>${t.product_number}</span></div>` : ''}
          ${t.serial_number ? `<div class="info-row"><span class="label">Serial #</span><span>${t.serial_number}</span></div>` : ''}
          ${penalInfo ? `<div class="info-row"><span class="label">Penal Code</span><span>${penalInfo.code} — ${penalInfo.label}</span></div>` : ''}
        </div>
        <div style="text-align:right;">
          <div class="points-big">${t.points}</div>
          <div class="points-label">Point${t.points !== 1 ? 's' : ''}</div>
        </div>
      </div>

      ${t.description ? `
        <div style="background:var(--blue-light);border-left:4px solid var(--blue);padding:12px 14px;margin-bottom:16px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--blue-dark);margin-bottom:6px;">Violation Details</div>
          <div style="font-size:14px;white-space:pre-wrap;">${t.description}</div>
        </div>` : ''}

      ${appealThread}
      ${statusMsg}
      ${appealSection}
      ${logHtml}
    </div>
  `;
}

async function submitAppeal(id) {
  const noteEl = document.getElementById('appeal-note');
  const note = noteEl ? noteEl.value.trim() : '';
  const confirmEl = document.getElementById('appeal-confirm');
  const msgEl = document.getElementById('appeal-msg');

  if (!note) { showMsg(msgEl, 'Please enter an explanation.', 'error'); return; }
  if (confirmEl && !confirmEl.checked) {
    showMsg(msgEl, 'You must confirm this citation was issued to you.', 'error');
    return;
  }

  let photoBase64 = null;
  const photoFile = document.getElementById('appeal-photo')?.files[0];
  if (photoFile) { try { photoBase64 = await compressImage(photoFile); } catch {} }

  const submitBtn = document.querySelector(`[onclick="submitAppeal('${id}')"]`);
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting...'; }

  const result = await API.appeal(id, note, photoBase64);
  if (result.success) {
    showMsg(msgEl, 'Submitted successfully.', 'ok');
    if (noteEl) noteEl.disabled = true;
    const photoInput = document.getElementById('appeal-photo');
    if (photoInput) photoInput.disabled = true;
    if (confirmEl) confirmEl.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
    setTimeout(() => {
      API.getTicket(id).then(data => {
        if (data?.ticket) renderFullTicket(document.getElementById('ticket-view'), data.ticket, false);
      });
    }, 1000);
  } else {
    showMsg(msgEl, result.error || 'Failed to submit.', 'error');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit'; }
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

    tickets.forEach(t => { _ticketCache[t.id] = t; });

    ticketsEl.innerHTML = sorted.length === 0
      ? '<tr><td colspan="7" style="color:var(--muted)">No tickets issued yet.</td></tr>'
      : sorted.map(t => {
          const displayName = t.is_unknown
            ? (t.claimed_name
                ? `${t.claimed_name} <em style="color:var(--muted);font-size:11px">(claimed)</em>`
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

          const vtInfo = VIOLATION_TYPES[t.violation_type];
          const vtLabel = vtInfo?.label || t.violation_type;

          const viewAsBtn = `<a href="ticket.html?id=${t.id}&bypass=1" target="_blank" style="font-size:11px;color:var(--blue);text-decoration:underline;">View as Recipient</a>`;

          const actionBtn = t.status === 'resolved'
            ? viewAsBtn
            : t.appeal_flagged
              ? `<button style="padding:4px 12px;font-size:12px;background:var(--blue)" onclick="openAppealModal('${t.id}')">View Appeal</button>`
              : `<button class="success" style="padding:4px 10px;font-size:12px" onclick="resolveTicket('${t.id}', false)">Resolve</button>`;

          return `<tr>
            <td><a href="ticket.html?id=${t.id}&bypass=1">${t.id}</a></td>
            <td>${displayName}</td>
            <td><span class="badge ${t.violation_type}">${vtLabel}</span></td>
            <td>${t.points} pt${t.points !== 1 ? 's' : ''}</td>
            <td><span class="badge ${statusClass}">${statusLabel}</span></td>
            <td style="font-size:12px;color:var(--muted)">${t.penal_code || '—'}</td>
            <td style="white-space:nowrap;">${actionBtn}${t.status !== 'resolved' ? `<br>${viewAsBtn}` : ''}</td>
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
  const res = await fetch('/api/appeal-lock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
  const data = await res.json();
  if (data.success) location.reload();
  else alert('Failed to lock thread.');
}

function openAppealModal(id) {
  const t = _ticketCache[id];
  if (!t) { alert('Could not load ticket data.'); return; }
  const existing = document.getElementById('appeal-modal');
  if (existing) existing.remove();

  const canRespond = t.appeal_flagged && t.status !== 'resolved';
  const canLock = t.appeal_response && !t.appeal_response_locked && t.status !== 'locked' && t.status !== 'resolved';
  const canDecline = !t.appeal_declined && t.status !== 'resolved';

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
      <div style="font-size:11px;font-weight:700;color:var(--success);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Your Response · ${t.appeal_response_locked ? '<span style="color:var(--muted)">Thread Locked</span>' : '<span style="color:var(--muted)">Awaiting Reply</span>'}</div>
      <div style="font-size:14px;">${t.appeal_response}</div>
      ${t.appeal_response_photo ? `<img src="${t.appeal_response_photo}" style="width:100%;max-height:200px;object-fit:cover;margin-top:8px;border:1px solid var(--border);">` : ''}
    </div>`;
  }
  if (t.appeal_declined) {
    thread += `<div style="background:#fde8e8;border:1px solid var(--accent);padding:10px;margin-bottom:10px;font-size:13px;font-weight:700;color:var(--accent);">✗ Appeal Declined — Points Remain</div>`;
  }

  const respondForm = canRespond ? `
    <div style="border-top:2px solid var(--border);margin-top:16px;padding-top:16px;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--blue-dark);margin-bottom:10px;">Send a Response</div>
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

  let actionBtns = '';
  if (t.status !== 'resolved') {
    actionBtns += `<button class="success" style="padding:8px 16px;font-size:13px;" onclick="resolveTicket('${t.id}', false)">Resolve</button>`;
    actionBtns += ` <button class="secondary" style="padding:8px 16px;font-size:13px;" onclick="resolveTicket('${t.id}', true)">Dismiss (Remove Points)</button>`;
    if (canDecline) actionBtns += ` <button class="danger" style="padding:8px 16px;font-size:13px;" onclick="declineAppeal('${t.id}')">Decline Appeal</button>`;
    if (canLock) actionBtns += ` <button style="background:#333;padding:8px 16px;font-size:13px;" onclick="lockThread('${t.id}')">Lock Thread</button>`;
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
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

async function submitModalResponse(id, lock) {
  const text = document.getElementById('modal-respond-text').value.trim();
  const msgEl = document.getElementById('respond-msg');
  if (!text) { msgEl.className = 'msg error'; msgEl.textContent = 'Response text is required.'; msgEl.style.display = 'block'; return; }
  let photoBase64 = null;
  const photoFile = document.getElementById('modal-respond-photo').files[0];
  if (photoFile) { try { photoBase64 = await compressImage(photoFile); } catch {} }
  const btns = document.querySelectorAll('#appeal-modal button');
  btns.forEach(b => b.disabled = true);
  const result = await API.respondToAppeal(id, text, lock, photoBase64);
  if (result.success) { document.getElementById('appeal-modal').remove(); location.reload(); }
  else { msgEl.className = 'msg error'; msgEl.textContent = result.error || 'Failed to send.'; msgEl.style.display = 'block'; btns.forEach(b => b.disabled = false); }
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
      <div style="width:80mm;margin:0 auto;font-size:11px;font-family:monospace;">
        <div style="text-align:center;font-size:16px;font-weight:bold;letter-spacing:3px;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:10px;">14-T CITATION</div>
        <div style="margin-bottom:4px;"><strong>NAME:</strong> ${t.person_name}</div>
        <div style="margin-bottom:4px;"><strong>LOCATION:</strong> ${t.location}</div>
        ${t.item_name ? `<div style="margin-bottom:4px;"><strong>ITEM:</strong> ${t.item_name}</div>` : ''}
        <div style="margin-bottom:4px;"><strong>DATE:</strong> ${dateStr}</div>
        <div style="border-top:1px solid #000;margin-top:10px;padding-top:10px;text-align:center;">
          <div id="qr-code" style="display:inline-block;"></div>
          <div style="font-size:9px;margin-top:6px;word-break:break-all;">${url}</div>
          <div style="margin-top:6px;font-size:10px;font-style:italic;">Scan to view your citation</div>
        </div>
      </div>`;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = () => {
      new QRCode(document.getElementById('qr-code'), { text: url, width: 160, height: 160, colorDark: '#000000', colorLight: '#ffffff' });
      setTimeout(() => window.print(), 800);
    };
    document.head.appendChild(script);
  });
}
