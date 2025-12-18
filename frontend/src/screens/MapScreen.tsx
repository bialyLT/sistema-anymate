import React from 'react';
import { View } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledMapView = styled(MapView);

const MapScreen = () => {
  return (
    <StyledView className="flex-1">
      <StyledMapView
        className="w-full h-full"
        initialRegion={{
          latitude: -34.6037,
          longitude: -58.3816,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        mapType="none" // Disable Google Maps tiles
      >
        <UrlTile
          /**
           * The url template of the tile server. The patterns {x} {y} {z} will be replaced at runtime
           * For example, http://c.tile.openstreetmap.org/{z}/{x}/{y}.png
           */
          urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
      </StyledMapView>
    </StyledView>
  );
};

export default MapScreen;
