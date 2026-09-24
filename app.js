/* Ganti nilai placeholder ini saat data telah tersedia. */
const CONFIG = {
  giftAddress: '[Isi alamat kado]',
  bank2LogoUrl: '[Isi link logo bank kedua]',
  brandLogoUrl: '[Isi link logo brand/kredit]',
  sharedWishesUrl: '[Isi link tautan formulir ucapan bersama]'
};

const $ = (selector) => document.querySelector(selector);
const eventDate = Date.UTC(2026, 9, 1, 2, 41, 0); // 1 Okt 2026, 10:41 WITA (UTC+8)
const guestFromUrl = new URLSearchParams(location.search).get('to');
let guestName = cleanName(guestFromUrl) || 'Taufiq Ahmadi';
let toastTimer;

function cleanName(value) {
  return (value || '').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function isConfigured(value) {
  return Boolean(value && !/^\[Isi .+\]$/.test(value.trim()));
}

function safeLink(value) {
  try {
    const url = new URL(value, location.href);
    return url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin) ? url.href : null;
  } catch { return null; }
}

function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('is-visible'), 3000);
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      if (!document.execCommand('copy')) throw new Error('Gagal menyalin');
      area.remove();
    }
    return true;
  } catch {
    toast('Gagal menyalin. Silakan pilih dan salin teks secara manual.');
    return false;
  }
}

function setGuest(name) {
  guestName = name;
  $('#coverGuest').textContent = name;
  $('#rsvpName').value = name;
  $('#wishName').value = name;
  $('#guestInput').value = name;
}
setGuest(guestName);

const audio = $('#backgroundMusic');
const musicButton = $('#musicControl');
function updateMusicButton() {
  const playing = !audio.paused;
  musicButton.setAttribute('aria-pressed', String(playing));
  musicButton.setAttribute('aria-label', playing ? 'Jeda musik' : 'Putar musik');
}
async function playMusic() {
  try { await audio.play(); } catch { /* Pengunjung dapat menekan tombol musik lagi. */ }
  updateMusicButton();
}
audio.addEventListener('play', updateMusicButton);
audio.addEventListener('pause', updateMusicButton);
musicButton.addEventListener('click', () => audio.paused ? playMusic() : audio.pause());

function openInvitation(fromClick = false) {
  document.body.classList.remove('is-covered');
  $('#invitation').removeAttribute('inert');
  $('#cover').setAttribute('aria-hidden', 'true');
  musicButton.hidden = false;
  if (fromClick) {
    history.replaceState({}, '', location.pathname + location.search + '#open');
    window.scrollTo({ top: 0, behavior: 'auto' });
    playMusic();
    $('#opening').focus({ preventScroll: true });
  }
}
$('#openInvitation').addEventListener('click', () => openInvitation(true));
if (location.hash === '#open') openInvitation();

const guestDialog = $('#guestDialog');
$('#editGuest').addEventListener('click', () => guestDialog.showModal());
$('#applyGuest').addEventListener('click', () => {
  const name = cleanName($('#guestInput').value);
  if (!name) { $('#guestInput').focus(); toast('Masukkan nama tamu terlebih dahulu.'); return; }
  setGuest(name);
  const url = new URL(location.href);
  url.searchParams.set('to', name);
  url.hash = '';
  history.replaceState({}, '', url);
  guestDialog.close();
  toast('Nama tamu diterapkan. Tautan siap disalin.');
});
$('#copyGuestLink').addEventListener('click', async () => {
  const name = cleanName($('#guestInput').value);
  if (!name) { $('#guestInput').focus(); toast('Masukkan nama tamu terlebih dahulu.'); return; }
  setGuest(name);
  const url = new URL(location.href);
  url.searchParams.set('to', name);
  url.hash = '';
  history.replaceState({}, '', url);
  if (await copyText(url.href)) toast('Tautan untuk ' + name + ' tersalin.');
});

function updateCountdown() {
  let difference = Math.max(0, eventDate - Date.now());
  const days = Math.floor(difference / 86400000);
  difference %= 86400000;
  const hours = Math.floor(difference / 3600000);
  difference %= 3600000;
  const minutes = Math.floor(difference / 60000);
  const seconds = Math.floor((difference % 60000) / 1000);
  [['#countDays', days], ['#countHours', hours], ['#countMinutes', minutes], ['#countSeconds', seconds]].forEach(([id, value]) => { $(id).textContent = String(value).padStart(2, '0'); });
}
updateCountdown();
setInterval(updateCountdown, 1000);

