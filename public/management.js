// public/management.js
// 14-T Ticket Management

let _allTickets = [];
let _editingId = null;
let _deletedExtraIndexes = new Set();

// ── AGE HELPERS ──────────────────────────────────────────────────────────────
function ageDays(createdAt) {
  return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
}

function ageBucket(days) {
  if (days < 1)  return { cls: 'age-green',   label: 'Fresh' };
  if (days < 10) return { cls: 'age-orange',  label: `${Math.floor(days)}d` };
  if (days < 30) return { cls: 'age-red',     label: `${Math.floor(days)}d` };
  return                 { cls: 'age-darkred', label: `${Math.floor(days)}d` };
}

function ageFilterMatch(t, filter) {
  const d = ageDays(t.created_at);
  if (!filter) return true;
  if (filter === 'fresh')  return d < 1;
  if (filter === 'recent') return d >= 1 && d < 10;
  if (filter === 'aging')  return d >= 10 && d < 30;
  if (filter === 'old')    return d >= 30;
  return true;
}

// ── LOAD & RENDER ─────────────────────────────────────────────────────────────
async function loadTickets() {
  const res = await fetch('/api/tickets');
  const data = await res.json();
  _allTickets = data.tickets || [];
  renderTable();
}

function renderTable() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const statusF = document.getElementById('filter-status').value;
  const ageF = document.getElementById('filter-age').value;

  let tickets = _allTickets.filter(t => {
    if (statusF && t.status !== statusF) return false;
    if (!ageFilterMatch(t, ageF)) return false;
    if (search) {
      const haystack = [t.id, t.person_name, t.location, t.item_name, t.penal_code, t.description].join(' ').toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const tbody = document.getElementById('mgmt-tbody');
  if (!tickets.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="color:var(--muted);padding:16px;">No tickets match.</td></tr>';
    return;
  }

  tbody.innerHTML = tickets.map(t => {
    const days = ageDays(t.created_at);
    const age = ageBucket(days);
    const dateStr = new Date(t.created_at).toLocaleDateString();
    const name = t.is_unknown ? (t.person_name || 'Unknown') : t.person_name;
    const statusBadge = {
      open: 'background:#ddd;color:#333',
      resolved: 'background:#2a7a2a;color:#fff',
      locked: 'background:#555;color:#fff'
    }[t.status] || 'background:#ddd;color:#333';

    return `<tr>
      <td><span class="age-dot ${age.cls}" title="${age.label}"></span></td>
      <td style="font-family:monospace;font-size:11px;white-space:nowrap;">
        <a href="ticket.html?id=${t.id}&bypass=1" target="_blank" style="color:var(--blue);">${t.id}</a>
      </td>
      <td>${name}</td>
      <td><span style="font-size:11px;font-weight:600;text-transform:uppercase;">${t.violation_type}</span></td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${t.location||''}">${t.location||'—'}</td>
      <td><span style="padding:2px 8px;font-size:11px;font-weight:700;${statusBadge}">${t.status.toUpperCase()}</span></td>
      <td style="white-space:nowrap;font-size:12px;color:var(--muted);">
        <span class="age-dot ${age.cls}"></span>${dateStr}
      </td>
      <td style="white-space:nowrap;">
        <button onclick="openEdit('${t.id}')" style="padding:4px 10px;font-size:12px;background:var(--blue);color:#fff;border:none;cursor:pointer;font-family:inherit;margin-right:4px;">Edit</button>
        <button onclick="quickDelete('${t.id}')" style="padding:4px 10px;font-size:12px;background:var(--accent);color:#fff;border:none;cursor:pointer;font-family:inherit;">Delete</button>
      </td>
    </tr>`;
  }).join('');
}

// ── EDIT MODAL ────────────────────────────────────────────────────────────────
function openEdit(id) {
  const t = _allTickets.find(x => x.id === id);
  if (!t) return;
  _editingId = id;
  _deletedExtraIndexes = new Set();

  document.getElementById('modal-ticket-id').textContent = t.id;
  document.getElementById('edit-msg').textContent = '';
  document.getElementById('edit-msg').style.display = 'none';

  // Fill all fields
  const set = (fieldId, val) => {
    const el = document.getElementById(fieldId);
    if (el) el.value = val ?? '';
  };

  set('e-person_first', t.person_first);
  set('e-person_last_initial', t.person_last_initial);
  set('e-person_name', t.person_name);
  set('e-is_unknown', t.is_unknown ? '1' : '0');
  set('e-violation_type', t.violation_type);
  set('e-points', t.points);
  set('e-penal_code', t.penal_code);
  set('e-location', t.location);
  set('e-description', t.description);
  set('e-item_name', t.item_name);
  set('e-product_number', t.product_number);
  set('e-serial_number', t.serial_number);
  set('e-removal_notice', t.removal_notice ? '1' : '0');
  set('e-removal_deadline', t.removal_deadline);
  set('e-removal_note', t.removal_note);
  set('e-status', t.status);
  set('e-created_at', t.created_at);

  // Primary photo
  const photoPreview = document.getElementById('e-photo-preview');
  if (t.photo_base64) {
    photoPreview.src = t.photo_base64;
    photoPreview.style.display = 'block';
  } else {
    photoPreview.style.display = 'none';
  }
  document.getElementById('e-photo-file').value = '';

  // Extra photos
  const extraList = document.getElementById('e-extra-photos-list');
  let extras = [];
  if (t.extra_photos) { try { extras = JSON.parse(t.extra_photos); } catch {} }
  extraList.innerHTML = extras.length ? extras.map((src, i) => `
    <div id="extra-wrap-${i}" style="display:inline-block;margin:4px;position:relative;cursor:pointer;" onclick="toggleDeleteExtra(${i})">
      <img src="${src}" style="width:90px;height:70px;object-fit:cover;border:2px solid var(--border);" id="extra-img-${i}">
      <div id="extra-del-${i}" style="display:none;position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(217,79,0,0.7);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;">DELETE</div>
    </div>`).join('') : '<div style="font-size:12px;color:var(--muted);">No extra photos.</div>';

  document.getElementById('edit-modal').style.display = 'flex';
  document.getElementById('edit-modal').scrollTop = 0;
}

function toggleDeleteExtra(idx) {
  if (_deletedExtraIndexes.has(idx)) {
    _deletedExtraIndexes.delete(idx);
    document.getElementById(`extra-img-${idx}`).style.opacity = '1';
    document.getElementById(`extra-del-${idx}`).style.display = 'none';
  } else {
    _deletedExtraIndexes.add(idx);
    document.getElementById(`extra-img-${idx}`).style.opacity = '0.35';
    document.getElementById(`extra-del-${idx}`).style.display = 'flex';
  }
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
  _editingId = null;
}

async function saveTicket() {
  const id = _editingId;
  if (!id) return;
  const t = _allTickets.find(x => x.id === id);
  const msgEl = document.getElementById('edit-msg');
  msgEl.style.display = 'none';

  const get = fieldId => {
    const el = document.getElementById(fieldId);
    return el ? el.value.trim() || null : null;
  };

  // Handle primary photo replacement
  let photo_base64 = t.photo_base64;
  const photoFile = document.getElementById('e-photo-file').files[0];
  if (photoFile) {
    photo_base64 = await compressImageSimple(photoFile);
  }

  // Handle extra photos — remove deleted indexes
  let extras = [];
  if (t.extra_photos) { try { extras = JSON.parse(t.extra_photos); } catch {} }
  extras = extras.filter((_, i) => !_deletedExtraIndexes.has(i));

  const payload = {
    id,
    person_first:        get('e-person_first'),
    person_last_initial: get('e-person_last_initial'),
    person_name:         get('e-person_name') || 'Unknown',
    is_unknown:          document.getElementById('e-is_unknown').value === '1' ? 1 : 0,
    violation_type:      get('e-violation_type') || 'warning',
    points:              parseInt(document.getElementById('e-points').value) || 0,
    penal_code:          get('e-penal_code'),
    location:            get('e-location'),
    description:         get('e-description'),
    item_name:           get('e-item_name'),
    product_number:      get('e-product_number'),
    serial_number:       get('e-serial_number'),
    removal_notice:      document.getElementById('e-removal_notice').value === '1' ? 1 : 0,
    removal_deadline:    get('e-removal_deadline'),
    removal_note:        get('e-removal_note'),
    status:              get('e-status') || 'open',
    created_at:          get('e-created_at'),
    photo_base64,
    extra_photos:        extras.length ? JSON.stringify(extras) : null,
  };

  const res = await fetch('/api/manage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', ...payload })
  });
  const result = await res.json();

  if (result.success) {
    // Update local cache
    const idx = _allTickets.findIndex(x => x.id === id);
    if (idx >= 0) _allTickets[idx] = { ..._allTickets[idx], ...payload };
    msgEl.className = 'msg ok'; msgEl.textContent = 'Saved.'; msgEl.style.display = 'block';
    setTimeout(() => { msgEl.style.display = 'none'; }, 2000);
    _deletedExtraIndexes = new Set();
    renderTable();
  } else {
    msgEl.className = 'msg error'; msgEl.textContent = result.error || 'Failed to save.'; msgEl.style.display = 'block';
  }
}

