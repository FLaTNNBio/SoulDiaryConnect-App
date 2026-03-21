import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export type UserRole = 'doctor' | 'patient';

interface TypeSelectorProps {
  userType: UserRole;
  setUserType: (type: UserRole) => void;
}

export default function TypeSelector({ userType, setUserType }: TypeSelectorProps) {
  return (
    <View style={styles.selectionContainer}>
      
      {/* Doctor */}
      <TouchableOpacity 
        style={[styles.selectionBox, userType === 'doctor' && styles.selectedBox]}
        onPress={() => setUserType('doctor')}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="medkit-outline" 
          size={24} 
          color={userType === 'doctor' ? Colors.primary : Colors.textGray} 
          style={{ marginBottom: 4 }}
        />
        <Text style={[styles.boxText, userType === 'doctor' && styles.selectedBoxText]}>
          Medico
        </Text>
      </TouchableOpacity>

      {/* Patient */}
      <TouchableOpacity 
        style={[styles.selectionBox, userType === 'patient' && styles.selectedBox]}
        onPress={() => setUserType('patient')}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="person-outline" 
          size={24} 
          color={userType === 'patient' ? Colors.primary : Colors.textGray} 
          style={{ marginBottom: 4 }}
        />
        <Text style={[styles.boxText, userType === 'patient' && styles.selectedBoxText]}>
          Paziente
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 5,
    width: '100%', 
  },
  selectionBox: {
    width: '48%',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: Colors.borderInput,
    borderRadius: 12,
    backgroundColor: Colors.backgroundInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBox: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  boxText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textGray,
  },
  selectedBoxText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});