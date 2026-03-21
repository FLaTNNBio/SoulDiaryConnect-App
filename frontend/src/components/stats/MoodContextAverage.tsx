import React from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { Colors } from '../../constants/Colors'; 
import { commonStyles } from '../../styles/CommonStyles';

interface MoodContextAverageProps {
  data: {
    labels: string[];
    medie: number[];
    emojis: string[];
  };
}

export default function MoodContextAverage({ data }: MoodContextAverageProps) {
  
  if (!data || !data.labels || data.labels.length === 0) return null;

  // Funzione per determinare il colore della barra in base al punteggio (1-4)
  const getBarColor = (score: number) => {
    if (score >= 3.5) return '#66BB6A'; // Verde (Positivo)
    if (score >= 2.5) return '#BA68C8'; // Lilla (Neutro) - Ora include il 2.5
    if (score >= 1.8) return '#FFCA28'; // Giallo (Ansioso)
    return '#EF5350';                   // Rosso (Critico/Negativo)
  };

  const LABEL_WIDTH = 100;

  return (
    <View style={commonStyles.border_card}>
      <Text style={styles.descriptionText}>
        Questo grafico mostra la media emotiva per ogni contesto sociale, permettendo un confronto diretto 
        tra i diversi ambiti della vita del paziente.   
      </Text>

      <View style={styles.chartWrapper}>
        {/* DASHED BACKGROUND GRID */}
        <View style={[styles.gridOverlay, { marginLeft: LABEL_WIDTH }]}>
          {[0, 1, 2, 3, 4].map((line) => (
            <View 
              key={`grid-${line}`} 
              style={[styles.gridLine, { left: `${(line / 4) * 100}%` }]} 
            />
          ))}
        </View>

        {/* GRAPH LINES - DATI REALI DAL BACKEND */}
        {data.labels.map((label, index) => {
          const score = data.medie[index] || 0;
          const barWidthPercentage = `${(score / 4) * 100}%` as DimensionValue;
          const emoji = data.emojis[index] || '';

          return (
            <View key={index} style={styles.barRow}>
              <Text style={[styles.yAxisLabel, { width: LABEL_WIDTH }]} numberOfLines={1}>
                {emoji} {label}
              </Text>
              <View style={styles.barTrack}>
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      width: barWidthPercentage, 
                      backgroundColor: getBarColor(score) // <--- COLORE DINAMICO
                    }
                  ]} 
                />
                <Text style={styles.scoreText}>{score.toFixed(1)}</Text>
              </View>
            </View>
          );
        })}

        {/* X-AXIS (NUMBERS) */}
        <View style={[styles.xAxisContainer, { marginLeft: LABEL_WIDTH }]}>
          {[1, 2, 3, 4].map(num => (
            <Text key={num} style={styles.xAxisLabel}>{num}</Text>
          ))}
        </View>

        {/* LEGEND - MAPPA COLORI */}
        <View style={styles.legendContainer}>
          <LegendItem color="#EF5350" label="Negativo" score="1" />
          <LegendItem color="#FFCA28" label="Ansioso" score="2" />
          <LegendItem color="#BA68C8" label="Neutro" score="3" />
          <LegendItem color="#66BB6A" label="Positivo" score="4" />
        </View>

      </View>
    </View>
  );
}

// Sottocomponente per la legenda
const LegendItem = ({ color, label, score }: { color: string, label: string, score: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendIndicator, { backgroundColor: color }]} />
    <Text style={styles.legendText}><Text style={styles.legendBold}>{score}</Text> {label}</Text>
  </View>
);

const styles = StyleSheet.create({
  descriptionText: {
    fontSize: 13,
    color: Colors.textGray,
    marginBottom: 20,
    lineHeight: 18,
  },
  chartWrapper: {
    width: '100%',
    position: 'relative',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    bottom: 80,
    flexDirection: 'row',
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    borderLeftWidth: 1,
    borderColor: Colors.borderInput,
    borderStyle: 'dashed',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 1,
  },
  yAxisLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
    paddingRight: 10,
  },
  barTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  scoreText: {
    position: 'absolute',
    right: 8,
    fontSize: 10,
    fontWeight: '900',
    color: Colors.textDark,
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderInput,
  },
  xAxisLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textGray,
    width: 20,
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.borderInput,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 4,
  },
  legendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textGray,
  },
  legendBold: {
    fontWeight: '800',
    color: Colors.textDark,
  }
});