import React, { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';

// A component to center/zoom map when boundaries are uploaded or presets selected
export const RecenterMap = ({ bounds, center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && Array.isArray(bounds) && bounds.length === 2 && bounds[0] && bounds[1]) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    } else if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [bounds, center, zoom, map]);
  return null;
};

// Component to force Leaflet resize on mount or tab switch so tiles render immediately
export const MapResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// Component to handle drawing points and click inspection on map
export const MapEventHandler = ({ 
  isDrawing, 
  drawPoints, 
  setDrawPoints, 
  onPixelClick, 
  hoverCoords, 
  setHoverCoords 
}) => {
  useMapEvents({
    mousemove(e) {
      if (setHoverCoords) {
        setHoverCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
    click(e) {
      if (isDrawing) {
        setDrawPoints([...drawPoints, [e.latlng.lat, e.latlng.lng]]);
      } else if (onPixelClick) {
        onPixelClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });

  return null;
};
