import React, { useEffect, useRef, useState } from 'react';

// Leaflet loaded via CDN in index.html — no npm install needed

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  dispatched: '#8b5cf6',
  in_transit: '#6366f1',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const DRIVER_STATUS_COLORS = {
  available: '#10b981',
  on_delivery: '#3b82f6',
  offline: '#6b7280',
  on_break: '#f59e0b',
};

function makeIcon(color, emoji, size = 32) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 ${size} ${size + 8}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-size="${size * 0.45}">${emoji}</text>
      <polygon points="${size / 2 - 5},${size} ${size / 2 + 5},${size} ${size / 2},${size + 8}" fill="${color}"/>
    </svg>
  `;
  return window.L?.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -size],
  });
}

export default function LiveMap({ orders = [], drivers = [], warehouses = [], route = null }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const routeLineRef = useRef(null);
  const [ready, setReady] = useState(!!window.L);

  // Wait for Leaflet to load
  useEffect(() => {
    if (window.L) { setReady(true); return; }
    const check = setInterval(() => {
      if (window.L) { setReady(true); clearInterval(check); }
    }, 200);
    return () => clearInterval(check);
  }, []);

  // Init map
  useEffect(() => {
    if (!ready || !mapRef.current || mapInstance.current) return;

    mapInstance.current = window.L.map(mapRef.current, {
      center: [17.385, 78.486], // Hyderabad
      zoom: 11,
      zoomControl: true,
    });

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [ready]);

  // Update markers whenever data changes
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (routeLineRef.current) { routeLineRef.current.remove(); routeLineRef.current = null; }

    // Warehouse markers
    warehouses.forEach(w => {
      if (!w.latitude || !w.longitude) return;
      const m = window.L.marker([w.latitude, w.longitude], { icon: makeIcon('#6366f1', '🏭') })
        .addTo(mapInstance.current)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:160px">
            <div style="font-weight:600;font-size:13px;margin-bottom:4px">${w.name}</div>
            <div style="font-size:11px;color:#71717a">Code: ${w.code}</div>
            <div style="font-size:11px;color:#71717a">Capacity: ${w.capacity?.toLocaleString()}</div>
          </div>
        `);
      markersRef.current.push(m);
    });

    // Order markers — use random coords near Hyderabad if no geo data
    orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').forEach(o => {
      const lat = o.shippingAddress?.latitude || (17.32 + Math.random() * 0.15);
      const lng = o.shippingAddress?.longitude || (78.42 + Math.random() * 0.13);
      const color = STATUS_COLORS[o.status] || '#888';
      const emoji = o.priority === 'urgent' ? '🔴' : o.status === 'in_transit' ? '🚚' : '📦';

      const m = window.L.marker([lat, lng], { icon: makeIcon(color, emoji, 28) })
        .addTo(mapInstance.current)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:180px">
            <div style="font-weight:600;font-size:13px;margin-bottom:4px">${o.orderNumber}</div>
            <div style="font-size:11px;color:#71717a">Customer: ${o.customerName}</div>
            <div style="font-size:11px;color:#71717a">${o.shippingAddress?.line1}, ${o.shippingAddress?.city}</div>
            <div style="margin-top:6px">
              <span style="background:${color}20;color:${color};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">${o.status}</span>
              <span style="background:#6366f120;color:#6366f1;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;margin-left:4px">${o.priority}</span>
            </div>
          </div>
        `);
      markersRef.current.push(m);
    });

    // Driver markers
    drivers.forEach((d, i) => {
      // Simulate location for on_delivery drivers
      const lat = d.currentLocation?.latitude || (17.35 + i * 0.03 + Math.random() * 0.02);
      const lng = d.currentLocation?.longitude || (78.45 + i * 0.03 + Math.random() * 0.02);
      const color = DRIVER_STATUS_COLORS[d.status] || '#888';
      const emoji = d.status === 'on_delivery' ? '🚗' : d.status === 'available' ? '✅' : '💤';

      const m = window.L.marker([lat, lng], { icon: makeIcon(color, emoji, 34) })
        .addTo(mapInstance.current)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:180px">
            <div style="font-weight:600;font-size:13px;margin-bottom:4px">${d.name}</div>
            <div style="font-size:11px;color:#71717a">${d.vehicleType} · ${d.vehicleNumber || '—'}</div>
            <div style="font-size:11px;color:#71717a">⭐ ${d.rating?.toFixed(1)} · ${d.totalDeliveries} deliveries</div>
            <div style="margin-top:6px">
              <span style="background:${color}20;color:${color};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">${d.status.replace('_', ' ')}</span>
            </div>
          </div>
        `);
      markersRef.current.push(m);
    });

    // Draw optimized route if provided
    if (route?.length > 1) {
      const latlngs = route.map(r => [r.lat, r.lng]);
      routeLineRef.current = window.L.polyline(latlngs, {
        color: '#6366f1', weight: 3, opacity: 0.8, dashArray: '8 4',
      }).addTo(mapInstance.current);
      mapInstance.current.fitBounds(routeLineRef.current.getBounds(), { padding: [40, 40] });
    }

  }, [orders, drivers, warehouses, route, ready]);

  if (!ready) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
      Loading map...
    </div>
  );

  return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: 'var(--radius)', zIndex: 1 }} />;
}
