import React, { useEffect, useState } from 'react'; // Aggiunto useState
import { 
    View, 
    ScrollView, 
    Text, 
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { commonStyles } from '../../../styles/CommonStyles';
import { Colors } from '../../../constants/Colors'; 
import Navbar from '../../../components/nav/Navbar';
import Footer from '../../../components/Footer';
import NoteCard from '../../../components/notes/cards/NoteCard';
import AuthButton from '../../../components/buttons/AuthButton';
import { usePatient } from '../../../hooks/usePatient';

export default function NoteDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { noteId } = route.params;

    // Estratta la funzione generateSupportText
    const { fetchNoteDetails, selectedNote, deleteNote, generateSupportText, loading, error } = usePatient();

    // Nuovo stato per gestire il bottone di caricamento
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchNoteDetails(noteId);
    }, [noteId, fetchNoteDetails]);

    // Funzione reale collegata al backend
    const handleGenerateSupport = async () => {
        if (isGenerating) return; // Evita doppi click accidentali

        setIsGenerating(true); // Cambia il bottone in "Sto Generando..."
        
        const success = await generateSupportText(noteId);
        
        setIsGenerating(false); // Riporta il bottone allo stato normale se fallisce

        if (success) {
            Alert.alert("Generazione completata ✨", "L'intelligenza artificiale ha generato la tua frase di supporto.");
            // Nota: se ha successo, la pagina si ricaricherà da sola grazie a fetchNoteDetails dentro l'hook, 
            // facendo sparire il bottone e mostrando la NoteCard dell'IA!
        } else {
            Alert.alert("Ops...", "Non è stato possibile generare la frase di supporto in questo momento.");
        }
    };

    const handleDeleteNote = () => {
        Alert.alert(
            "Elimina Nota",
            "Sei sicuro di voler eliminare definitivamente questa nota dal tuo diario?",
            [
                { text: "Annulla", style: "cancel" },
                { 
                    text: "Elimina", 
                    style: "destructive", 
                    onPress: async () => {
                        const success = await deleteNote(noteId);
                        if (success) {
                            navigation.goBack(); // Torna al diario
                        } else {
                            Alert.alert("Errore", "Non è stato possibile eliminare la nota.");
                        }
                    } 
                }
            ]
        );
    };

    // Usiamo una logica speciale: se stiamo solo generando la frase, NON mostriamo il caricamento a tutto schermo
    // ma mostriamo il caricamento solo se è il primissimo caricamento della pagina
    if (loading && !selectedNote && !isGenerating) {
        return (
            <View style={{flex:1, justifyContent:'center', backgroundColor: Colors.background}}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{textAlign:'center', marginTop:10, color: Colors.grey}}>Caricamento nota...</Text>
            </View>
        );
    }

    if (error || !selectedNote) {
        return (
            <SafeAreaView style={commonStyles.safe_container_log} edges={['top', 'bottom']}>
                <Navbar showBackArrow={true}/>
                <View style={{flex:1, justifyContent:'center', padding:20}}>
                    <Text style={{textAlign:'center', color:'red'}}>{error || "Nota non trovata"}</Text>
                    <AuthButton title="Torna indietro" onPress={() => navigation.goBack()} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={commonStyles.safe_container_log} edges={['top', 'bottom']}>
            <Navbar showBackArrow={true}/>
            <View style={commonStyles.container_log}>
                <ScrollView 
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1}} 
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[commonStyles.page_left, {paddingHorizontal: 15, paddingVertical: 20}]}>
                        
                        <Text style={styles.dateHeader}>{selectedNote.data_formattata}</Text>
                        
                        {/* --- TESTO PAZIENTE --- */}
                        <NoteCard 
                            text={selectedNote.testo_paziente} 
                            time={selectedNote.ora} 
                            type='patient'
                        />

                        {/* --- SUPPORTO AI --- */}
                        {selectedNote.testo_supporto ? (
                            <NoteCard 
                                text={selectedNote.testo_supporto} 
                                time={selectedNote.ora} 
                                type='ai'
                            />
                        ) 
                        // : selectedNote.generazione_in_corso ? (
                        //     <View style={styles.aiPendingBox}>
                        //         <ActivityIndicator size="small" color={Colors.primary} />
                        //         <Text style={styles.aiPendingText}>L'intelligenza artificiale sta analizzando la nota...</Text>
                        //     </View>
                        // ) 
                        : (
                            <View style={styles.noSupportBox}>
                                <Text style={styles.noSupportText}>
                                    Questa nota non ha ancora una frase di supporto
                                </Text>
                                {/* Bottone dinamico in base allo stato isGenerating */}
                                <AuthButton 
                                    title={isGenerating ? 'Sto Generando...' : 'Genera Frase di supporto'} 
                                    onPress={handleGenerateSupport} 
                                    iconName={isGenerating ? 'hourglass-outline' : 'sparkles'}
                                />
                            </View>
                        )}

                        {/* --- ELIMINAZIONE --- */}
                        <View style={styles.deleteContainer}>
                            <AuthButton 
                                title='Elimina nota' 
                                onPress={handleDeleteNote}
                                variant='logout'
                                iconName='trash-outline' 
                                iconFamily='ionicons' 
                            />
                        </View>

                    </View>
                    <Footer />
                </ScrollView>
            </View>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    dateHeader: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.textGray,
        marginBottom: 30,
        marginLeft: 5
    },
    deleteContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    aiPendingBox: {
        backgroundColor: '#F8F9FA',
        padding: 20,
        borderRadius: 15,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25
    },
    aiPendingText: {
        marginLeft: 10,
        color: Colors.primary,
        fontStyle: 'italic'
    },
    noSupportBox: {
        alignItems: 'center',
        width:'100%',
        paddingVertical: 20,
        paddingHorizontal: 15,
        marginBottom: 25,
        backgroundColor: Colors.white,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Colors.borderInput,
    },
    noSupportText: {
        color: Colors.textGray,
        marginBottom: 15,
        textAlign: 'center',
        fontStyle: 'italic',
        fontSize: 16
    }
});