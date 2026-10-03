const app = document.querySelector('#app');
const appConfig = window.SECO_CONFIG || {
  apiBaseUrl: '/api/v1',
  wsBaseUrl: '',
  requestTimeoutMs: 30000,
  sessionPollIntervalMs: 5000,
  allowDemoFallback: true,
  authStorageKey: 'seco.accessToken',
  userStorageKey: 'seco.user',
  endpoints: { stations: '/stations' }
};

function resolveApiUrl(endpoint) {
  const base = appConfig.apiBaseUrl.replace(/\/+$/, '');
  const path = String(endpoint || '').replace(/^\/+/, '');
  return `${base}/${path}`;
}

function resolveWsUrl(path = '') {
  const base = appConfig.wsBaseUrl.replace(/\/+$/, '');
  return `${base}/${String(path).replace(/^\/+/, '')}`;
}

async function apiRequest(endpoint, options = {}) {
  if (!endpoint) return null;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), appConfig.requestTimeoutMs);
  try {
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');
    const token = window.localStorage?.getItem(appConfig.authStorageKey || 'seco.accessToken');
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    return await fetch(resolveApiUrl(endpoint), {
      ...options,
      headers,
      signal: controller.signal
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

function saveAuthSession(payload) {
  const token = payload?.access_token;
  const user = payload?.user || (payload?.user_id ? payload : null);
  if (token) window.localStorage?.setItem(appConfig.authStorageKey || 'seco.accessToken', token);
  if (user) window.localStorage?.setItem(appConfig.userStorageKey || 'seco.user', JSON.stringify(user));
  if (user) {
    state.user = user;
    state.balance = Number(user.balance_vnd ?? state.balance);
  }
}

function clearAuthSession() {
  window.localStorage?.removeItem(appConfig.authStorageKey || 'seco.accessToken');
  window.localStorage?.removeItem(appConfig.userStorageKey || 'seco.user');
  state.user = null;
}

const stations = [
  { id: 'SECO-01', name: 'Lab IoT · trạm thật', distance: '0.6 km', address: 'Phòng Lab IoT, tầng 2, toà Alpha', status: 'READY', tone: 'green', price: '4.000đ/kWh', power: '0.15 kW', temperature: '31°C', connectors: '1 cổng', lat: 21.0278, lng: 105.8342 },
  { id: 'SECO-06', name: 'Ký túc xá B', distance: '1.0 km', address: 'Tầng hầm KTX B', status: 'CHARGING', tone: 'blue', price: '4.000đ/kWh', power: '0.15 kW', temperature: '33°C', connectors: '2 cổng', lat: 21.0300, lng: 105.8400 },
  { id: 'SECO-04', name: 'Bãi xe Beta', distance: '1.2 km', address: 'Bãi xe ngoài trời, khu Beta', status: 'ERROR', tone: 'red', price: '4.000đ/kWh', power: '0.15 kW', temperature: '37°C', connectors: '2 cổng', lat: 21.0245, lng: 105.8380 },
  { id: 'SECO-02', name: 'Nhà xe A', distance: '1.4 km', address: 'Nhà xe A, cổng phía đông', status: 'CHARGING', tone: 'blue', price: '4.000đ/kWh', power: '0.15 kW', temperature: '32°C', connectors: '2 cổng', lat: 21.0252, lng: 105.8310 },
  { id: 'SECO-05', name: 'Cổng chính', distance: '1.4 km', address: 'Bãi đỗ cổng chính', status: 'MAINTENANCE', tone: 'orange', price: '4.000đ/kWh', power: '0.15 kW', temperature: '30°C', connectors: '1 cổng', lat: 21.0320, lng: 105.8385 },
  { id: 'SECO-03', name: 'Toà Innovation', distance: '1.7 km', address: 'Sảnh B, toà Innovation', status: 'READY', tone: 'green', price: '4.000đ/kWh', power: '0.15 kW', temperature: '31°C', connectors: '2 cổng', lat: 21.0288, lng: 105.8270 },
  { id: 'SECO-07', name: 'Thư viện', distance: '1.8 km', address: 'Bãi xe thư viện trung tâm', status: 'Offline', tone: 'gray', price: '4.000đ/kWh', power: '0.15 kW', temperature: '—', connectors: '1 cổng', lat: 21.0330, lng: 105.8320 }
];

const transactions = [
  { id: 'TX-3036', title: 'Trừ tiền phiên sạc', time: '01/10 18:35', station: 'SECO-02', amount: -200, balance: '46.240đ', session: 'SS-1035' },
  { id: 'TX-2987', title: 'Trừ tiền phiên sạc', time: '29/09 13:43', station: 'SECO-01', amount: -100, balance: '46.440đ', session: 'SS-1028' },
  { id: 'TX-2984', title: 'Trừ tiền phiên sạc', time: '29/09 08:19', station: 'SECO-02', amount: -1100, balance: '46.540đ', session: 'SS-1024' },
  { id: 'TX-2972', title: 'Trừ tiền phiên sạc', time: '27/09 17:18', station: 'SECO-02', amount: -535, balance: '47.640đ', session: 'SS-1016' },
  { id: 'TX-2910', title: 'Trừ tiền phiên sạc', time: '26/09 13:06', station: 'SECO-01', amount: -200, balance: '48.175đ', session: 'SS-1009' },
  { id: 'TX-2801', title: 'Nạp tiền (Demo)', time: '22/09 21:31', station: '', amount: 50000, balance: '50.000đ', session: '' }
];

const chargingHistory = [
  { id: 'SS-1035', station: 'SECO-02 · Nhà xe A', date: '01/10 18:15', reason: 'Đạt ngân sách', cost: 200, energy: '0.0500 kWh', duration: '20 phút' },
  { id: 'SS-1028', station: 'SECO-01 · Lab IoT · trạm thật', date: '29/09 13:33', reason: 'Đạt ngân sách', cost: 100, energy: '0.0250 kWh', duration: '10 phút' },
  { id: 'SS-1024', station: 'SECO-02 · Nhà xe A', date: '29/09 06:29', reason: 'Rút sạc', cost: 1100, energy: '0.2750 kWh', duration: '1 giờ 50 phút' },
  { id: 'SS-1016', station: 'SECO-02 · Nhà xe A', date: '27/09 16:24', reason: 'Rút sạc', cost: 535, energy: '0.1338 kWh', duration: '53 phút' },
  { id: 'SS-1009', station: 'SECO-01 · Lab IoT · trạm thật', date: '26/09 12:46', reason: 'Đạt ngân sách', cost: 200, energy: '0.0500 kWh', duration: '20 phút' },
  { id: 'SS-1002', station: 'SECO-02 · Nhà xe A', date: '25/09 03:43', reason: 'Rút sạc', cost: 775, energy: '0.1938 kWh', duration: '1 giờ 17 phút' },
  { id: 'SS-0994', station: 'SECO-06 · Ký túc xá B', date: '23/09 19:48', reason: 'Rút sạc', cost: 850, energy: '0.2125 kWh', duration: '1 giờ 25 phút' }
];

const state = {
  screen: 'login',
  mode: 'user',
  role: 'USER',
  station: stations[0],
  mapQuery: '',
  mapSelectedStationId: null,
  mapStatusFilter: 'ALL',
  userLocation: null,
  geoWatchId: null,
  filter: 'Tất cả',
  budget: null,
  customBudget: '',
  rfidReady: false,
  balance: 46240,
  topupAmount: 20000,
  activeSession: false,
  elapsed: 0,
  result: chargingHistory[0],
  selectedTransaction: transactions[0],
  selectedHistory: chargingHistory[0],
  maintenanceProgress: 35,
  maintenanceStatus: 'Đang xử lý',
  recoveryEmail: 'anh.tm@seco.vn',
  recoverySent: false,
  settingsSection: 'notifications',
  notificationsEnabled: true,
  favoriteNotificationsEnabled: true,
  language: 'Tiếng Việt',
  paymentMethod: 'Sandbox Demo',
  vehicleAdded: false,
  helpTopic: 'Vì sao cần quẹt RFID trước khi sạc?',
  sessionId: null,
  sessionSocket: null,
  sessionTicker: null,
  sessionPoller: null,
  sessionPollFailures: 0,
  sessionLive: { energyKwh: 0, cost: 0, powerKw: 0.15, temperature: 31, elapsedSeconds: 0 },
  startingSession: false,
  rfidUid: '',
  user: null,
  maintenanceAssigned: false,
  maintenanceStarted: false,
  maintenanceChecks: [false, false, false, false, false],
  maintenancePhoto: null,
  maintenancePhotoName: '',
  repairHistory: [],
  stationsInitialized: false,
  previousStationStatuses: {}
};

const requestedScreen = new URLSearchParams(window.location.search).get('screen');
const deepLinkScreens = ['map', 'stations', 'stationDetail', 'setup', 'rfid', 'active', 'sessionHub', 'result', 'wallet', 'topup', 'transactions', 'transactionDetail', 'history', 'historyDetail', 'profile', 'forgotPassword', 'stationFilters', 'shareStation', 'walletQr', 'rfidCard', 'settings', 'changePassword', 'vehicles', 'vehicleEditor', 'help', 'helpArticle', 'techHome', 'techMap', 'notifications', 'faultDetail', 'maintenance', 'repairReport', 'repairHistory'];
if (deepLinkScreens.includes(requestedScreen)) state.screen = requestedScreen;

const money = (value) => `${Math.abs(Math.round(value)).toLocaleString('vi-VN')}đ`;
const signedMoney = (value) => `${value >= 0 ? '+' : '-'}${money(value)}`;
const lucideNames = { bolt: 'zap', map: 'map', history: 'history', wallet: 'wallet', user: 'user-round', search: 'search', back: 'chevron-left', share: 'share-2', sliders: 'sliders-horizontal', lock: 'lock', qr: 'qr-code', bell: 'bell', wrench: 'wrench', check: 'check', plug: 'plug', card: 'credit-card', plus: 'plus', arrow: 'chevron-right', alert: 'triangle-alert', report: 'file-text', calendar: 'calendar-days', signal: 'signal', wifi: 'wifi', battery: 'battery-full', mail: 'mail', message: 'message-circle', copy: 'copy', close: 'x', pin: 'map-pin', navigation: 'navigation', download: 'download', language: 'languages', key: 'key-round', car: 'car-front', help: 'circle-help', device: 'smartphone', arrowDown: 'arrow-down-left', list: 'list' };
const icon = (name) => `<i class="icon icon-${name}" data-lucide="${lucideNames[name] || name}" aria-hidden="true"></i>`;
const stationTone = (status) => ({ READY: 'green', CHARGING: 'blue', ERROR: 'red', MAINTENANCE: 'orange' }[status] || 'gray');
const normalizeStation = (station) => ({
  ...station,
  id: station.id ?? station.station_id,
  name: station.name || station.station_id || 'Trạm sạc SECO',
  address: station.address || station.location || 'Vị trí theo tọa độ GPS',
  distance: station.distance || '—',
  connectors: station.connectors || station.connector_count || (station.connector_lock === 'LOCKED' ? 'Đang khoá' : station.connector_lock === 'UNLOCKED' ? 'Mở' : '—'),
  power: station.power || (station.power_kw != null ? `${station.power_kw} kW` : '—'),
  temperature: station.temperature || '—',
  price: station.price || (station.price_per_kwh_vnd != null ? `${Number(station.price_per_kwh_vnd).toLocaleString('vi-VN')}đ/kWh` : '—'),
  lat: Number(station.lat ?? station.latitude),
  lng: Number(station.lng ?? station.longitude),
  tone: station.tone || stationTone(station.status)
});

function statusBadge(status, tone = '') { return `<span class="badge ${tone}">${status}</span>`; }
function pageHead(title, back = 'map', action = '') {
  return `<div class="topbar"><button class="icon-btn" data-action="screen" data-screen="${back}" aria-label="Quay lại">${icon('back')}</button><h1 class="screen-title">${title}</h1>${action}</div>`;
}
function userBottom(active = 'map') {
  const items = [['map', icon('map'), 'Trạm'], ['sessionHub', icon('bolt'), 'Sạc'], ['wallet', icon('wallet'), 'Ví'], ['profile', icon('user'), 'Tôi']];
  return `<nav class="bottom-nav">${items.map(([screen, glyph, label]) => `<button class="nav-item ${active === screen ? 'active' : ''}" data-action="screen" data-screen="${screen}"><i>${glyph}</i><span>${label}</span></button>`).join('')}</nav>`;
}
function techBottom(active = 'techHome') {
  const items = [['techHome', icon('wrench'), 'Tổng quan'], ['techMap', icon('map'), 'Bản đồ'], ['notifications', icon('bell'), 'Thông báo'], ['profile', icon('user'), 'Tài khoản']];
  return `<nav class="bottom-nav">${items.map(([screen, glyph, label]) => `<button class="nav-item ${active === screen ? 'active' : ''}" data-action="screen" data-screen="${screen}"><i>${glyph}</i><span>${label}</span></button>`).join('')}</nav>`;
}
function shell(body, nav = '', extra = '') {
  return `<div class="phone"><div class="app-screen"><div class="statusbar"><span>09:32</span><span class="status-icons">${icon('signal')}${icon('wifi')}${icon('battery')}</span></div>${body}${nav}${extra}</div></div>`;
}
function content(body, cls = '') { return `<section class="content ${cls}">${body}</section>`; }

function loginScreen() {
  return shell(`<section class="login"><div class="logo-mark">${icon('bolt')}</div><h1>Chào mừng trở lại</h1><p class="login-copy">Đăng nhập để tìm trạm, theo dõi phiên sạc<br/>và ví của bạn.</p><div class="stack"><div class="field"><label for="email">Email</label><input id="email" value="anh.tm@seco.vn" type="email" /></div><div class="field"><label for="password">Mật khẩu</label><input id="password" value="seco-demo" type="password" /></div><button class="btn btn-primary btn-block" data-action="login">Đăng nhập</button></div><button class="btn btn-quiet" data-action="screen" data-screen="forgotPassword" style="align-self:flex-end;background:transparent;padding:0;margin-top:7px;text-decoration:underline;">Quên mật khẩu?</button><p class="login-foot">Chưa có tài khoản? <strong>Liên hệ quản trị viên để được cấp<br/>thẻ RFID.</strong></p></section>`);
}

function forgotPasswordScreen() {
  const sent = state.recoverySent;
  return shell(content(`${pageHead('Quên mật khẩu', 'login')}<div class="auth-illustration">${sent ? icon('check') : icon('mail')}</div><div class="result-head"><h2>${sent ? 'Kiểm tra hộp thư của bạn' : 'Khôi phục mật khẩu'}</h2><p>${sent ? `Liên kết đặt lại mật khẩu đã được gửi tới <strong>${state.recoveryEmail}</strong>.` : 'Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết để bạn tạo mật khẩu mới.'}</p></div>${sent ? `<div class="notice">Liên kết có hiệu lực trong 15 phút. Nếu chưa thấy email, hãy kiểm tra mục Spam hoặc thử lại.</div><button class="btn btn-primary btn-block" data-action="screen" data-screen="login" style="margin-top:14px">Quay lại đăng nhập</button>` : `<div class="field"><label for="recovery-email">Email tài khoản</label><input id="recovery-email" type="email" value="${state.recoveryEmail}" data-action="recoveryEmail" placeholder="you@example.com" /></div><div class="notice" style="margin-top:12px">Bạn vẫn cần thẻ RFID đang hoạt động để tiếp tục sử dụng dịch vụ sau khi đổi mật khẩu.</div><div class="sticky-action"><button class="btn btn-primary btn-block" data-action="resetPassword">Gửi liên kết đặt lại</button></div>`}`));
}

function stationFiltersScreen() {
  const options = [['Tất cả', 'Hiển thị toàn bộ trạm'], ['READY', 'Chỉ trạm đang sẵn sàng'], ['CHARGING', 'Trạm đang có phiên sạc'], ['ERROR', 'Trạm cần xử lý lỗi']];
  return shell(content(`${pageHead('Bộ lọc trạm', 'stations')}<div class="section-label">Trạng thái trạm</div><div class="option-list">${options.map(([value, description]) => `<button class="option-row ${state.filter === value ? 'selected' : ''}" data-action="filter" data-filter="${value}"><span><strong>${value === 'Tất cả' ? value : value === 'READY' ? 'Sẵn sàng' : value === 'CHARGING' ? 'Đang sạc' : 'Có lỗi'}</strong><small>${description}</small></span><span class="option-check">${state.filter === value ? icon('check') : ''}</span></button>`).join('')}</div><div class="section-label">Khoảng cách</div><div class="info-card"><div class="row"><span>Trong bán kính 5 km</span><strong>Đang bật</strong></div><input class="range" type="range" min="1" max="10" value="5" aria-label="Khoảng cách tìm trạm" /></div><div class="sticky-action"><button class="btn btn-primary btn-block" data-action="screen" data-screen="stations">Áp dụng bộ lọc</button></div>`));
}

function shareStationScreen() {
  return shell(content(`${pageHead('Chia sẻ trạm', 'stationDetail')}<div class="station-hero"><div class="row">${statusBadge(state.station.status, state.station.tone)}<span class="subtle">${state.station.distance}</span></div><h2>${state.station.id} · ${state.station.name}</h2><p>${icon('pin')} ${state.station.address}</p></div><div class="section-label">Chia sẻ với</div><div class="share-grid"><button class="share-item" data-action="toast">${icon('message')}<strong>Tin nhắn</strong><small>Gửi liên kết</small></button><button class="share-item" data-action="toast">${icon('share')}<strong>Ứng dụng khác</strong><small>Mở bảng chia sẻ</small></button><button class="share-item" data-action="copyStation">${icon('copy')}<strong>Sao chép link</strong><small>seco.app/${state.station.id}</small></button></div><div class="notice" style="margin-top:15px">Bạn có thể gửi tên trạm, khoảng cách và trạng thái hiện tại cho người khác.</div>`));
}

function getMapStations() {
  return stations.filter(station => stationMatchesQuery(station));
}

function stationMatchesQuery(station, query = state.mapQuery) {
  const normalizedQuery = String(query || '').trim().toLocaleLowerCase('vi-VN');
  if (!normalizedQuery) return true;
  return [station.id, station.name, station.address, station.status].some(value => String(value || '').toLocaleLowerCase('vi-VN').includes(normalizedQuery));
}

function stationSheetMarkup(selected, technician = false) {
  if (!selected) return '';
  if (technician) return `<div class="station-sheet"><div class="grabber"></div><div style="margin-bottom:4px"><strong>${selected.id}</strong><div class="subtle">${selected.address} · ${selected.status}</div></div><div class="metric-grid"><div class="metric"><span>Trạng thái</span><strong>${selected.status}</strong></div><div class="metric"><span>Nhiệt độ</span><strong>${selected.temperature || '—'}</strong></div><div class="metric"><span>Cổng</span><strong>${selected.connectors || '—'}</strong></div></div><button class="btn btn-primary btn-block" data-action="screen" data-screen="faultDetail" style="margin-top:12px">Mở chi tiết xử lý</button></div>`;
  return `<div class="station-sheet"><div class="grabber"></div><div style="margin-bottom:4px"><strong>${selected.id}</strong><div class="subtle">${selected.address} · ${selected.distance}</div></div><div class="metric-grid"><div class="metric"><span>Giá</span><strong>4.000đ</strong></div><div class="metric"><span>Đầu cắm</span><strong>${selected.connectors || '1 cổng'}</strong></div><div class="metric"><span>Nhiệt độ</span><strong>${selected.temperature || '—'}</strong></div></div><div class="sheet-actions"><button class="btn btn-secondary btn-compact" data-action="directions" title="Mở chỉ đường">${icon('navigation')} Chỉ đường</button><button class="btn btn-primary btn-compact" data-action="screen" data-screen="stationDetail">Xem chi tiết trạm</button></div></div>`;
}

function renderMapSheet(selected = null, technician = state.screen === 'techMap') {
  const wrapper = document.querySelector('.map-wrap');
  const container = document.querySelector('#station-sheet-container');
  if (!wrapper || !container) return;
  wrapper.classList.toggle('has-selection', Boolean(selected));
  wrapper.classList.toggle('full-map', !selected);
  container.innerHTML = stationSheetMarkup(selected, technician);
  refreshIcons();
  window.requestAnimationFrame(() => stationMap?.invalidateSize({ animate: false }));
}

function mapScreen() {
  const visibleStations = getMapStations();
  const ready = visibleStations.filter(s => s.status === 'READY').length;
  const selected = state.mapSelectedStationId ? stations.find(s => s.id === state.mapSelectedStationId) : null;
  return shell(content(`<div class="map-wrap ${selected ? 'has-selection' : 'full-map'}"><div class="map-area"><div id="station-map" class="map-canvas" aria-label="Bản đồ các trạm sạc"></div><div class="map-overlay"><div class="search map-search"><span>${icon('search')}</span><input type="search" value="${state.mapQuery}" data-action="mapSearch" placeholder="Tìm trạm sạc, địa điểm..." /></div><div class="filters"><button class="chip ${state.mapStatusFilter === 'ALL' ? 'active' : ''}" data-action="mapStatusFilter" data-filter="ALL">Tất cả ${visibleStations.length}</button><button class="chip ${state.mapStatusFilter === 'READY' ? 'active' : ''}" data-action="mapStatusFilter" data-filter="READY"><span class="dot"></span>Sẵn sàng ${ready}</button><button class="chip" data-action="screen" data-screen="stations"><span class="chip-icon">${icon('list')}</span>Danh sách</button></div></div></div><div id="station-sheet-container">${stationSheetMarkup(selected)}</div></div>`, 'no-pad'), userBottom('map'));
}

function sessionHubScreen() {
  return state.activeSession ? activeScreen() : historyScreen();
}

function techMapScreen() {
  const visibleStations = getMapStations();
  const ready = visibleStations.filter(s => s.status === 'READY').length;
  const selected = state.mapSelectedStationId ? stations.find(s => s.id === state.mapSelectedStationId) : null;
  return shell(content(`<div class="map-wrap ${selected ? 'has-selection' : 'full-map'}"><div class="map-area"><div id="station-map" class="map-canvas" aria-label="Bản đồ các trạm sạc cho Technician"></div><div class="map-overlay"><div class="search map-search"><span>${icon('search')}</span><input type="search" value="${state.mapQuery}" data-action="mapSearch" placeholder="Tìm trạm cần sửa..." /></div><div class="filters"><button class="chip ${state.mapStatusFilter === 'ALL' ? 'active' : ''}" data-action="mapStatusFilter" data-filter="ALL">Tất cả ${visibleStations.length}</button><button class="chip ${state.mapStatusFilter === 'READY' ? 'active' : ''}" data-action="mapStatusFilter" data-filter="READY"><span class="dot"></span>Sẵn sàng ${ready}</button><button class="chip" data-action="screen" data-screen="notifications"><span class="chip-icon">${icon('alert')}</span>Sự cố</button></div></div></div><div id="station-sheet-container">${stationSheetMarkup(selected, true)}</div></div>`, 'no-pad'), techBottom('techMap'));
}

function stationsScreen() {
  const filtered = (state.filter === 'Tất cả' ? stations : stations.filter(s => s.status === state.filter)).filter(station => stationMatchesQuery(station));
  return shell(content(`${pageHead('Trạm sạc', 'map', `<button class="icon-btn" data-action="screen" data-screen="stationFilters">${icon('sliders')}</button>`)}<div class="search"><span>${icon('search')}</span><input type="search" value="${state.mapQuery}" data-action="stationSearch" placeholder="Tìm trạm" /></div><div class="filters"><button class="chip ${state.filter === 'Tất cả' ? 'active' : ''}" data-action="filter" data-filter="Tất cả">Tất cả</button><button class="chip ${state.filter === 'READY' ? 'active' : ''}" data-action="filter" data-filter="READY">Sẵn sàng</button><button class="chip ${state.filter === 'CHARGING' ? 'active' : ''}" data-action="filter" data-filter="CHARGING">Đang sạc</button><button class="chip ${state.filter === 'ERROR' ? 'active' : ''}" data-action="filter" data-filter="ERROR">Lỗi</button></div><div class="station-list">${filtered.map(s => `<button class="station-row" data-action="station" data-station="${s.id}"><div class="station-symbol">${icon('bolt')}</div><div class="station-text"><h3>${s.id} · ${s.name.replace(' · trạm thật', '')}</h3><p>${s.distance} · ${s.address}</p></div>${statusBadge(s.status, s.tone)}</button>`).join('')}</div>`), userBottom('map'));
}

function stationDetailScreen() {
  const s = state.station;
  return shell(content(`${pageHead(s.id, 'stations', `<button class="icon-btn" data-action="screen" data-screen="shareStation">${icon('share')}</button>`)}<div class="station-hero">${statusBadge(s.status, s.tone)}<h2>${s.name}</h2><p>${icon('pin')} ${s.address}</p><div class="metric-grid"><div class="metric"><span>Khoảng cách</span><strong>${s.distance}</strong></div><div class="metric"><span>Giá</span><strong>${s.price}</strong></div><div class="metric"><span>Công suất</span><strong>${s.power}</strong></div></div></div><div class="section-label">Trạng thái hiện tại</div><div class="info-card row"><div class="station-symbol">${icon('bolt')}</div><div style="flex:1"><strong>${s.status === 'READY' ? 'Sẵn sàng' : s.status === 'CHARGING' ? 'Đang có phiên sạc' : 'Cần kiểm tra'}</strong><div class="subtle">${s.status === 'READY' ? 'Có thể sạc ngay' : 'Cập nhật realtime từ trạm'}</div></div><small class="subtle">cập nhật 09:32:20</small></div><div class="section-label">Cách sạc tại trạm</div><div class="info-card"><div class="step-list"><div class="step"><div class="step-num">1</div><div><strong>Chọn ngân sách (tuỳ chọn)</strong><span>Đặt mức chi tối đa ngay trong ứng dụng</span></div></div><div class="step"><div class="step-num">2</div><div><strong>Quẹt thẻ RFID</strong><span>Backend xác thực UID thẻ trước khi sạc</span></div></div><div class="step"><div class="step-num">3</div><div><strong>Cắm sạc và bắt đầu</strong><span>Dữ liệu phiên được đồng bộ realtime từ backend</span></div></div></div></div><div class="sticky-action"><button class="btn btn-primary btn-block" data-action="startSetup">${icon('bolt')} Sạc tại trạm này</button></div>`), userBottom('map'));
}

function setupScreen() {
  const selected = state.budget === null ? 'unlimited' : String(state.budget);
  const choices = [['unlimited', 'Không giới hạn', 'tới khi rút'], ['50', '50đ', '≈ 5 phút'], ['100', '100đ', '≈ 10 phút'], ['200', '200đ', '≈ 20 phút'], ['500', '500đ', '≈ 50 phút'], ['1000', '1.000đ', '≈ 1g 40p']];
  const estimated = state.budget ? `Sạc khoảng ${Math.max(1, Math.round(state.budget / 10))} phút` : 'Sạc tới khi rút hoặc hết số dư';
  return shell(content(`${pageHead('Thiết lập phiên sạc', 'stationDetail')}<div class="info-card row"><div class="station-symbol">${icon('bolt')}</div><div style="flex:1"><strong>${state.station.id} · ${state.station.name}</strong><div class="subtle">4.000đ/kWh · 5đ mỗi 30 giây</div></div>${statusBadge('READY')}</div><div class="balance-card" style="margin-top:10px"><div class="row"><div><span class="subtle">Số dư khả dụng</span><br/><strong>${money(state.balance)}</strong></div><button class="btn btn-quiet" data-action="screen" data-screen="topup">＋ Nạp</button></div></div><div class="row section-label"><span>Ngân sách tối đa</span><span class="subtle" style="font-weight:500">tuỳ chọn</span></div><div class="budget-grid">${choices.map(([key, label, hint]) => `<button class="budget-choice ${selected === key ? 'active' : ''}" data-action="budget" data-budget="${key}">${label}<small>${hint}</small></button>`).join('')}</div><div class="field" style="margin-top:13px"><label for="custom-budget">Hoặc nhập số tiền (VND)</label><input id="custom-budget" value="${state.customBudget}" inputmode="numeric" placeholder="Ví dụ 300" data-action="customBudget" /><span class="subtle">Phải nhỏ hơn hoặc bằng số dư ${money(state.balance)}</span></div><div class="estimate"><span>Ước tính</span><strong>${estimated}</strong></div><div class="sticky-action"><button class="btn btn-primary btn-block" data-action="confirmSetup">Xác nhận và tới trạm</button></div>`));
}

function rfidScreen() {
  return shell(content(`${pageHead('Bắt đầu tại trạm', 'setup')}<div class="rfid"><div class="rfid-ring">${icon('qr')}</div><h2>${state.rfidReady ? 'Đã quét mã phần cứng' : `Quét mã tại ${state.station.id}`}</h2><p>${state.rfidReady ? 'Mã hợp lệ. Bây giờ hãy cắm sạc vào đầu cắm.' : 'Dùng camera hoặc đầu đọc trên thân trạm để xác thực phiên.'}</p></div><div class="field" style="margin-bottom:12px"><label for="rfid-uid">UID thẻ RFID</label><input id="rfid-uid" value="${state.rfidUid}" data-action="rfidUid" autocapitalize="characters" placeholder="Nhập mã đọc từ phần cứng" /></div><div class="info-card"><div class="step-list"><div class="step"><div class="step-num">1</div><div><strong>Quét mã trên phần cứng</strong><span>${state.rfidReady ? 'Mã thẻ đã được backend xác thực' : `Đang chờ mã từ evcs/${state.station.id}/req`}</span></div></div><div class="step"><div class="step-num">2</div><div><strong>Cắm sạc</strong><span>Micro-switch phát hiện PLUG</span></div></div><div class="step"><div class="step-num">3</div><div><strong>Phiên bắt đầu</strong><span>Ngân sách: ${state.budget ? money(state.budget) : 'không giới hạn'}</span></div></div></div></div><div class="demo-note">${icon('bolt')} Chỉ khi mã thẻ hợp lệ, nút cắm sạc mới gọi API backend.</div><div class="sticky-action"><div class="action-row"><button class="btn btn-secondary" data-action="rfid">${icon('qr')} ${state.rfidReady ? 'Đã xác thực' : 'Xác thực RFID'}</button><button class="btn ${state.rfidReady ? 'btn-primary' : 'btn-quiet'}" data-action="plug" ${state.rfidReady ? '' : 'disabled'}>${icon('plug')} Cắm sạc</button></div></div>`));
}

function activeScreen() {
  const budget = state.budget || state.balance;
  const cost = state.sessionLive.cost || 0;
  const progress = Math.min(100, Math.round((cost / budget) * 100));
  const elapsedMinutes = Math.floor((state.sessionLive.elapsedSeconds || 0) / 60);
  const temperature = typeof state.sessionLive.temperature === 'number' ? `${state.sessionLive.temperature}°C` : (state.sessionLive.temperature || state.station.temperature);
  return shell(content(`${pageHead('Phiên sạc', 'map')}<div class="session-hero"><div class="charging-orb">${icon('bolt')}</div><h2>Đang sạc tại ${state.station.id}</h2><p>Đồng bộ realtime · ${elapsedMinutes} phút</p></div><div class="info-card"><div class="row"><strong>Tiến độ ngân sách</strong><span class="subtle">${progress}%</span></div><div class="progress" style="margin-top:10px"><i style="width:${progress}%"></i></div></div><div class="live-grid" style="margin-top:11px"><div class="live-card"><span>Điện năng</span><strong>${Number(state.sessionLive.energyKwh || 0).toFixed(4)} kWh</strong></div><div class="live-card"><span>Chi phí hiện tại</span><strong>${money(cost)}</strong></div><div class="live-card"><span>Công suất</span><strong>${Number(state.sessionLive.powerKw || 0).toFixed(2)} kW</strong></div><div class="live-card"><span>Nhiệt độ</span><strong>${temperature}</strong></div></div><div class="notice" style="margin-top:13px">${icon('lock')} Đầu cắm đang khoá trong thời gian phiên sạc. Dữ liệu được cập nhật liên tục từ backend.</div><div class="sticky-action"><button class="btn btn-danger btn-block" data-action="stop">Dừng phiên sạc</button></div>`), userBottom('sessionHub'));
}

function resultScreen() {
  const r = state.result;
  return shell(content(`<div class="row"><h1 class="screen-title">Kết quả phiên</h1><button class="icon-btn" data-action="screen" data-screen="map" aria-label="Đóng">${icon('close')}</button></div><div class="result-head"><div class="result-icon">${icon('check')}</div><h2>Phiên sạc đã kết thúc</h2><p>Lý do: <strong>${r.reason}</strong> · MAX_BUDGET</p></div><div class="receipt"><div class="receipt-total"><span>Tổng thanh toán</span><strong>${money(r.cost)}</strong></div><div class="keyval"><span>Mã phiên</span><strong>${r.id}</strong></div><div class="keyval"><span>Trạm</span><strong>${state.station.id}</strong></div><div class="keyval"><span>Điện năng</span><strong>${r.energy}</strong></div><div class="keyval"><span>Thời lượng</span><strong>${r.duration}</strong></div><div class="keyval"><span>Giá</span><strong>4.000đ/kWh</strong></div><div class="keyval"><span>Ngân sách</span><strong>${state.budget ? money(state.budget) : 'Không giới hạn'}</strong></div><div class="divider"></div><div class="keyval"><span>Số dư trước</span><strong>${money(state.balance + r.cost)}</strong></div><div class="keyval"><span>Đã trừ</span><strong class="negative">-${money(r.cost)}</strong></div><div class="keyval"><span>Số dư còn lại</span><strong>${money(state.balance)}</strong></div></div><div class="sticky-action"><div class="action-row"><button class="btn btn-secondary" data-action="screen" data-screen="history">Lịch sử</button><button class="btn btn-primary" data-action="screen" data-screen="map">Về trang chủ</button></div></div>`));
}

function walletScreen() {
  return shell(content(`<div class="row"><h1 class="screen-title">Ví của tôi</h1><button class="icon-btn" data-action="screen" data-screen="walletQr">${icon('qr')}</button></div><div class="wallet-hero"><span>Số dư khả dụng</span><strong>${money(state.balance)}</strong><div class="wallet-meta"><div><small>Đang giữ</small><b>0đ</b></div><div><small>Đã chi tháng này</small><b>3.760đ</b></div><div><small>Thẻ</small><b>•• 1F:7C</b></div></div></div><div class="quick-actions" style="margin-top:13px"><button class="quick" data-action="screen" data-screen="topup"><i>${icon('plus')}</i>Nạp tiền</button><button class="quick" data-action="screen" data-screen="transactions"><i>${icon('wallet')}</i>Giao dịch</button><button class="quick" data-action="screen" data-screen="history"><i>${icon('history')}</i>Phiên sạc</button><button class="quick" data-action="screen" data-screen="rfidCard"><i>${icon('card')}</i>Thẻ RFID</button></div><div class="row section-label"><span>Giao dịch gần đây</span><button class="btn btn-quiet" data-action="screen" data-screen="transactions" style="padding:0;background:transparent;min-height:auto;font-size:12px">Xem tất cả</button></div><div class="transaction-list">${transactions.slice(0,5).map(transactionRow).join('')}</div>`), userBottom('wallet'));
}

function transactionRow(t) {
  return `<button class="transaction" data-action="transaction" data-id="${t.id}" style="width:100%;border-left:0;border-right:0;border-top:0;text-align:left;background:transparent"><div class="transaction-icon">${t.amount > 0 ? icon('arrowDown') : icon('bolt')}</div><div class="transaction-main"><strong>${t.title}</strong><span>${t.time}${t.station ? ` · ${t.station}` : ''}</span></div><div class="transaction-amount ${t.amount > 0 ? 'positive' : 'negative'}">${signedMoney(t.amount)}<small>SD ${t.balance}</small></div></button>`;
}

function topupScreen() {
  const amounts = [10000, 20000, 50000, 100000, 200000, 500000];
  return shell(content(`${pageHead('Nạp tiền', 'wallet')}<div class="info-card" style="text-align:center;padding:22px 12px"><span class="subtle">Số tiền nạp</span><strong style="font-size:32px;display:block;margin:4px 0">${money(state.topupAmount)}</strong><span class="subtle">Số dư sau khi nạp: ${money(state.balance + state.topupAmount)}</span></div><div class="budget-grid" style="margin-top:13px">${amounts.map(a => `<button class="budget-choice ${a === state.topupAmount ? 'active' : ''}" data-action="topupAmount" data-amount="${a}">${money(a)}</button>`).join('')}</div><div class="section-label">Phương thức</div><button class="info-card row selected" data-action="selectPayment" style="width:100%;text-align:left;border:2px solid var(--brand);background:#f2f8f6"><div class="station-symbol">${icon('flask-conical')}</div><div style="flex:1"><strong>Sandbox Demo</strong><div class="subtle">DEMO_TOPUP_ENABLED · không trừ tiền thật</div></div>${icon('check')}</button><button class="info-card row" disabled style="width:100%;text-align:left;margin-top:8px;opacity:.45"><div class="station-symbol">${icon('building-2')}</div><div><strong>Thẻ ngân hàng</strong><div class="subtle">Ngoài phạm vi dự án</div></div></button><div class="sticky-action"><button class="btn btn-primary btn-block" data-action="topup">Nạp ${money(state.topupAmount)}</button></div>`), userBottom('wallet'));
}

function walletQrScreen() {
  return shell(content(`${pageHead('Mã QR ví', 'wallet')}<div class="qr-card"><div class="qr-placeholder"><span>▦</span><i></i><b></b></div><strong>Trần Minh Anh</strong><span class="subtle">Mã ví SECO-WALLET-0001</span><small>Đưa mã này cho quầy hỗ trợ khi cần đối soát.</small></div><div class="notice" style="margin-top:14px">QR ví chỉ dùng để nhận diện tài khoản trong bản demo, không chứa thông tin thanh toán thật.</div>`));
}

function rfidCardScreen() {
  return shell(content(`${pageHead('Thẻ RFID', 'wallet')}<div class="rfid-card large"><div class="row"><small>${icon('bolt')} SECO MEMBER</small>${statusBadge('ACTIVE')}</div><strong>04:A3:1F:7C</strong><small>Trần Minh Anh · C-0001</small></div><div class="section-label">Thông tin thẻ</div><div class="info-card"><div class="keyval"><span>Trạng thái</span><strong class="positive">Đang hoạt động</strong></div><div class="keyval"><span>Ngày liên kết</span><strong>12/09/2026</strong></div><div class="keyval"><span>Người dùng</span><strong>anh.tm@seco.vn</strong></div><div class="keyval"><span>Quyền</span><strong>MEMBER</strong></div></div><div class="notice" style="margin-top:13px">Thẻ RFID dùng để xác thực tại trạm. Không chia sẻ UID của thẻ với người khác.</div><button class="btn btn-secondary btn-block" data-action="toast" style="margin-top:13px">Báo mất hoặc khoá thẻ</button>`), userBottom('wallet'));
}

function transactionsScreen() {
  return shell(content(`${pageHead('Lịch sử giao dịch', 'wallet')}<div class="tabs"><button class="active">Tất cả</button><button>Trừ tiền</button><button>Nạp / cộng</button></div><div class="transaction-list">${transactions.map(transactionRow).join('')}</div>`), userBottom('wallet'));
}

function transactionDetailScreen() {
  const t = state.selectedTransaction;
  return shell(content(`${pageHead('Chi tiết giao dịch', 'transactions')}<div class="info-card" style="text-align:center;padding:24px 13px"><div class="result-icon" style="width:52px;height:52px;font-size:24px;margin:0 auto 12px">${icon('bolt')}</div><span class="subtle">${t.title}</span><strong style="display:block;font-size:31px;margin:4px 0" class="${t.amount > 0 ? 'positive' : 'negative'}">${signedMoney(t.amount)}</strong>${statusBadge('Thành công')}</div><div class="info-card" style="margin-top:11px"><div class="keyval"><span>Mã giao dịch</span><strong>${t.id}</strong></div><div class="keyval"><span>Thời gian</span><strong>${t.time}</strong></div><div class="keyval"><span>Số dư trước</span><strong>${money(Number(t.balance.replace(/\D/g, '')) - t.amount)}</strong></div><div class="keyval"><span>Số dư sau</span><strong>${t.balance}</strong></div></div>${t.session ? `<div class="section-label">Phiên liên quan</div><button class="info-card row" data-action="historyDetail" style="width:100%;text-align:left"><div><strong>${t.session} · ${t.station}</strong><div class="subtle">0.0500 kWh · 20 phút · Đạt ngân sách</div></div><span>${icon('arrow')}</span></button>` : ''}`), userBottom('wallet'));
}

function historyScreen() {
  return shell(content(`${pageHead('Lịch sử sạc', 'map')}<div class="stats-grid"><div class="stat-box"><strong>7</strong><span>Số phiên</span></div><div class="stat-box"><strong>0.940</strong><span>Điện năng kWh</span></div><div class="stat-box"><strong>3.760đ</strong><span>Tổng chi</span></div></div><div class="section-label">Tháng này</div><div class="transaction-list">${chargingHistory.map(historyRow).join('')}</div>`), userBottom('sessionHub'));
}

function historyRow(h) {
  return `<button class="transaction" data-action="historyDetail" data-id="${h.id}" style="width:100%;text-align:left;background:transparent;border-left:0;border-right:0;border-top:0"><div class="transaction-icon">${icon('history')}</div><div class="transaction-main"><strong>${h.station}</strong><span>${h.date} · ${h.reason}</span></div><div class="transaction-amount">${money(h.cost)}<small>${h.energy}</small></div></button>`;
}

function historyDetailScreen() {
  const h = state.selectedHistory;
  return shell(content(`${pageHead('Chi tiết phiên', 'history')}<div class="station-hero"><div class="row"> <strong>${h.id}</strong>${statusBadge('COMPLETED')}</div><strong style="font-size:30px;display:block;margin-top:17px">${money(h.cost)}</strong><div class="subtle">${h.energy} · ${h.duration}</div></div><div class="info-card" style="margin-top:11px"><div class="keyval"><span>Trạm</span><strong>${h.station}</strong></div><div class="keyval"><span>Bắt đầu</span><strong>${h.date}</strong></div><div class="keyval"><span>Kết thúc</span><strong>${h.date}</strong></div><div class="keyval"><span>Lý do dừng</span><strong>${h.reason}</strong></div><div class="keyval"><span>Ngân sách</span><strong>${money(h.cost)}</strong></div><div class="keyval"><span>Giá</span><strong>4.000đ/kWh</strong></div><div class="keyval"><span>Số dư sau</span><strong>${money(state.balance)}</strong></div></div><div class="section-label">Biểu đồ điện năng</div><div class="info-card" style="height:160px;display:flex;align-items:flex-end;padding:18px 13px 18px;background:linear-gradient(to top, #eef5f3 1px, transparent 1px);background-size:100% 28px"><div style="width:100%;height:3px;background:var(--brand);transform:rotate(-17deg);transform-origin:left center;border-radius:5px;position:relative"></div></div>`), userBottom('sessionHub'));
}

function settingsScreen() {
  const section = state.settingsSection;
  return shell(content(`${pageHead('Cài đặt', 'profile')}<div class="tabs"><button class="${section === 'notifications' ? 'active' : ''}" data-action="settingsSection" data-section="notifications">Thông báo</button><button class="${section === 'language' ? 'active' : ''}" data-action="settingsSection" data-section="language">Ngôn ngữ</button><button class="${section === 'account' ? 'active' : ''}" data-action="settingsSection" data-section="account">Tài khoản</button></div>${section === 'notifications' ? `<div class="info-card"><div class="row"><div><strong>Thông báo phiên sạc</strong><div class="subtle">Nhận cảnh báo khi phiên bắt đầu, dừng hoặc gặp lỗi trên điện thoại.</div></div><button class="toggle ${state.notificationsEnabled ? 'on' : ''}" data-action="toggleNotifications" aria-label="Bật tắt thông báo"><i></i></button></div><div class="divider"></div><div class="row"><div><strong>Trạm yêu thích</strong><div class="subtle">Thông báo khi trạm yêu thích có đầu cắm trống.</div></div><button class="toggle ${state.favoriteNotificationsEnabled ? 'on' : ''}" data-action="toggleFavoriteNotifications" aria-label="Bật tắt thông báo trạm yêu thích"><i></i></button></div></div>` : section === 'language' ? `<div class="option-list"><button class="option-row ${state.language === 'Tiếng Việt' ? 'selected' : ''}" data-action="language" data-language="Tiếng Việt"><span><strong>Tiếng Việt</strong><small>Ngôn ngữ ứng dụng</small></span><span class="option-check">${state.language === 'Tiếng Việt' ? icon('check') : ''}</span></button><button class="option-row ${state.language === 'English' ? 'selected' : ''}" data-action="language" data-language="English"><span><strong>English</strong><small>Application language</small></span><span class="option-check">${state.language === 'English' ? icon('check') : ''}</span></button></div>` : `<div class="settings"><button class="setting" data-action="screen" data-screen="changePassword"><span class="setting-icon">${icon('key')}</span><span class="setting-main">Đổi mật khẩu</span><span class="setting-arrow">${icon('arrow')}</span></button><button class="setting" data-action="screen" data-screen="rfidCard"><span class="setting-icon">${icon('card')}</span><span class="setting-main">Thẻ RFID</span><span class="setting-value">ACTIVE</span><span class="setting-arrow">${icon('arrow')}</span></button><button class="setting" data-action="toast"><span class="setting-icon">${icon('device')}</span><span class="setting-main">Thiết bị đã đăng nhập</span><span class="setting-value">1 thiết bị</span><span class="setting-arrow">${icon('arrow')}</span></button></div>`}`));
}

function changePasswordScreen() {
  return shell(content(`${pageHead('Đổi mật khẩu', 'settings')}<p class="subtle" style="margin:0 0 17px">Mật khẩu mới cần có ít nhất 8 ký tự, gồm chữ và số.</p><div class="stack"><div class="field"><label for="old-password">Mật khẩu hiện tại</label><input id="old-password" type="password" placeholder="Nhập mật khẩu hiện tại" /></div><div class="field"><label for="new-password">Mật khẩu mới</label><input id="new-password" type="password" placeholder="Nhập mật khẩu mới" /></div><div class="field"><label for="confirm-password">Nhập lại mật khẩu mới</label><input id="confirm-password" type="password" placeholder="Nhập lại mật khẩu mới" /></div></div><div class="password-rules"><span>✓</span> Ít nhất 8 ký tự<br/><span>✓</span> Có ít nhất một chữ số</div><div class="sticky-action"><button class="btn btn-primary btn-block" data-action="changePassword">Cập nhật mật khẩu</button></div>`));
}

function vehiclesScreen() {
  return shell(content(`${pageHead('Xe của tôi', 'profile')}<p class="subtle" style="margin:0 0 16px">Lưu thông tin xe để chọn nhanh trước mỗi phiên sạc.</p>${state.vehicleAdded ? `<div class="vehicle-card"><div class="vehicle-icon">${icon('car')}</div><div><strong>Xe điện của tôi</strong><span>VinFast · VF e34</span><small>Biển số: 30A-123.45</small></div><button class="icon-btn" data-action="toast">${icon('arrow')}</button></div>` : `<div class="empty-state"><div class="result-icon">${icon('car')}</div><h2>Chưa có xe nào</h2><p>Thêm xe để liên kết với lịch sử sạc và chọn nhanh khi bắt đầu phiên.</p></div>`}<div class="sticky-action"><button class="btn btn-primary btn-block" data-action="addVehicle">${icon('plus')} ${state.vehicleAdded ? 'Thêm xe khác' : 'Thêm xe'}</button></div>`));
}

function vehicleEditorScreen() {
  return shell(content(`${pageHead('Thêm xe', 'vehicles')}<div class="stack"><div class="field"><label for="vehicle-name">Tên xe</label><input id="vehicle-name" placeholder="Ví dụ: Xe đi làm" /></div><div class="field"><label for="vehicle-brand">Hãng xe</label><input id="vehicle-brand" placeholder="Ví dụ: VinFast" /></div><div class="field"><label for="vehicle-plate">Biển số</label><input id="vehicle-plate" placeholder="30A-123.45" /></div><div class="field"><label for="vehicle-battery">Dung lượng pin (tuỳ chọn)</label><input id="vehicle-battery" inputmode="decimal" placeholder="42 kWh" /></div></div><div class="notice" style="margin-top:14px">Thông tin xe chỉ dùng để hiển thị trong phiên sạc và lịch sử của bạn.</div><div class="sticky-action"><button class="btn btn-primary btn-block" data-action="saveVehicle">Lưu thông tin xe</button></div>`));
}

function helpScreen() {
  return shell(content(`${pageHead('Trợ giúp', 'profile')}<div class="help-hero"><div class="logo-mark">?</div><div><strong>SECO Support</strong><p>Chúng tôi có thể giúp gì cho bạn?</p></div></div><div class="section-label">Câu hỏi thường gặp</div><div class="help-list"><button class="help-row" data-action="helpTopic" data-topic="Vì sao cần quẹt RFID trước khi sạc?"><span>Vì sao cần quẹt RFID trước khi sạc?</span>${icon('arrow')}</button><button class="help-row" data-action="helpTopic" data-topic="Phiên sạc bị dừng khi mất kết nối?"><span>Phiên sạc bị dừng khi mất kết nối?</span>${icon('arrow')}</button><button class="help-row" data-action="helpTopic" data-topic="Thanh toán Guest hoạt động thế nào?"><span>Thanh toán Guest hoạt động thế nào?</span>${icon('arrow')}</button><button class="help-row" data-action="helpTopic" data-topic="Làm gì khi đầu cắm vẫn bị khoá?"><span>Làm gì khi đầu cắm vẫn bị khoá?</span>${icon('arrow')}</button></div><div class="section-label">Liên hệ hỗ trợ</div><div class="info-card"><div class="keyval"><span>Email</span><strong>support@seco.vn</strong></div><div class="keyval"><span>Thời gian</span><strong>08:00 – 18:00</strong></div><button class="btn btn-secondary btn-block" data-action="toast" style="margin-top:9px">Gửi yêu cầu hỗ trợ</button></div>`));
}

function helpArticleScreen() {
  const articles = {
    'Vì sao cần quẹt RFID trước khi sạc?': 'RFID xác thực thành viên, số dư và ngân sách trước khi station chuyển sang CHARGING. Quét thẻ thành công cũng giúp hệ thống ghi đúng session vào tài khoản của bạn.',
    'Phiên sạc bị dừng khi mất kết nối?': 'Station tiếp tục đo và lưu dữ liệu cục bộ. Khi kết nối trở lại, firmware retry session_end để đồng bộ energy, cost và stop reason với backend.',
    'Thanh toán Guest hoạt động thế nào?': 'Guest không dùng ví. Khi rút sạc, đầu cắm được khóa và app tạo PaymentIntent. Chỉ sau khi Sandbox trả về PAID, station mới nhận lệnh UNLOCK.',
    'Làm gì khi đầu cắm vẫn bị khoá?': 'Không cố kéo đầu cắm. Kiểm tra payment status trong biên lai, tạo lại QR nếu mã đã hết hạn, hoặc liên hệ Technician để kiểm tra connector_lock.'
  };
  return shell(content(`${pageHead('Câu trả lời', 'help')}<div class="help-article"><div class="article-icon">?</div><div class="eyebrow">SECO SUPPORT</div><h2>${state.helpTopic}</h2><p>${articles[state.helpTopic] || 'Thông tin đang được cập nhật.'}</p></div><div class="notice" style="margin-top:14px">Vẫn cần hỗ trợ? Gửi yêu cầu tới <strong>support@seco.vn</strong>, kèm mã trạm hoặc mã phiên liên quan.</div>`));
}

function profileScreen() {
  if (state.role === 'TECHNICIAN') return techProfileScreen();
  return shell(content(`<div class="row"><h1 class="screen-title">Tài khoản</h1></div><div class="profile-head"><div class="profile-avatar">MA</div><div><h2>Trần Minh Anh</h2><p>anh.tm@seco.vn<br/>0905 214 887</p></div></div><div class="section-label">Thẻ RFID</div><button class="rfid-card" data-action="screen" data-screen="rfidCard" style="width:100%;text-align:left"><div class="row"><small>${icon('bolt')} RFID</small>${statusBadge('ACTIVE')}</div><strong>04:A3:1F:7C</strong><small>Trần Minh Anh · C-0001</small></button><div class="section-label">Cài đặt</div><div class="settings"><button class="setting" data-action="screen" data-screen="settings"><span class="setting-icon">${icon('bell')}</span><span class="setting-main">Thông báo và tuỳ chọn</span><span class="setting-value">${state.notificationsEnabled ? 'Bật' : 'Tắt'}</span><span class="setting-arrow">${icon('arrow')}</span></button><button class="setting" data-action="screen" data-screen="vehicles"><span class="setting-icon">${icon('car')}</span><span class="setting-main">Xe của tôi</span><span class="setting-value">${state.vehicleAdded ? '1 xe' : 'Chưa có'}</span><span class="setting-arrow">${icon('arrow')}</span></button><button class="setting" data-action="screen" data-screen="help"><span class="setting-icon">${icon('help')}</span><span class="setting-main">Trợ giúp</span><span class="setting-value"></span><span class="setting-arrow">${icon('arrow')}</span></button></div><button class="btn btn-secondary btn-block" data-action="logout" style="margin-top:15px">Đăng xuất</button>`), userBottom('profile'));
}

function techProfileScreen() {
  return shell(content(`<div class="row"><h1 class="screen-title">Tài khoản Technician</h1></div><div class="profile-head"><div class="profile-avatar">HL</div><div><h2>HieuLN</h2><p>technician@seco.vn<br/>Kỹ thuật viên trạm sạc</p></div></div><div class="section-label">Công việc</div><div class="settings"><button class="setting" data-action="screen" data-screen="repairHistory"><span class="setting-icon">${icon('history')}</span><span class="setting-main">Lịch sử sửa lỗi</span><span class="setting-value">${state.repairHistory.length} bản ghi</span><span class="setting-arrow">${icon('arrow')}</span></button><button class="setting" data-action="screen" data-screen="notifications"><span class="setting-icon">${icon('bell')}</span><span class="setting-main">Thông báo sự cố</span><span class="setting-value">Bật</span><span class="setting-arrow">${icon('arrow')}</span></button></div><button class="btn btn-secondary btn-block" data-action="logout" style="margin-top:15px">Đăng xuất</button>`), techBottom('profile'));
}

function techHomeScreen() {
  return shell(content(`<div class="row"><div><div class="eyebrow">Không gian vận hành</div><h1 class="screen-title" style="margin-top:4px;margin-bottom:0">Xin chào, Hieu</h1></div><div class="avatar">HL</div></div><div class="tech-banner"><div><strong>Technician Mobile</strong><span>Giám sát và xử lý sự cố trạm</span></div><span class="tech-role">TECHNICIAN</span></div><div class="stats-grid"><div class="stat-box"><strong>2</strong><span>Đang lỗi</span></div><div class="stat-box"><strong>1</strong><span>Đang sửa</span></div><div class="stat-box"><strong>${state.repairHistory.length + 5}</strong><span>Đã xử lý</span></div></div><div class="row section-label"><span>Sự cố cần xử lý</span><button class="btn btn-quiet" data-action="screen" data-screen="notifications" style="padding:0;background:transparent;min-height:auto;font-size:12px">Xem tất cả</button></div><button class="fault-card" data-action="screen" data-screen="faultDetail" style="width:100%;text-align:left"><div class="row"><h3>SECO-04 · Quá nhiệt</h3>${statusBadge('CRITICAL', 'red')}</div><p>Nhiệt độ 42°C vượt ngưỡng 40°C · relay đã ngắt tải an toàn.</p><div class="row"><span class="fault-level">Cần xử lý ngay</span><span>${icon('arrow')}</span></div></button><div class="row section-label"><span>Tác vụ nhanh</span></div><div class="tech-nav"><button data-action="screen" data-screen="techMap"><i>${icon('map')}</i>Bản đồ trạm</button><button data-action="screen" data-screen="notifications"><i>${icon('bell')}</i>Thông báo</button><button data-action="screen" data-screen="repairHistory"><i>${icon('history')}</i>Lịch sử sửa lỗi</button></div><div class="section-label">Trạng thái trạm</div><div class="station-list">${stations.slice(0,4).map(s => `<button class="station-row" data-action="screen" data-screen="techMap"><div class="station-symbol">${icon('bolt')}</div><div class="station-text"><h3>${s.id}</h3><p>${s.address}</p></div>${statusBadge(s.status, s.tone)}</button>`).join('')}</div>`), techBottom('techHome'));
}

function notificationsScreen() {
  return shell(content(`${pageHead('Thông báo', 'techHome')}<div class="filters"><button class="chip active">Tất cả 4</button><button class="chip">Chưa đọc 2</button></div><div class="stack"><button class="fault-card" data-action="screen" data-screen="faultDetail" style="text-align:left"><div class="row"><h3>SECO-04 · Quá nhiệt</h3><span class="subtle">2 phút</span></div><p>Đã vượt ngưỡng 40°C. Session dừng với lý do OVER_TEMPERATURE.</p><div class="row" style="margin-top:11px"><span class="fault-level">Chưa xử lý</span>${icon('arrow')}</div></button><button class="info-card" data-action="screen" data-screen="faultDetail" style="text-align:left"><div class="row"><strong>SECO-05 · Sensor fault</strong><span class="subtle">18 phút</span></div><p class="subtle" style="margin:5px 0 0">INA219 không phản hồi telemetry trong 30 giây.</p></button><button class="info-card" data-action="screen" data-screen="maintenance" style="text-align:left"><div class="row"><strong>SECO-01 · Bảo trì định kỳ</strong><span class="subtle">Hôm qua</span></div><p class="subtle" style="margin:5px 0 0">Checklist bảo trì tháng 10 đã được tạo.</p></button></div>`), techBottom('notifications'));
}

function faultDetailScreen() {
  const action = !state.maintenanceAssigned
    ? `<button class="btn btn-primary btn-block" data-action="assignMaintenance">${icon('check')} Nhận nhiệm vụ</button>`
    : !state.maintenanceStarted
      ? `<button class="btn btn-primary btn-block" data-action="startMaintenance">${icon('wrench')} Bắt đầu bảo trì</button>`
      : `<button class="btn btn-secondary btn-block" data-action="screen" data-screen="maintenance">${icon('wrench')} Tiếp tục bảo trì</button>`;
  return shell(content(`${pageHead('Chi tiết lỗi', 'notifications')}<div class="fault-card"><div class="row"><div><div class="eyebrow">FAULT · ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div><h3 style="margin-top:5px">SECO-04 · Bãi xe Beta</h3></div>${statusBadge('CRITICAL', 'red')}</div><p style="margin-top:12px">Nhiệt độ đường tải vượt ngưỡng an toàn, trạm đã chuyển sang ERROR và ngắt relay.</p></div><div class="section-label">Telemetry cuối</div><div class="telemetry"><div class="metric"><span>Nhiệt độ</span><strong style="color:var(--danger)">42°C</strong></div><div class="metric"><span>Dòng điện</span><strong>0.00 A</strong></div><div class="metric"><span>Relay</span><strong>OFF</strong></div><div class="metric"><span>Connector lock</span><strong>LOCKED</strong></div></div><div class="section-label">Hướng xử lý</div><div class="info-card"><div class="step-list"><div class="step"><div class="step-num">1</div><div><strong>Nhận nhiệm vụ</strong><span>Ghi nhận Technician đang phụ trách lỗi SECO-04</span></div></div><div class="step"><div class="step-num">2</div><div><strong>Kiểm tra tại trạm</strong><span>Xác nhận nguồn và cảm biến DS18B20</span></div></div><div class="step"><div class="step-num">3</div><div><strong>Reset và ghi biên bản</strong><span>Chỉ đưa trạm về READY sau khi test an toàn</span></div></div></div></div><div class="sticky-action">${action}</div>`), techBottom('notifications'));
}

function maintenanceScreen() {
  const items = ['Xác nhận đã ngắt relay và E-Stop', 'Kiểm tra cảm biến nhiệt DS18B20', 'Kiểm tra dây INA219 và nguồn 12V', 'Test micro-switch cắm / rút', 'Reset trạm và xác nhận READY'];
  const progress = Math.round((state.maintenanceChecks.filter(Boolean).length / items.length) * 100);
  state.maintenanceProgress = progress;
  return shell(content(`${pageHead('Bảo trì trạm', 'faultDetail')}<div class="info-card"><div class="row"><div><strong>SECO-04 · Bãi xe Beta</strong><div class="subtle">Phiếu bảo trì MT-2026-014 · HieuLN</div></div>${statusBadge(state.maintenanceStatus, state.maintenanceStatus === 'Hoàn tất' ? 'green' : 'orange')}</div><div class="progress" style="margin-top:13px"><i style="width:${progress}%"></i></div><div class="subtle" style="margin-top:7px">${progress}% checklist hoàn tất</div></div><div class="section-label">Checklist sửa chữa</div><div class="checklist">${items.map((item, i) => `<div class="check-item"><input type="checkbox" ${state.maintenanceChecks[i] ? 'checked' : ''} data-action="checkMaintenance" data-index="${i}" id="check-${i}"/><label for="check-${i}">${item}</label></div>`).join('')}</div><div class="section-label">Ảnh bằng chứng</div><label class="upload-box" for="maintenance-photo">${icon('download')}<span>${state.maintenancePhotoName || 'Tải ảnh hiện trạng sau sửa chữa'}</span><input id="maintenance-photo" type="file" accept="image/*" data-action="maintenancePhoto" /></label><div class="notice" style="margin-top:12px">${icon('lock')} Chỉ hoàn thành khi checklist đủ 100% và đã upload ảnh bằng chứng.</div><div class="sticky-action"><button class="btn btn-primary btn-block" data-action="completeMaintenance">Hoàn thành bảo trì</button></div>`), techBottom('techHome'));
}

function repairReportScreen() {
  return shell(content(`${pageHead('Báo cáo sửa chữa', 'maintenance')}<div class="info-card"><div class="row"><strong>SECO-04 · Bãi xe Beta</strong>${statusBadge('READY')}</div><div class="subtle" style="margin-top:5px">MT-2026-014 · Người xử lý: HieuLN</div><div class="subtle" style="margin-top:5px">Ảnh bằng chứng: ${state.maintenancePhotoName}</div></div><div class="field" style="margin-top:15px"><label for="report">Mô tả kết quả</label><textarea id="report">Đã thay cảm biến nhiệt, kiểm tra INA219 và test tải DC 12V. Trạm đã reset, gửi heartbeat bình thường.</textarea></div><div class="section-label">Xác nhận</div><div class="checklist"><div class="check-item"><input type="checkbox" checked id="safe"/><label for="safe">Đã kiểm tra an toàn và relay fail-safe</label></div><div class="check-item"><input type="checkbox" checked id="telemetry"/><label for="telemetry">Telemetry và WebSocket hoạt động</label></div></div><div class="sticky-action"><button class="btn btn-primary btn-block" data-action="submitReport">${icon('check')} Gửi báo cáo và đóng lỗi</button></div>`), techBottom('techHome'));
}

function repairHistoryScreen() {
  const records = state.repairHistory.length ? state.repairHistory : [{ id: 'MT-2026-009', station: 'SECO-02 · Nhà xe A', date: '28/09/2026', summary: 'Đã thay connector lock và kiểm tra relay.', photo: 'maintenance-009.jpg' }];
  return shell(content(`${pageHead('Lịch sử sửa lỗi', 'techHome')}<div class="notice">Mọi báo cáo đã hoàn thành được lưu tại đây để đối soát với backend.</div><div class="stack" style="margin-top:12px">${records.map(record => `<div class="info-card"><div class="row"><strong>${record.id}</strong>${statusBadge('Đã lưu')}</div><div class="subtle" style="margin-top:5px">${record.station} · ${record.date}</div><p style="margin:8px 0 0;font-size:12px">${record.summary}</p><small class="subtle">Ảnh: ${record.photo}</small></div>`).join('')}</div>`), techBottom('profile'));
}

let stationMap;
let userLocationMarker;
const stationMapMarkers = new Map();

function updateUserLocationMarker() {
  if (!stationMap || !window.L || !state.userLocation) return;
  const { lat, lng } = state.userLocation;
  if (!userLocationMarker) {
    userLocationMarker = window.L.circleMarker([lat, lng], { radius: 8, color: '#fff', weight: 3, fillColor: '#256fc1', fillOpacity: 1 });
    userLocationMarker.bindTooltip('Vị trí của bạn', { direction: 'top', offset: [0, -7] });
    userLocationMarker.addTo(stationMap);
  } else {
    userLocationMarker.setLatLng([lat, lng]);
  }
}

function requestUserLocation() {
  if (state.geoWatchId !== null || !navigator.geolocation) return;
  state.geoWatchId = navigator.geolocation.watchPosition((position) => {
    state.userLocation = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy };
    updateUserLocationMarker();
  }, () => {
    state.geoWatchId = null;
  }, { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 });
}

function openDirections(station) {
  if (!station || !Number.isFinite(Number(station.lat)) || !Number.isFinite(Number(station.lng))) return toast('Trạm chưa có tọa độ để chỉ đường');
  const params = new URLSearchParams({ api: '1', destination: `${station.lat},${station.lng}`, travelmode: 'driving' });
  if (state.userLocation) params.set('origin', `${state.userLocation.lat},${state.userLocation.lng}`);
  window.open(`https://www.google.com/maps/dir/?${params.toString()}`, '_blank', 'noopener,noreferrer');
}

function updateMapMarkerStyles() {
  stationMapMarkers.forEach((marker, stationId) => {
    const station = stations.find(item => item.id === stationId);
    const highlighted = state.mapStatusFilter === 'ALL' || station?.status === state.mapStatusFilter;
    marker.setStyle({ opacity: highlighted ? 1 : 0.22, fillOpacity: highlighted ? 1 : 0.18, weight: highlighted ? 3 : 1 });
  });
  document.querySelectorAll('[data-action="mapStatusFilter"]').forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === state.mapStatusFilter);
  });
}

