const CARDS = [
  {
    id: 'ppv', name: 'Preferred Platinum Visa', bank: 'UOB', mpd: 4, cap: 1110, base: 0.4,
    cats: ['online', 'dining', 'entertainment', 'transport'],
    perks: ['UNI$ never expire', 'Pool across UOB cards'],
    hi_perks: [],
    notes: '4 mpd on online, dining & entertainment. Min 5 txns/mo. Base only 0.4 mpd — low fallback.'
  },
  {
    id: 'vs', name: 'Visa Signature', bank: 'UOB', mpd: 4, cap: 1000, base: 1.4,
    cats: ['online', 'overseas', 'petrol', 'dining'],
    perks: ['UNI$ pooling', 'Petrol cashback'],
    hi_perks: ['Lounge (Mastercard Travel Pass)'],
    notes: '4 mpd on overseas & online — min S$500 FCY or online/mo. Base 1.4 mpd.'
  },
  {
    id: 'womens', name: "Woman's Card", bank: 'DBS', mpd: 4, cap: 1500, base: 1.2,
    cats: ['online', 'fashion', 'beauty', 'dining'],
    perks: ['DBS Points no expiry', 'Multi-airline transfer'],
    hi_perks: [],
    notes: '4 mpd on online spend. No min spend. Convert to KrisFlyer or Asia Miles.'
  },
  {
    id: 'ladys', name: "Lady's Card", bank: 'UOB', mpd: 4, cap: 1000, base: 1.4,
    cats: ['online', 'dining', 'entertainment', 'transport', 'travel'],
    perks: ['UNI$ pooling', 'Pick 1 cat/quarter'],
    hi_perks: [],
    notes: '4 mpd on 1 chosen category per quarter (set in UOB app). Cap S$1,000.'
  },
  {
    id: 'citi', name: 'Citi Rewards', bank: 'Citi', mpd: 4, cap: 1000, base: 1.2,
    cats: ['online', 'shopping', 'dining', 'transport'],
    perks: ['Points never expire', 'No min spend'],
    hi_perks: [],
    notes: '4 mpd online & retail. Excl. supermarkets, travel, insurance. Points never expire.'
  },
  {
    id: 'krisflyer', name: 'KrisFlyer UOB', bank: 'UOB', mpd: 3, cap: null, base: 1.2,
    cats: ['dining', 'online', 'travel', 'overseas'],
    perks: ['Miles direct to KrisFlyer', 'No conversion fee'],
    hi_perks: ['Complimentary travel insurance'],
    notes: '3 mpd on dining, online & travel. Miles go straight to KrisFlyer — no pooling step needed.'
  },
  {
    id: 'premiermiles', name: 'PremierMiles', bank: 'Citi', mpd: 2.2, cap: null, base: 1.2,
    cats: ['overseas', 'travel'],
    perks: ['Miles never expire', '11 airline partners'],
    hi_perks: ['2x Priority Pass lounge/yr', 'Travel insurance'],
    notes: '1.2 mpd local, 2.2 mpd overseas. Miles never expire. 2 lounge visits/yr via Priority Pass.'
  },
  {
    id: 'altitude', name: 'Altitude', bank: 'DBS', mpd: 3, cap: 5000, base: 1.2,
    cats: ['travel', 'online', 'overseas', 'dining'],
    perks: ['DBS Points no expiry', 'Multi-airline transfer'],
    hi_perks: ['Airport lounge access', 'Travel insurance S$1M'],
    notes: '3 mpd on online travel portals up to S$5,000/mo. Lounge via DBS Lifestyle app.'
  }
];

const CATS = [
  { id: 'online',        label: 'Online shopping' },
  { id: 'dining',        label: 'Dining & delivery' },
  { id: 'transport',     label: 'Transport & Grab' },
  { id: 'overseas',      label: 'Overseas / FCY spend' },
  { id: 'travel',        label: 'Travel & hotels' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'petrol',        label: 'Petrol' },
  { id: 'fashion',       label: 'Fashion & beauty' },
  { id: 'shopping',      label: 'Retail shopping' },
  { id: 'groceries',     label: 'Groceries' },
  { id: 'bills',         label: 'Bills & utilities' },
  { id: 'other',         label: 'Other spend' }
];

