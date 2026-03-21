import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

// Definiamo le nuove props
interface AvatarProps {
  firstName: string;
  lastName: string;
}

export default function Avatar({ firstName, lastName }: AvatarProps) {
  const f = firstName ? firstName.charAt(0) : '';
  const l = lastName ? lastName.charAt(0) : '';
  const initials = `${f}${l}`.toUpperCase();

  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderInput,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});