function initializeStationMap() {
  const element = document.querySelector('#station-map');
  if (!element || !window.L) return;
  if (stationMap) stationMap.remove();
  userLocationMarker = null;
  stationMapMarkers.clear();
  const mapStations = getMapStations();
  const firstStation = mapStations[0];
  stationMap = window.L.map(element, { zoomControl: false, attributionControl: false }).setView(
    firstStation ? [firstStation.lat, firstStation.lng] : [21.0285, 105.8355],
    firstStation ? 13 : 15
  );
  window.L.control.zoom({ position: 'bottomright' }).addTo(stationMap);
  window.L.control.attribution({ prefix: false, position: 'bottomleft' }).addAttribution('© OpenStreetMap').addTo(stationMap);
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(stationMap);
  mapStations.forEach((station) => {
    const color = station.status === 'READY' ? '#3f796e' : station.status === 'ERROR' ? '#d94e4d' : station.status === 'MAINTENANCE' ? '#bf7b23' : '#256fc1';
    const marker = window.L.circleMarker([station.lat, station.lng], { radius: 10, color: '#fff', weight: 3, fillColor: color, fillOpacity: 1 });
    marker.bindTooltip(`${station.id} · ${station.status}`, { direction: 'top', offset: [0, -8] });
    marker.on('click', () => {
      state.station = station;
      state.mapSelectedStationId = station.id;
      stationMap.setView([station.lat, station.lng], Math.max(stationMap.getZoom(), 16), { animate: true });
      renderMapSheet(station, state.screen === 'techMap');
    });
    marker.addTo(stationMap);
    stationMapMarkers.set(station.id, marker);
  });
  if (mapStations.length > 1) {
    const bounds = window.L.latLngBounds(mapStations.map((station) => [station.lat, station.lng]));
    stationMap.fitBounds(bounds.pad(0.18), { maxZoom: 14, animate: false });
  }
  updateMapMarkerStyles();
  requestUserLocation();
  updateUserLocationMarker();
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
}

