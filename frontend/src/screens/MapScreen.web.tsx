import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapScreen.css';

// Buenos Aires coordinates default
const DEFAULT_REGION = {
  lat: -34.6037,
  lng: -58.3816,
  zoom: 13,
};

const MapScreen = () => {
  return (
    <View style={styles.container}>
      {/* 
         Size must be explicitly defined for Leaflet to render in a React Native Web View 
         We use a div wrapper to bridge the gap if needed, or just let MapContainer take full height
      */}
      <div style={{ height: '100%', width: '100%' }}>
        <MapContainer 
          center={[DEFAULT_REGION.lat, DEFAULT_REGION.lng]} 
          zoom={DEFAULT_REGION.zoom} 
          scrollWheelZoom={true}
          className="leaflet-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default MapScreen;
