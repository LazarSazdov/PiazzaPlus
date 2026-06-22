import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { recipeApi } from '@/api/sdk';
import { Card, Screen, SegmentedTabs, Text, TopAppBar } from '@/components';
import { useAsync } from '@/lib/useAsync';
import { useAuth } from '@/store/auth';
import { colors, space } from '@/theme/tokens';

export default function Recepti() {
  const { user } = useAuth();
  const { data, loading, reload } = useAsync(() => recipeApi.list('saved'), []);
  const recipes = data?.recipes ?? [];

  // Refresh saved list when returning from a recipe (save/unsave may have changed it).
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  return (
    <Screen padded={false}>
      <TopAppBar
        title="Recepti"
        avatarKey={user?.avatarKey ?? 'kupac'}
        profileHref="/(kupac)/profile"
        notificationsHref="/(kupac)/notifications"
        settingsHref="/(kupac)/settings"
      />
      <View style={{ padding: space.lg, gap: space.lg, flex: 1 }}>
        <SegmentedTabs
          options={['Sačuvani', 'AI generator']}
          value="Sačuvani"
          onChange={(v) => {
            if (v === 'AI generator') router.push('/(kupac)/ai-generator');
          }}
        />
        <Text variant="headline" color="text">
          Sačuvani recepti
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : recipes.length === 0 ? (
          <Text variant="body" color="textMuted">
            Još nemate sačuvanih recepata.
          </Text>
        ) : (
          <View style={styles.grid}>
            {recipes.map((r) => (
              <View key={r.id} style={styles.cell}>
                <Card
                  fill
                  title={r.title}
                  subtitle={r.description}
                  imageKey={r.imageKey}
                  onPress={() => router.push(`/(kupac)/recipe?id=${r.id}`)}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  cell: { width: '47.5%', flexGrow: 1 },
});