function render() {
  let view;
  if (state.screen === 'login') view = loginScreen();
  else if (state.screen === 'map') view = mapScreen();
  else if (state.screen === 'stations') view = stationsScreen();
  else if (state.screen === 'stationDetail') view = stationDetailScreen();
  else if (state.screen === 'setup') view = setupScreen();
  else if (state.screen === 'rfid') view = rfidScreen();
  else if (state.screen === 'active') view = activeScreen();
  else if (state.screen === 'sessionHub') view = sessionHubScreen();
  else if (state.screen === 'result') view = resultScreen();
  else if (state.screen === 'wallet') view = walletScreen();
  else if (state.screen === 'topup') view = topupScreen();
  else if (state.screen === 'walletQr') view = walletQrScreen();
  else if (state.screen === 'rfidCard') view = rfidCardScreen();
  else if (state.screen === 'transactions') view = transactionsScreen();
  else if (state.screen === 'transactionDetail') view = transactionDetailScreen();
  else if (state.screen === 'history') view = historyScreen();
  else if (state.screen === 'historyDetail') view = historyDetailScreen();
  else if (state.screen === 'profile') view = profileScreen();
  else if (state.screen === 'forgotPassword') view = forgotPasswordScreen();
  else if (state.screen === 'stationFilters') view = stationFiltersScreen();
  else if (state.screen === 'shareStation') view = shareStationScreen();
  else if (state.screen === 'settings') view = settingsScreen();
  else if (state.screen === 'changePassword') view = changePasswordScreen();
  else if (state.screen === 'vehicles') view = vehiclesScreen();
  else if (state.screen === 'vehicleEditor') view = vehicleEditorScreen();
  else if (state.screen === 'help') view = helpScreen();
  else if (state.screen === 'helpArticle') view = helpArticleScreen();
  else if (state.screen === 'techHome') view = techHomeScreen();
  else if (state.screen === 'techMap') view = techMapScreen();
  else if (state.screen === 'notifications') view = notificationsScreen();
  else if (state.screen === 'faultDetail') view = faultDetailScreen();
  else if (state.screen === 'maintenance') view = maintenanceScreen();
  else if (state.screen === 'repairReport') view = repairReportScreen();
  else if (state.screen === 'repairHistory') view = repairHistoryScreen();
  app.innerHTML = view;
  window.requestAnimationFrame(() => {
    refreshIcons();
    if (state.screen === 'map' || state.screen === 'techMap') initializeStationMap();
  });
}

