import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors'; 
import { commonStyles } from '../../styles/CommonStyles';

export interface StatsData {
  totalNotes: number | string;
  averageScore: number | string;
  topEmotion: string;
  topEmotionCount: number;
}

interface StatsCardProps {
  stats: StatsData;
}

export default function StatsCard({ stats }: StatsCardProps) {
  return (
    <View style={commonStyles.border_card}>
      {/* Notes */}
      <View style={styles.statRow}>
        <View style={styles.labelGroup}>
          <Ionicons name="document-text-outline" size={20} color={Colors.textGray} />
          <Text style={styles.rowLabel}>Note totali</Text>
        </View>
        <View style={styles.valueBox}>
          <Text style={styles.valueTextMain}>{stats.totalNotes}</Text>
        </View>
      </View>

      {/* Average Emotions */}
      <View style={styles.statRow}>
        <View style={styles.labelGroup}>
          <Ionicons name="analytics-outline" size={20} color={Colors.textGray || '#6b7280'} />
          <Text style={styles.rowLabel}>Media emotività</Text>
        </View>
        <View style={styles.valueBox}>
          <Text style={styles.valueTextScore}>{stats.averageScore}</Text>
        </View>
      </View>

      {/* Top Emotion */}
      <View style={[styles.statRow, styles.lastRow]}>
        <View style={styles.labelGroup}>
          <Ionicons name="happy" size={20} color={Colors.textGray || '#6b7280'} />
          <Text style={styles.rowLabel}>Emozione prevalente</Text>
        </View>
        <View style={[styles.valueBox]}>
          <Text style={styles.valueTextEmotion}>
            {stats.topEmotion} <Text style={styles.countText}>({stats.topEmotionCount}x)</Text>
          </Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderInput, 
  },
  lastRow: {
    borderBottomWidth: 0, 
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 16,
    color: Colors.textDark,
    fontWeight: 'bold',
    marginLeft: 12, 
  },
  valueBox: {
    backgroundColor: Colors.backgroundInput, 
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueTextMain: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  valueTextScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary, 
  },
  valueTextEmotion: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textDark,
  },
  countText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: Colors.textGray,
  }
});