let selCards = new Set(['ppv', 'citi']);
const spends = {};
CATS.forEach(c => spends[c.id] = 0);

/* ── TAB SWITCHING ── */
function sw(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
  if (id === 'strategy') renderStrategy();
  if (id === 'catalog')  renderCatalog();
}

/* ── CARD PICKER ── */
function renderPicker() {
  document.getElementById('cPicker').innerHTML = CARDS.map(c => `
    <div class="card-opt${selCards.has(c.id) ? ' sel' : ''}" onclick="toggleCard('${c.id}')">
      <div class="co-name">${c.name}</div>
      <div class="co-bank">${c.bank}</div>
      <div class="co-mpd">${c.mpd} mpd</div>
    </div>`).join('');
}

function toggleCard(id) {
  selCards.has(id) ? selCards.delete(id) : selCards.add(id);
  renderPicker();
  calc();
}

/* ── CAP-AWARE ASSIGNMENT ENGINE ── */
function computeAssignments() {
  const active = CARDS.filter(c => selCards.has(c.id));
  const capUsed = {};
  active.forEach(c => capUsed[c.id] = 0);
  const assignments = {};

  CATS.forEach(cat => {
    const amt = spends[cat.id] || 0;
    if (!amt) { assignments[cat.id] = null; return; }

    const ranked = [...active].sort((a, b) => {
      const ra = a.cats.includes(cat.id) ? a.mpd : a.base;
      const rb = b.cats.includes(cat.id) ? b.mpd : b.base;
      return rb - ra;
    });

    let remaining = amt;
    const segments = [];

    for (const card of ranked) {
      if (remaining <= 0) break;
      const eligible = card.cats.includes(cat.id);
      const rate = eligible ? card.mpd : card.base;

      if (eligible && card.cap !== null) {
        const left = Math.max(0, card.cap - capUsed[card.id]);
        if (left <= 0) continue;
        const use = Math.min(remaining, left);
        capUsed[card.id] += use;
        segments.push({ card, rate, amt: use, capped: false });
        remaining -= use;
      } else {
        segments.push({ card, rate, amt: remaining, capped: false });
        if (eligible && card.cap === null) capUsed[card.id] = (capUsed[card.id] || 0) + remaining;
        remaining = 0;
      }
    }

    if (remaining > 0 && ranked.length) {
      const fb = ranked[ranked.length - 1];
      segments.push({ card: fb, rate: fb.base, amt: remaining, capped: true });
    }

    const totalMiles = segments.reduce((s, sg) => s + Math.round(sg.amt * sg.rate), 0);
    assignments[cat.id] = { segments, totalMiles };
  });

  return { assignments, capUsed };
}

/* ── HELPERS ── */
function rateBadge(rate, capped) {
  const label = rate % 1 === 0 ? rate : rate.toFixed(1);
  if (capped)  return `<span class="badge bcapped">${label} mpd</span>`;
  if (rate >= 4) return `<span class="badge b4">${label} mpd</span>`;
  if (rate >= 3) return `<span class="badge b3">${label} mpd</span>`;
  if (rate >= 2) return `<span class="badge b2">${label} mpd</span>`;
  return `<span class="badge b1">${label} mpd</span>`;
}

function shortName(c) {
  const w = c.name.split(' ');
  return c.bank + ' ' + (w.length > 2 ? w.slice(0, 2).join(' ') : c.name);
}

function fmt(n) { return Number(n).toLocaleString(); }

/* ── RENDER SPEND TABLE STRUCTURE (called once) ── */
function renderCatTableStructure() {
  document.getElementById('catBody').innerHTML = CATS.map(cat => `
    <tr>
      <td>${cat.label}</td>
      <td><input class="cat-input" type="number" min="0" step="10" placeholder="0"
        oninput="onSpendInput('${cat.id}',this.value)"></td>
      <td id="card-${cat.id}" style="color:var(--text-3);font-size:11px">—</td>
      <td id="rate-${cat.id}" style="text-align:center">—</td>
      <td id="miles-${cat.id}" style="text-align:right" class="miles-val">—</td>
    </tr>`).join('');
}

