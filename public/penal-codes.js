// public/penal-codes.js
// ─────────────────────────────────────────────────────────────────────────────
// 14-T PENAL CODES & QUICK PRESETS
// Edit this file freely — it is separate from app.js and will not be
// overwritten when app.js is updated.
//
// HOW TO ADD A PENAL CODE:
//   { code: '14T-XXX', label: 'Short Name', desc: 'Full description.', category: 'abandonment' }
//   Categories: abandonment | cleanliness | noise | property | other
//   Or add your own category key and a matching entry in CATEGORY_LABELS below.
//
// HOW TO ADD A QUICK PRESET:
//   { label: 'Display name', icon: '📦', violation_type: 'warning',
//     penal_code: '14T-XXX', description: 'Pre-filled description.',
//     removal_notice: true, removal_deadline: '24hr' }
//   violation_type: notice | warning | minor | major | severe
//   removal_deadline: immediately | 24hr | 48hr | 72hr | 1week | null
// ─────────────────────────────────────────────────────────────────────────────

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
// These appear as one-tap chips at the top of the new ticket form.
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
