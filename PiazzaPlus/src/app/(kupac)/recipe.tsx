import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ApiError } from '@/api/client';
import { recipeApi } from '@/api/sdk';
import { Button, ErrorView, ImagePlaceholder, Screen, Text, TopAppBar, useToast } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { colors, space } from '@/theme/tokens';

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => recipeApi.get(id), [id]);
  const recipe = data?.recipe;

  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (recipe) setSaved(recipe.saved);
  }, [recipe]);

  const toggleSave = async () => {
    const next = !saved;
    setSaved(next); // optimistic
    try {
      const { saved: confirmed } = await recipeApi.toggleSave(id);
      setSaved(confirmed);
      toast.show(confirmed ? 'Sačuvano u recepte.' : 'Uklonjeno iz sačuvanih.', confirmed ? 'success' : 'info');
    } catch (e) {
      setSaved(!next); // revert
      toast.show(e instanceof ApiError ? e.message : 'Greška.', 'error');
    }
  };

  return (
    <Screen padded={false}>
      <TopAppBar
        title="Recept"
        back
        action={
          recipe
            ? { icon: 'heart', color: saved ? colors.error : colors.textMuted, onPress: toggleSave, label: 'Sačuvaj recept' }
            : undefined
        }
      />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
      ) : error || !recipe ? (
        <ErrorView message={error ?? 'Recept nije pronađen.'} onRetry={reload} />
      ) : (
        <Screen scroll padded contentStyle={{ gap: space.lg }}>
          <ImagePlaceholder imageKey={recipe.imageKey} height={190} radius={16} />
          <Text variant="title2" color="text">
            {recipe.title}
          </Text>
          <Text variant="body" color="textMuted">
            {recipe.description}
          </Text>

          <Text variant="headline" color="text">
            Sastojci
          </Text>
          <View style={{ gap: space.sm }}>
            {recipe.ingredients.map((ing, i) => (
              <View key={i} style={styles.bullet}>
                <Feather name="check" size={18} color={colors.success} />
                <Text variant="body" color="text" style={{ flex: 1 }}>
                  {ing}
                </Text>
              </View>
            ))}
          </View>

          <Text variant="headline" color="text">
            Priprema
          </Text>
          <View style={{ gap: space.md }}>
            {recipe.steps.map((step, i) => (
              <View key={i} style={styles.step}>
                <View style={styles.num}>
                  <Text variant="footnote" color="surface">
                    {i + 1}
                  </Text>
                </View>
                <Text variant="body" color="text" style={{ flex: 1 }}>
                  {step}
                </Text>
              </View>
            ))}
          </View>

          <Button label="Sastojci na pijaci" onPress={() => router.replace('/(kupac)/pretraga')} />
        </Screen>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  num: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
});