function onSpendInput(catId, val) {
  spends[catId] = +val || 0;
  calc();
}

/* ── UPDATE RESULT CELLS ONLY (preserves input focus) ── */
function updateCatTable(assignments) {
  CATS.forEach(cat => {
    const amt = spends[cat.id] || 0;
    const a = assignments[cat.id];
    const cardEl  = document.getElementById('card-'  + cat.id);
    const rateEl  = document.getElementById('rate-'  + cat.id);
    const milesEl = document.getElementById('miles-' + cat.id);
    if (!cardEl) return;
    if (!amt || !a) {
      cardEl.innerHTML  = '—';
      rateEl.innerHTML  = '—';
      milesEl.textContent = '—';
      return;
    }
    const segs = a.segments;
    const p = segs[0];
    const splitNote = segs.length > 1
      ? `<div class="split-note">Split: ${segs.map(sg =>
          `${shortName(sg.card)} S$${fmt(sg.amt)} @ ${sg.rate % 1 === 0 ? sg.rate : sg.rate.toFixed(1)} mpd`
        ).join(' → ')}</div>`
      : '';
    cardEl.innerHTML    = shortName(p.card) + splitNote;
    rateEl.innerHTML    = rateBadge(p.rate, p.capped);
    milesEl.textContent = fmt(a.totalMiles);
  });
}

/* ── RENDER CAP BARS ── */
function renderCapBars(capUsed) {
  const capped = CARDS.filter(c => selCards.has(c.id) && c.cap);
  document.getElementById('capBars').innerHTML = capped.length
    ? capped.map(c => {
        const used = capUsed[c.id] || 0;
        const pct  = Math.min(100, Math.round(used / c.cap * 100));
        const col  = pct >= 100 ? '#E24B4A' : pct >= 80 ? '#EF9F27' : '#1D9E75';
        return `<div class="cap-item">
          <div class="cap-label">
            <span>${c.bank} ${c.name}</span>
            <span style="color:${pct >= 100 ? '#A32D2D' : 'var(--text-3)'}">
              S$${fmt(Math.round(used))} / S$${fmt(c.cap)} (${pct}%)
            </span>
          </div>
          <div class="cap-track"><div class="cap-fill" style="width:${pct}%;background:${col}"></div></div>
        </div>`;
      }).join('')
    : `<p style="font-size:12px;color:var(--text-3)">No capped cards selected.</p>`;
}

/* ── MAIN CALC ── */
function calc() {
  const { assignments, capUsed } = computeAssignments();
  updateCatTable(assignments);
  renderCapBars(capUsed);

  let ts = 0, tm = 0;
  CATS.forEach(cat => {
    const amt = spends[cat.id] || 0;
    ts += amt;
    const a = assignments[cat.id];
    if (a) tm += a.totalMiles;
  });

  document.getElementById('rSpend').textContent = 'S$' + fmt(ts);
  document.getElementById('rMiles').textContent = fmt(tm);
  document.getElementById('rVal').textContent   = 'S$' + Math.round(tm * 0.02).toLocaleString();
  document.getElementById('rCards').textContent = selCards.size;

  const warns = [];
  CARDS.filter(c => selCards.has(c.id) && c.cap).forEach(c => {
    const u = capUsed[c.id] || 0;
    if (u > c.cap) warns.push(`${c.bank} ${c.name} cap reached (S$${fmt(c.cap)}). Overflow spend reassigned to next best card.`);
  });
  document.getElementById('warns').innerHTML = warns.map(w => `<div class="warn">${w}</div>`).join('');
}

