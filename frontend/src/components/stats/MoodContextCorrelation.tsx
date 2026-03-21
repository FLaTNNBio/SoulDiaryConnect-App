import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors'; 
import { commonStyles } from '../../styles/CommonStyles';

const screenWidth = Dimensions.get('window').width;

interface MoodContextCorrelationProps {
  data: {
    labels: string[];
    positive: number[];
    neutral: number[];
    anxious: number[];
    negative: number[];
    medie: number[];
    emojis: string[];
    contesto_migliore: string;
    contesto_migliore_emoji: string;
    contesto_migliore_media: number;
    contesto_peggiore: string;
    contesto_peggiore_emoji: string;
    contesto_peggiore_media: number;
  };
}

export default function MoodContextCorrelation({ data }: MoodContextCorrelationProps) {
  
  if (!data || !data.labels || data.labels.length === 0) return null;

  // Highlights dati reali
  const positiveContext = { 
    name: `${data.contesto_migliore_emoji || ''} ${data.contesto_migliore}`.trim(), 
    score: `${data.contesto_migliore_media.toFixed(1)} / 4` 
  };
  
  const criticalContext = { 
    name: `${data.contesto_peggiore_emoji || ''} ${data.contesto_peggiore}`.trim(), 
    score: `${data.contesto_peggiore_media.toFixed(1)} / 4` 
  };

  // Calcolo scala grafico
  const allValues = [...data.positive, ...data.neutral, ...data.anxious, ...data.negative];
  const maxValue = Math.max(...allValues, 1);
  const chartHeight = 140;

  return (
    <View style={commonStyles.border_card}>
      
      {/* --- DESCRIZIONE --- */}
      <Text style={styles.descriptionText}>
        Questa analisi mostra come lo stato emotivo del paziente varia in base al contesto sociale. 
        Permette di identificare quali contesti sono associati ad emozioni positive o negative.
      </Text>

      {/* --- HIGHLIGHTS BOXES --- */}
      <View style={styles.highlightsContainer}>
        <View style={[styles.highlightBox, styles.highlightPositive]}>
          <View style={styles.highlightHeader}>
            <Ionicons name="arrow-up-circle-outline" size={18} color={Colors.darkGreen} />
            <Text style={[styles.highlightTitle, { color: Colors.darkGreen }]}>Più positivo</Text>
          </View>
          <Text style={styles.contextName} numberOfLines={1}>{positiveContext.name}</Text>
          <Text style={styles.contextScore}>Media: {positiveContext.score}</Text>
        </View>

        <View style={[styles.highlightBox, styles.highlightCritical]}>
          <View style={styles.highlightHeader}>
            <Ionicons name="warning-outline" size={18} color={Colors.red} />
            <Text style={[styles.highlightTitle, { color: Colors.red }]}>Più critico</Text>
          </View>
          <Text style={styles.contextName} numberOfLines={1}>{criticalContext.name}</Text>
          <Text style={styles.contextScore}>Media: {criticalContext.score}</Text>
        </View>
      </View>

      <Text style={styles.chartTitle}>Distribuzione Emozioni per Contesto</Text>

      {/* --- LEGENDA COLORI --- */}
      <View style={styles.legendContainer}>
        <LegendItem color="#66BB6A" label="Positivo" />
        <LegendItem color="#BA68C8" label="Neutro" />
        <LegendItem color="#FFCA28" label="Ansioso" />
        <LegendItem color="#EF5350" label="Negativo" />
      </View>

      {/* --- GRAFICO RAGGRUPPATO --- */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.chartWrapper}>
          {data.labels.map((label, index) => (
            <View key={index} style={styles.contextGroup}>
              <View style={styles.barsContainer}>
                <Bar height={(data.positive[index] / maxValue) * chartHeight} color="#66BB6A" value={data.positive[index]} />
                <Bar height={(data.neutral[index] / maxValue) * chartHeight} color="#BA68C8" value={data.neutral[index]} />
                <Bar height={(data.anxious[index] / maxValue) * chartHeight} color="#FFCA28" value={data.anxious[index]} />
                <Bar height={(data.negative[index] / maxValue) * chartHeight} color="#EF5350" value={data.negative[index]} />
              </View>
              <Text style={styles.axisLabel}>{data.emojis[index]} {label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

    </View>
  );
}

// Helper: Singola colonna
const Bar = ({ height, color, value }: { height: number, color: string, value: number }) => (
  <View style={styles.singleBarWrapper}>
    {value > 0 && <Text style={styles.barValueText}>{value}</Text>}
    <View style={[styles.barShape, { height: Math.max(height, 2), backgroundColor: color }]} />
  </View>
);

// Helper: Legenda
const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendSquare, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  descriptionText: {
    fontSize: 13,
    color: Colors.textGray,
    lineHeight: 18,
    marginBottom: 15,
  },
  highlightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  highlightBox: {
    width: '48%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  highlightPositive: { backgroundColor: '#F1F8E9', borderColor: '#C5E1A5' },
  highlightCritical: { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' },
  highlightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 },
  highlightTitle: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  contextName: { fontSize: 15, fontWeight: '800', color: Colors.textDark },
  contextScore: { fontSize: 12, color: Colors.textGray },
  
  chartTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark, textAlign: 'center', marginBottom: 10 },
  legendContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 15 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSquare: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 11, color: Colors.textGray },

  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 10,
    minHeight: 180,
  },
  contextGroup: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderInput,
  },
  singleBarWrapper: {
    alignItems: 'center',
    width: 16,
  },
  barShape: {
    width: '100%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  barValueText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: Colors.textGray,
    marginBottom: 2,
  },
  axisLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDark,
  },
});