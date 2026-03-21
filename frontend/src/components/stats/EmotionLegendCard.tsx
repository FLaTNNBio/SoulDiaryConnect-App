import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { commonStyles } from '../../styles/CommonStyles';

export default function EmotionLegendCard() {
  const legendData = [
    {
      score: '4',
      category: 'Positive',
      color: Colors.green,
      emotions: 'Gioia, felicità, speranza, gratitudine, amore, serenità, entusiasmo, calma, orgoglio.'
    },
    {
      score: '3',
      category: 'Neutre / Ambivalenti',
      color: Colors.mediumViolet,
      emotions: 'Sorpresa, confusione, nostalgia.'
    },
    {
      score: '2',
      category: 'Ansiose',
      color: Colors.orange,
      emotions: 'Ansia, preoccupazione, nervosismo, paura.'
    },
    {
      score: '1',
      category: 'Negative',
      color: Colors.mediumRed,
      emotions: 'Tristezza, rabbia, disgusto, frustrazione, solitudine, delusione, malinconia, disperazione, inadeguatezza, vergogna, colpa, imbarazzo, stanchezza.'
    }
  ];

  return (
    <View style={commonStyles.border_card}>
      <Text style={styles.cardTitle}>Legenda Emozioni</Text>
      
      <View style={styles.legendList}>
        {legendData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
    
            <View style={styles.itemHeader}>
              <View style={[styles.colorBox, { backgroundColor: item.color }]} />
              <Text style={styles.categoryTitle}>
                <Text style={styles.scoreText}>{item.score}</Text> - {item.category}
              </Text>
            </View>
            
            <Text style={styles.emotionsList}>
              {item.emotions}
            </Text>
            
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 16,
  },
  legendList: {
    flexDirection: 'column',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'column',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: 10,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  scoreText: {
    fontWeight: 'bold',
  },
  emotionsList: {
    fontSize: 13,
    color: Colors.textGray,
    lineHeight: 18,
    paddingLeft: 24,
  }
});