function makeCalendar() {
  // Resepsi sesuai data: 00:41–03:41 WITA, lebih awal daripada akad pada hari yang sama.
  // Durasi akad tidak diberikan; kalender memakai blok satu jam dan menjelaskannya.
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Amelia dan Zeus//Undangan Pernikahan//ID','CALSCALE:GREGORIAN','METHOD:PUBLISH',
    'BEGIN:VEVENT','UID:amelia-zeus-resepsi-20261001@undangan.local','DTSTAMP:' + stamp,
    'DTSTART:20260930T164100Z','DTEND:20260930T194100Z','SUMMARY:Resepsi Amelia dan Zeus',
    'LOCATION:Four Points by Sheraton Makassar','DESCRIPTION:Resepsi 01 Oktober 2026 pukul 00:41–03:41 WITA.','END:VEVENT',
    'BEGIN:VEVENT','UID:amelia-zeus-akad-20261001@undangan.local','DTSTAMP:' + stamp,
    'DTSTART:20261001T024100Z','DTEND:20261001T034100Z','SUMMARY:Akad Nikah Amelia dan Zeus',
    'LOCATION:Four Points by Sheraton Makassar','DESCRIPTION:Akad dimulai 01 Oktober 2026 pukul 10:41 WITA. Waktu selesai belum ditentukan; blok kalender satu jam adalah perkiraan.','END:VEVENT','END:VCALENDAR'
  ];
  const fold = (line) => {
    const parts = [];
    let part = '', length = 0;
    for (const character of line) {
      const bytes = new TextEncoder().encode(character).length;
      if (length + bytes > 73) { parts.push(part); part = ' '; length = 1; }
      part += character; length += bytes;
    }
    parts.push(part);
    return parts.join('\r\n');
  };
  const content = lines.map(fold).join('\r\n') + '\r\n';
  const blobUrl = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = 'Amelia-Zeus-01-Oktober-2026.ics';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  toast('Jadwal akad dan resepsi diunduh.');
}
$('#addCalendar').addEventListener('click', makeCalendar);

document.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
  if (await copyText(button.dataset.copy)) toast('Nomor rekening tersalin.');
}));
if (isConfigured(CONFIG.giftAddress)) {
  $('#giftAddress').textContent = CONFIG.giftAddress;
  $('#copyAddress').disabled = false;
  $('#copyAddress').removeAttribute('title');
  $('#copyAddress').addEventListener('click', async () => {
    if (await copyText('Amelia — ' + CONFIG.giftAddress)) toast('Alamat kado tersalin.');
  });
}
if (isConfigured(CONFIG.bank2LogoUrl) && safeLink(CONFIG.bank2LogoUrl)) {
  const image = document.createElement('img');
  image.className = 'bank__logo'; image.src = safeLink(CONFIG.bank2LogoUrl); image.alt = 'Logo BCA';
  $('.bank__placeholder').replaceWith(image);
}
if (isConfigured(CONFIG.brandLogoUrl) && safeLink(CONFIG.brandLogoUrl)) {
  const image = document.createElement('img');
  image.src = safeLink(CONFIG.brandLogoUrl); image.alt = 'Logo kreasidikamala';
  image.className = 'brand__image';
  $('.brand__mark').replaceWith(image);
}

const galleryButtons = [...document.querySelectorAll('[data-gallery]')];
const galleryDialog = $('#galleryDialog');
let galleryIndex = 0;
function showPhoto(index) {
  galleryIndex = (index + galleryButtons.length) % galleryButtons.length;
  const thumb = galleryButtons[galleryIndex].querySelector('img');
  $('#largePhoto').src = thumb.src;
  $('#largePhoto').alt = thumb.alt;
  $('#galleryCaption').textContent = (galleryIndex + 1) + ' / ' + galleryButtons.length + ' · ' + thumb.alt;
  if (!galleryDialog.open) galleryDialog.showModal();
}
galleryButtons.forEach((button, index) => button.addEventListener('click', () => showPhoto(index)));
$('#prevGallery').addEventListener('click', () => showPhoto(galleryIndex - 1));
$('#nextGallery').addEventListener('click', () => showPhoto(galleryIndex + 1));
$('#closeGallery').addEventListener('click', () => galleryDialog.close());
document.addEventListener('keydown', (event) => {
  if (!galleryDialog.open) return;
  if (event.key === 'ArrowLeft') showPhoto(galleryIndex - 1);
  if (event.key === 'ArrowRight') showPhoto(galleryIndex + 1);
});

