/*
 * Runtime configuration for the mobile client.
 *
 * The default API path is same-origin so the local server can proxy requests
 * to the deployed backend without browser CORS errors. When the deployed
 * frontend is served behind the API domain, apiBaseUrl can be changed to the
 * absolute URL below without changing any screen code.
 */
window.SECO_CONFIG = Object.freeze({
  environment: 'remote-api',
  apiBaseUrl: '/api/v1',
  remoteApiBaseUrl: 'https://seco-backend-api.onrender.com/api/v1',
  wsBaseUrl: '',
  requestTimeoutMs: 30000,
  sessionPollIntervalMs: 5000,
  allowDemoFallback: false,
  authStorageKey: 'seco.accessToken',
  userStorageKey: 'seco.user',
  endpoints: Object.freeze({
    stations: '/stations',
    stationById: (stationId) => `/stations/${encodeURIComponent(stationId)}`,
    authLogin: '/auth/login',
    authMe: '/auth/me',
    authLogout: '/auth/logout',
    rfidVerify: '/member/rfid/verify',
    currentSession: '/member/charging/current',
    sessions: '/member/sessions',
    sessionById: (sessionId) => `/member/charging/${encodeURIComponent(sessionId)}`,
    sessionStream: null,
    sessionStart: '/member/charging/start',
    sessionStop: (sessionId) => `/member/charging/${encodeURIComponent(sessionId)}/stop`,
    transactions: '/member/transactions',
    wallet: '/member/wallet',
    walletTopup: '/member/topup',
    notifications: null,
    vehicles: null,
    profile: '/auth/me',
    support: null,
    technicianFaults: null,
    technicianFaultById: null,
    technicianMaintenance: null,
    technicianRepairReports: null
  })
});
