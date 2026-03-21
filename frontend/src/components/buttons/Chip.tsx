import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View, 
  GestureResponderEvent 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface ChipProps {
  label: string;
  emoji?: string;
  isActive?: boolean;
  hasInfo?: boolean;
  onPress: (event: GestureResponderEvent) => void;
  onInfoPress?: (event: GestureResponderEvent) => void;
}

export default function Chip({ 
  label, 
  emoji, 
  isActive = false, 
  hasInfo = false, 
  onPress, 
  onInfoPress 
}: ChipProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.filterChip, 
        isActive && styles.filterChipActive
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Renderizza l'emoji se presente */}
        {emoji && <Text style={styles.emojiText}>{emoji}</Text>}
        
        <Text style={[
          styles.filterChipText, 
          isActive && styles.filterChipTextActive
        ]}>
          {label}
        </Text>

        {/* Pulsante Info opzionale */}
        {hasInfo && (
          <TouchableOpacity 
            onPress={onInfoPress} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.infoButton}
          >
            <Ionicons 
              name="information-circle-outline" 
              size={16} 
              color={isActive ? Colors.primary : Colors.textGray} 
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundInput,
    borderWidth: 1,
    borderColor: 'transparent',
    alignSelf: 'flex-start', // Si adatta alla larghezza del testo
  },
  filterChipActive: {
    backgroundColor: Colors.primary + '1A', // 1A = 10% opacità in Hex
    borderColor: Colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiText: {
    marginRight: 6,
    fontSize: 16,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.textGray,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  infoButton: {
    marginLeft: 8,
  }
});