/* ── STRATEGY TAB ── */
function renderStrategy() {
  const active = CARDS.filter(c => selCards.has(c.id));
  document.getElementById('stratCards').innerHTML = active.length
    ? active.map(c => `
        <div class="sc sel">
          <div class="sc-head">
            <div><div class="sc-name">${c.name}</div><div class="sc-bank">${c.bank}</div></div>
            <div class="sc-mpd">${c.mpd} mpd</div>
          </div>
          <div class="sc-div"></div>
          <div class="sc-row"><span class="sc-k">Cap</span><span class="sc-v">${c.cap ? 'S$' + fmt(c.cap) + '/mo' : 'No cap'}</span></div>
          <div class="sc-row"><span class="sc-k">Base rate</span><span class="sc-v">${c.base} mpd</span></div>
          <div class="sc-row"><span class="sc-k">Earns on</span><span></span></div>
          <div style="margin-top:4px">${c.cats.map(t => `<span class="ctag">${t}</span>`).join('')}</div>
          <div class="sc-div"></div>
          <div class="sc-perks">
            ${c.hi_perks.map(p => `<span class="perk hi">${p}</span>`).join('')}
            ${c.perks.map(p => `<span class="perk">${p}</span>`).join('')}
          </div>
        </div>`).join('')
    : `<div class="empty-state">No cards selected. Go to the Calculator tab to pick your cards.</div>`;

  const { assignments } = computeAssignments();
  let ts = 0, tm = 0;
  const rows = CATS.map(cat => {
    const amt = spends[cat.id] || 0;
    if (!amt) return '';
    ts += amt;
    const a = assignments[cat.id];
    if (!a) return '';
    tm += a.totalMiles;
    const segs = a.segments;
    const p = segs[0];
    const cl = segs.length === 1
      ? shortName(p.card)
      : segs.map(s => `${shortName(s.card)} (S$${fmt(s.amt)})`).join(' + ');
    const bc = p.rate >= 4 ? 'b4' : p.rate >= 3 ? 'b3' : p.rate >= 2 ? 'b2' : 'b1';
    const rl = p.rate % 1 === 0 ? p.rate : p.rate.toFixed(1);
    return `<div class="bk-row">
      <span>${cat.label}</span>
      <span style="color:var(--text-3);font-size:11px">${cl}</span>
      <span>S$${fmt(amt)}</span>
      <span style="text-align:center"><span class="badge ${bc}">${rl} mpd</span></span>
      <span style="text-align:right" class="miles-val">${fmt(a.totalMiles)}</span>
    </div>`;
  }).join('');

  document.getElementById('ssBody').innerHTML = rows ||
    `<div class="empty-state">Enter spend in the Calculator tab first.</div>`;

  const tot = document.getElementById('ssTotal');
  if (ts) {
    tot.style.display = 'grid';
    document.getElementById('ssTS').textContent = 'S$' + fmt(ts);
    document.getElementById('ssTM').textContent = fmt(tm) + ' miles';
  } else {
    tot.style.display = 'none';
  }
}

/* ── CATALOG TAB ── */
function renderCatalog() {
  document.getElementById('catCards').innerHTML = CARDS.map(c => `
    <div class="sc">
      <div class="sc-head">
        <div><div class="sc-name">${c.name}</div><div class="sc-bank">${c.bank}</div></div>
        <div class="sc-mpd">${c.mpd} mpd</div>
      </div>
      <div class="sc-div"></div>
      <div class="sc-row"><span class="sc-k">Cap</span><span class="sc-v">${c.cap ? 'S$' + fmt(c.cap) + '/mo' : 'No cap'}</span></div>
      <div class="sc-row"><span class="sc-k">Base rate</span><span class="sc-v">${c.base} mpd</span></div>
      <div class="sc-row"><span class="sc-k">Notes</span><span class="sc-v" style="font-weight:400;color:var(--text-3);font-size:10px;line-height:1.5">${c.notes}</span></div>
      <div class="sc-row" style="margin-top:4px"><span class="sc-k">Earns on</span><span></span></div>
      <div style="margin-top:4px">${c.cats.map(t => `<span class="ctag">${t}</span>`).join('')}</div>
      <div class="sc-div"></div>
      <div style="font-size:10px;color:var(--text-3);margin-bottom:6px;font-weight:500">Perks</div>
      <div class="sc-perks">
        ${c.hi_perks.map(p => `<span class="perk hi">${p}</span>`).join('')}
        ${c.perks.map(p => `<span class="perk">${p}</span>`).join('')}
      </div>
    </div>`).join('');
}

