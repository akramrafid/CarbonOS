import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Layers, ShieldAlert } from 'lucide-react';
import { useHarvestStore } from '../../lib/useHarvestStore';
import { Button } from '../ui/Button';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom colored icons
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  blue: createIcon('blue'), // Own farm
  green: createIcon('green'), // Low risk
  gold: createIcon('gold'), // Medium risk
  red: createIcon('red') // High risk
};

// District center coordinates mapping (Mock)
const districtCoords = {
  "Dhaka": [23.8103, 90.4125],
  "Rajshahi": [24.3745, 88.6042],
  "Sylhet": [24.8949, 91.8687],
  "Chittagong": [22.3569, 91.7832],
  "Khulna": [22.8456, 89.5403],
  "Barisal": [22.7010, 90.3535],
  "Rangpur": [25.7439, 89.2752]
};

const defaultCenter = [23.6850, 90.3563]; // Center of Bangladesh

// Component to dynamically change map center and keep Leaflet container sized properly
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 11);
  }, [center, map]);

  useEffect(() => {
    const container = map.getContainer();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    let observer;
    if (typeof ResizeObserver !== 'undefined' && container) {
      observer = new ResizeObserver(() => {
        map.invalidateSize();
      });
      observer.observe(container);
    }
    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [map]);

  return null;
}

const LocalRiskMap = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const { batches } = useHarvestStore();
  const [mapMode, setMapMode] = useState('street');

  const [center, setCenter] = useState(defaultCenter);
  const [neighbors, setNeighbors] = useState([]);

  const activeDistrict = batches.length > 0 ? batches[0].district : "Dhaka";

  useEffect(() => {
    // 1. Center map on farmer's district
    const coords = districtCoords[activeDistrict] || defaultCenter;
    setCenter(coords);

    // 2. Generate Mock Neighbor Data Points (Anonymous)
    const generateNeighbors = () => {
      const pts = [];
      const numNeighbors = 12 + Math.floor(Math.random() * 8); // 12 to 20

      for (let i = 0; i < numNeighbors; i++) {
        // Random offset within roughly 10-15km
        const latOffset = (Math.random() - 0.5) * 0.15;
        const lngOffset = (Math.random() - 0.5) * 0.15;

        const rand = Math.random();
        let riskLevel = 'Low';
        let bnRisk = 'নিম্ন';
        let color = 'green';

        if (rand > 0.8) {
          riskLevel = 'High';
          bnRisk = 'উচ্চ';
          color = 'red';
        } else if (rand > 0.5) {
          riskLevel = 'Medium';
          bnRisk = 'মাঝারি';
          color = 'gold';
        }

        pts.push({
          id: i,
          lat: coords[0] + latOffset,
          lng: coords[1] + lngOffset,
          riskLevel,
          bnRisk,
          color,
          cropBn: Math.random() > 0.5 ? 'ধান' : 'আলু',
          timeStr: `${Math.floor(Math.random() * 5) + 1} ঘণ্টা আগে`
        });
      }
      return pts;
    };

    setNeighbors(generateNeighbors());
  }, [activeDistrict]);

  const mapContent = (
    <div className="w-full flex flex-col">
      {!isEmbedded && (
        <button onClick={() => navigate('/farmers-ai')} className="self-start flex items-center text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors font-medium">
          <ArrowLeft size={20} className="mr-2" /> Back to Landing
        </button>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          {!isEmbedded ? (
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Local Risk Map</h1>
          ) : (
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Local Risk Map</h2>
          )}
          <p className="text-gray-600 dark:text-white/60 text-sm">Illustrative community spoilage risk pins around {activeDistrict}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
          <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
            <Button
              type="button"
              size="sm"
              variant={mapMode === 'street' ? 'secondary' : 'ghost'}
              onClick={() => setMapMode('street')}
              leftIcon={<Layers className="w-3.5 h-3.5" />}
            >
              Street Map
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mapMode === 'satellite' ? 'secondary' : 'ghost'}
              onClick={() => setMapMode('satellite')}
            >
              Satellite
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-4 bg-white/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 rounded-2xl text-xs font-bold text-gray-800 dark:text-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2 shadow-[0_0_10px_rgba(59,130,246,0.3)]"></span> You</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2 shadow-[0_0_10px_rgba(34,197,94,0.3)]"></span> Low Risk</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-2 shadow-[0_0_10px_rgba(234,179,8,0.3)]"></span> Medium</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></span> High Risk</div>
          </div>
        </div>
      </div>

      <div className="isolate bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 p-2.5 rounded-[32px] relative z-0 overflow-hidden shadow-2xl" style={{ height: '550px' }}>
        <MapContainer
          center={center}
          zoom={11}
          scrollWheelZoom={true}
          className="w-full h-full rounded-[24px] z-0"
        >
          {/* [COMMENTED OUT FOR PERSONAL REFERENCE — CARTO basemaps occasionally block or show key overlays]
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          /> */}
          {mapMode === 'satellite' ? (
            <TileLayer
              key="esri-satellite"
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
              className="map-tiles"
            />
          ) : (
            <TileLayer
              key="osm-standard"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              className="map-tiles"
            />
          )}
          <MapUpdater center={center} />

          {/* Farmer's Own Location */}
          <Marker position={center} icon={icons.blue}>
            <Popup>
              <div className="font-sans text-gray-900 dark:text-white text-sm">
                <strong className="text-blue-600 dark:text-blue-400 block mb-1">আপনার অবস্থান</strong>
                {batches.length > 0 ? `ফসল: ${batches[0].cropType}` : "কোনো ফসল নেই"}
              </div>
            </Popup>
          </Marker>

          {/* Mock Neighbors */}
          {neighbors.map(n => (
            <Marker key={n.id} position={[n.lat, n.lng]} icon={icons[n.color]}>
              <Popup>
                <div className="font-sans min-w-[130px] text-gray-900 dark:text-white text-sm">
                  <div className="font-bold border-b border-gray-200 dark:border-white/10 pb-1 mb-2">এলাকার তথ্য</div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-600 dark:text-white/70">ফসল:</span>
                    <strong className="text-gray-900 dark:text-white">{n.cropBn}</strong>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-600 dark:text-white/70">ঝুঁকি:</span>
                    <strong className={n.color === 'red' ? 'text-red-600 dark:text-red-400' : n.color === 'gold' ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-700 dark:text-green-400'}>
                      {n.bnRisk}
                    </strong>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-white/50 mt-2 text-right font-mono">
                    আপডেট: {n.timeStr}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Privacy & Demo Disclaimer Overlay */}
          <div className="absolute bottom-4 left-3 right-3 sm:right-auto sm:bottom-6 sm:left-6 z-20 bg-white/95 dark:bg-black/85 backdrop-blur-md border border-gray-200 dark:border-white/10 px-4 py-2.5 rounded-xl flex items-center text-xs text-gray-700 dark:text-white/80 sm:max-w-sm shadow-md">
            <ShieldAlert size={16} className="text-emerald-600 dark:text-lime-400 mr-2 shrink-0 animate-pulse" />
            <p><strong>Demo Risk Overlay:</strong> Neighbor pins on this map are illustrative simulated data, not live farm telemetry.</p>
          </div>
        </div>
      </div>
      );

      if (isEmbedded) {
    return mapContent;
  }

      return (
        <div className="max-w-6xl mx-auto w-full flex flex-col">
          {mapContent}
        </div>
        );
};

        export default LocalRiskMap;
