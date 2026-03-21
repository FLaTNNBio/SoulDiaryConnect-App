import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors'; 

export interface Note {
  id: number | string;
  day: string;
  month: string;
  text: string;
  time: string;
}

interface NotesListProps {
  notes: Note[];
  onNotePress?: (id: number | string) => void;
}

const NotesList = ({ notes, onNotePress }: NotesListProps) => {
  return (
    <>
      {notes.map((item) => (
        <TouchableOpacity 
          key={item.id} 
          style={styles.diaryCard}
          onPress={() => onNotePress && onNotePress(item.id)}
          activeOpacity={0.7}
        >
          {/* Badge Data */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{item.day}</Text>
            <Text style={styles.dateMonth}>{item.month}</Text>
          </View>

          {/* Note content */}
          <View style={styles.diaryContent}>
            <Text style={styles.diaryText} numberOfLines={2} ellipsizeMode="tail">
              {item.text}
            </Text>
            
            {/* Time */}
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={14} color={Colors.grey} style={{ marginRight: 4 }} /> 
              <Text style={styles.diaryTime}>{item.time}</Text>
            </View>
          </View>

          {/* Arrow icon */}
          <View>
             <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
};

export default NotesList;

const styles = StyleSheet.create({
  diaryCard: {
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
  dateBadge: {
    backgroundColor: Colors.backgroundInput, 
    borderRadius: 12,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.borderInput,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    marginTop: -2,
  },
  diaryContent: {
    flex: 1,
    paddingRight: 10,
  },
  diaryText: {
    fontSize: 15,
    color: Colors.textDark,
    lineHeight: 22,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 6 
  },
  diaryTime: {
    fontSize: 12,
    color: Colors.grey,
    fontWeight: '500',
    lineHeight: 14, 
  },
});