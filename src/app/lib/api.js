const BASE = '/.netlify/functions';

// Single in-flight refresh promise to avoid parallel refresh races
let _refreshing = null;

async function tryRefresh() {
  if (_refreshing) return _refreshing;
  _refreshing = (async () => {
    const rt = localStorage.getItem('refresh_token');
    if (!rt) return null;
    try {
      const res = await fetch(`${BASE}/auth-refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent('auth:token-refreshed', { detail: data }));
      return data.token;
    } catch {
      return null;
    } finally {
      _refreshing = null;
    }
  })();
  return _refreshing;
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  window.location.href = '/app/login';
}

async function request(path, options = {}) {
  const { method = 'GET', body, token } = options;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    const newToken = await tryRefresh();
    if (!newToken) {
      clearSession();
      throw new Error('Sesión expirada');
    }
    // Retry original request with the new token
    const retryHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${newToken}` };
    const retryRes = await fetch(`${BASE}/${path}`, {
      method,
      headers: retryHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const retryData = await retryRes.json().catch(() => ({}));
    if (retryRes.status === 401) {
      clearSession();
      throw new Error('Sesión expirada');
    }
    if (!retryRes.ok) throw new Error(retryData.error || `Error ${retryRes.status}`);
    return retryData;
  }

  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

export const api = {
  auth: {
    login: (email, password) =>
      request('auth-login', { method: 'POST', body: { email, password } }),
    register: (data) =>
      request('auth-register', { method: 'POST', body: data }),
    checkInvite: (token) =>
      request(`auth-check-invite?token=${encodeURIComponent(token)}`),
    invite: (token, data) =>
      request('auth-invite', { method: 'POST', body: data, token }),
    invitacionesPendientes: (token) =>
      request('auth-invite', { token }),
    reenviarInvite: (token, email, rol) =>
      request('auth-invite', { method: 'POST', body: { email, rol, reenviar: true }, token }),
  },
  obras: {
    list: (token) => request('obras-list', { token }),
    create: (token, data) => request('obras-create', { method: 'POST', body: data, token }),
  },
  etapas: {
    cargar: (token, data) => request('etapas-cargar', { method: 'POST', body: data, token }),
    firmar: (token, data) => request('etapas-firmar', { method: 'POST', body: data, token }),
  },
  remitos: {
    list:        (token, obra_id) => request(`remitos-list?obra_id=${obra_id}`, { token }),
    create:      (token, data)    => request('remitos-create', { method: 'POST', body: data, token }),
    firmar:      (token, data)    => request('remitos-firmar', { method: 'POST', body: data, token }),
    getByToken:  (t)              => request(`remito-token?token=${t}`),
    firmarToken: (t, data)        => request(`remito-token?token=${t}`, { method: 'POST', body: data }),
    scan:        (token, data)    => request('remito-scan', { method: 'POST', body: data, token }),
  },
  checklist: {
    get: (token, obra_id) => request(`checklist-get?obra_id=${obra_id}`, { token }),
  },
  partes: {
    list:   (token, modelo_id) => request(`partes-list${modelo_id ? `?modelo_id=${modelo_id}` : ''}`, { token }),
    create: (token, data)      => request('partes-list', { method: 'POST', body: data, token }),
    update: (token, data)      => request('partes-list', { method: 'PUT',  body: data, token }),
  },
  etapasProduccion: {
    list:   (token, modelo_id) => request(`etapas-produccion?modelo_id=${modelo_id}`, { token }),
    create: (token, data)      => request('etapas-produccion', { method: 'POST', body: data, token }),
    update: (token, data)      => request('etapas-produccion', { method: 'PUT',  body: data, token }),
    delete: (token, id)        => request(`etapas-produccion?id=${id}`, { method: 'DELETE', token }),
  },
  bom: {
    list:   (token, modelo_id) => request(`modelo-partes?modelo_id=${modelo_id}`, { token }),
    save:   (token, data)      => request('modelo-partes', { method: 'POST', body: data, token }),
    update: (token, data)      => request('modelo-partes', { method: 'PUT',  body: data, token }),
    delete: (token, id)        => request(`modelo-partes?id=${id}`, { method: 'DELETE', token }),
  },
  familias: {
    list:   (token)       => request('familias', { token }),
    create: (token, data) => request('familias', { method: 'POST', body: data, token }),
    update: (token, data) => request('familias', { method: 'PUT',  body: data, token }),
    delete: (token, id)   => request(`familias?id=${id}`, { method: 'DELETE', token }),
  },
  stock: {
    movimientos: (token, parte_id) => request(`stock-movimiento?parte_id=${parte_id}`, { token }),
    registrar:   (token, data)     => request('stock-movimiento', { method: 'POST', body: data, token }),
  },
  modelos: {
    list: (token) => request('modelos-list', { token }),
  },
  cms: {
    modelos: {
      list:   (token)       => request('cms-modelos', { token }),
      update: (token, data) => request('cms-modelos', { method: 'PUT', body: data, token }),
    },
    obras: {
      list:   (token)       => request('cms-obras', { token }),
      create: (token, data) => request('cms-obras', { method: 'POST', body: data, token }),
      update: (token, data) => request('cms-obras', { method: 'PUT', body: data, token }),
      delete: (token, id)   => request(`cms-obras?id=${id}`, { method: 'DELETE', token }),
    },
  },
  users: {
    list:    (token, rol) => request(`users-list${rol ? `?rol=${rol}` : ''}`, { token }),
    update:  (token, data) => request('users-list', { method: 'PUT', body: data, token }),
    delete:  (token, id)   => request(`users-list?id=${id}`, { method: 'DELETE', token }),
    signout: (token, id)   => request('users-list', { method: 'PUT', body: { id, signout: true }, token }),
  },
  pdf: {
    download: async (token, obra_id, numero_obra) => {
      const res = await fetch(`${BASE}/pdf-export?obra_id=${obra_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al generar PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `almamod-obra-${numero_obra}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
  },
};
