import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths using CDN (avoids build path issues)
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapEditorProps {
  center?: [number, number];
  zoom?: number;
  marker?: { lat: number; lng: number } | null;
  onSelect?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

const ClickHandler: React.FC<{ onSelect?: (lat: number, lng: number) => void }> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      if (onSelect) onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapEditor: React.FC<MapEditorProps> = ({ center = [-15.3875, 28.3228], zoom = 13, marker = null, onSelect, readOnly = false }) => {
  useEffect(() => {
    // noop - placeholder in case we need side-effects
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 12, padding: '12px 16px', backgroundColor: '#e3f2fd', borderRadius: 6, borderLeft: '4px solid #1976d2' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#1565c0', fontWeight: 500 }}>
          📍 {readOnly ? 'Property Location' : 'Click on the map to drop a pin for your property location'}
        </p>
        {marker && (
          <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#1565c0' }}>
            📌 Coordinates: {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
          </p>
        )}
      </div>
      <div 
        style={{ 
          height: 400,
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}
      >
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!readOnly && <ClickHandler onSelect={onSelect} />}
          {marker && (
            <Marker position={[marker.lat, marker.lng]}>
              <Popup>
                <div style={{ fontSize: '0.9rem' }}>
                  <strong>📍 Selected Location</strong><br />
                  Lat: {marker.lat.toFixed(6)}<br />
                  Lng: {marker.lng.toFixed(6)}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapEditor;