function toast(message = 'Tính năng đã sẵn sàng trong bản demo') {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  Object.assign(node.style, { position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)', background: '#102b2a', color: '#fff', padding: '11px 15px', borderRadius: '12px', fontSize: '12px', zIndex: 20, boxShadow: '0 8px 25px rgba(0,0,0,.2)', maxWidth: '320px', textAlign: 'center' });
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2300);
}

function inferRole(email) {
  const normalized = email.toLowerCase();
  return ['technician@seco.vn', 'hieu.ln@seco.vn', 'hieuln@seco.vn'].includes(normalized) ? 'TECHNICIAN' : 'USER';
}

async function notifyDevice(title, body, kind = 'user') {
  if (kind === 'user' && !state.notificationsEnabled) return;
  if (!('Notification' in window)) return;
  try {
    let permission = window.Notification.permission;
    if (permission === 'default') permission = await window.Notification.requestPermission();
    if (permission === 'granted') new window.Notification(title, { body, tag: `seco-${kind}` });
  } catch {
    // Browser notification permission is optional; the in-app toast remains available.
  }
}

function mapServerRole(role) {
  const normalized = String(role || '').toUpperCase();
  return normalized === 'TECHNICIAN' ? 'TECHNICIAN' : 'USER';
}

function formatRemoteDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function normalizeRemoteSession(item) {
  const energy = Number(item.energy_kwh || 0);
  const durationSeconds = Number(item.duration_seconds || 0);
  const stationName = item.station_name ? ` · ${item.station_name}` : '';
  return {
    id: item.session_id,
    station: `${item.station_id || '—'}${stationName}`,
    date: formatRemoteDate(item.started_at),
    reason: item.stop_reason || item.status || '—',
    cost: Number(item.cost_vnd || 0),
    energy: `${energy.toFixed(4)} kWh`,
    duration: `${Math.max(1, Math.round(durationSeconds / 60))} phút`
  };
}

