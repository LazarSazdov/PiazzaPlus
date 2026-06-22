import { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '@/theme/tokens';

export interface MapMarker {
  lat: number;
  lng: number;
  title?: string;
  color?: string;
}
export interface MapCircle {
  lat: number;
  lng: number;
  radius: number; // metres
  color: string;
}

interface OsmMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  circles?: MapCircle[];
  style?: StyleProp<ViewStyle>;
}

/**
 * Real OpenStreetMap rendered with Leaflet inside a WebView (works in Expo Go,
 * no native maps SDK and no API key). Markers are drawn as coloured circle-markers
 * so no marker-icon assets are needed; circles give a lightweight heatmap look.
 */
export function OsmMap({ center, zoom = 13, markers = [], circles = [], style }: OsmMapProps) {
  const html = useMemo(
    () => buildHtml(center, zoom, markers, circles),
    [center.lat, center.lng, zoom, JSON.stringify(markers), JSON.stringify(circles)]
  );

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        androidLayerType="hardware"
      />
    </View>
  );
}

function buildHtml(
  center: { lat: number; lng: number },
  zoom: number,
  markers: MapMarker[],
  circles: MapCircle[]
): string {
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#map{height:100%;margin:0;padding:0;background:${colors.bg}}</style>
</head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var map = L.map('map', { zoomControl: true, attributionControl: false })
            .setView([${center.lat}, ${center.lng}], ${zoom});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
  var circles = ${JSON.stringify(circles)};
  circles.forEach(function (c) {
    L.circle([c.lat, c.lng], { radius: c.radius, color: c.color, fillColor: c.color, fillOpacity: 0.35, weight: 1 }).addTo(map);
  });
  var markers = ${JSON.stringify(markers)};
  markers.forEach(function (m) {
    var cm = L.circleMarker([m.lat, m.lng], { radius: 9, color: '#ffffff', weight: 2, fillColor: m.color || '${colors.primary}', fillOpacity: 1 }).addTo(map);
    if (m.title) cm.bindPopup(m.title);
  });
</script></body></html>`;
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: colors.border },
  web: { flex: 1, backgroundColor: colors.bg },
});
