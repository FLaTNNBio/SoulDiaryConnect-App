import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';

interface LogoProps {
  scale?: number; // 1 = ORIGINAL SIZE, 0.8 = SMALLER, etc.
  style?: ViewStyle;
}

export default function Logo({ scale = 1, style }: LogoProps) {
  const containerSize = 120 * scale;
  const imageSize = 90 * scale;
  const fontSize = 30 * scale;
  const connectWidth = 160 * scale;
  const connectHeight = 50 * scale;
  const borderRadius = 32 * scale;

  return (
    <View style={[styles.container, style]}>
      
      {/* --- BLUE RECTANGLE --- */}
      <View style={[
        styles.logoContainer, 
        { 
          width: containerSize, 
          height: containerSize, 
          borderRadius: borderRadius 
        }
      ]}>
        <Image 
          source={require('../../../assets/logo.png')} 
          style={{ width: imageSize, height: imageSize }} 
          resizeMode="contain" 
        />
      </View>
      
      {/* --- TITLE --- */}
      <Text style={[styles.appTitle, { fontSize: fontSize }]}>SoulDiary</Text>

      {/* --- LOGO 2 (CONNECT) --- */}
      <Image 
        source={require('../../../assets/logo2.png')} 
        style={{ 
          width: connectWidth, 
          height: connectHeight,
          marginTop: 0,
          marginBottom: 10 * scale
        }} 
        resizeMode="contain" 
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  appTitle: {
    fontWeight: 'bold',
    color: Colors.deepBlue,
    textAlign: 'center',
    marginBottom: 0, 
    lineHeight: 34,
  },
});