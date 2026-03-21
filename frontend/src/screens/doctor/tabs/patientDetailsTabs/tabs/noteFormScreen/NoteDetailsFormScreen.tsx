import React, { useEffect, useState } from 'react';
import { 
    View, 
    ScrollView, 
    TextInput, 
    Text, 
    StyleSheet, 
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    TouchableOpacity,
    Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { commonStyles } from '../../../../../../styles/CommonStyles';
import { Colors } from '../../../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useDoctor } from '../../../../../../hooks/useDoctor';
import Navbar from '../../../../../../components/nav/Navbar';
import NoteCard from '../../../../../../components/notes/cards/NoteCard';
import Footer from '../../../../../../components/Footer';
import AuthButton from '../../../../../../components/buttons/AuthButton';
import KeywordList, { KeywordItem } from '../../../../../../components/keywords/KeywordList';

export default function NoteDetailsFormScreen() {
    const [newDoctorComment, setNewDoctorComment] = useState('');
    const route = useRoute<any>();
    const navigation = useNavigation();
    
    // Recupero parametri dalla navigazione (NoteListScreen)
    const { patientId, noteId } = route.params;

    const { 
        selectedNote, 
        loading, 
        error, 
        fetchNoteDetails,
        addClinicalComment,
        regenerateClinicalAnalysis 
    } = useDoctor();

    const [isRegenerating, setIsRegenerating] = useState(false);

    // Caricamento dati reali all'avvio
    useEffect(() => {
        if (patientId && noteId) {
            fetchNoteDetails(patientId, noteId);
        }
    }, [patientId, noteId, fetchNoteDetails]);

    // Funzione per salvare la nota clinica del medico
    const handleSaveComment = async () => {
        if (!newDoctorComment.trim()) {
            Alert.alert("Attenzione", "Inserisci un testo prima di pubblicare.");
            return;
        }

        const success = await addClinicalComment(noteId, newDoctorComment);
        
        if (success) {
            Alert.alert("Fatto", "Valutazione clinica salvata con successo!");
            setNewDoctorComment(''); // Svuota il campo di input
        } else {
            Alert.alert("Errore", "Impossibile salvare la valutazione.");
        }
    };

    const handleRegenerateAnalysis = async () => {
        if (isRegenerating) return; // Evita doppi click
        
        setIsRegenerating(true);
        const success = await regenerateClinicalAnalysis(noteId);
        setIsRegenerating(false);

        if (success) {
            Alert.alert("Successo ✨", "La valutazione clinica è stata rigenerata dall'IA.");
        } else {
            Alert.alert("Errore", "Non è stato possibile rigenerare l'analisi.");
        }
    };

    if (loading && !selectedNote) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{marginTop: 10, color: Colors.textGray}}>Caricamento dettagli...</Text>
            </View>
        );
    }

    if (error || !selectedNote) {
        return (
            <View style={styles.centered}>
                <Ionicons name="alert-circle-outline" size={50} color="red" />
                <Text style={styles.errorText}>{error || "Impossibile caricare la nota."}</Text>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Torna indietro</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Costruzione dinamica delle Keywords con dati e emoji dal Backend
    const realKeywords: KeywordItem[] = [];
    if (selectedNote.emozione) {
        realKeywords.push({ 
            id: 'emo', 
            word: selectedNote.emozione.charAt(0).toUpperCase() + selectedNote.emozione.slice(1), 
            emoji: selectedNote.emozione_emoji || '✨', 
            description: selectedNote.spiegazione_emozione 
        });
    }
    if (selectedNote.contesto) {
        realKeywords.push({ 
            id: 'ctx', 
            word: selectedNote.contesto.charAt(0).toUpperCase() + selectedNote.contesto.slice(1), 
            emoji: selectedNote.contesto_emoji || '📍', 
            description: selectedNote.spiegazione_contesto 
        });
    }

    return (
        <SafeAreaView style={commonStyles.safe_container_log} edges={['top', 'bottom']}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <Navbar showBackArrow={true}/>
                <View style={commonStyles.container_log}>
                    <ScrollView 
                        style={{ flex: 1 }}
                        contentContainerStyle={{ flexGrow: 1}} 
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={[commonStyles.page_left, {paddingHorizontal: 15, paddingVertical: 20}]}>
                                <Text style={styles.dateHeader}>{selectedNote.data_formattata}</Text>

                                {realKeywords.length > 0 && (
                                    <View style={{ marginBottom: 15 }}>
                                        <KeywordList keywords={realKeywords} />
                                    </View>
                                )}
                                
                                {/* --- SEZIONE PAZIENTE --- */}
                                <NoteCard 
                                    text={selectedNote.testo_paziente} 
                                    time={selectedNote.ora} 
                                    type='patient'
                                />

                                {/* --- SEZIONE AI (SUPPORTO EMPATICO) --- */}
                                {selectedNote.testo_supporto && (
                                    <NoteCard 
                                        text={selectedNote.testo_supporto} 
                                        time={selectedNote.ora} 
                                        type='ai'
                                    />
                                )}

                                {/* --- SEZIONE ANALISI CLINICA IA --- */}
                                {selectedNote.testo_clinico && (
                                    <View style={styles.analysisContainer}>
                                        <NoteCard 
                                            text={selectedNote.testo_clinico} 
                                            time={selectedNote.data_formattata}
                                            result="Analisi Clinica Automatica"
                                            type='clinical_analysis'
                                        />
                                        
                                        <View style={styles.regenerateButtonWrapper}>
                                            <AuthButton 
                                                title={isRegenerating ? 'Sto rigenerando...' : 'Rigenera analisi clinica'} 
                                                onPress={handleRegenerateAnalysis}
                                                variant='outline' 
                                                iconName={isRegenerating ? 'hourglass-outline' : 'refresh-outline'}
                                                iconFamily='ionicons' 
                                            />
                                        </View>
                                    </View>
                                )}

                                {/* --- VALUTAZIONE MEDICA ESISTENTE ---
                                {selectedNote.commento_medico && (
                                    <NoteCard 
                                        doctorName="Tua valutazione precedente"
                                        time={selectedNote.data_commento_medico || "18:40"}
                                        text={selectedNote.commento_medico}
                                        type='doctor'
                                    />
                                )} */}

                                {/* --- VALUTAZIONE MEDICA ESISTENTE --- */}
                                {selectedNote.commento_medico && (
                                    <NoteCard 
                                        doctorName={selectedNote.nome_medico || "Il tuo commento"}
                                        time={selectedNote.data_commento_formattata || ""}
                                        text={selectedNote.commento_medico}
                                        type='doctor'
                                    />
                                )}

                                {/* --- INPUT PER NUOVO COMMENTO/AGGIORNAMENTO --- */}
                                <View style={{width:'100%', marginTop: 10}}>
                                    <View style={styles.inputHeader}>
                                        <Ionicons name="add-circle-outline" size={20} color={Colors.green} />
                                        <Text style={styles.inputTitle}>
                                            {selectedNote.commento_medico ? "Aggiorna valutazione" : "Aggiungi valutazione clinica"}
                                        </Text>
                                    </View>

                                    <TextInput
                                        style={commonStyles.inputTextArea}
                                        placeholder="Scrivi qui le tue osservazioni per il paziente..."
                                        placeholderTextColor={Colors.placeholderInput}
                                        multiline={true}
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                        value={newDoctorComment}
                                        onChangeText={setNewDoctorComment}
                                    />
                                    
                                    <AuthButton
                                        title='Pubblica valutazione'
                                        onPress={handleSaveComment} 
                                        variant='primary'
                                        iconName='checkmark'
                                    />
                                </View>

                            </View>
                        </TouchableWithoutFeedback>
                        <Footer />
                    </ScrollView>
                </View>      
            </KeyboardAvoidingView>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 20
    },
    dateHeader: {
        fontSize: 16,
        color: Colors.textGray,
        marginBottom: 15,
        fontWeight: '600',
        marginLeft: 5
    },
    inputHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    inputTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textDark,
        marginLeft: 8,
    },
    analysisContainer: {
        width: '100%',
        marginBottom: 15,
    },
    regenerateButtonWrapper: {
        marginTop: -15,
        marginBottom: 15,
        width: '100%',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
        fontSize: 16
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        backgroundColor: Colors.primary,
        borderRadius: 10
    },
    backButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16
    }
});