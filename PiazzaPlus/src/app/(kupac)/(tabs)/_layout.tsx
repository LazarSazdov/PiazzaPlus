import { Tabs } from 'expo-router';
import { makeTabBar, TabConfig } from '@/components/AppTabBar';

const KUPAC_TABS: TabConfig[] = [
  { name: 'home', label: 'Početna', icon: 'home' },
  { name: 'heatmap', label: 'HeatMapa', icon: 'map' },
  { name: 'recepti', label: 'Recept', icon: 'book-open' },
  { name: 'ocr', label: 'OCR Scan', icon: 'camera' },
  { name: 'history', label: 'Istorija', icon: 'clock' },
];

const KupacTabBar = makeTabBar(KUPAC_TABS);

export default function KupacTabsLayout() {
  return (
    <Tabs tabBar={(props) => <KupacTabBar {...props} />} screenOptions={{ headerShown: false }}>
      {KUPAC_TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} />
      ))}
    </Tabs>
  );
}
