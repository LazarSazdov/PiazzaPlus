import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { catalogApi, reservationApi } from '@/api/sdk';
import { Button, ErrorView, Screen, Text, TextInput, TopAppBar, useToast } from '@/components';
import { img } from '@/lib/images';
import { rsd } from '@/lib/format';
import { useAsync } from '@/lib/useAsync';
import { colors, radii, space, stroke } from '@/theme/tokens';

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => catalogApi.product(id), [id]);
  const product = data?.product;

  const [qty, setQty] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const quantity = Math.max(0, Number(qty.replace(',', '.')) || 0);
  const total = useMemo(() => (product ? product.price * quantity : 0), [product, quantity]);

  const onOrder = async () => {
    if (!product || quantity <= 0) {
      toast.show('Unesite količinu.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const { reservation } = await reservationApi.create({ productId: product.id, quantity });
      router.replace(`/(kupac)/reservation?id=${reservation.id}`);
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška pri rezervaciji.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="Detalji proizvoda" back />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : error || !product ? (
        <ErrorView message={error ?? 'Proizvod nije pronađen.'} onRetry={reload} />
      ) : (
        <Screen scroll padded contentStyle={{ gap: space.lg }}>
          <View style={styles.header}>
            <Image source={img(product.imageKey)} style={styles.thumb} contentFit="cover" />
            <View style={styles.headerText}>
              <Text variant="title3" color="text">
                {product.name}
              </Text>
              <Text variant="subhead" color="textMuted">
                {product.sellerName ?? 'Pijaca'}
              </Text>
              <Text variant="headline" color="primary">
                {rsd(product.price)} / {product.unit}
              </Text>
              {product.market ? (
                <View style={styles.metaRow}>
                  <Feather name="map-pin" size={14} color={colors.textMuted} />
                  <Text variant="footnote" color="textMuted">
                    {product.market.name} · {product.market.workHours}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <Text variant="body" color="textMuted">
            {product.description}
          </Text>

          <TextInput
            label={`Unesite količinu (${product.unit})`}
            value={qty}
            onChangeText={setQty}
            keyboardType="decimal-pad"
            placeholder="0"
          />

          <View style={styles.totalRow}>
            <Text variant="headline" color="text">
              Ukupno
            </Text>
            <Text variant="title3" color="primary">
              {rsd(total)}
            </Text>
          </View>

          <Button label="Naruči" onPress={onOrder} loading={submitting} />
        </Screen>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: space.lg },
  thumb: { width: 120, height: 100, borderRadius: radii.card, backgroundColor: colors.border },
  headerText: { flex: 1, gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space.md,
    borderTopWidth: stroke.hair,
    borderTopColor: colors.border,
  },
});
