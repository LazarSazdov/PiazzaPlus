import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { predictionApi } from '@/api/sdk';
import { BarChart, Button, Screen, Text, TopAppBar } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { colors, radii, space } from '@/theme/tokens';

const DAYS = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];

export default function PredikcijaDetalji() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useAsync(() => predictionApi.get(id), [id]);
  const prediction = data?.prediction;

  const peak = prediction ? DAYS[prediction.series.indexOf(Math.max(...prediction.series))] : '';

  return (
    <Screen padded={false}>
      <TopAppBar title="Detalji predikcije" back />
      {loading || !prediction ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : (
        <Screen scroll padded contentStyle={{ gap: space.lg }}>
          <Text variant="title3" color="text">
            {prediction.productName}
          </Text>
          <BarChart title="Predviđeni višak po danima (kg)" data={prediction.series} labels={DAYS} />

          <View style={styles.info}>
            <Feather name="trending-up" size={20} color={colors.primary} />
            <Text variant="body" color="text" style={{ flex: 1 }}>
              Najveći višak se očekuje u {peak}. {prediction.recommended}
            </Text>
          </View>

          <Button label="Prilagodi ponudu" onPress={() => router.push('/(prodavac)/postavljanje')} />
        </Screen>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: { flexDirection: 'row', gap: space.md, backgroundColor: colors.primaryLight, borderRadius: radii.card, padding: space.lg },
});
