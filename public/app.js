// public/app.js
// 14-T Client Application

// ── PENAL CODES ──────────────────────────────────────────────────────────────
const PENAL_CODES = [
  // § 100 — Abandonment & Unauthorized Occupation
  { code: '14T-100', label: 'Unauthorized Occupation of Common Area', desc: 'Item occupying shared space without authorization or prior arrangement.', category: 'abandonment' },
  { code: '14T-101', label: 'Abandoned Item — Extended Period', desc: 'Item left unattended in a shared or common area for an unreasonable length of time.', category: 'abandonment' },
  { code: '14T-102', label: 'Overnight Abandonment', desc: 'Item left out or unattended overnight without prior arrangement or justification.', category: 'abandonment' },
  { code: '14T-103', label: 'Multi-Day Abandonment', desc: 'Item left unattended for more than 24 hours in a non-designated area.', category: 'abandonment' },
  { code: '14T-104', label: 'Extended Abandonment (72+ hrs)', desc: 'Item has remained unattended and unaddressed for 72 hours or more.', category: 'abandonment' },
  { code: '14T-105', label: 'Obstruction of Common Area', desc: 'Item placed in a manner that blocks, restricts, or impedes access to a shared space or walkway.', category: 'abandonment' },
  { code: '14T-106', label: 'Counter / Surface Occupation', desc: 'Item left on a shared counter, table, or surface for an unreasonable period after use.', category: 'abandonment' },
  { code: '14T-107', label: 'Floor Abandonment', desc: 'Item left on the floor of a shared space, posing a hazard or obstruction.', category: 'abandonment' },
  { code: '14T-108', label: 'Entryway / Hallway Obstruction', desc: 'Item left in an entryway, hallway, or corridor blocking passage.', category: 'abandonment' },
  { code: '14T-109', label: 'Returned to Wrong Location', desc: 'Item placed in an incorrect or non-designated storage area after use.', category: 'abandonment' },
  { code: '14T-110', label: 'Furniture Misplacement', desc: 'Furniture or large item moved and not returned to its designated location.', category: 'abandonment' },
  { code: '14T-111', label: 'Vehicle — Unauthorized Parking', desc: 'Bicycle, scooter, or vehicle left in an unauthorized or obstructive location.', category: 'abandonment' },
  { code: '14T-112', label: 'Repeat Abandonment Offense', desc: 'Second or subsequent abandonment violation by the same party within a 30-day period.', category: 'abandonment' },

  // § 200 — Cleanliness & Sanitation
  { code: '14T-200', label: 'Dish / Utensil Left Out', desc: 'Dirty dish, cup, or utensil left outside the kitchen or sink area.', category: 'cleanliness' },
  { code: '14T-201', label: 'Food or Waste Left Out', desc: 'Food, food packaging, or organic waste left in an improper area.', category: 'cleanliness' },
  { code: '14T-202', label: 'Spill — Not Cleaned', desc: 'Liquid or food spill left unaddressed by the responsible party.', category: 'cleanliness' },
  { code: '14T-203', label: 'Refuse Not Properly Disposed', desc: 'Trash, recyclables, or waste not placed in the appropriate receptacle.', category: 'cleanliness' },
  { code: '14T-204', label: 'Sanitation Violation', desc: 'Area left in an unsanitary condition attributable to a specific party.', category: 'cleanliness' },

  // § 300 — Noise & Disturbance
  { code: '14T-300', label: 'Noise Disturbance', desc: 'Unreasonable noise during designated quiet hours or shared spaces.', category: 'noise' },
  { code: '14T-301', label: 'Repeat Noise Offense', desc: 'Second or subsequent noise/disturbance violation.', category: 'noise' },

  // § 400 — Property
  { code: '14T-400', label: 'Unauthorized Use of Property', desc: "Using another person's belongings without permission.", category: 'property' },
  { code: '14T-401', label: 'Property Damage', desc: 'Damage caused to shared or personal property through negligence or misuse.', category: 'property' },
  { code: '14T-402', label: 'Borrowed Item — Not Returned', desc: 'Item borrowed and not returned within the agreed or reasonable timeframe.', category: 'property' },

  // § 900 — Other
  { code: '14T-900', label: 'Other / Custom', desc: '', category: 'other' }
];

const CATEGORY_LABELS = {
  abandonment: '§ 100 — Abandonment & Unauthorized Occupation',
  cleanliness: '§ 200 — Cleanliness & Sanitation',
  noise:       '§ 300 — Noise & Disturbance',
  property:    '§ 400 — Property',
  other:       '§ 900 — Other'
};

// ── QUICK-ISSUE PRESETS ───────────────────────────────────────────────────────
const QUICK_PRESETS = [
  {
    label: 'Box / Package Left on Counter',
    icon: '📦',
    violation_type: 'warning',
    penal_code: '14T-106',
    description: 'A box or package has been left on the counter for an unreasonable period and is occupying shared surface space.',
    removal_notice: true,
    removal_deadline: '24hr',
  },
  {
    label: 'Item Left on Floor',
    icon: '👟',
    violation_type: 'warning',
    penal_code: '14T-107',
    description: 'An item has been left on the floor of a shared space, creating an obstruction or hazard.',
    removal_notice: true,
    removal_deadline: '24hr',
  },
  {
    label: 'Hallway / Entryway Blocked',
    icon: '🚧',
    violation_type: 'minor',
    penal_code: '14T-108',
    description: 'An item is blocking the hallway or entryway, restricting safe passage through the area.',
    removal_notice: true,
    removal_deadline: 'immediately',
  },
  {
    label: 'Item Left Out Overnight',
    icon: '🌙',
    violation_type: 'minor',
    penal_code: '14T-102',
    description: 'Item was left out in a shared or common area overnight without prior arrangement.',
    removal_notice: true,
    removal_deadline: '24hr',
  },
  {
    label: 'Multi-Day Abandonment',
    icon: '📅',
    violation_type: 'major',
    penal_code: '14T-103',
    description: 'Item has been left unattended in a non-designated area for more than 24 hours with no indication of when it will be addressed.',
    removal_notice: true,
    removal_deadline: '24hr',
  },
  {
    label: 'Extended Abandonment (72+ hrs)',
    icon: '⏰',
    violation_type: 'severe',
    penal_code: '14T-104',
    description: 'Item has remained unattended and unaddressed in a shared space for 72 hours or more. This constitutes an extended abandonment.',
    removal_notice: true,
    removal_deadline: 'immediately',
  },
  {
    label: 'Dishes Left Out',
    icon: '🍽️',
    violation_type: 'warning',
    penal_code: '14T-200',
    description: 'Dirty dish, cup, or utensil has been left outside the kitchen or sink area.',
    removal_notice: false,
    removal_deadline: null,
  },
  {
    label: 'Bicycle / Vehicle Parked Wrong',
    icon: '🚲',
    violation_type: 'minor',
    penal_code: '14T-111',
    description: 'Bicycle, scooter, or vehicle left in an unauthorized or obstructive location.',
    removal_notice: true,
    removal_deadline: '24hr',
  },
];