function normalizeRemoteTransaction(item) {
  const amount = Number(item.amount_vnd || 0);
  return {
    id: item.transaction_id,
    title: item.type === 'TOPUP' ? 'Nạp tiền' : 'Giao dịch phiên sạc',
    time: formatRemoteDate(item.created_at),
    station: item.session_id || '',
    amount,
    balance: money(item.balance_after_vnd ?? 0),
    session: item.session_id || ''
  };
}

async function loadMemberData() {
  const [walletResponse, sessionsResponse, transactionsResponse] = await Promise.all([
    apiRequest(appConfig.endpoints.wallet),
    apiRequest(appConfig.endpoints.sessions),
    apiRequest(appConfig.endpoints.transactions)
  ]);
  if (walletResponse?.ok) {
    const wallet = await walletResponse.json();
    state.balance = Number(wallet.available_balance_vnd ?? wallet.balance_vnd ?? state.balance);
  }
  if (sessionsResponse?.ok) {
    const payload = await sessionsResponse.json();
    const incoming = Array.isArray(payload) ? payload : payload.items;
    if (Array.isArray(incoming) && incoming.length) chargingHistory.splice(0, chargingHistory.length, ...incoming.map(normalizeRemoteSession));
  }
  if (transactionsResponse?.ok) {
    const payload = await transactionsResponse.json();
    const incoming = Array.isArray(payload) ? payload : payload.items;
    if (Array.isArray(incoming) && incoming.length) transactions.splice(0, transactions.length, ...incoming.map(normalizeRemoteTransaction));
  }
  if (state.screen !== 'login') render();
}

