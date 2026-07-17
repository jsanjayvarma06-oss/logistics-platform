const INVENTORY_URL = import.meta.env.VITE_INVENTORY_URL || 'http://localhost:3001';
const DISPATCH_URL = import.meta.env.VITE_DISPATCH_URL || 'http://localhost:3002';
const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'demo-tenant';

async function request(baseUrl, path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': TENANT_ID,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const inventory = {
  products: {
    list: (params) => request(INVENTORY_URL, `/api/products?${new URLSearchParams(params)}`),
    get: (id) => request(INVENTORY_URL, `/api/products/${id}`),
    create: (data) => request(INVENTORY_URL, '/api/products', { method: 'POST', body: JSON.stringify(data) }),
    lowStock: () => request(INVENTORY_URL, '/api/products/low-stock'),
  },
  warehouses: {
    list: () => request(INVENTORY_URL, '/api/warehouses'),
    get: (id) => request(INVENTORY_URL, `/api/warehouses/${id}`),
    create: (data) => request(INVENTORY_URL, '/api/warehouses', { method: 'POST', body: JSON.stringify(data) }),
    stock: (id) => request(INVENTORY_URL, `/api/warehouses/${id}/stock`),
  },
  stock: {
    add: (data) => request(INVENTORY_URL, '/api/stock/add', { method: 'POST', body: JSON.stringify(data) }),
    remove: (data) => request(INVENTORY_URL, '/api/stock/remove', { method: 'POST', body: JSON.stringify(data) }),
    movements: (params) => request(INVENTORY_URL, `/api/stock/movements?${new URLSearchParams(params)}`),
  },
};

export const dispatch = {
  orders: {
    list: (params) => request(DISPATCH_URL, `/api/orders?${new URLSearchParams(params)}`),
    get: (id) => request(DISPATCH_URL, `/api/orders/${id}`),
    create: (data) => request(DISPATCH_URL, '/api/orders', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, status) => request(DISPATCH_URL, `/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    autoPlan: () => request(DISPATCH_URL, '/api/orders/auto-plan', { method: 'POST' }),
    dashboard: () => request(DISPATCH_URL, '/api/orders/dashboard'),
  },
  shipments: {
    list: (params) => request(DISPATCH_URL, `/api/shipments?${new URLSearchParams(params)}`),
    get: (id) => request(DISPATCH_URL, `/api/shipments/${id}`),
  },
  drivers: {
    list: (params) => request(DISPATCH_URL, `/api/drivers?${new URLSearchParams(params)}`),
    create: (data) => request(DISPATCH_URL, '/api/drivers', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, status) => request(DISPATCH_URL, `/api/drivers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
};