function readStored(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function saveStored(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
const rsvpKey = 'amelia-zeus-rsvp';
const wishesKey = 'amelia-zeus-wishes';
let savedRsvp = readStored(rsvpKey, null);
if (savedRsvp && savedRsvp.name === guestName) {
  $('#attendance').value = savedRsvp.attendance;
  $('#guestCount').value = savedRsvp.count;
  $('#rsvpFeedback').textContent = 'RSVP Anda tersimpan di perangkat ini. Anda dapat memperbaruinya.';
}
$('#attendance').addEventListener('change', (event) => {
  $('#guestCount').disabled = event.target.value === 'tidak';
});
$('#rsvpForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = cleanName($('#rsvpName').value);
  const attendance = $('#attendance').value;
  const count = attendance === 'hadir' ? $('#guestCount').value : '0';
  if (!name || !attendance) return;
  savedRsvp = { name, attendance, count, updatedAt: new Date().toISOString() };
  const stored = saveStored(rsvpKey, savedRsvp);
  $('#rsvpFeedback').textContent = stored
    ? (attendance === 'hadir' ? 'Terima kasih, konfirmasi kehadiran Anda tersimpan di perangkat ini.' : 'Terima kasih sudah memberi kabar. Konfirmasi Anda tersimpan di perangkat ini.')
    : 'Konfirmasi belum dapat disimpan di perangkat ini.';
});

let wishes = readStored(wishesKey, []);
if (!Array.isArray(wishes)) wishes = [];
function renderWishes() {
  const list = $('#wishesList');
  list.replaceChildren();
  if (!wishes.length) {
    const empty = document.createElement('p'); empty.className = 'empty-note';
    empty.textContent = 'Belum ada ucapan di perangkat ini. Jadilah yang pertama mengirim doa.';
    list.append(empty); return;
  }
  wishes.slice(0, 30).forEach((wish) => {
    const article = document.createElement('article'); article.className = 'wish-item';
    const head = document.createElement('div'); head.className = 'wish-item__head';
    const name = document.createElement('strong'); name.textContent = wish.name;
    const time = document.createElement('time'); time.dateTime = wish.at;
    time.textContent = new Date(wish.at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const message = document.createElement('p'); message.textContent = wish.message;
    head.append(name, time); article.append(head, message); list.append(article);
  });
}
renderWishes();
const sharedForm = isConfigured(CONFIG.sharedWishesUrl) ? safeLink(CONFIG.sharedWishesUrl) : null;
if (sharedForm) {
  $('#wishesForm').hidden = true;
  $('#sharedWishesLink').href = sharedForm;
  $('#sharedWishesLink').hidden = false;
  $('#storageNote').textContent = 'RSVP tersimpan di perangkat ini. Untuk ucapan bersama, gunakan formulir pada tautan di atas.';
  $('#wishesList').parentElement.hidden = true;
}
$('#wishesForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = cleanName($('#wishName').value);
  const message = $('#wishMessage').value.trim().slice(0, 700);
  if (!name || !message) return;
  const next = [{ name, message, at: new Date().toISOString() }, ...wishes].slice(0, 30);
  if (!saveStored(wishesKey, next)) {
    $('#wishFeedback').textContent = 'Ucapan belum dapat disimpan di perangkat ini.'; return;
  }
  wishes = next;
  renderWishes();
  $('#wishMessage').value = '';
  $('#wishFeedback').textContent = 'Terima kasih. Ucapan tampil dan tersimpan di perangkat ini.';
});

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.09, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
}

// Structured actions for browsers that support WebMCP; the visible forms remain the source of truth.
const modelContext = document.modelContext;
if (modelContext?.registerTool) {
  const register = (tool) => {
    try { Promise.resolve(modelContext.registerTool(tool)).catch(() => {}); } catch { /* Browser support varies. */ }
  };
  register({
    name: 'personalize_guest_link', title: 'Buat tautan nama tamu',
    description: 'Set the wedding invitation guest name and return its personalized cover URL.',
    inputSchema: { type: 'object', properties: { name: { type: 'string', minLength: 1, maxLength: 80 } }, required: ['name'], additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      const name = cleanName(input?.name);
      if (!name) throw new Error('Nama tamu wajib diisi.');
      $('#guestInput').value = name;
      $('#applyGuest').click();
      const url = new URL(location.href); url.hash = '';
      return { name, url: url.href };
    }
  });
  register({
    name: 'save_local_rsvp', title: 'Simpan RSVP',
    description: 'Save a guest RSVP in this browser and update the visible confirmation. This does not sync across devices.',
    inputSchema: { type: 'object', properties: { name: { type: 'string', minLength: 1, maxLength: 80 }, attendance: { type: 'string', enum: ['hadir', 'tidak'] }, count: { type: 'integer', minimum: 1, maximum: 4 } }, required: ['name', 'attendance'], additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      const name = cleanName(input?.name);
      if (!name || !['hadir', 'tidak'].includes(input?.attendance) || (input.attendance === 'hadir' && ![1, 2, 3, 4].includes(input.count))) throw new Error('Isi nama, kehadiran, dan jumlah tamu 1–4 jika hadir.');
      $('#rsvpName').value = name;
      $('#attendance').value = input.attendance;
      $('#guestCount').value = String(input.count || 1);
      $('#rsvpForm').requestSubmit();
      return { name, attendance: input.attendance, count: input.attendance === 'hadir' ? input.count : 0, message: $('#rsvpFeedback').textContent };
    }
  });
  if (!sharedForm) register({
    name: 'add_local_wish', title: 'Kirim ucapan',
    description: 'Add a wedding wish to the visible list in this browser. It does not sync across devices.',
    inputSchema: { type: 'object', properties: { name: { type: 'string', minLength: 1, maxLength: 80 }, message: { type: 'string', minLength: 1, maxLength: 700 } }, required: ['name', 'message'], additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    execute(input) {
      const name = cleanName(input?.name), message = String(input?.message || '').trim().slice(0, 700);
      if (!name || !message) throw new Error('Nama dan ucapan wajib diisi.');
      $('#wishName').value = name;
      $('#wishMessage').value = message;
      $('#wishesForm').requestSubmit();
      return { name, message, result: $('#wishFeedback').textContent };
    }
  });
}
