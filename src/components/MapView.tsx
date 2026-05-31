import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths using CDN URLs for production compatibility
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface MapViewProps {
  properties?: any[];
  height?: number;
  hideHeader?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ properties: externalProperties, height = 500, hideHeader = false }) => {
  const [markers, setMarkers] = useState<Array<any>>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const buildMarkers = (list: any[]) => {
    const townFallback: Record<string, [number, number]> = {
      MAKENI: [-12.9, 28.3],
      Kabulonga: [-12.8, 28.2],
      Other: [-13.1, 27.8],
      Lusaka: [-13.1333, 27.8493],
    };

    return list
      .map((p: any) => {
        let lat = p.location?.coordinates?.lat;
        let lng = p.location?.coordinates?.lng;

        if (!lat || !lng) {
          const town = p.location?.township || 'Other';
          const fallback = townFallback[town] || townFallback.Other;
          const randLat = (Math.random() - 0.5) * 0.02;
          const randLng = (Math.random() - 0.5) * 0.02;
          lat = fallback[0] + randLat;
          lng = fallback[1] + randLng;
        }

        return {
          id: p._id || p.id,
          title: p.title || 'Property',
          lat,
          lng,
          price: p.price,
          town: p.location?.township || 'Lusaka',
        };
      })
      .filter((x: any) => x.lat && x.lng);
  };

  useEffect(() => {
    const loadMarkers = async () => {
      try {
        if (externalProperties && externalProperties.length > 0) {
          setMarkers(buildMarkers(externalProperties));
          return;
        }

        const res = await fetch(`${API_URL}/properties?limit=100`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = data.data || data || [];
        setMarkers(buildMarkers(list));
      } catch (err) {
        console.warn('[MapView] Failed to load properties:', err);
      }
    };

    if (!isClient) return;
    loadMarkers();
  }, [isClient, externalProperties]);

  const center: [number, number] = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [-15.3875, 28.3228];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!hideHeader && (
        <div style={{ marginBottom: 16 }}>
          <h4 className="mb-2">📍 Property Locations</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
            {markers.length} properties available. Click on markers to view details.
          </p>
        </div>
      )}
      <div
        style={{
          height: hideHeader ? '100%' : height,
          width: '100%',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          position: 'relative',
          backgroundColor: '#f5f5f5',
        }}
      >
        {isClient ? (
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />
            {markers.map((m) => (
              <Marker
                key={m.id}
                position={[m.lat, m.lng]}
                eventHandlers={{
                  click: () => {
                    // also open Google Maps directly when the marker pin is clicked
                    const url = `https://www.google.com/maps?q=${m.lat},${m.lng}`;
                    window.open(url, '_blank');
                  },
                }}
              >
                <Popup>
                  <div style={{ minWidth: 220, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#333' }}>{m.title}</strong>
                    <div style={{ marginTop: 8, fontSize: '0.9rem', color: '#666' }}>
                      <div><strong>📍 Location:</strong> {m.town}</div>
                      <div><strong>💰 Price:</strong> ZK {m.price?.toLocaleString()}</div>
                      <div style={{ marginTop: 10 }}>
                        <a
                          href={`https://www.google.com/maps?q=${m.lat},${m.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}
                        >
                          🔗 View on Google Maps
                        </a>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#999', textAlign: 'center' }}>Loading map...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
