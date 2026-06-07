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
  notice:   { label: 'Notice',          points: 0, desc: '0 pts — Informational only' },
  warning:  { label: 'Warning',         points: 0, desc: '0 pts — Warning only' },
  removal:  { label: 'Removal Notice',  points: 0, desc: '0 pts — Must remove item or face escalation' },
  minor:    { label: 'Minor',           points: 1, desc: '1 pt' },
  major:    { label: 'Major',           points: 2, desc: '2 pts' },
  severe:   { label: 'Severe',          points: 3, desc: '3 pts' },
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
      const descEl = document.getElementById('description');
      if (!found || found.code === '14T-900') {
        // "Other" — clear description, let user type freely
        penalDesc.style.display = 'none';
        if (descEl) {
          descEl.value = '';
          descEl.dataset.autofilled = '0';
          descEl.placeholder = 'Describe what they did wrong...';
          descEl.focus();
        }
      } else {
        penalDesc.textContent = found.desc;
        penalDesc.style.display = 'block';
        // Auto-fill description if empty or was previously auto-filled
        if (descEl && (!descEl.value || descEl.dataset.autofilled === '1')) {
          descEl.value = found.desc;
          descEl.dataset.autofilled = '1';
        }
        // Auto-set removal type for removal codes
        if (found.category === 'removal' && violationSelect) {
          violationSelect.value = 'removal';
          violationSelect.dispatchEvent(new Event('change'));
        }
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

  // ── Location dropdown ────────────────────────────────────────────────────
  const locationPreset = document.getElementById('location_preset');
  const locationOtherWrap = document.getElementById('location-other-wrap');
  const locationInput = document.getElementById('location');
  if (locationPreset) {
    locationPreset.addEventListener('change', () => {
      if (locationPreset.value === '__other__') {
        locationOtherWrap.style.display = 'block';
        locationInput.required = true;
        locationInput.focus();
      } else {
        locationOtherWrap.style.display = 'none';
        locationInput.required = false;
        locationInput.value = '';
      }
    });
  }

  // ── Multi-photo ──────────────────────────────────────────────────────────
  const photoInput = document.getElementById('photo');
  const primaryPreview = document.getElementById('primary-photo-preview');
  const extraPhotosContainer = document.getElementById('extra-photos');
  const addPhotoBtn = document.getElementById('add-photo-btn');
  const extraPhotoFiles = [];

  // Primary photo preview
  if (photoInput && primaryPreview) {
    photoInput.addEventListener('change', () => {
      const file = photoInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          primaryPreview.innerHTML = `
            <img src="${e.target.result}" style="width:100%;max-height:200px;object-fit:cover;border:1px solid var(--border);margin-top:8px;">
            <div style="font-size:12px;color:var(--success);margin-top:4px;">✓ ${file.name}</div>`;
        };
        reader.readAsDataURL(file);
      } else {
        primaryPreview.innerHTML = '';
      }
    });
  }

  if (addPhotoBtn) {
    addPhotoBtn.addEventListener('click', () => {
      const idx = extraPhotoFiles.length;
      extraPhotoFiles.push(null);

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'margin-top:10px;';

      // Row: label + remove button
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;';

      const labelEl = document.createElement('label');
      labelEl.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:0;';
      labelEl.textContent = `Photo ${idx + 2}`;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '✕ Remove';
      removeBtn.style.cssText = 'background:none;border:none;color:var(--accent);font-size:12px;cursor:pointer;padding:0;font-family:inherit;';
      removeBtn.addEventListener('click', () => {
        extraPhotoFiles[idx] = null;
        wrapper.remove();
      });

      row.appendChild(labelEl);
      row.appendChild(removeBtn);

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.style.cssText = 'width:100%;margin-bottom:4px;';

      const imgEl = document.createElement('img');
      imgEl.style.cssText = 'display:none;width:100%;max-height:160px;object-fit:cover;border:1px solid var(--border);margin-top:4px;';

      const statusEl = document.createElement('div');
      statusEl.style.cssText = 'font-size:12px;color:var(--muted);';

      input.addEventListener('change', () => {
        const file = input.files[0];
        if (file) {
          extraPhotoFiles[idx] = file;
          statusEl.style.color = 'var(--success)';
          statusEl.textContent = `✓ ${file.name}`;
          const reader = new FileReader();
          reader.onload = e => { imgEl.src = e.target.result; imgEl.style.display = 'block'; };
          reader.readAsDataURL(file);
        }
      });

      wrapper.appendChild(row);
      wrapper.appendChild(input);
      wrapper.appendChild(statusEl);
      wrapper.appendChild(imgEl);
      extraPhotosContainer.appendChild(wrapper);
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
      const locationVal = (locationPreset && locationPreset.value && locationPreset.value !== '__other__')
        ? locationPreset.value
        : (locationInput ? locationInput.value.trim() : '');
      if (!locationVal) { showMsg(msgEl, 'Location is required.', 'error'); submitBtn.disabled = false; submitBtn.textContent = 'Issue Ticket'; return; }

      const photoBase64 = await compressImage(primaryPhoto);

      // Compress extra photos — filter out nulls (slots where user never picked a file)
      const extraBase64s = [];
      for (const f of extraPhotoFiles.filter(Boolean)) {
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
        location: locationVal,
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
let _allTickets = [];
const _filters = { sort: 'newest', person: '', severity: '', status: '' };

function getTicketStatus(t) {
  const needsResponse = t.appeal_flagged && !t.appeal_response && !t.appeal_declined && t.status !== 'resolved';
  const hasReply = t.appeal_flagged && t.appeal_response && !t.appeal_response_locked && t.status !== 'resolved';
  if (t.status === 'resolved') return { label: 'RESOLVED', cls: 'resolved', key: 'resolved' };
  if (t.appeal_declined) return { label: 'DECLINED', cls: 'severe', key: 'declined' };
  if (t.status === 'locked') return { label: 'LOCKED', cls: 'locked', key: 'locked' };
  if (needsResponse) return { label: 'APPEAL', cls: 'flagged', key: 'appeal' };
  if (hasReply) return { label: 'REPLY', cls: 'flagged', key: 'reply' };
  return { label: 'OPEN', cls: 'open', key: 'open' };
}

function renderTicketRow(t) {
  const displayName = t.is_unknown
    ? (t.claimed_name ? `${t.claimed_name} <em style="color:var(--muted);font-size:11px">(claimed)</em>` : '<em style="color:var(--muted)">Unknown</em>')
    : t.person_name;
  const status = getTicketStatus(t);
  const vtInfo = VIOLATION_TYPES[t.violation_type];
  const vtLabel = vtInfo?.label || t.violation_type;
  const dateStr = new Date(t.created_at).toLocaleDateString();
  const viewAsBtn = `<a href="ticket.html?id=${t.id}&bypass=1" target="_blank" style="font-size:11px;color:var(--blue);text-decoration:underline;display:block;margin-top:4px;">View as Recipient</a>`;
  const actionBtn = t.status === 'resolved'
    ? '—'
    : t.appeal_flagged
      ? `<button style="padding:4px 12px;font-size:12px;background:var(--blue)" onclick="openAppealModal('${t.id}')">View Appeal</button>`
      : `<button class="success" style="padding:4px 10px;font-size:12px" onclick="showResolveModal('${t.id}', 'resolve')">Resolve</button>`;
  return `<tr>
    <td><a href="ticket.html?id=${t.id}&bypass=1" style="font-size:12px">${t.id}</a><br><span style="font-size:11px;color:var(--muted)">${dateStr}</span></td>
    <td>${displayName}</td>
    <td><span class="badge ${t.violation_type}">${vtLabel}</span></td>
    <td>${t.points} pt${t.points !== 1 ? 's' : ''}</td>
    <td><span class="badge ${status.cls}">${status.label}</span></td>
    <td style="font-size:12px;color:var(--muted)">${t.penal_code || '—'}</td>
    <td style="white-space:nowrap;">${actionBtn}${t.status !== 'resolved' ? viewAsBtn : ''}</td>
  </tr>`;
}

function setFilter(key, value) {
  _filters[key] = value;
  syncFilterUI();
  applyFilters();
}

function setSortFilter(value) {
  _filters.sort = value;
  syncFilterUI();
  applyFilters();
}

function clearFilters() {
  _filters.sort = 'newest';
  _filters.person = '';
  _filters.severity = '';
  _filters.status = '';
  syncFilterUI();
  applyFilters();
}

function syncFilterUI() {
  const anyActive = _filters.sort !== 'newest' || _filters.person || _filters.severity || _filters.status;
  const clearBtn = document.getElementById('filter-clear-btn');
  if (clearBtn) {
    clearBtn.disabled = !anyActive;
    clearBtn.style.opacity = anyActive ? '1' : '0.4';
    clearBtn.style.cursor = anyActive ? 'pointer' : 'default';
  }
  // Sync selects
  const map = { 'f-sort': _filters.sort, 'f-person': _filters.person, 'f-severity': _filters.severity, 'f-status': _filters.status };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
}

function renderFilterBar() {
  const bar = document.getElementById('filter-bar');
  if (!bar) return;

  const names = [...new Set(_allTickets.map(t => t.claimed_name || t.person_name).filter(n => n && n !== 'Unknown'))].sort();

  bar.innerHTML = `
    <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
      <div style="display:flex;gap:10px;align-items:flex-end;min-width:max-content;padding-bottom:4px;">

        <div style="display:flex;flex-direction:column;gap:4px;">
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--muted);">Sort</label>
          <select id="f-sort" onchange="setSortFilter(this.value)" style="font-size:13px;padding:7px 28px 7px 10px;border:1.5px solid var(--border);background:var(--white);min-width:140px;appearance:auto;">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="person">Person A–Z</option>
            <option value="points-high">Most Points</option>
            <option value="points-low">Fewest Points</option>
          </select>
        </div>

        <div style="display:flex;flex-direction:column;gap:4px;">
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--muted);">Status</label>
          <select id="f-status" onchange="setFilter('status',this.value)" style="font-size:13px;padding:7px 28px 7px 10px;border:1.5px solid var(--border);background:var(--white);min-width:170px;appearance:auto;">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="appeal">Needs Response</option>
            <option value="reply">Follow-up Reply</option>
            <option value="locked">Locked</option>
            <option value="declined">Declined</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div style="display:flex;flex-direction:column;gap:4px;">
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--muted);">Severity</label>
          <select id="f-severity" onchange="setFilter('severity',this.value)" style="font-size:13px;padding:7px 28px 7px 10px;border:1.5px solid var(--border);background:var(--white);min-width:145px;appearance:auto;">
            <option value="">All Types</option>
            <option value="notice">Notice</option>
            <option value="warning">Warning</option>
            <option value="removal">Removal Notice</option>
            <option value="minor">Minor</option>
            <option value="major">Major</option>
            <option value="severe">Severe</option>
          </select>
        </div>

        ${names.length > 1 ? `
        <div style="display:flex;flex-direction:column;gap:4px;">
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--muted);">Person</label>
          <select id="f-person" onchange="setFilter('person',this.value)" style="font-size:13px;padding:7px 28px 7px 10px;border:1.5px solid var(--border);background:var(--white);min-width:140px;appearance:auto;">
            <option value="">All People</option>
            ${names.map(n => `<option value="${n}">${n}</option>`).join('')}
          </select>
        </div>` : ''}

        <div style="display:flex;flex-direction:column;gap:4px;justify-content:flex-end;">
          <button id="filter-clear-btn" onclick="clearFilters()" disabled style="
            padding:7px 14px;font-size:12px;font-weight:600;
            background:var(--white);color:var(--accent);
            border:1.5px solid var(--accent);cursor:default;
            opacity:0.4;white-space:nowrap;font-family:inherit;
          ">✕ Clear Filters</button>
        </div>

      </div>
    </div>
  `;

  syncFilterUI();
}

function applyFilters() {
  let tickets = [..._allTickets];

  if (_filters.person) {
    tickets = tickets.filter(t => (t.claimed_name || t.person_name || '') === _filters.person);
  }
  if (_filters.severity) {
    tickets = tickets.filter(t => t.violation_type === _filters.severity);
  }
  if (_filters.status) {
    tickets = tickets.filter(t => getTicketStatus(t).key === _filters.status);
  }

  tickets.sort((a, b) => {
    if (_filters.sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (_filters.sort === 'person') return (a.person_name || '').localeCompare(b.person_name || '');
    if (_filters.sort === 'points-high') return b.points - a.points;
    if (_filters.sort === 'points-low') return a.points - b.points;
    return new Date(b.created_at) - new Date(a.created_at); // newest default
  });

  // Always float urgent items to top unless sorting explicitly by something else
  if (_filters.sort === 'newest' || _filters.sort === 'oldest') {
    const urgent = tickets.filter(t => ['appeal','reply'].includes(getTicketStatus(t).key));
    const rest = tickets.filter(t => !['appeal','reply'].includes(getTicketStatus(t).key));
    tickets = [...urgent, ...rest];
  }

  const ticketsEl = document.getElementById('tickets-table');
  const countEl = document.getElementById('tickets-count');
  if (countEl) countEl.textContent = `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}`;

  ticketsEl.innerHTML = tickets.length === 0
    ? '<tr><td colspan="7" style="color:var(--muted);padding:16px;">No tickets match your filters.</td></tr>'
    : tickets.map(renderTicketRow).join('');
}

if (document.getElementById('dashboard')) {
  API.getAllTickets().then(data => {
    if (!data || data.error) return;
    _allTickets = data.tickets || [];
    const people = data.people || [];
    _allTickets.forEach(t => { _ticketCache[t.id] = t; });

    const leaderboardEl = document.getElementById('leaderboard');
    leaderboardEl.innerHTML = people.length === 0
      ? '<tr><td colspan="2" style="color:var(--muted)">No records yet.</td></tr>'
      : people.sort((a, b) => b.total_points - a.total_points)
          .map((p, i) => `<tr><td><span class="leaderboard-rank">#${i + 1}</span> ${p.name}</td><td><strong style="color:var(--accent)">${p.total_points}</strong> pts</td></tr>`)
          .join('');

    renderFilterBar();
    applyFilters();
  });
}

async function resolveTicket(id, dismiss) {
  // Called directly (non-appeal) or from appeal modal — show confirm modal
  showResolveModal(id, dismiss ? 'dismiss' : 'resolve');
}

function showResolveModal(id, defaultAction) {
  const existing = document.getElementById('resolve-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'resolve-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = `
    <div style="background:var(--white);max-width:480px;width:100%;border-top:4px solid var(--blue);">
      <div style="background:var(--blue);color:var(--white);padding:14px 18px;">
        <div style="font-size:16px;font-weight:700;">Close Ticket</div>
        <div style="font-size:12px;opacity:0.75;margin-top:2px;">Choose how to close this ticket</div>
      </div>
      <div style="padding:18px;display:flex;flex-direction:column;gap:12px;">

        <div id="rm-resolve" onclick="selectResolveAction('resolve')" style="border:2px solid var(--border);padding:14px;cursor:pointer;transition:border-color 0.1s;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:16px;height:16px;border-radius:50%;border:2px solid var(--success);flex-shrink:0;display:flex;align-items:center;justify-content:center;" id="rm-dot-resolve"></div>
            <div>
              <div style="font-weight:700;color:var(--success);font-size:14px;">Resolve</div>
              <div style="font-size:13px;color:var(--muted);margin-top:2px;">Ticket is closed. Points stay on record. Use when the violation stands and is now handled.</div>
            </div>
          </div>
        </div>

        <div id="rm-dismiss" onclick="selectResolveAction('dismiss')" style="border:2px solid var(--border);padding:14px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:16px;height:16px;border-radius:50%;border:2px solid var(--blue);flex-shrink:0;display:flex;align-items:center;justify-content:center;" id="rm-dot-dismiss"></div>
            <div>
              <div style="font-weight:700;color:var(--blue);font-size:14px;">Dismiss</div>
              <div style="font-size:13px;color:var(--muted);margin-top:2px;">Ticket is closed and points are removed. Use when the citation was a mistake or the appeal was valid.</div>
            </div>
          </div>
        </div>

        <div id="rm-decline" onclick="selectResolveAction('decline')" style="border:2px solid var(--border);padding:14px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:16px;height:16px;border-radius:50%;border:2px solid var(--accent);flex-shrink:0;display:flex;align-items:center;justify-content:center;" id="rm-dot-decline"></div>
            <div>
              <div style="font-weight:700;color:var(--accent);font-size:14px;">Decline Appeal</div>
              <div style="font-size:13px;color:var(--muted);margin-top:2px;">Appeal is rejected. Points stay, ticket remains active. Use when the appeal was invalid or insufficient.</div>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:10px;margin-top:4px;">
          <button id="rm-confirm-btn" onclick="confirmResolveAction('${id}')" style="padding:10px 20px;font-size:14px;">Confirm</button>
          <button class="secondary" onclick="document.getElementById('resolve-modal').remove()" style="padding:10px 20px;font-size:14px;">Cancel</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  selectResolveAction(defaultAction || 'resolve');
}

let _selectedResolveAction = 'resolve';
function selectResolveAction(action) {
  _selectedResolveAction = action;
  const colors = { resolve: 'var(--success)', dismiss: 'var(--blue)', decline: 'var(--accent)' };
  ['resolve','dismiss','decline'].forEach(a => {
    const row = document.getElementById(`rm-${a}`);
    const dot = document.getElementById(`rm-dot-${a}`);
    if (!row) return;
    if (a === action) {
      row.style.borderColor = colors[a];
      row.style.background = 'var(--blue-light)';
      dot.style.background = colors[a];
    } else {
      row.style.borderColor = 'var(--border)';
      row.style.background = 'transparent';
      dot.style.background = 'transparent';
    }
  });
}

async function confirmResolveAction(id) {
  const btn = document.getElementById('rm-confirm-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Working...'; }
  let result;
  if (_selectedResolveAction === 'resolve') result = await API.resolve(id, false);
  else if (_selectedResolveAction === 'dismiss') result = await API.resolve(id, true);
  else if (_selectedResolveAction === 'decline') result = await API.declineAppeal(id);
  if (result?.success) { document.getElementById('resolve-modal')?.remove(); location.reload(); }
  else { if (btn) { btn.disabled = false; btn.textContent = 'Confirm'; } alert(result?.error || 'Something went wrong.'); }
}

async function declineAppeal(id) {
  showResolveModal(id, 'decline');
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