async function loginWithCredentials() {
  const email = document.querySelector('#email')?.value.trim() || '';
  const password = document.querySelector('#password')?.value || '';
  try {
    const response = await apiRequest(appConfig.endpoints.authLogin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response?.ok) {
      let message = 'Email hoặc mật khẩu không đúng';
      try { message = (await response.json())?.detail || message; } catch { /* keep the user-facing fallback */ }
      toast(message);
      return;
    }
    const payload = await response.json();
    saveAuthSession(payload);
    state.role = mapServerRole(payload?.user?.role || payload?.role);
    state.mode = state.role === 'TECHNICIAN' ? 'tech' : 'user';
    state.screen = state.role === 'TECHNICIAN' ? 'techHome' : 'map';
    render();
    if (state.role === 'TECHNICIAN') void notifyDevice('SECO Technician', 'Có sự cố mới cần xử lý.', 'tech');
    void loadMemberData().catch(() => null);
  } catch {
    toast('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
  }
}

function stopSessionTransport() {
  if (state.sessionTicker) window.clearInterval(state.sessionTicker);
  state.sessionTicker = null;
  if (state.sessionPoller) window.clearInterval(state.sessionPoller);
  state.sessionPoller = null;
  if (state.sessionSocket) {
    state.sessionSocket.onclose = null;
    state.sessionSocket.close();
  }
  state.sessionSocket = null;
}

function applySessionMessage(message) {
  let payload = message;
  try { payload = typeof message === 'string' ? JSON.parse(message) : message; } catch { return; }
  if (!payload) return;
  const live = state.sessionLive;
  state.sessionId = payload.session_id || payload.sessionId || state.sessionId;
  live.energyKwh = Number(payload.energy_kwh ?? payload.energyKwh ?? payload.energy ?? live.energyKwh);
  live.cost = Number(payload.cost_vnd ?? payload.cost ?? payload.amount ?? live.cost);
  live.powerKw = Number(payload.power_kw ?? payload.powerKw ?? payload.power ?? live.powerKw);
  live.temperature = payload.temperature ?? live.temperature;
  live.elapsedSeconds = Number(payload.duration_seconds ?? payload.elapsedSeconds ?? payload.elapsed ?? live.elapsedSeconds);
  state.balance = Number(payload.balance_after_vnd ?? payload.balance_vnd ?? state.balance);
  state.elapsed = Math.floor(live.elapsedSeconds / 60);
  if (state.screen === 'active' || state.screen === 'sessionHub') render();
}

function startDemoSessionTicker() {
  if (state.sessionTicker || !state.activeSession) return;
  state.sessionTicker = window.setInterval(() => {
    if (!state.activeSession) return stopSessionTransport();
    state.sessionLive.elapsedSeconds += 1;
    state.sessionLive.energyKwh = Number((state.sessionLive.energyKwh + 0.00004).toFixed(5));
    state.sessionLive.cost = Math.round(state.sessionLive.energyKwh * 4000);
    state.sessionLive.powerKw = 0.15;
    state.sessionLive.temperature = Math.round(31 + Math.min(8, state.sessionLive.elapsedSeconds / 45));
    state.elapsed = Math.floor(state.sessionLive.elapsedSeconds / 60);
    if (state.screen === 'active' || state.screen === 'sessionHub') render();
  }, 1000);
}

async function pollCurrentSession() {
  const response = await apiRequest(appConfig.endpoints.currentSession);
  if (!response?.ok) {
    state.sessionPollFailures += 1;
    if (state.sessionPollFailures >= 3 && appConfig.allowDemoFallback) startDemoSessionTicker();
    return;
  }
  state.sessionPollFailures = 0;
  applySessionMessage(await response.json());
}

function startSessionPolling() {
  if (state.sessionPoller || !state.activeSession) return;
  void pollCurrentSession().catch(() => { state.sessionPollFailures += 1; });
  state.sessionPoller = window.setInterval(() => {
    void pollCurrentSession().catch(() => { state.sessionPollFailures += 1; });
  }, appConfig.sessionPollIntervalMs || 5000);
}

function openChargingSocket() {
  if (!state.activeSession) return;
  const streamPath = typeof appConfig.endpoints.sessionStream === 'function'
    ? appConfig.endpoints.sessionStream(state.sessionId || 'active')
    : null;
  if (!streamPath || !appConfig.wsBaseUrl) return startSessionPolling();
  if (!window.WebSocket) return startDemoSessionTicker();
  try {
    const socket = new window.WebSocket(resolveWsUrl(streamPath));
    state.sessionSocket = socket;
    socket.onmessage = (event) => applySessionMessage(event.data);
    socket.onerror = () => startDemoSessionTicker();
    socket.onclose = () => { if (state.activeSession) startDemoSessionTicker(); };
  } catch {
    startDemoSessionTicker();
  }
}

async function startChargingSession() {
  state.startingSession = true;
  state.activeSession = true;
  state.sessionId = null;
  state.sessionLive = { energyKwh: 0, cost: 0, powerKw: 0.15, temperature: Number.parseInt(state.station.temperature, 10) || 31, elapsedSeconds: 0 };
  state.screen = 'sessionHub';
  render();
  const response = await apiRequest(appConfig.endpoints.sessionStart, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: state.rfidUid, station_id: state.station.id, max_budget_vnd: state.budget })
  }).catch(() => null);
  if (!response?.ok) {
    state.activeSession = false;
    state.startingSession = false;
    state.screen = 'rfid';
    render();
    toast('Không thể bắt đầu phiên sạc tại trạm này');
    return;
  }
  const payload = await response.json();
  state.sessionId = payload.session_id || payload.sessionId;
  applySessionMessage(payload);
  state.startingSession = false;
  openChargingSocket();
  render();
  void notifyDevice('Phiên sạc đã bắt đầu', `${state.station.id} đang gửi dữ liệu điện năng và chi phí realtime.`);
}

