import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

type NoteType = 'patient' | 'ai' | 'doctor' | 'clinical_analysis';

interface NoteCardProps {
  text: string;
  time: string;        
  type?: NoteType;     
  doctorName?: string; 
  result?: string;
}

const NoteCard = ({ 
  text, 
  time, 
  type = 'patient',
  doctorName = 'Dr. Specialista',
  result = 'Analisi completata'
}: NoteCardProps) => {

  const config = {
    patient: {
      title: 'La tua riflessione',
      icon: 'person-outline',
      iconLib: Ionicons,
      color: Colors.primary,
    },
    ai: {
      title: 'Supporto AI',
      icon: 'robot-excited-outline',
      iconLib: MaterialCommunityIcons,
      color: Colors.primary,
    },
    doctor: {
      title: 'Dallo specialista',
      icon: 'medkit-outline',
      iconLib: Ionicons,
      color: Colors.green,
    },
    clinical_analysis: {
      title: 'Analisi Clinica IA',
      icon: 'analytics-outline',
      iconLib: Ionicons,
      color: Colors.violet,
    }
  };

  const currentConfig = config[type];
  const IconComponent = currentConfig.iconLib;

  return (
    <View style={styles.sectionContainer}>
      
      {/* --- COMMON HEADER --- */}
      <View style={styles.sectionHeader}>
        <IconComponent 
          name={currentConfig.icon as any} 
          size={20} 
          color={currentConfig.color} 
          style={styles.sectionIcon} 
        />
        <Text style={styles.sectionTitle}>{currentConfig.title}</Text>
        
        {(type === 'patient') && (
          <Text style={styles.timeBadge}>{time}</Text>
        )}
      </View>
      
      {/* --- CARD BODY --- */}
      <View style={[
        styles.cardBase, 
        type === 'ai' && styles.cardAi,
        type === 'doctor' && styles.cardDoctor,
        type === 'clinical_analysis' && styles.cardAnalysis
      ]}>
        
        {/* Decorations for AI & Analysis IA */}
        {(type === 'ai' || type === 'clinical_analysis') && (
          <>
            <View style={[
                styles.aiAccentBar, 
                type === 'clinical_analysis' && { backgroundColor: Colors.violet }
            ]} />
            <Ionicons 
                name="sparkles" 
                size={16} 
                color={currentConfig.color} 
                style={styles.aiSparkle} 
            />
          </>
        )}

        {/* Header for CLINICAL ANALYSIS */}
        {type === 'clinical_analysis' && (
          <View style={styles.analysisHeader}>
             <View style={styles.analysisBadge}>
                <Text style={styles.analysisBadgeText}>{result}</Text>
             </View>
          </View>
        )}

        {/* Header for DOCTOR */}
        {type === 'doctor' && (
          <View>
            <View style={styles.doctorHeaderInternal}>
              <View style={styles.doctorAvatar}>
                <Ionicons name="person" size={14} color={Colors.white}/>
              </View>
              <View>
                <Text style={styles.doctorNameText}>{doctorName}</Text>
                <Text style={styles.doctorDateText}>{time}</Text>
              </View>
            </View>
            <View style={styles.doctorDivider} />
          </View>
        )}

        {/* Text Body */}
        <Text style={[
          styles.textBase,
          type === 'ai' && styles.textAi,
          type === 'doctor' && styles.textDoctor,
          type === 'clinical_analysis' && styles.textAnalysis
        ]}>
           {type === 'doctor' && <MaterialCommunityIcons name="format-quote-open" size={14} color="#ccc" />}{" "}
           {text}
        </Text>
      </View>
    </View>
  );
};

export default NoteCard;

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 30,
    width: '100%', // <-- AGGIUNTO: forza l'intero blocco al 100%
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    flex: 1,
  },
  timeBadge: {
    fontSize: 12,
    color: Colors.textGray,
    backgroundColor: Colors.backgroundInput,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    fontWeight: '600',
  },
  cardBase: {
    width: '100%', // <-- AGGIUNTO: forza la card visiva al 100%
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderInput,
    position: 'relative',
    overflow: 'hidden',
  },
  cardAi: {
    backgroundColor: '#F0F7FF',
    borderColor: '#D0E4FF',
    elevation: 0,
  },
  cardDoctor: {
    backgroundColor: '#F9FBFD',
    borderColor: '#ECEFF1',
    elevation: 0,
  },
  cardAnalysis: {
    backgroundColor: Colors.lightViolet,
    borderColor: '#E9D5FF',
    elevation: 0,
  },
  aiAccentBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 4,
    backgroundColor: Colors.primary,
  },
  aiSparkle: {
    position: 'absolute',
    top: 10, right: 10,
    opacity: 0.3,
  },
  analysisHeader: {
    marginBottom: 10,
  },
  analysisBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.lightViolet,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  analysisBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.violet,
    textTransform: 'uppercase',
  },
  doctorHeaderInternal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorAvatar: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: Colors.green,
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 10,
  },
  doctorNameText: { fontSize: 14, fontWeight: 'bold', color: Colors.textDark},
  doctorDateText: { fontSize: 11, color: Colors.textGray },
  doctorDivider: { height: 1, backgroundColor: Colors.borderInput, marginBottom: 12 },
  textBase: {
    fontSize: 16,
    color: Colors.textDark,
    lineHeight: 24,
  },
  textAi: {
    fontStyle: 'italic',
  },
  textDoctor: {
    fontSize: 15,
  },
  textAnalysis: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.darkViolet,
  }
});