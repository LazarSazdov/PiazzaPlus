import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { chartRamp, colors, radii, space, stroke } from '@/theme/tokens';

interface BarChartProps {
  title?: string;
  data: number[];
  labels: string[];
}

const PLOT_HEIGHT = 132;
const AXIS_WIDTH = 46;

/** Bars darken as they grow taller. Rebuilt natively per figma/MEASUREMENTS.md §Charts. */
export function BarChart({ title, data, labels }: BarChartProps) {
  const niceMax = niceCeil(Math.max(1, ...data));
  const ticks = [niceMax, Math.round(niceMax / 2), 0];

  return (
    <View style={styles.card}>
      {title ? (
        <Text variant="footnote" color="textMuted" style={styles.title}>
          {title}
        </Text>
      ) : null}

      <View style={styles.body}>
        <View style={styles.axis}>
          {ticks.map((t) => (
            <Text key={t} variant="caption2" color="textMuted" style={styles.tick}>
              {t}
            </Text>
          ))}
        </View>

        <View style={styles.plotWrap}>
          <View style={styles.plot}>
            {data.map((value, i) => {
              const h = Math.max(2, (value / niceMax) * PLOT_HEIGHT);
              return (
                <View key={i} style={styles.col}>
                  <View style={[styles.bar, { height: h, backgroundColor: rampColor(value, niceMax) }]} />
                </View>
              );
            })}
          </View>
          <View style={styles.labels}>
            {labels.map((l, i) => (
              <Text key={i} variant="caption2" color="textMuted" style={styles.label} numberOfLines={1}>
                {l}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function rampColor(value: number, max: number): string {
  const ratio = value / max;
  const idx = Math.min(chartRamp.length - 1, Math.floor(ratio * chartRamp.length));
  return chartRamp[idx];
}

function niceCeil(n: number): number {
  if (n <= 5) return 5;
  if (n <= 10) return 10;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  return Math.ceil(n / mag) * mag;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: stroke.hair,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: space.md,
  },
  title: {},
  body: { flexDirection: 'row' },
  axis: { width: AXIS_WIDTH, height: PLOT_HEIGHT, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 8 },
  tick: { textAlign: 'right' },
  plotWrap: { flex: 1 },
  plot: { height: PLOT_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 22, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  labels: { flexDirection: 'row', gap: 6, marginTop: 6 },
  label: { flex: 1, textAlign: 'center' },
});