async function stopChargingSession() {
  const sessionId = state.sessionId;
  if (!sessionId) return toast('Chưa có mã phiên sạc để dừng');
  const response = await apiRequest(appConfig.endpoints.sessionStop(sessionId), { method: 'POST' }).catch(() => null);
  if (!response?.ok) return toast('Không thể dừng phiên sạc, vui lòng thử lại');
  const payload = await response.json();
  applySessionMessage(payload);
  const cost = Number(payload.cost_vnd ?? state.sessionLive.cost ?? 0);
  const energy = Number(payload.energy_kwh ?? state.sessionLive.energyKwh ?? 0);
  const duration = Math.max(1, Math.round(Number(payload.duration_seconds ?? state.sessionLive.elapsedSeconds ?? 0) / 60));
  stopSessionTransport();
  state.activeSession = false;
  state.balance = Number(payload.balance_after_vnd ?? Math.max(0, state.balance - cost));
  state.result = { ...chargingHistory[0], id: sessionId || `SS-${Date.now()}`, station: `${state.station.id} · ${state.station.name}`, cost, energy: `${energy.toFixed(4)} kWh`, duration: `${duration} phút`, reason: 'Rút sạc' };
  chargingHistory.unshift(state.result);
  state.screen = 'result';
  render();
  void notifyDevice('Phiên sạc đã kết thúc', `Đã sạc ${energy.toFixed(4)} kWh, chi phí ${money(cost)}.`);
}