async function reopenTicket() {
  const id = _editingId;
  if (!id) return;
  document.getElementById('e-status').value = 'open';
  await saveTicket();
}

async function deleteTicket() {
  const id = _editingId;
  if (!id) return;
  const res = await fetch('/api/manage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id })
  });
  const result = await res.json();
  if (result.success) {
    _allTickets = _allTickets.filter(x => x.id !== id);
    closeEditModal();
    renderTable();
  } else {
    alert(result.error || 'Failed to delete.');
  }
}

async function quickDelete(id) {
  const res = await fetch('/api/manage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id })
  });
  const result = await res.json();
  if (result.success) {
    _allTickets = _allTickets.filter(x => x.id !== id);
    renderTable();
  } else {
    alert(result.error || 'Failed to delete.');
  }
}

// Simple image compress without watermark for management edits
function compressImageSimple(file, maxWidth = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
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

// ── WIRE UP FILTERS ───────────────────────────────────────────────────────────
document.getElementById('search-input').addEventListener('input', renderTable);
document.getElementById('filter-status').addEventListener('change', renderTable);
document.getElementById('filter-age').addEventListener('change', renderTable);

// Close modal on backdrop click
document.getElementById('edit-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('edit-modal')) closeEditModal();
});

// ── INIT ──────────────────────────────────────────────────────────────────────
loadTickets();
