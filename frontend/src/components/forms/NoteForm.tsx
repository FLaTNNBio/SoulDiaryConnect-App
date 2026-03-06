import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors'; // Controlla che il path sia corretto
import AuthButton from '../buttons/AuthButton';

interface NoteFormProps {
  noteText: string;
  setNoteText: (text: string) => void;
  isAiSupportEnabled: boolean;
  setIsAiSupportEnabled: (enabled: boolean) => void;
  onSave: () => void;
  onVoiceInput: () => void;
  loading: boolean;
  isListening?: boolean; // Prop opzionale per gestire la UI del microfono
}

const NoteForm = ({ 
  noteText, 
  setNoteText, 
  isAiSupportEnabled, 
  setIsAiSupportEnabled, 
  onSave, 
  onVoiceInput,
  loading,
  isListening = false 
}: NoteFormProps) => {

  return (
    <View style={styles.container}>
      
      {/* AREA DI TESTO DELLA NOTA */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.textInput, loading && styles.textInputDisabled]}
          placeholder="Scrivi qui come ti senti..."
          placeholderTextColor="#999"
          multiline={true}
          value={noteText}
          onChangeText={setNoteText}
          editable={!loading} 
        />
        
        {/* Pulsante Microfono (Dettatura) */}
        <TouchableOpacity 
          style={styles.micButton} 
          onPress={onVoiceInput}
          activeOpacity={0.8}
          disabled={loading} 
        >
          <Ionicons 
            name={isListening ? "mic" : "mic-outline"} 
            size={22} 
            color={loading ? Colors.grey : (isListening ? 'red' : Colors.primary)} 
          />
        </TouchableOpacity>
      </View>

      {/* CHECKBOX SUPPORTO AI */}
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => !loading && setIsAiSupportEnabled(!isAiSupportEnabled)} 
        activeOpacity={0.8}
        disabled={loading}
      >
        <Ionicons 
          name={isAiSupportEnabled ? "checkbox" : "square-outline"} 
          size={24} 
          color={loading ? Colors.grey : (isAiSupportEnabled ? Colors.primary : Colors.grey)} 
        />
        <Text style={[styles.checkboxLabel, loading && { color: Colors.grey }]}>
          Genera automaticamente frasi di supporto
        </Text>
      </TouchableOpacity>
      
      {/* PULSANTE DI SALVATAGGIO */}
      <AuthButton 
        title={loading ? "Salvataggio in corso..." : "Salva nota"} 
        onPress={onSave}
        variant="primary"
      />
    </View>
  );
};

export default NoteForm;

const styles = StyleSheet.create({
  container: { 
    marginBottom: 20, 
    width: '100%' 
  },
  inputWrapper: { 
    position: 'relative', 
    marginBottom: 15 
  },
  textInput: {
    fontSize: 16, 
    color: Colors.textDark, 
    minHeight: 140, 
    textAlignVertical: 'top',
    backgroundColor: Colors.backgroundInput, 
    borderRadius: 16, 
    padding: 15, 
    paddingRight: 50, 
    borderWidth: 1, 
    borderColor: Colors.borderInput,
  },
  textInputDisabled: {
    backgroundColor: '#F0F0F0',
    color: '#888',
  },
  micButton: {
    position: 'absolute', 
    bottom: 15, 
    right: 15, 
    backgroundColor: Colors.white,
    padding: 8, 
    borderRadius: 20, 
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    elevation: 2,
  },
  checkboxContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  checkboxLabel: { 
    fontSize: 14, 
    color: Colors.textDark, 
    marginLeft: 10 
  }
});