async function submitRepairReport() {
  const summary = document.querySelector('#report')?.value || 'Đã hoàn thành checklist bảo trì.';
  const record = { id: 'MT-2026-' + String(15 + state.repairHistory.length).padStart(3, '0'), station: 'SECO-04 · Bãi xe Beta', date: new Date().toLocaleDateString('vi-VN'), summary, photo: state.maintenancePhotoName };
  state.repairHistory.unshift(record);
  const form = new FormData();
  form.append('stationId', 'SECO-04');
  form.append('summary', summary);
  if (state.maintenancePhoto) form.append('evidence', state.maintenancePhoto);
  void apiRequest(appConfig.endpoints.technicianRepairReports, { method: 'POST', body: form }).catch(() => null);
  state.screen = 'techHome';
  render();
  toast('Đã lưu lịch sử sửa lỗi và gửi báo cáo');
}

async function verifyRfidCard() {
  if (!state.rfidUid.trim()) return toast('Hãy nhập hoặc quét UID thẻ RFID trước');
  const response = await apiRequest(appConfig.endpoints.rfidVerify, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: state.rfidUid })
  }).catch(() => null);
  if (!response?.ok) return toast('Không xác thực được thẻ RFID');
  const identity = await response.json();
  state.rfidReady = true;
  state.balance = Number(identity.balance_vnd ?? state.balance);
  state.user = { ...(state.user || {}), user_id: identity.user_id, name: identity.name, role: identity.role };
  render();
  toast('RFID hợp lệ · Đã xác thực thành viên');
}

async function topUpWallet() {
  const amount = Number(state.topupAmount || 0);
  const response = await apiRequest(appConfig.endpoints.walletTopup, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount_vnd: amount })
  }).catch(() => null);
  if (!response?.ok) return toast('Không thể nạp tiền vào ví');
  const payload = await response.json();
  state.balance = Number(payload.balance_after_vnd ?? state.balance + amount);
  transactions.unshift(normalizeRemoteTransaction({
    transaction_id: payload.transaction_id,
    type: 'TOPUP',
    amount_vnd: payload.amount_vnd ?? amount,
    balance_after_vnd: state.balance,
    created_at: payload.created_at
  }));
  state.screen = 'wallet';
  render();
  toast(`Đã nạp ${money(amount)} vào ví`);
}

app.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'login') { void loginWithCredentials(); return; }
  if (action === 'logout') { void apiRequest(appConfig.endpoints.authLogout, { method: 'POST' }).catch(() => null); stopSessionTransport(); clearAuthSession(); state.screen = 'login'; state.mode = 'user'; state.role = 'USER'; state.activeSession = false; render(); return; }
  if (action === 'screen') { if (target.dataset.screen === 'map' || target.dataset.screen === 'techMap') state.mapSelectedStationId = null; state.screen = target.dataset.screen; render(); return; }
  if (action === 'mapStatusFilter') { state.mapStatusFilter = target.dataset.filter || 'ALL'; updateMapMarkerStyles(); return; }
  if (action === 'directions') { openDirections(state.station); return; }
  if (action === 'station') { state.station = stations.find(s => s.id === target.dataset.station) || stations[0]; state.screen = 'stationDetail'; render(); return; }
  if (action === 'filter') { state.filter = target.dataset.filter; state.screen = state.screen === 'stationFilters' ? 'stations' : state.screen; render(); return; }
  if (action === 'startSetup') { state.screen = 'setup'; render(); return; }
  if (action === 'budget') { state.budget = target.dataset.budget === 'unlimited' ? null : Number(target.dataset.budget); state.customBudget = ''; render(); return; }
  if (action === 'confirmSetup') { state.screen = 'rfid'; state.rfidReady = false; render(); return; }
  if (action === 'rfid') { void verifyRfidCard(); return; }
  if (action === 'plug') { if (!state.rfidReady) return toast('Hãy quét mã trên phần cứng trước'); if (state.notificationsEnabled && 'Notification' in window && window.Notification.permission === 'default') void window.Notification.requestPermission(); void startChargingSession(); return; }
  if (action === 'stop') { void stopChargingSession(); return; }
  if (action === 'topupAmount') { state.topupAmount = Number(target.dataset.amount); render(); return; }
  if (action === 'selectPayment') { state.paymentMethod = 'Sandbox Demo'; render(); toast('Đã chọn phương thức Sandbox Demo'); return; }
  if (action === 'topup') { void topUpWallet(); return; }
  if (action === 'transaction') { state.selectedTransaction = transactions.find(t => t.id === target.dataset.id) || transactions[0]; state.screen = 'transactionDetail'; render(); return; }
  if (action === 'historyDetail') { state.selectedHistory = chargingHistory.find(h => h.id === target.dataset.id) || chargingHistory[0]; state.screen = 'historyDetail'; render(); return; }
  if (action === 'resetPassword') { state.recoverySent = true; render(); return; }
  if (action === 'settingsSection') { state.settingsSection = target.dataset.section; state.screen = 'settings'; render(); return; }
  if (action === 'toggleNotifications') { state.notificationsEnabled = !state.notificationsEnabled; render(); if (state.notificationsEnabled) void notifyDevice('Thông báo SECO đã bật', 'Bạn sẽ nhận cập nhật phiên sạc trên điện thoại.'); return; }
  if (action === 'toggleFavoriteNotifications') { state.favoriteNotificationsEnabled = !state.favoriteNotificationsEnabled; render(); if (state.favoriteNotificationsEnabled) void notifyDevice('Trạm yêu thích đã bật', 'Bạn sẽ nhận thông báo khi trạm có đầu cắm trống.'); return; }
  if (action === 'language') { state.language = target.dataset.language; state.settingsSection = 'language'; render(); toast(`Đã chọn ${state.language}`); return; }
  if (action === 'changePassword') { state.screen = 'profile'; render(); toast('Mật khẩu đã được cập nhật trong bản demo'); return; }
  if (action === 'addVehicle') { state.screen = 'vehicleEditor'; render(); return; }
  if (action === 'saveVehicle') { state.vehicleAdded = true; state.screen = 'vehicles'; render(); toast('Đã thêm xe vào tài khoản'); return; }
  if (action === 'copyStation') { toast(`Đã sao chép liên kết ${state.station.id}`); return; }
  if (action === 'helpTopic') { state.helpTopic = target.dataset.topic; state.screen = 'helpArticle'; render(); return; }
  if (action === 'assignMaintenance') { state.maintenanceAssigned = true; render(); toast('Đã nhận nhiệm vụ SECO-04'); return; }
  if (action === 'startMaintenance') { state.maintenanceStarted = true; state.maintenanceStatus = 'Đang xử lý'; state.screen = 'maintenance'; render(); toast('Đã bắt đầu bảo trì SECO-04'); return; }
  if (action === 'completeMaintenance') { if (state.maintenanceProgress < 100) return toast('Hãy hoàn tất toàn bộ checklist'); if (!state.maintenancePhoto) return toast('Hãy upload ảnh bằng chứng trước khi hoàn thành'); state.maintenanceStatus = 'Hoàn tất'; state.screen = 'repairReport'; render(); return; }
  if (action === 'submitReport') { void submitRepairReport(); return; }
  if (action === 'toast') { toast(); return; }
});

app.addEventListener('input', (event) => {
  if (event.target.dataset.action === 'customBudget') {
    state.customBudget = event.target.value.replace(/\D/g, '');
    const numeric = Number(state.customBudget);
    state.budget = numeric > 0 ? Math.min(numeric, state.balance) : null;
  }
  if (event.target.dataset.action === 'recoveryEmail') state.recoveryEmail = event.target.value;
  if (event.target.dataset.action === 'rfidUid') {
    state.rfidUid = event.target.value.trim().toUpperCase();
    if (state.rfidReady) state.rfidReady = false;
  }
  if (event.target.dataset.action === 'mapSearch') {
    state.mapQuery = event.target.value;
    state.mapSelectedStationId = null;
    renderMapSheet(null);
    window.requestAnimationFrame(() => initializeStationMap());
  }
  if (event.target.dataset.action === 'stationSearch') {
    state.mapQuery = event.target.value;
    const query = state.mapQuery;
    document.querySelectorAll('.station-row[data-station]').forEach((row) => {
      const station = stations.find(item => item.id === row.dataset.station);
      row.hidden = station ? !stationMatchesQuery(station, query) : true;
    });
  }
});

app.addEventListener('change', (event) => {
  const action = event.target.dataset.action;
  if (action === 'checkMaintenance') {
    state.maintenanceChecks[Number(event.target.dataset.index)] = event.target.checked;
    render();
  }
  if (action === 'maintenancePhoto') {
    state.maintenancePhoto = event.target.files?.[0] || null;
    state.maintenancePhotoName = state.maintenancePhoto?.name || '';
    render();
  }
});

render();

async function loadStationsFromBackend() {
  try {
    const response = await apiRequest(appConfig.endpoints.stations);
    if (!response?.ok) return;
    const payload = await response.json();
    const incoming = Array.isArray(payload) ? payload : payload.stations;
    if (!Array.isArray(incoming) || !incoming.length) return;
    const normalized = incoming.map(normalizeStation).filter((station) => Number.isFinite(station.lat) && Number.isFinite(station.lng));
    if (!normalized.length) return;
    const nextStatuses = Object.fromEntries(normalized.map(station => [station.id, station.status]));
    if (state.stationsInitialized && state.favoriteNotificationsEnabled) {
      normalized.forEach((station) => {
        if (state.previousStationStatuses[station.id] && state.previousStationStatuses[station.id] !== 'READY' && station.status === 'READY') {
          void notifyDevice('Trạm yêu thích đã sẵn sàng', `${station.id} hiện có đầu cắm trống.`);
        }
      });
    }
    if (state.stationsInitialized && state.role === 'TECHNICIAN') {
      normalized.forEach((station) => {
        if (state.previousStationStatuses[station.id] && state.previousStationStatuses[station.id] !== 'ERROR' && station.status === 'ERROR') {
          void notifyDevice('SECO Technician', `${station.id} vừa phát sinh lỗi cần xử lý.`, 'tech');
        }
      });
    }
    const currentStationId = state.station?.id;
    stations.splice(0, stations.length, ...normalized);
    state.station = stations.find((station) => station.id === currentStationId) || stations[0];
    state.previousStationStatuses = nextStatuses;
    state.stationsInitialized = true;
    if (['map', 'techMap', 'stations', 'stationDetail'].includes(state.screen)) render();
  } catch {
    // Demo data remains available when the backend is not running locally.
  }
}

async function restoreAuthSession() {
  const token = window.localStorage?.getItem(appConfig.authStorageKey || 'seco.accessToken');
  if (!token) return;
  const response = await apiRequest(appConfig.endpoints.authMe).catch(() => null);
  if (!response?.ok) {
    clearAuthSession();
    return;
  }
  const user = await response.json();
  saveAuthSession(user);
  state.role = mapServerRole(user.role);
  state.mode = state.role === 'TECHNICIAN' ? 'tech' : 'user';
  if (state.screen === 'login') state.screen = state.role === 'TECHNICIAN' ? 'techHome' : 'map';
  render();
  void loadMemberData().catch(() => null);
}

loadStationsFromBackend();
window.setInterval(loadStationsFromBackend, 60000);
void restoreAuthSession();
