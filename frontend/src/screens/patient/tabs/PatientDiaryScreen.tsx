import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView,
    StyleSheet,
    Alert,
    Keyboard
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '../../../styles/CommonStyles';
import { Colors } from '../../../constants/Colors';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import NoteForm from '../../../components/forms/NoteForm';
import Footer from '../../../components/Footer';
import Navbar from '../../../components/nav/Navbar';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import NotesList from '../../../components/notes/NotesList';

// Import della nuova libreria vocale moderna
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

// Importa l'hook personalizzato per le chiamate API
import { usePatient } from '../../../hooks/usePatient';

export default function PatientDiaryScreen() {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
     
    // Stati locali
    const [noteText, setNoteText] = useState('');
    const [isAiSupportEnabled, setIsAiSupportEnabled] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Estrae funzioni e stati dal nostro hook
    const { createNote, fetchNotes, notes, loading } = usePatient();

    // Fetch delle note all'apertura della pagina
    useEffect(() => {
        if (isFocused) {
            fetchNotes();
        }
    }, [isFocused, fetchNotes]);

    // ==========================================
    // GESTIONE EVENTI VOCALI
    // ==========================================
    
    useSpeechRecognitionEvent('start', () => setIsListening(true));
    
    useSpeechRecognitionEvent('end', () => setIsListening(false));
    
    useSpeechRecognitionEvent('error', (event) => {
        setIsListening(false);
        // Ignoriamo silenziosamente l'errore "no-speech" dovuto ai cali di focus
        if (event.error !== 'no-speech') {
            console.log("Errore vocale:", event.error);
            Alert.alert("Errore", "Non sono riuscito a capire, riprova.");
        }
    });

    useSpeechRecognitionEvent('result', (event) => {
        // Estrapoliamo il testo capito da Android
        const transcript = event.results[0]?.transcript;
        if (transcript) {
            // Lo uniamo al testo che c'è già, aggiungendo uno spazio se serve
            setNoteText((prevText) => {
                const separator = prevText.length > 0 ? " " : "";
                return prevText + separator + transcript;
            });
        }
    });

    const handleVoiceInput = async () => {
        try {
            if (isListening) {
                // Se sta già ascoltando, lo fermiamo
                ExpoSpeechRecognitionModule.stop();
                return;
            }

            // Chiediamo i permessi nativi al telefono
            const { status } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert("Permesso negato", "Devi autorizzare il microfono per poter dettare le note.");
                return;
            }

            // Chiudiamo forzatamente la tastiera per evitare sbalzi di UI
            Keyboard.dismiss();

            // Il trucco magico: aspettiamo 200ms prima di attivare il microfono
            setTimeout(() => {
                ExpoSpeechRecognitionModule.start({
                    lang: 'it-IT',
                    interimResults: false, // Aspetta che la persona finisca la frase
                });
            }, 200);
            
        } catch (error) {
            console.error("Errore avvio microfono:", error);
            Alert.alert("Errore", "Impossibile avviare il microfono.");
            setIsListening(false);
        }
    };
    // ==========================================

    const formatNotesForUI = (apiNotes: any[]) => {
        const mesi = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
        
        return apiNotes.map(nota => {
            const date = new Date(nota.data_iso);
            const day = date.getDate().toString().padStart(2, '0');
            const month = mesi[date.getMonth()];
            const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            return {
                id: nota.id,
                day: day,
                month: month,
                text: nota.testo,
                time: time
            };
        });
    };

    const displayNotes = formatNotesForUI(notes);

    const handleSaveNote = async () => {
        if (noteText.trim() === '') {
            Alert.alert("Attenzione", "La nota non può essere vuota.");
            return;
        }
        
        try {
            await createNote(noteText, isAiSupportEnabled);
            Alert.alert("Salvato", "La tua nota è stata aggiunta al diario.");
            setNoteText('');
            setIsAiSupportEnabled(false);
            fetchNotes();
        } catch (error: any) {
            Alert.alert("Errore", error.message || "Impossibile salvare la nota. Riprova più tardi.");
        }
    };

    const handleNotePress = (id: number | string) => {
        navigation.navigate('NoteDetails', { noteId: id });
    };

    return ( 
        <SafeAreaView style={commonStyles.safe_container_log} edges={['top']}>
            <Navbar/>
            <View style={commonStyles.container_log}>
                <ScrollView 
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1}} 
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[commonStyles.page_left]}>
                        
                        <View style={styles.sectionHeaderContainer}>
                            <Ionicons name="pencil" size={20} color={Colors.primary} />
                            <Text style={styles.sectionTitle}>Come ti senti oggi?</Text>
                        </View>

                        <NoteForm 
                            noteText={noteText}
                            setNoteText={setNoteText}
                            isAiSupportEnabled={isAiSupportEnabled}
                            setIsAiSupportEnabled={setIsAiSupportEnabled}
                            onSave={handleSaveNote}
                            onVoiceInput={handleVoiceInput}
                            loading={loading}
                            isListening={isListening} 
                        />
                        
                        {isListening && (
                            <Text style={styles.listeningText}>In ascolto... Parla ora</Text>
                        )}

                        <View style={styles.sectionHeaderContainer}>
                            <Ionicons name="document" size={20} color={Colors.primary} />
                            <Text style={styles.sectionTitle}>Il mio diario</Text>
                        </View>

                        {notes.length === 0 && !loading ? (
                            <Text style={styles.emptyText}>Non hai ancora scritto nessuna nota. Inizia a tenere traccia delle tue giornate!</Text>
                        ) : (
                            <NotesList 
                                notes={displayNotes} 
                                onNotePress={handleNotePress} 
                            />
                        )}

                    </View>
                    <Footer />
                </ScrollView>
            </View>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    sectionHeaderContainer: {
        flexDirection: 'row',
        marginVertical: 20,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textDark,
        marginLeft: 8, 
    },
    emptyText: {
        fontSize: 16,
        color: Colors.grey,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 40
    },
    listeningText: {
        color: 'red',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: -10
    }
});