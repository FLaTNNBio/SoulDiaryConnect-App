import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export default function Footer() {
  return (
    <View style={[styles.container]}>
      <Text style={styles.text}>
        <Ionicons name="alert-circle-outline" size={13} color={Colors.textGray} />
        {'  '}L'IA può commettere errori
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 'auto',
  },
  text: {
    fontSize: 12,
    color: Colors.textGray,
  },
});