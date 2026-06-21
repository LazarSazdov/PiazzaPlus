import { Tabs } from 'expo-router';
import { makeTabBar, TabConfig } from '@/components/AppTabBar';

const PRODAVAC_TABS: TabConfig[] = [
  { name: 'pocetna', label: 'Početna', icon: 'home' },
  { name: 'oglasi', label: 'Oglasi', icon: 'tag' },
  { name: 'predikcije', label: 'Predikcije', icon: 'bar-chart-2' },
  { name: 'donacije', label: 'Donacije', icon: 'heart' },
];

const ProdavacTabBar = makeTabBar(PRODAVAC_TABS);

export default function ProdavacTabsLayout() {
  return (
    <Tabs tabBar={(props) => <ProdavacTabBar {...props} />} screenOptions={{ headerShown: false }}>
      {PRODAVAC_TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} />
      ))}
    </Tabs>
  );
}
