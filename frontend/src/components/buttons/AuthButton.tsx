import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'logout';
  iconName?: string; 
  iconFamily?: 'ionicons' | 'material'; 
}

export default function AuthButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  iconName,
  iconFamily = 'ionicons'
}: AuthButtonProps) {

  const getIconColor = () => {
    switch (variant) {
      case 'primary': return Colors.white;
      case 'logout': return Colors.red; 
      default: return Colors.primary;
    }
  };

  const IconComponent = iconFamily === 'material' ? MaterialCommunityIcons : Ionicons;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'outline' && styles.outlineButton,
        variant === 'logout' && styles.logoutButton, 
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {iconName && (
          <IconComponent
            name={iconName as any}
            size={20}
            color={getIconColor()}
            style={styles.icon}
          />
        )}
        <Text style={[
          styles.text, 
          variant === 'primary' && styles.primaryText,
          variant === 'outline' && styles.outlineText,
          variant === 'logout' && styles.logoutText 
        ]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryText: {
    color: Colors.white,
  },
  outlineButton: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  outlineText: {
    color: Colors.primary,
  },
  logoutButton: {
    backgroundColor: Colors.lightRed, 
    borderWidth: 1.5,
    borderColor: Colors.borderRed, 
  },
  logoutText: {
    color: Colors.red,
    fontWeight: '700',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});