// ── VIOLATION TYPES ──────────────────────────────────────────────────────────
const VIOLATION_TYPES = {
  notice:  { label: 'Notice',  points: 0, desc: '0 pts — Informational only' },
  warning: { label: 'Warning', points: 0, desc: '0 pts — Warning only' },
  minor:   { label: 'Minor',   points: 1, desc: '1 pt' },
  major:   { label: 'Major',   points: 2, desc: '2 pts' },
  severe:  { label: 'Severe',  points: 3, desc: '3 pts' },
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
  },
  async itemRemoved(id) {
    const res = await fetch('/api/item-removed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
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
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        // Timestamp watermark
        const now = new Date();
        const stamp = now.toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        const fontSize = Math.max(12, Math.round(w * 0.025));
        ctx.font = `bold ${fontSize}px monospace`;
        const padding = 8;
        const textW = ctx.measureText(stamp).width;
        // Background bar
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, textW + padding * 2, fontSize + padding * 2);
        // Text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(stamp, padding, fontSize + padding - 2);

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

  // ── Quick presets ─────────────────────────────────────────────────────────
  const presetChips = document.getElementById('preset-chips');
  if (presetChips) {
    QUICK_PRESETS.forEach((preset, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = 'padding:7px 14px;font-size:12px;font-weight:600;border:1.5px solid var(--border);background:var(--white);cursor:pointer;font-family:inherit;white-space:nowrap;display:flex;align-items:center;gap:6px;';
      btn.innerHTML = `<span>${preset.icon}</span><span>${preset.label}</span>`;
      btn.addEventListener('click', () => {
        // Highlight selected
        presetChips.querySelectorAll('button').forEach(b => {
          b.style.borderColor = 'var(--border)';
          b.style.background = 'var(--white)';
          b.style.color = 'var(--text)';
        });
        btn.style.borderColor = 'var(--blue)';
        btn.style.background = 'var(--blue)';
        btn.style.color = '#fff';

        // Fill violation type
        const vSel = document.getElementById('violation_type');
        if (vSel) { vSel.value = preset.violation_type; vSel.dispatchEvent(new Event('change')); }

        // Fill penal code
        const pSel = document.getElementById('penal_code');
        if (pSel) { pSel.value = preset.penal_code; pSel.dispatchEvent(new Event('change')); }

        // Fill description
        const descEl = document.getElementById('description');
        if (descEl) { descEl.value = preset.description; descEl.dataset.autofilled = '0'; }

        // Set removal notice
        const rCheck = document.getElementById('removal_notice');
        const rFields = document.getElementById('removal-fields');
        const rDeadline = document.getElementById('removal_deadline');
        if (rCheck) {
          rCheck.checked = !!preset.removal_notice;
          if (rFields) rFields.style.display = rCheck.checked ? 'block' : 'none';
          if (preset.removal_notice && preset.removal_deadline && rDeadline) {
            rDeadline.value = preset.removal_deadline;
            rDeadline.dispatchEvent(new Event('change'));
          }
        }

        // Scroll to location
        document.getElementById('location_preset')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      presetChips.appendChild(btn);
    });
  }

  // ── Removal notice toggle ─────────────────────────────────────────────────
  const removalCheck = document.getElementById('removal_notice');
  const removalFields = document.getElementById('removal-fields');
  const removalDeadlineSelect = document.getElementById('removal_deadline');
  const removalCustomWrap = document.getElementById('removal-custom-wrap');
  if (removalCheck) {
    removalCheck.addEventListener('change', () => {
      removalFields.style.display = removalCheck.checked ? 'block' : 'none';
    });
  }
  if (removalDeadlineSelect) {
    removalDeadlineSelect.addEventListener('change', () => {
      removalCustomWrap.style.display = removalDeadlineSelect.value === 'custom' ? 'block' : 'none';
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

      // Removal notice
      const hasRemoval = removalCheck && removalCheck.checked;
      let removalDeadline = null;
      if (hasRemoval) {
        const dlVal = removalDeadlineSelect?.value;
        if (dlVal === 'custom') {
          removalDeadline = document.getElementById('removal_custom_date')?.value || null;
        } else {
          removalDeadline = dlVal || '24hr';
        }
      }
      const removalNote = hasRemoval ? (document.getElementById('removal_note')?.value.trim() || null) : null;

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
        removal_notice: hasRemoval ? 1 : 0,
        removal_deadline: removalDeadline,
        removal_note: removalNote,
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

function formatDeadline(deadline, issuedAt) {
  if (!deadline) return '';
  const issued = new Date(issuedAt);
  const deadlineMap = {
    'immediately': 'immediately',
    '24hr': 'within 24 hours',
    '48hr': 'within 48 hours',
    '72hr': 'within 72 hours',
    '1week': 'within 1 week',
  };
  if (deadlineMap[deadline]) return deadlineMap[deadline];
  // Custom datetime string
  try {
    return `by ${new Date(deadline).toLocaleString()}`;
  } catch { return deadline; }
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
    if (t.issuer_removed_at) {
      statusMsg = '<div class="msg error" style="display:block;margin-top:16px;background:#fde8e8;border-left:4px solid var(--accent);">This item has been impounded.</div>';
    } else if (t.item_removed_at) {
      statusMsg = '<div class="msg ok" style="display:block;margin-top:16px;">Item removal has been verified. This ticket is closed.</div>';
    } else {
      statusMsg = '<div class="msg ok" style="display:block;margin-top:16px;">This ticket has been resolved.</div>';
    }
  } else if (t.appeal_declined) {
    statusMsg = '<div class="msg error" style="display:block;margin-top:16px;">Appeal declined — points remain.</div>';
  } else if (t.appeal_response_locked || t.status === 'locked') {
    statusMsg = '<div class="msg" style="display:block;margin-top:16px;background:var(--blue-light);color:var(--blue-dark);padding:14px;">This appeal thread has been closed.</div>';
  }

  // Appeal action section (recipient only)
  // Allow appeal even on resolved tickets that have a removal notice — they can contest the impound
  const canAppeal = !isIssuerView
    && !t.appeal_declined
    && !t.appeal_response_locked
    && t.status !== 'locked'
    && !(t.status === 'resolved' && !t.removal_notice)
    // If they self-reported removal, they can't also file an appeal unless they already had one in progress
    && !(t.item_removed_at && !t.appeal_flagged);

  let appealSection = '';
  if (canAppeal) {
    if (!t.appeal_flagged) {
      const isImpound = t.issuer_removed_at && t.status === 'resolved';
      appealSection = `
        <hr class="divider">
        <h2>${isImpound ? 'Contest Impound' : 'File an Appeal'}</h2>
        ${isImpound ? `<div style="font-size:13px;color:var(--muted);margin-bottom:12px;">If you believe this item was wrongly impounded, you can contest it below.</div>` : ''}
        <div id="appeal-msg"></div>
        <div class="field-group">
          <label for="appeal-note">Explanation <span class="req">*</span></label>
          <textarea id="appeal-note" placeholder="${isImpound ? 'Explain why this impound should be contested...' : 'Explain your situation...'}"></textarea>
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
        <button onclick="submitAppeal('${t.id}')">${isImpound ? 'Submit Contest' : 'Submit Appeal'}</button>`;
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

  // Parse issuer notes
  let issuerNotes = [];
  if (t.issuer_notes) { try { issuerNotes = JSON.parse(t.issuer_notes); } catch {} }

  // Issuer notes display (styled like removal notice block)
  const notesHtml = issuerNotes.length ? issuerNotes.map(n => `
    <div style="background:var(--blue-light);border-left:4px solid var(--blue);padding:12px 14px;margin-bottom:10px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--blue-dark);margin-bottom:4px;">
        Issuer Note${n.time ? ` — <span style="font-weight:400;color:var(--muted)">${new Date(n.time).toLocaleString()}</span>` : ''}
        ${n.type === 'points' ? `<span style="background:var(--accent);color:#fff;padding:1px 6px;font-size:10px;margin-left:6px;">POINTS</span>` : ''}
      </div>
      <div style="font-size:13px;">${n.text}</div>
    </div>`).join('') : '';

  // Add note / attach removal UI (issuer bypass only)
  const issuerActionsHtml = isIssuerView && t.status !== 'resolved' ? `
    <div style="margin-top:16px;border-top:1px solid var(--border);padding-top:14px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--muted);margin-bottom:10px;">Issuer Actions</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
        <button class="secondary" style="padding:6px 12px;font-size:12px;" onclick="openAddNoteModal('${t.id}')">Add Note / Comment</button>
        ${!t.removal_notice
          ? `<button class="secondary" style="padding:6px 12px;font-size:12px;" onclick="openAttachRemovalModal('${t.id}')">Attach Removal Notice</button>`
          : `<button class="secondary" style="padding:6px 12px;font-size:12px;border-color:var(--accent);color:var(--accent);" onclick="removeRemovalNotice('${t.id}')">Remove Removal Notice</button>`}
      </div>
    </div>` : '';

  // Activity log — vertical stacked, mobile friendly
  const log = [];
  log.push({ time: t.created_at, msg: 'Ticket issued', color: 'var(--blue)' });
  if (t.removal_notice) log.push({ time: null, msg: `Removal notice attached — ${formatDeadline(t.removal_deadline, t.created_at)}`, color: '#e6a000' });
  issuerNotes.forEach(n => log.push({ time: n.time, msg: n.text, color: n.type === 'points' ? 'var(--accent)' : 'var(--blue-dark)' }));
  if (t.item_removed_at) log.push({ time: t.item_removed_at, msg: 'Recipient reported item removed', color: 'var(--success)' });
  if (t.issuer_removed_at) log.push({ time: t.issuer_removed_at, msg: 'Item impounded', color: '#7b3f00' });
  if (t.appeal_flagged && t.appeal_note) log.push({ time: null, msg: 'Appeal filed by recipient', color: '#e6a000' });
  if (t.appeal_response) log.push({ time: null, msg: 'Response sent by issuer', color: 'var(--blue)' });
  if (t.appeal_declined) log.push({ time: null, msg: 'Appeal declined', color: 'var(--accent)' });
  if (t.appeal_response_locked) log.push({ time: null, msg: 'Appeal thread locked', color: 'var(--muted)' });
  if (t.status === 'resolved') log.push({ time: null, msg: 'Ticket resolved', color: 'var(--success)' });

  const logHtml = `
    <div style="margin-top:24px;border-top:1px solid var(--border);padding-top:14px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:10px;">Activity Log</div>
      ${log.map(entry => `
        <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--bg);">
          <div style="width:3px;min-width:3px;background:${entry.color};align-self:stretch;border-radius:2px;"></div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;">${entry.msg}</div>
            ${entry.time ? `<div style="font-size:11px;color:var(--muted);margin-top:2px;">${new Date(entry.time).toLocaleString()}</div>` : ''}
          </div>
        </div>`).join('')}
    </div>`;

  const vtInfo = VIOLATION_TYPES[t.violation_type];

  container.innerHTML = `
    <div class="ticket-header">
      <div class="ticket-id">${t.id}</div>
      <div class="ticket-name">${displayName}</div>
      <div style="margin-top:6px;">
        <span class="badge ${t.violation_type}">${(vtInfo?.label || t.violation_type).toUpperCase()}</span>
        ${t.removal_notice ? `&nbsp;<span class="badge removal">REMOVAL NOTICE</span>` : ''}
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

      ${t.removal_notice ? (() => {
        // Determine current state of the removal notice
        const impounded = !!t.issuer_removed_at;
        const selfReported = !!t.item_removed_at;
        const resolved = t.status === 'resolved';

        let removalContent = '';

        // Header
        removalContent += `
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#a07000;margin-bottom:6px;">Removal Notice</div>
          <div style="font-size:14px;font-weight:600;color:#333;">
            Must be removed${t.removal_deadline ? ` — <strong>${formatDeadline(t.removal_deadline, t.created_at)}</strong>` : ''}.
          </div>
          ${t.removal_note ? `<div style="font-size:13px;color:var(--muted);margin-top:4px;">${t.removal_note}</div>` : ''}`;

        // ── IMPOUNDED (issuer removed it) ──
        if (impounded) {
          removalContent += `
            <div style="margin-top:12px;border-top:1px solid #e6a000;padding-top:12px;">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--muted);margin-bottom:6px;">Impounded — ${new Date(t.issuer_removed_at).toLocaleString()}</div>
              ${t.issuer_removed_photo ? `<img src="${t.issuer_removed_photo}" style="width:100%;max-height:280px;object-fit:cover;border:1px solid var(--border);display:block;margin-bottom:8px;">` : ''}
              ${t.issuer_removed_note ? `<div style="font-size:13px;color:var(--text);">${t.issuer_removed_note}</div>` : ''}
            </div>`;

        // ── SELF-REPORTED: pending issuer verification ──
        } else if (selfReported && !resolved) {
          if (isIssuerView) {
            removalContent += `
              <div style="margin-top:12px;border-top:1px solid #e6a000;padding-top:12px;background:#e8f5e8;border:1px solid var(--success);padding:10px;margin-top:10px;">
                <div style="font-size:13px;font-weight:700;color:var(--success);margin-bottom:8px;">Recipient says item was removed — ${new Date(t.item_removed_at).toLocaleString()}</div>
                <div class="field-group">
                  <label for="ir-verify-note" style="font-size:12px;">Add a note <span style="font-weight:400;color:var(--muted)">(optional — e.g. "Left trash behind")</span></label>
                  <input type="text" id="ir-verify-note" placeholder="e.g. Area was left messy" style="margin-bottom:8px;">
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  <button onclick="verifyItemRemoved('${t.id}', true)" style="background:var(--success);color:#fff;padding:8px 14px;font-size:12px;border:none;cursor:pointer;font-family:inherit;font-weight:600;">Item is Gone</button>
                  <button onclick="verifyItemRemoved('${t.id}', false)" style="background:var(--accent);color:#fff;padding:8px 14px;font-size:12px;border:none;cursor:pointer;font-family:inherit;">Item Still There</button>
                </div>
              </div>`;
          } else {
            removalContent += `
              <div style="margin-top:10px;background:#e8f5e8;border:1px solid var(--success);padding:10px;font-size:13px;">
                <strong style="color:var(--success);">Removal Reported</strong> — ${new Date(t.item_removed_at).toLocaleString()}. Pending verification.
              </div>`;
          }

        // ── SELF-REPORTED: resolved after verification ──
        } else if (selfReported && resolved) {
          // Use item_removed_note as proxy for "they were told it was confirmed" — use points as signal
          const wasConfirmed = t.points === 0;
          removalContent += wasConfirmed
            ? `<div style="margin-top:10px;background:#e8f5e8;border:1px solid var(--success);padding:10px;font-size:13px;font-weight:600;color:var(--success);">Removal confirmed — ticket closed.</div>`
            : `<div style="margin-top:10px;background:#fde8e8;border:1px solid var(--accent);padding:10px;font-size:13px;font-weight:600;color:var(--accent);">Item was verified as still there. Points remain.</div>`;

        // ── OPEN: recipient can report removal ──
        } else if (!isIssuerView && !resolved) {
          removalContent += `
            <div style="font-size:12px;color:var(--accent);margin-top:8px;font-weight:600;">Failure to comply may result in the item being impounded.</div>
            <div style="margin-top:12px;border-top:1px solid #e6a000;padding-top:12px;">
              <button onclick="submitItemRemoved('${t.id}')" style="background:#2a7a2a;color:#fff;padding:10px 18px;font-size:13px;font-weight:700;border:none;cursor:pointer;font-family:inherit;">
                I Have Removed the Item
              </button>
              <div style="font-size:11px;color:var(--muted);margin-top:6px;">The issuer will be notified to verify. Points may be waived.</div>
            </div>`;

        } else if (!resolved) {
          removalContent += `<div style="font-size:12px;color:var(--accent);margin-top:8px;font-weight:600;">Failure to comply may result in the item being impounded.</div>`;
        }

        return `<div style="background:#fff3cd;border:2px solid #e6a000;padding:14px;margin-bottom:16px;">${removalContent}</div>`;
      })() : ''}

      ${appealThread}
      ${notesHtml}
      ${issuerActionsHtml}
      ${statusMsg}
      ${appealSection}
      ${logHtml}
    </div>
  `;
}

async function submitItemRemoved(id) {
  const btn = event.target;
  btn.disabled = true; btn.textContent = 'Submitting...';
  const result = await API.itemRemoved(id);
  if (result.success) {
    API.getTicket(id).then(data => {
      if (data?.ticket) renderFullTicket(document.getElementById('ticket-view'), data.ticket, false);
    });
  } else {
    btn.disabled = false; btn.textContent = '✓ I Have Removed the Item';
    alert(result.error || 'Failed to submit.');
  }
}

async function verifyItemRemoved(id, confirmed) {
  const noteEl = document.getElementById('ir-verify-note');
  const note = noteEl ? noteEl.value.trim() : null;
  if (confirmed) {
    openPointsModal(id, 'verified', note);
  } else {
    // Item still there — offer points choice AND option to impound right now
    openPointsModal(id, 'notmoved', note);
  }
}

function openPointsModal(id, context, verifyNote) {
  const existing = document.getElementById('points-modal');
  if (existing) existing.remove();

  const t = _ticketCache[id];
  const fullPoints = t ? t.points : 0;
  const half = Math.ceil(fullPoints / 2);
  const isStillThere = context === 'notmoved';

  const contextMsg = context === 'verified'
    ? 'Recipient reported the item was removed. Choose how to handle their points.'
    : 'Item is still there. Choose how to proceed.';

  const impoundOption = isStillThere ? `
    <div id="pm-impound" onclick="selectPointsOption('impound')" style="border:2px solid var(--border);padding:12px;cursor:pointer;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div id="pm-dot-impound" style="width:16px;height:16px;border-radius:50%;border:2px solid #7b3f00;flex-shrink:0;"></div>
        <div>
          <div style="font-weight:700;color:#7b3f00;font-size:14px;">Impound Now</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px;">Take a photo and remove the item yourself. Keep full points.</div>
        </div>
      </div>
    </div>
    <div id="pm-keepopen" onclick="selectPointsOption('keepopen')" style="border:2px solid var(--border);padding:12px;cursor:pointer;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div id="pm-dot-keepopen" style="width:16px;height:16px;border-radius:50%;border:2px solid var(--blue);flex-shrink:0;"></div>
        <div>
          <div style="font-weight:700;color:var(--blue);font-size:14px;">Add Points &amp; Keep Open</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px;">Add more points and leave a comment. Ticket stays active.</div>
        </div>
      </div>
    </div>` : '';

  const keepOpenFields = isStillThere ? `
    <div id="pm-keepopen-fields" style="display:none;border:1px solid var(--border);padding:12px;margin-top:4px;background:var(--bg);">
      <div class="field-group">
        <label style="font-size:12px;font-weight:600;">Additional Points</label>
        <select id="pm-extra-points" style="font-size:13px;padding:6px 8px;border:1px solid var(--border);width:auto;">
          <option value="0">No additional points</option>
          <option value="1">+1 point</option>
          <option value="2">+2 points</option>
          <option value="3">+3 points</option>
        </select>
      </div>
      <div class="field-group" style="margin-bottom:0;">
        <label style="font-size:12px;font-weight:600;">Comment (appears on ticket)</label>
        <textarea id="pm-comment" placeholder="e.g. Item still present after 48 hours. Points added." style="min-height:70px;font-size:13px;"></textarea>
      </div>
    </div>` : '';

  const modal = document.createElement('div');
  modal.id = 'points-modal';
  modal.dataset.verifyNote = verifyNote || '';
  modal.dataset.context = context;
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:2000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;';

  modal.innerHTML = `
    <div style="background:var(--white);max-width:440px;width:100%;border-top:4px solid var(--blue);margin:auto;">
      <div style="background:var(--blue);color:var(--white);padding:14px 18px;">
        <div style="font-size:15px;font-weight:700;">How should points be handled?</div>
        <div style="font-size:12px;opacity:0.75;margin-top:2px;">${contextMsg}</div>
      </div>
      <div style="padding:18px;display:flex;flex-direction:column;gap:10px;">
        <div id="pm-full" onclick="selectPointsOption('full')" style="border:2px solid var(--border);padding:12px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div id="pm-dot-full" style="width:16px;height:16px;border-radius:50%;border:2px solid var(--accent);flex-shrink:0;"></div>
            <div>
              <div style="font-weight:700;color:var(--accent);font-size:14px;">Keep Full Points &amp; Close</div>
              <div style="font-size:12px;color:var(--muted);margin-top:2px;">${fullPoints} pt${fullPoints !== 1 ? 's' : ''} — close the ticket as-is.</div>
            </div>
          </div>
        </div>

        ${fullPoints > 1 ? `
        <div id="pm-half" onclick="selectPointsOption('half')" style="border:2px solid var(--border);padding:12px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div id="pm-dot-half" style="width:16px;height:16px;border-radius:50%;border:2px solid var(--warn);flex-shrink:0;"></div>
            <div>
              <div style="font-weight:700;color:var(--warn);font-size:14px;">Reduce to ${half} Point${half !== 1 ? 's' : ''} &amp; Close</div>
              <div style="font-size:12px;color:var(--muted);margin-top:2px;">Partial — close the ticket with reduced fine.</div>
            </div>
          </div>
        </div>` : ''}

        <div id="pm-none" onclick="selectPointsOption('none')" style="border:2px solid var(--border);padding:12px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div id="pm-dot-none" style="width:16px;height:16px;border-radius:50%;border:2px solid var(--success);flex-shrink:0;"></div>
            <div>
              <div style="font-weight:700;color:var(--success);font-size:14px;">Dismiss — Remove All Points &amp; Close</div>
              <div style="font-size:12px;color:var(--muted);margin-top:2px;">Waive the fine and close the ticket.</div>
            </div>
          </div>
        </div>

        ${impoundOption}
        ${keepOpenFields}

        <div id="pm-msg"></div>
        <div style="display:flex;gap:10px;margin-top:4px;">
          <button id="pm-confirm-btn" onclick="confirmPointsAction('${id}')" style="padding:10px 20px;font-size:14px;">Confirm</button>
          <button class="secondary" onclick="document.getElementById('points-modal').remove()" style="padding:10px 18px;font-size:14px;">Cancel</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  selectPointsOption('full');
}

let _selectedPointsOption = 'full';
function selectPointsOption(key) {
  _selectedPointsOption = key;
  const colors = { full: 'var(--accent)', half: 'var(--warn)', none: 'var(--success)', impound: '#7b3f00', keepopen: 'var(--blue)' };
  ['full','half','none','impound','keepopen'].forEach(k => {
    const row = document.getElementById(`pm-${k}`);
    const dot = document.getElementById(`pm-dot-${k}`);
    if (!row) return;
    if (k === key) {
      row.style.borderColor = colors[k];
      row.style.background = 'var(--blue-light)';
      if (dot) dot.style.background = colors[k];
    } else {
      row.style.borderColor = 'var(--border)';
      row.style.background = 'transparent';
      if (dot) dot.style.background = 'transparent';
    }
  });
  const koFields = document.getElementById('pm-keepopen-fields');
  if (koFields) koFields.style.display = key === 'keepopen' ? 'block' : 'none';
}

async function confirmPointsAction(id) {
  const modal = document.getElementById('points-modal');
  const btn = document.getElementById('pm-confirm-btn');
  const msgEl = document.getElementById('pm-msg');

  if (_selectedPointsOption === 'impound') {
    modal?.remove();
    openIssuerRemoveModal(id);
    return;
  }

  if (_selectedPointsOption === 'keepopen') {
    const extraPts = parseInt(document.getElementById('pm-extra-points')?.value || '0');
    const comment = document.getElementById('pm-comment')?.value.trim() || '';
    if (!comment && extraPts === 0) {
      msgEl.className = 'msg error'; msgEl.textContent = 'Add points or a comment to continue.'; msgEl.style.display = 'block';
      return;
    }
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
    if (extraPts > 0) {
      const t = _ticketCache[id];
      const newTotal = (t ? t.points : 0) + extraPts;
      await fetch('/api/adjust-points', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, points: newTotal }) });
    }
    if (comment) {
      await fetch('/api/issuer-note', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text: comment, points: 0 }) });
    }
    modal?.remove();
    location.reload();
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Working...'; }

  const t = _ticketCache[id];
  const fullPoints = t ? t.points : 0;
  const half = Math.ceil(fullPoints / 2);

  let result;
  if (_selectedPointsOption === 'none') {
    result = await API.resolve(id, true);
  } else if (_selectedPointsOption === 'half' && fullPoints > 1) {
    const res = await fetch('/api/adjust-points', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, points: half }) });
    const adj = await res.json();
    if (!adj.success) {
      msgEl.className = 'msg error'; msgEl.textContent = adj.error || 'Failed.'; msgEl.style.display = 'block';
      if (btn) { btn.disabled = false; btn.textContent = 'Confirm'; }
      return;
    }
    result = await API.resolve(id, false);
  } else {
    result = await API.resolve(id, false);
  }

  if (result?.success) { modal?.remove(); location.reload(); }
  else {
    msgEl.className = 'msg error'; msgEl.textContent = result?.error || 'Something went wrong.'; msgEl.style.display = 'block';
    if (btn) { btn.disabled = false; btn.textContent = 'Confirm'; }
  }
}

function openIssuerRemoveModal(id) {
  const existing = document.getElementById('issuer-remove-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'issuer-remove-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = `
    <div style="background:var(--white);max-width:480px;width:100%;border-top:4px solid #7b3f00;">
      <div style="background:#7b3f00;color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:15px;font-weight:700;">Mark Item as Removed</div>
          <div style="font-size:12px;opacity:0.8;margin-top:2px;">Take a photo as proof and close the ticket</div>
        </div>
        <button onclick="document.getElementById('issuer-remove-modal').remove()" style="background:transparent;border:1px solid rgba(255,255,255,0.4);color:#fff;padding:4px 10px;font-size:13px;cursor:pointer;">✕</button>
      </div>
      <div style="padding:18px;">
        <div id="ir-msg"></div>
        <div class="field-group">
          <label for="ir-photo">Photo of Item Removed / Location <span class="req">*</span></label>
          <input type="file" id="ir-photo" accept="image/*" capture="environment" required>
          <div id="ir-photo-preview" style="margin-top:6px;"></div>
        </div>
        <div class="field-group">
          <label for="ir-note">Note <span class="opt">(optional)</span></label>
          <input type="text" id="ir-note" placeholder="e.g. Moved to garage, Left outside door">
        </div>
        <div style="background:#fff3cd;border:1px solid #e6a000;padding:10px;font-size:12px;margin-bottom:14px;">
          This will close the ticket. Points remain on record. The recipient will see that the item was relocated and will be shown the contact number to retrieve it.
        </div>
        <div style="display:flex;gap:10px;">
          <button onclick="submitIssuerRemoved('${id}')" style="background:#7b3f00;color:#fff;padding:10px 18px;font-size:13px;font-weight:700;border:none;cursor:pointer;font-family:inherit;">Confirm & Close Ticket</button>
          <button class="secondary" onclick="document.getElementById('issuer-remove-modal').remove()" style="padding:10px 16px;font-size:13px;">Cancel</button>
        </div>
      </div>
    </div>`;

  // Preview photo
  modal.querySelector('#ir-photo').addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        document.getElementById('ir-photo-preview').innerHTML = `<img src="${e.target.result}" style="width:100%;max-height:180px;object-fit:cover;border:1px solid var(--border);">`;
      };
      reader.readAsDataURL(file);
    }
  });

  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

async function submitIssuerRemoved(id) {
  const photoFile = document.getElementById('ir-photo').files[0];
  const msgEl = document.getElementById('ir-msg');
  if (!photoFile) {
    msgEl.className = 'msg error'; msgEl.textContent = 'A photo is required.'; msgEl.style.display = 'block';
    return;
  }
  const btn = document.querySelector('#issuer-remove-modal button[onclick^="submitIssuerRemoved"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

  let photoBase64 = null;
  try { photoBase64 = await compressImage(photoFile); } catch {}

  const note = document.getElementById('ir-note').value.trim() || null;

  const res = await fetch('/api/issuer-removed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, photo_base64: photoBase64, note })
  });
  const result = await res.json();
  if (result.success) {
    document.getElementById('issuer-remove-modal').remove();
    location.reload();
  } else {
    msgEl.className = 'msg error'; msgEl.textContent = result.error || 'Failed.'; msgEl.style.display = 'block';
    if (btn) { btn.disabled = false; btn.textContent = 'Confirm & Close Ticket'; }
  }
}

// ── ADD NOTE / COMMENT ───────────────────────────────────────────────────────
function openAddNoteModal(id) {
  const existing = document.getElementById('add-note-modal');
  if (existing) existing.remove();

  const t = _ticketCache[id] || {};

  const modal = document.createElement('div');
  modal.id = 'add-note-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = `
    <div style="background:var(--white);max-width:460px;width:100%;border-top:4px solid var(--blue);">
      <div style="background:var(--blue);color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:15px;font-weight:700;">Add Note / Comment</div>
        <button onclick="document.getElementById('add-note-modal').remove()" style="background:transparent;border:1px solid rgba(255,255,255,0.4);color:#fff;padding:3px 9px;font-size:13px;cursor:pointer;">✕</button>
      </div>
      <div style="padding:18px;">
        <div id="note-msg"></div>
        <div class="field-group">
          <label for="note-text">Note <span class="req">*</span></label>
          <textarea id="note-text" placeholder="Add a comment, observation, or update..." style="min-height:80px;"></textarea>
        </div>
        <div class="field-group">
          <label style="font-size:13px;font-weight:600;margin-bottom:6px;display:block;">Also add points?</label>
          <div style="display:flex;align-items:center;gap:10px;">
            <input type="number" id="note-points" min="0" max="10" value="0" style="width:70px;padding:6px 8px;border:1px solid var(--border);font-size:14px;">
            <span style="font-size:13px;color:var(--muted);">pts to add (0 = note only)</span>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:6px;">
          <button onclick="submitAddNote('${id}')" style="padding:10px 18px;font-size:13px;">Save Note</button>
          <button class="secondary" onclick="document.getElementById('add-note-modal').remove()" style="padding:10px 16px;font-size:13px;">Cancel</button>
        </div>
      </div>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

async function submitAddNote(id) {
  const text = document.getElementById('note-text').value.trim();
  const pts = parseInt(document.getElementById('note-points').value) || 0;
  const msgEl = document.getElementById('note-msg');
  if (!text) { msgEl.className = 'msg error'; msgEl.textContent = 'Note text is required.'; msgEl.style.display = 'block'; return; }

  const btn = document.querySelector('#add-note-modal button[onclick^="submitAddNote"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  const res = await fetch('/api/issuer-note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, text, points: pts })
  });
  const result = await res.json();
  if (result.success) { document.getElementById('add-note-modal').remove(); location.reload(); }
  else { msgEl.className = 'msg error'; msgEl.textContent = result.error || 'Failed.'; msgEl.style.display = 'block'; if (btn) { btn.disabled = false; btn.textContent = 'Save Note'; } }
}

// ── ATTACH / REMOVE REMOVAL NOTICE ──────────────────────────────────────────
function openAttachRemovalModal(id) {
  const existing = document.getElementById('attach-removal-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'attach-removal-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = `
    <div style="background:var(--white);max-width:440px;width:100%;border-top:4px solid #e6a000;">
      <div style="background:#e6a000;color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:15px;font-weight:700;">Attach Removal Notice</div>
        <button onclick="document.getElementById('attach-removal-modal').remove()" style="background:transparent;border:1px solid rgba(255,255,255,0.4);color:#fff;padding:3px 9px;font-size:13px;cursor:pointer;">✕</button>
      </div>
      <div style="padding:18px;">
        <div id="attach-msg"></div>
        <div class="field-group">
          <label for="attach-deadline">Deadline <span class="req">*</span></label>
          <select id="attach-deadline" style="margin-bottom:8px;">
            <option value="immediately">Immediately</option>
            <option value="24hr" selected>Within 24 hours</option>
            <option value="48hr">Within 48 hours</option>
            <option value="72hr">Within 72 hours</option>
            <option value="1week">Within 1 week</option>
          </select>
        </div>
        <div class="field-group">
          <label for="attach-note">Note <span class="opt">(optional)</span></label>
          <input type="text" id="attach-note" placeholder="e.g. Move to garage, Return to room">
        </div>
        <div style="display:flex;gap:10px;margin-top:6px;">
          <button onclick="submitAttachRemoval('${id}')" style="padding:10px 18px;font-size:13px;background:#e6a000;border:none;color:#fff;cursor:pointer;font-family:inherit;font-weight:600;">Attach Notice</button>
          <button class="secondary" onclick="document.getElementById('attach-removal-modal').remove()" style="padding:10px 16px;font-size:13px;">Cancel</button>
        </div>
      </div>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

async function submitAttachRemoval(id) {
  const deadline = document.getElementById('attach-deadline').value;
  const note = document.getElementById('attach-note').value.trim() || null;
  const msgEl = document.getElementById('attach-msg');
  const btn = document.querySelector('#attach-removal-modal button[onclick^="submitAttachRemoval"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  const res = await fetch('/api/attach-removal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, deadline, note })
  });
  const result = await res.json();
  if (result.success) { document.getElementById('attach-removal-modal').remove(); location.reload(); }
  else { msgEl.className = 'msg error'; msgEl.textContent = result.error || 'Failed.'; msgEl.style.display = 'block'; if (btn) { btn.disabled = false; btn.textContent = 'Attach Notice'; } }
}

async function removeRemovalNotice(id) {
  if (!confirm('Remove the removal notice from this ticket?')) return;
  const res = await fetch('/api/attach-removal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, remove: true })
  });
  const result = await res.json();
  if (result.success) location.reload();
  else alert(result.error || 'Failed to remove notice.');
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
  if (t.item_removed_at && t.status !== 'resolved') return { label: 'VERIFY', cls: 'flagged', key: 'verify' };
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

  let actionBtn = '—';
  if (t.status !== 'resolved' || (t.removal_notice && t.appeal_flagged)) {
    if (t.appeal_flagged) {
      // Always show View Appeal if there's an appeal, regardless of item_removed_at
      actionBtn = `<button style="padding:4px 12px;font-size:12px;background:var(--blue);color:#fff;border:none;cursor:pointer;" onclick="openAppealModal('${t.id}')">View Appeal</button>`;
      if (t.status !== 'resolved') {
        actionBtn += `<br><button class="success" style="padding:3px 8px;font-size:11px;margin-top:3px;" onclick="showResolveModal('${t.id}', 'resolve')">Resolve</button>`;
      }
    } else if (t.item_removed_at && t.status !== 'resolved') {
      actionBtn = `
        <div style="font-size:11px;color:var(--success);font-weight:600;margin-bottom:4px;">Recipient says removed</div>
        <button onclick="verifyItemRemoved('${t.id}', true)" style="padding:3px 8px;font-size:11px;background:var(--success);color:#fff;border:none;cursor:pointer;font-family:inherit;display:block;margin-bottom:3px;width:100%;">Item is Gone</button>
        <button onclick="verifyItemRemoved('${t.id}', false)" style="padding:3px 8px;font-size:11px;background:var(--accent);color:#fff;border:none;cursor:pointer;font-family:inherit;display:block;width:100%;">Item Still There</button>`;
    } else if (t.status !== 'resolved') {
      actionBtn = `<button class="success" style="padding:4px 10px;font-size:12px;display:block;margin-bottom:4px;" onclick="showResolveModal('${t.id}', 'resolve')">Resolve</button>`;
    }
  }

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
            <option value="verify">Verify Removal</option>
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
  showResolveModal(id, dismiss ? 'dismiss' : 'resolve');
}

function showResolveModal(id, defaultAction) {
  const existing = document.getElementById('resolve-modal');
  if (existing) existing.remove();

  const t = _ticketCache[id];
  const hasRemoval = t && t.removal_notice && !t.issuer_removed_at;

  const modal = document.createElement('div');
  modal.id = 'resolve-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto;';

  const removalOptions = hasRemoval ? `
    <div id="rm-impound" onclick="selectResolveAction('impound')" style="border:2px solid var(--border);padding:14px;cursor:pointer;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:16px;height:16px;border-radius:50%;border:2px solid #7b3f00;flex-shrink:0;" id="rm-dot-impound"></div>
        <div>
          <div style="font-weight:700;color:#7b3f00;font-size:14px;">Impounded</div>
          <div style="font-size:13px;color:var(--muted);margin-top:2px;">Item was not moved. You removed it. Take a photo as proof — points stay on record.</div>
        </div>
      </div>
    </div>

    <div id="rm-notmoved" onclick="selectResolveAction('notmoved')" style="border:2px solid var(--border);padding:14px;cursor:pointer;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:16px;height:16px;border-radius:50%;border:2px solid #555;flex-shrink:0;" id="rm-dot-notmoved"></div>
        <div>
          <div style="font-weight:700;color:#555;font-size:14px;">Item Not Moved</div>
          <div style="font-size:13px;color:var(--muted);margin-top:2px;">Deadline passed, item is still there. Close the ticket and keep points — no photo needed.</div>
        </div>
      </div>
    </div>` : '';

  modal.innerHTML = `
    <div style="background:var(--white);max-width:480px;width:100%;border-top:4px solid var(--blue);margin:auto;">
      <div style="background:var(--blue);color:var(--white);padding:14px 18px;">
        <div style="font-size:16px;font-weight:700;">Close Ticket</div>
        <div style="font-size:12px;opacity:0.75;margin-top:2px;">Choose how to close this ticket</div>
      </div>
      <div style="padding:18px;display:flex;flex-direction:column;gap:12px;">

        <div id="rm-resolve" onclick="selectResolveAction('resolve')" style="border:2px solid var(--border);padding:14px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:16px;height:16px;border-radius:50%;border:2px solid var(--success);flex-shrink:0;" id="rm-dot-resolve"></div>
            <div>
              <div style="font-weight:700;color:var(--success);font-size:14px;">Resolve</div>
              <div style="font-size:13px;color:var(--muted);margin-top:2px;">Ticket is closed. Points stay on record. Use when the violation stands and is now handled.</div>
            </div>
          </div>
        </div>

        <div id="rm-dismiss" onclick="selectResolveAction('dismiss')" style="border:2px solid var(--border);padding:14px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:16px;height:16px;border-radius:50%;border:2px solid var(--blue);flex-shrink:0;" id="rm-dot-dismiss"></div>
            <div>
              <div style="font-weight:700;color:var(--blue);font-size:14px;">Dismiss</div>
              <div style="font-size:13px;color:var(--muted);margin-top:2px;">Ticket is closed and points are removed. Use when the citation was a mistake or the appeal was valid.</div>
            </div>
          </div>
        </div>

        <div id="rm-decline" onclick="selectResolveAction('decline')" style="border:2px solid var(--border);padding:14px;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:16px;height:16px;border-radius:50%;border:2px solid var(--accent);flex-shrink:0;" id="rm-dot-decline"></div>
            <div>
              <div style="font-weight:700;color:var(--accent);font-size:14px;">Decline Appeal</div>
              <div style="font-size:13px;color:var(--muted);margin-top:2px;">Appeal is rejected. Points stay, ticket remains active.</div>
            </div>
          </div>
        </div>

        ${removalOptions}

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
  const colors = {
    resolve: 'var(--success)',
    dismiss: 'var(--blue)',
    decline: 'var(--accent)',
    impound: '#7b3f00',
    notmoved: '#555'
  };
  ['resolve','dismiss','decline','impound','notmoved'].forEach(a => {
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

  if (_selectedResolveAction === 'impound') {
    // Close modal, open photo + points modal
    document.getElementById('resolve-modal')?.remove();
    openIssuerRemoveModal(id);
    return;
  }

  if (_selectedResolveAction === 'notmoved') {
    // Close modal, open points choice modal
    document.getElementById('resolve-modal')?.remove();
    openPointsModal(id, 'notmoved');
    return;
  }

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
  // Show action buttons if ticket isn't fully closed, OR if it's resolved but has an active contest
  const canAct = t.status !== 'resolved' || (t.removal_notice && t.appeal_flagged);
  if (canAct) {
    if (t.status !== 'resolved') {
      actionBtns += `<button class="success" style="padding:8px 16px;font-size:13px;" onclick="resolveTicket('${t.id}', false)">Resolve</button>`;
      actionBtns += ` <button class="secondary" style="padding:8px 16px;font-size:13px;" onclick="resolveTicket('${t.id}', true)">Dismiss (Remove Points)</button>`;
    } else {
      // Resolved impound contest — can adjust points or reopen
      actionBtns += `<button style="background:var(--success);color:#fff;padding:8px 16px;font-size:13px;border:none;cursor:pointer;font-family:inherit;" onclick="openPointsModal('${t.id}', 'verified')">Adjust Points</button>`;
    }
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
  const variant = params.get('variant') || 'auto'; // auto, standard, removal, unknown

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

    // Determine which variant to show
    let activeVariant = variant;
    if (activeVariant === 'auto') {
      if (t.removal_notice) activeVariant = 'removal';
      else if (t.is_unknown) activeVariant = 'unknown';
      else activeVariant = 'standard';
    }

    const qrId = (suffix) => `qr-code-${suffix}`;

    const qrBlock = (suffix) => `
      <div style="border-top:1px dashed #000;margin-top:10px;padding-top:10px;text-align:center;">
        <div id="${qrId(suffix)}" style="display:inline-block;"></div>
        <div style="font-size:9px;margin-top:5px;word-break:break-all;">${url}</div>
        <div style="font-size:9px;margin-top:3px;font-style:italic;">Scan to view this citation</div>
      </div>`;

    // ── RECEIPT: STANDARD ───────────────────────────────────────────────────
    const receiptStandard = `
      <div class="receipt-sheet">
        <div style="text-align:center;letter-spacing:3px;font-size:15px;font-weight:bold;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:8px;">14-T CITATION</div>
        <div class="r-row"><span class="r-label">NAME</span><span>${t.is_unknown ? 'UNKNOWN' : t.person_name}</span></div>
        <div class="r-row"><span class="r-label">LOCATION</span><span>${t.location}</span></div>
        ${t.item_name ? `<div class="r-row"><span class="r-label">ITEM</span><span>${t.item_name}</span></div>` : ''}
        <div class="r-row"><span class="r-label">DATE</span><span>${dateStr}</span></div>
        ${qrBlock('std')}
      </div>`;

    // ── RECEIPT: REMOVAL NOTICE ─────────────────────────────────────────────
    const deadlineText = t.removal_deadline ? formatDeadline(t.removal_deadline, t.created_at).toUpperCase() : 'IMMEDIATELY';
    const receiptRemoval = `
      <div class="receipt-sheet">
        <div style="text-align:center;letter-spacing:2px;font-size:13px;font-weight:bold;border-bottom:2px solid #000;padding-bottom:5px;margin-bottom:8px;">14-T CITATION</div>
        <div style="border:2px solid #000;padding:8px;margin-bottom:8px;text-align:center;">
          <div style="font-size:11px;font-weight:bold;letter-spacing:1px;">⚠ REMOVAL NOTICE ⚠</div>
          <div style="font-size:10px;margin-top:3px;">THIS ITEM MUST BE REMOVED</div>
          <div style="font-size:12px;font-weight:bold;margin-top:3px;border-top:1px solid #000;padding-top:4px;">${deadlineText}</div>
          ${t.removal_note ? `<div style="font-size:9px;margin-top:3px;">${t.removal_note}</div>` : ''}
        </div>
        <div class="r-row"><span class="r-label">LOCATION</span><span>${t.location}</span></div>
        ${t.item_name ? `<div class="r-row"><span class="r-label">ITEM</span><span>${t.item_name}</span></div>` : ''}
        ${!t.is_unknown ? `<div class="r-row"><span class="r-label">ISSUED TO</span><span>${t.person_name}</span></div>` : ''}
        <div class="r-row"><span class="r-label">DATE</span><span>${dateStr}</span></div>
        <div style="font-size:9px;text-align:center;margin-top:6px;border-top:1px dashed #000;padding-top:6px;">Failure to comply may result in relocation of this item.</div>
        ${qrBlock('rem')}
      </div>`;

    // ── RECEIPT: UNKNOWN / ABANDONED ───────────────────────────────────────
    const receiptUnknown = `
      <div class="receipt-sheet">
        <div style="text-align:center;letter-spacing:2px;font-size:13px;font-weight:bold;border-bottom:2px solid #000;padding-bottom:5px;margin-bottom:8px;">14-T CITATION</div>
        <div style="border:1px solid #000;padding:8px;margin-bottom:8px;text-align:center;font-size:10px;">
          <div style="font-weight:bold;font-size:11px;letter-spacing:1px;">OWNER UNKNOWN</div>
          <div style="margin-top:3px;">If this item belongs to you, scan the QR code to claim this citation and view your options.</div>
        </div>
        <div class="r-row"><span class="r-label">LOCATION</span><span>${t.location}</span></div>
        ${t.item_name ? `<div class="r-row"><span class="r-label">ITEM</span><span>${t.item_name}</span></div>` : ''}
        <div class="r-row"><span class="r-label">DATE</span><span>${dateStr}</span></div>
        ${t.removal_notice ? `
        <div style="border:1px dashed #000;padding:6px;margin-top:8px;text-align:center;font-size:9px;font-weight:bold;">
          ⚠ REMOVAL NOTICE: MUST BE REMOVED ${deadlineText}
        </div>` : ''}
        ${qrBlock('unk')}
      </div>`;

    // Tab bar for switching variants
    const variants = [
      { key: 'standard', label: 'Standard' },
      { key: 'removal', label: 'Removal Notice' },
      { key: 'unknown', label: 'Unknown / Abandoned' },
    ];

    document.getElementById('print-view').innerHTML = `
      <style>
        .receipt-sheet { width:72mm; margin:0 auto; font-size:10px; font-family:monospace; line-height:1.4; }
        .r-row { display:flex; justify-content:space-between; gap:8px; margin-bottom:3px; }
        .r-label { font-weight:bold; white-space:nowrap; }
        .variant-tab { padding:6px 14px; font-size:12px; cursor:pointer; border:1px solid var(--border); background:var(--white); font-family:inherit; }
        .variant-tab.active { background:var(--blue); color:var(--white); border-color:var(--blue); font-weight:700; }
        @media print { .no-print { display:none !important; } }
      </style>
      <div class="no-print" style="margin-bottom:14px;">
        <div style="font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Receipt Type</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${variants.map(v => `<button class="variant-tab ${activeVariant === v.key ? 'active' : ''}" onclick="switchVariant('${v.key}')">${v.label}</button>`).join('')}
        </div>
      </div>
      <div id="receipt-standard" style="${activeVariant === 'standard' ? '' : 'display:none'}">${receiptStandard}</div>
      <div id="receipt-removal"  style="${activeVariant === 'removal'  ? '' : 'display:none'}">${receiptRemoval}</div>
      <div id="receipt-unknown"  style="${activeVariant === 'unknown'  ? '' : 'display:none'}">${receiptUnknown}</div>
    `;

    // QR codes
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = () => {
      ['std','rem','unk'].forEach(suffix => {
        const el = document.getElementById(`qr-code-${suffix}`);
        if (el) new QRCode(el, { text: url, width: 140, height: 140, colorDark: '#000000', colorLight: '#ffffff' });
      });
      setTimeout(() => window.print(), 900);
    };
    document.head.appendChild(script);
  });
}

function switchVariant(key) {
  ['standard','removal','unknown'].forEach(k => {
    const el = document.getElementById(`receipt-${k}`);
    if (el) el.style.display = k === key ? '' : 'none';
  });
  document.querySelectorAll('.variant-tab').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(key === 'unknown' ? 'unknown' : key));
  });
}
