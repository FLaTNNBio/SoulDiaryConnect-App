import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors'; 

interface AlertCardProps {
  title: string;
  text: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  isCritic: boolean;
}

export const AlertCard: React.FC<AlertCardProps> = ({ 
  title, 
  text, 
  iconName,
  isCritic
}) => {
  
  // Definizione dinamica dei colori in base allo stato critico
  const backgroundColor = isCritic ? Colors.lightRed : Colors.background;
  const borderColor = isCritic ? Colors.borderRed : Colors.primary;
  const accentColor = isCritic ? Colors.red : Colors.primary;

  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: backgroundColor,
        borderColor: borderColor 
      }
    ]}>
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name={iconName} 
          size={20} 
          color={accentColor} 
        />
        <Text style={[
          styles.title, 
          { color: accentColor }
        ]}>
          {title}
        </Text>
      </View>
      <Text style={styles.body}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  body: {
    color: Colors.textDark,
    fontSize: 13,
    lineHeight: 19,
  },
});