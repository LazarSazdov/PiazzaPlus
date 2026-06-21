import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { catalogApi } from '@/api/sdk';
import { Chip, ListRow, Screen, SearchField, Text, TopAppBar } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { rsd } from '@/lib/format';
import { space } from '@/theme/tokens';

const CATEGORIES = ['Sve', 'Voće', 'Povrće', 'Pijace'];

export default function Pretraga() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Sve');
  const { data: productData } = useAsync(() => catalogApi.products(), []);
  const { data: marketData } = useAsync(() => catalogApi.markets(), []);

  const products = productData?.products ?? [];
  const markets = marketData?.markets ?? [];

  const filteredProducts = useMemo(() => {
    if (category === 'Pijace') return [];
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => (!q || p.name.toLowerCase().includes(q)) && (category === 'Sve' || p.category === category)
    );
  }, [products, query, category]);

  const filteredMarkets = useMemo(() => {
    if (category !== 'Sve' && category !== 'Pijace') return [];
    const q = query.trim().toLowerCase();
    return markets.filter((m) => !q || m.name.toLowerCase().includes(q));
  }, [markets, query, category]);

  return (
    <Screen padded={false}>
      <TopAppBar title="Pretraga" back />
      <View style={{ paddingHorizontal: space.lg, paddingTop: space.lg, gap: space.md }}>
        <SearchField placeholder="Pretražite..." value={query} onChangeText={setQuery} autoFocus />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: space.md, paddingBottom: space.xl }}>
        {filteredMarkets.length > 0 ? (
          <Text variant="caption1" color="textMuted" style={{ paddingHorizontal: space.lg, paddingVertical: space.sm }}>
            PIJACE
          </Text>
        ) : null}
        {filteredMarkets.map((m) => (
          <ListRow
            key={m.id}
            title={m.name}
            subtitle={`${m.city} · ${m.workHours}`}
            icon="map-pin"
            onPress={() => router.push('/(kupac)/heatmap')}
          />
        ))}

        {filteredProducts.length > 0 ? (
          <Text variant="caption1" color="textMuted" style={{ paddingHorizontal: space.lg, paddingVertical: space.sm }}>
            PROIZVODI
          </Text>
        ) : null}
        {filteredProducts.map((p) => (
          <ListRow
            key={p.id}
            title={p.name}
            subtitle={`${rsd(p.price)} / ${p.unit} · ${p.sellerName ?? 'Pijaca'}`}
            imageKey={p.imageKey}
            onPress={() => router.push(`/(kupac)/product?id=${p.id}`)}
          />
        ))}

        {filteredProducts.length === 0 && filteredMarkets.length === 0 ? (
          <Text variant="body" color="textMuted" center style={{ marginTop: space.xl }}>
            Nema rezultata za "{query}".
          </Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
