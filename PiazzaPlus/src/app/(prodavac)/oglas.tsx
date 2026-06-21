import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { listingApi } from '@/api/sdk';
import { Button, ImagePlaceholder, Screen, Text, TopAppBar } from '@/components';
import { rsd } from '@/lib/format';
import { useAsync } from '@/lib/useAsync';
import { colors, radii, space } from '@/theme/tokens';

export default function DetaljiOglasa() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useAsync(() => listingApi.get(id), [id]);
  const listing = data?.listing;

  return (
    <Screen padded={false}>
      <TopAppBar title="Detalji oglasa" back />
      {loading || !listing ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : (
        <Screen scroll padded contentStyle={{ gap: space.lg }}>
          {listing.imageUrl ? (
            <Image source={{ uri: listing.imageUrl }} style={styles.hero} contentFit="cover" />
          ) : (
            <ImagePlaceholder imageKey={listing.imageKey} height={300} />
          )}

          <View style={styles.card}>
            <Text variant="title3" color="text">
              {listing.title}
            </Text>
            <View style={styles.priceRow}>
              {listing.discount > 0 ? (
                <>
                  <Text variant="title3" color="primary">
                    {rsd(listing.finalPrice)}
                  </Text>
                  <Text variant="subhead" color="textMuted" style={styles.strike}>
                    {rsd(listing.price)}
                  </Text>
                  <Text variant="subhead" color="error">
                    -{listing.discount}%
                  </Text>
                </>
              ) : (
                <Text variant="title3" color="primary">
                  {rsd(listing.price)}
                </Text>
              )}
            </View>
            <Text variant="subhead" color="textMuted">
              Kategorija: {listing.category} · {listing.quantity}
            </Text>
            {listing.description ? (
              <Text variant="body" color="textMuted">
                {listing.description}
              </Text>
            ) : null}
          </View>

          <View style={{ gap: space.md }}>
            <Button label="Izmeni oglas" onPress={() => router.push(`/(prodavac)/forma-izmenu?id=${listing.id}`)} />
            <Button label="Podesi sniženje" variant="secondary" onPress={() => router.push(`/(prodavac)/podesi-snizenje?id=${listing.id}`)} />
            <Button label="Obriši oglas" variant="dangerOutline" onPress={() => router.push(`/(prodavac)/brisanje?id=${listing.id}`)} />
          </View>
        </Screen>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 300, borderRadius: radii.card, backgroundColor: colors.border },
  card: { backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.sm },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  strike: { textDecorationLine: 'line-through' },
});