/* ── EXPORT: CSV ── */
function exportCSV() {
  const { assignments } = computeAssignments();
  const rows = CATS.map(cat => {
    const amt = spends[cat.id] || 0;
    if (!amt) return null;
    const a = assignments[cat.id];
    if (!a) return null;
    const p = a.segments[0];
    return {
      category: cat.label, spend: amt,
      card: shortName(p.card),
      rate: p.rate % 1 === 0 ? p.rate : p.rate.toFixed(1),
      miles: a.totalMiles,
      value: (a.totalMiles * 0.02).toFixed(2)
    };
  }).filter(Boolean);

  if (!rows.length) { setStatus('No spend data to export.', 'err'); return; }

  const header = 'Category,Spend (S$),Best Card,Rate (mpd),Miles Earned,Est. Value (S$)\n';
  const body   = rows.map(r => `${r.category},${r.spend},${r.card},${r.rate},${r.miles},${r.value}`).join('\n');
  const ts     = rows.reduce((s, r) => s + r.spend, 0);
  const tm     = rows.reduce((s, r) => s + r.miles, 0);
  const total  = `\nTOTAL,${ts},,,"${tm}","${(tm * 0.02).toFixed(2)}"`;

  const blob = new Blob([header + body + total], { type: 'text/csv' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `miles_tracker_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setStatus('CSV downloaded!', 'ok');
}

/* ── EXPORT: NOTION ── */
function exportNotion() {
  const { assignments } = computeAssignments();
  const rows = CATS.map(cat => {
    const amt = spends[cat.id] || 0;
    if (!amt) return null;
    const a = assignments[cat.id];
    if (!a) return null;
    const p = a.segments[0];
    return {
      category: cat.label, spend: amt,
      card: shortName(p.card),
      rate: p.rate % 1 === 0 ? p.rate : p.rate.toFixed(1),
      miles: a.totalMiles,
      value: (a.totalMiles * 0.02).toFixed(2)
    };
  }).filter(Boolean);

  if (!rows.length) { setStatus('No spend data to export.', 'err'); return; }

  const ts    = rows.reduce((s, r) => s + r.spend, 0);
  const tm    = rows.reduce((s, r) => s + r.miles, 0);
  const date  = new Date().toISOString().slice(0, 10);
  const trows = rows.map(r =>
    `| ${r.category} | S$${fmt(r.spend)} | ${r.card} | ${r.rate} mpd | ${fmt(r.miles)} | S$${r.value} |`
  ).join('\n');

  const content = `# Miles Tracker — ${date}

## Summary
- **Total spend:** S$${fmt(ts)}
- **Total miles:** ${fmt(tm)}
- **Estimated value:** S$${Math.round(tm * 0.02).toLocaleString()} (at S$0.02/mile)
- **Cards used:** ${selCards.size}

## Spend Breakdown

| Category | Spend | Best Card | Rate | Miles | Est. Value |
|---|---|---|---|---|---|
${trows}

---
*Estimates only. Actual miles depend on bank T&Cs. Verify with your card issuer.*`;

  const msg = `Please export this miles tracker data to Notion as a new page titled "Miles Tracker — ${date}":\n\n${content}`;

  if (window.sendPrompt) {
    window.sendPrompt(msg);
    setStatus('Sending to Notion...', 'ok');
  } else {
    navigator.clipboard.writeText(content).then(() => {
      setStatus('Copied to clipboard — paste into Notion!', 'ok');
    }).catch(() => {
      setStatus('Copy the data from the CSV export instead.', 'err');
    });
  }
}

function setStatus(msg, type) {
  ['expStatus', 'expStatus2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.className = 'exp-status' + (type ? ' ' + type : ''); }
  });
  setTimeout(() => {
    ['expStatus', 'expStatus2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
  }, 4000);
}

/* ── INIT ── */
renderPicker();
renderCatTableStructure();
calc();
