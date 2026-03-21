import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Chip from '../buttons/Chip'; 

export interface KeywordItem {
  id: string;
  word: string;
  emoji: string;
  description: string;
}

interface KeywordListProps {
  keywords: KeywordItem[];
}

export default function KeywordList({ keywords }: KeywordListProps) {
  
  const handleShowInfo = (word: string, description: string) => {
    Alert.alert(
      `${word}`, 
      description,
      [{ text: 'Ho capito', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      {keywords.map((item) => (
        <Chip
          key={item.id}
          label={item.word}
          emoji={item.emoji}
          isActive={false}
          hasInfo={true}
          onPress={() => handleShowInfo(item.word, item.description)}
          onInfoPress={() => handleShowInfo(item.word, item.description)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },
});