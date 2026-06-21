import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { recipeApi } from '@/api/sdk';
import { Button, ImagePlaceholder, Screen, Text, TopAppBar } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { colors, space } from '@/theme/tokens';

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useAsync(() => recipeApi.get(id), [id]);
  const recipe = data?.recipe;

  return (
    <Screen padded={false}>
      <TopAppBar title="Recept" back />
      {loading || !recipe ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.xl }} />
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
