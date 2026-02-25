import React, { useEffect, useRef, useState } from 'react';
import { io as ioClient } from 'socket.io-client';
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

const MapView: React.FC = () => {
  const [markers, setMarkers] = useState<Array<any>>([]);
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const socketRef = useRef<any>(null);

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch markers from API (defined outside useCallback to prevent loop)
  const fetchMarkers = async () => {
    try {
      const res = await fetch(`${API_URL}/properties?limit=100`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = data.data || data || [];
      
      // Zambia center: -13.1333, 27.8493
      // Fallback locations for common townships
      const townFallback: Record<string, [number, number]> = {
        'MAKENI': [-12.9, 28.3],
        'Kabulonga': [-12.8, 28.2],
        'Other': [-13.1, 27.8],
        'Lusaka': [-13.1333, 27.8493],
      };
      
      const pts = list
        .map((p: any) => {
          let lat = p.location?.coordinates?.lat;
          let lng = p.location?.coordinates?.lng;
          
          // If no coordinates, use township fallback + small random offset
          if (!lat || !lng) {
            const town = p.location?.township || 'Other';
            const fallback = townFallback[town] || townFallback['Other'];
            const randLat = (Math.random() - 0.5) * 0.05;
            const randLng = (Math.random() - 0.5) * 0.05;
            lat = fallback[0] + randLat;
            lng = fallback[1] + randLng;
          }
          
          return {
            id: p._id,
            title: p.title,
            lat,
            lng,
            price: p.price,
            town: p.location?.township || 'Lusaka',
          };
        })
        .filter((x: any) => x.lat && x.lng);
      
      setMarkers(pts);
    } catch (err) {
      console.warn('[MapView] Failed to load properties:', err);
    }
  };

  // Fetch on mount
  useEffect(() => {
    if (!isClient) return;
    fetchMarkers();
  }, [isClient]);

  // Poll for new markers every 15s (no dependency on fetchMarkers to prevent loop)
  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(fetchMarkers, 15000);
    return () => clearInterval(interval);
  }, [isClient]);

  // Cleanup map instance on unmount to prevent "already initialized" error
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        // Fully remove Leaflet map and clear the DOM container
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Also handle StrictMode double-invoke by clearing _leaflet_id if it exists
  useEffect(() => {
    return () => {
      // Find all map containers and clear Leaflet IDs to prevent re-init errors
      document.querySelectorAll('[class*="leaflet"]').forEach((el) => {
        (el as any)._leaflet_id = null;
      });
    };
  }, []);

  // Listen for real-time new properties via Socket.IO
  useEffect(() => {
    if (!isClient) return;

    const socket = ioClient(API_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    const handleNewProperty = (payload: any) => {
      const p = payload?.property || payload;
      const lat = p?.location?.coordinates?.lat;
      const lng = p?.location?.coordinates?.lng;
      if (!lat || !lng) return;

      setMarkers((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === p._id)) return prev;
        return [
          {
            id: p._id,
            title: p.title,
            lat,
            lng,
            price: p.price,
            town: p.location?.township || '',
          },
          ...prev,
        ];
      });
    };

    socket.on('new-property', handleNewProperty);
    return () => {
      socket.off('new-property', handleNewProperty);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isClient]);

  // Cleanup Leaflet map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const center: [number, number] = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [-15.3875, 28.3228];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h4 className="mb-2">📍 Property Locations</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
          {markers.length} properties available. Click on markers to view details.
        </p>
      </div>
      <div 
        style={{ 
          height: 500, 
          marginBottom: 30, 
          borderRadius: 8, 
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}
      >
        {isClient ? (
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            ref={(map: any) => {
              if (map) {
                mapRef.current = map._leaflet_map || map;
              }
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />
            {markers.map((m) => (
              <Marker key={m.id} position={[m.lat, m.lng]}>
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
          <p style={{ color: '#999', textAlign: 'center' }}>Map view coming soon...</p>
        )}
      </div>
    </div>
  );
};

export default MapView;
