import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import Avatar from '../avatar/Avatar';

export interface Patient {
  id: string;
  name: string;
  lastUpdate: string;
  hasNew?: boolean;
}

// Props
interface PatientsListProps {
  patients: Patient[];
  onPatientPress: (id: string, name: string) => void;
}

export default function PatientsList({ patients, onPatientPress }: PatientsListProps) {
  // No patients
  if (patients.length === 0) {
    return (
      <Text style={styles.emptyText}>
        Nessun paziente trovato.
      </Text>
    );
  }

  // List patients
  return (
    <View style={[{width:'100%'}]}>
      {patients.map((patient) => (
        <TouchableOpacity 
          key={patient.id} 
          style={styles.patientCard}
          onPress={() => onPatientPress(patient.id, patient.name)}
        >
          {/* Avatar */}
          <Avatar 
            firstName={patient.name.split(' ')[0]} 
            lastName={patient.name.split(' ')[1] || ''} 
          />

          {/* Info Patient */}
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patient.name}</Text>
            {/* <Text style={styles.lastUpdate}>Ultimo diario: {patient.lastUpdate}</Text> */}
          </View>

          {/* New Messages */}
          {patient.hasNew && (
            <View style={styles.statusIndicator} />
          )}
          
          <Ionicons name="chevron-forward" size={20} color={Colors.grey} style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    textAlign: 'center', 
    color: Colors.grey, 
    marginTop: 20,
    fontSize: 16,
  },
  patientCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.borderInput,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderInput,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 2,
  },
  lastUpdate: {
    fontSize: 13,
    color: Colors.grey,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green
  }
});