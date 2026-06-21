import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { recipeApi } from '@/api/sdk';
import { Recipe } from '@/api/types';
import { Button, Card, Screen, SegmentedTabs, Text, TopAppBar, useToast } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { colors, space } from '@/theme/tokens';

export default function AiGenerator() {
  const toast = useToast();
  const { data, loading, reload, setData } = useAsync(() => recipeApi.list('ai'), []);
  const [generating, setGenerating] = useState(false);
  const recipes: Recipe[] = data?.recipes ?? [];

  const onGenerate = async () => {
    setGenerating(true);
    try {
      const { recipe } = await recipeApi.generate();
      toast.show('Novi recept je generisan.', 'success');
      setData({ recipes: [recipe, ...recipes] });
      router.push(`/(kupac)/recipe?id=${recipe.id}`);
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : 'Greška pri generisanju.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar title="AI generator" back />
      <Screen scroll padded contentStyle={{ gap: space.lg }}>
        <SegmentedTabs
          options={['Sačuvani', 'AI generator']}
          value="AI generator"
          onChange={(v) => {
            if (v === 'Sačuvani') router.replace('/(kupac)/recepti');
          }}
        />

        <Text variant="body" color="textMuted">
          Generišite recept na osnovu sezonskih namirnica dostupnih na pijaci.
        </Text>
        <Button label="Generiši novi recept" onPress={onGenerate} loading={generating} />

        <Text variant="headline" color="text">
          Generisani recepti
        </Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.grid}>
            {recipes.map((r) => (
              <View key={r.id} style={styles.cell}>
                <Card fill title={r.title} subtitle={r.description} imageKey={r.imageKey} onPress={() => router.push(`/(kupac)/recipe?id=${r.id}`)} />
              </View>
            ))}
          </View>
        )}
      </Screen>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  cell: { width: '47.5%', flexGrow: 1 },
});
