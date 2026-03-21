import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '../../../styles/CommonStyles';
import { Colors } from '../../../constants/Colors';
import { AlertCard } from '../../../components/AlertCard';
import Navbar from '../../../components/nav/Navbar';
import Footer from '../../../components/Footer';
import AuthButton from '../../../components/buttons/AuthButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDoctor } from '../../../hooks/useDoctor';

interface Parameter {
  id: number;
  key: string;
  value: string;
}

export default function DoctorParametersScreen() { 
    // Integriamo il nostro hook
    const { fetchAiSettings, updateAiSettings, loading } = useDoctor();
    const [isSaving, setIsSaving] = useState(false);

    const [analysisType, setAnalysisType] = useState<'structured' | 'unstructured'>('structured');
    const [analysisLength, setAnalysisLength] = useState<'long' | 'short'>('short');
    
    const [parameters, setParameters] = useState<Parameter[]>([
        { id: Date.now(), key: '', value: '' }
    ]);

    // 1. Carica le impostazioni dal backend all'avvio
    useEffect(() => {
        const loadSettings = async () => {
            const data = await fetchAiSettings();
            if (data) {
                // Traduciamo i valori del backend per il frontend
                setAnalysisType(data.tipo_nota === 'strutturato' ? 'structured' : 'unstructured');
                setAnalysisLength(data.lunghezza_nota === 'lungo' ? 'long' : 'short');
                
                if (data.parametri && data.parametri.length > 0) {
                    setParameters(data.parametri.map((p: any, index: number) => ({
                        id: Date.now() + index, // Generiamo un ID univoco locale per React
                        key: p.tipo,
                        value: p.descrizione
                    })));
                } else {
                    // Se non ci sono parametri, lasciamo uno slot vuoto
                    setParameters([{ id: Date.now(), key: '', value: '' }]);
                }
            }
        };
        loadSettings();
    }, [fetchAiSettings]);

    // 2. Salva le impostazioni sul backend
    const handleSave = async () => {
        setIsSaving(true);
        
        // Prepariamo il payload traducendolo per il backend
        const payload: any = {
            tipo_nota: analysisType === 'structured' ? 'strutturato' : 'libero',
            lunghezza_nota: analysisLength === 'long' ? 'lungo' : 'breve',
            // Filtriamo i parametri vuoti per non salvare spazzatura nel DB
            parametri: parameters
                .filter(p => p.key.trim() !== '' || p.value.trim() !== '')
                .map(p => ({
                    tipo: p.key.trim(),
                    descrizione: p.value.trim()
                }))
        };

        const success = await updateAiSettings(payload);
        setIsSaving(false);

        if (success) {
            Alert.alert("Successo ✨", "La configurazione dell'IA è stata salvata correttamente.");
        } else {
            Alert.alert("Errore", "Impossibile salvare la configurazione. Riprova più tardi.");
        }
    };

    const addParameter = () => {
        setParameters([...parameters, { id: Date.now(), key: '', value: '' }]);
    };

    const removeParameter = (id: number) => {
        setParameters(parameters.filter(p => p.id !== id));
    };

    const updateParameter = (id: number, field: 'key' | 'value', text: string) => {
        setParameters(parameters.map(p => p.id === id ? { ...p, [field]: text } : p));
    };

    if (loading && !isSaving && parameters.length === 1 && parameters[0].key === '') {
        return (
            <SafeAreaView style={commonStyles.safe_container_log} edges={['top']}>
                <Navbar/>
                <View style={[commonStyles.container_log, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={{ marginTop: 10, color: Colors.textGray }}>Caricamento parametri...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return ( 
        <SafeAreaView style={commonStyles.safe_container_log} edges={['top']}>
            <Navbar/>
            <View style={commonStyles.container_log}>
                <ScrollView 
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} 
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[commonStyles.page , {padding: 10}]}>
                        {/* --- CARD 1 --- */}
                        <View style={[commonStyles.card, {width: '100%'}]}>
                            {/* 1. Type Analysis */}
                            <View style={styles.section}>
                                <Text style={styles.labelTitle}>Tipo di analisi clinica</Text>
                                <RadioButton 
                                    label="Analisi Strutturata" 
                                    selected={analysisType === 'structured'} 
                                    onPress={() => setAnalysisType('structured')} 
                                />
                                <RadioButton 
                                    label="Analisi Non Strutturata" 
                                    selected={analysisType === 'unstructured'} 
                                    onPress={() => setAnalysisType('unstructured')} 
                                />
                            </View>
                            {/* 1. Lenght Analysis */}
                            <View style={styles.section}>
                                <Text style={styles.labelTitle}>Lunghezza dell'analisi clinica</Text>
                                <RadioButton 
                                    label="Analisi Lunga" 
                                    selected={analysisLength === 'long'} 
                                    onPress={() => setAnalysisLength('long')} 
                                />
                                <RadioButton 
                                    label="Analisi Breve" 
                                    selected={analysisLength === 'short'} 
                                    onPress={() => setAnalysisLength('short')} 
                                />
                            </View>
                            {/* Alert */}
                            {analysisType === 'unstructured' && (
                                <AlertCard 
                                isCritic= {true}
                                title="Attenzione"
                                iconName="alert-decagram"
                                text="Scegliendo l'opzione ***Analisi Non Strutturata***, il commento generato potrebbe risultare meno affidabile e preciso rispetto alla versione strutturata."
                                />  
                            )}
                        </View>
                        
                    
                        {/* 3. CARD 2: Parameters */}
                        {analysisType === 'structured' && (
                            <View style={[commonStyles.card, {width: '100%', marginTop:20}]}>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.labelTitle}>Parametri Personalizzati</Text>
                                
                                    <AlertCard 
                                    isCritic= {false}
                                    title="Esempio di utilizzo"
                                    iconName="lightbulb-outline"
                                    text="Rispondi in modo parametrizzato al seguente testo: 'Today I failed my exam and feel like giving up.'"
                                    />  

                                    {parameters.map((param) => (
                                        <View key={param.id} style={styles.paramBlock}>
                                            {/* --- Remove button --- */}
                                            <View style={styles.paramHeader}>
                                                <TouchableOpacity onPress={() => removeParameter(param.id)}>
                                                    <Ionicons name="trash-outline" size={24} color={Colors.red} />
                                                </TouchableOpacity>
                                            </View>

                                            {/* --- Parameter 1 --- */}
                                            <Text style={styles.paramLabel}>Nome Parametro</Text>
                                            <TextInput 
                                                style={styles.input} 
                                                placeholder="Es: Emozione, Consiglio..." 
                                                value={param.key}
                                                onChangeText={(t) => updateParameter(param.id, 'key', t)}
                                            />

                                            {/* --- Parameter 2 --- */}
                                            <Text style={[styles.paramLabel, { marginTop: 10 }]}>Valore/Istruzione</Text>
                                            <TextInput 
                                                style={[styles.input, styles.textArea]} 
                                                placeholder="Inserisci il testo del parametro..." 
                                                multiline
                                                value={param.value}
                                                onChangeText={(t) => updateParameter(param.id, 'value', t)}
                                            />
                                        </View>
                                    ))}

                                    <AuthButton 
                                        variant='outline'
                                        title="Aggiungi Parametro" 
                                        iconFamily='ionicons'
                                        iconName='add-circle-outline'
                                        onPress={addParameter} 
                                    />

                                </View>
                            </View>
                        )}
                        

                        <View style={styles.footerDivider} />
                        
                        <AuthButton 
                            variant='primary'
                            title={isSaving ? "Salvataggio..." : "Salva Configurazione"} 
                            iconFamily='material'
                            iconName={isSaving ? 'cloud-upload' : 'content-save'}
                            onPress={handleSave}
                            // disabled={isSaving} <-- Puoi decommentarlo se AuthButton accetta la prop disabled
                        />
                    </View>
                    <Footer />
                </ScrollView>
            </View>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

const RadioButton = ({ label, selected, onPress }: { label: string, selected: boolean, onPress: () => void }) => (
    <TouchableOpacity 
        onPress={onPress} 
        style={[styles.radioContainer, selected && styles.radioSelected]}
    >
        <View style={styles.radioOuter}>
            {selected && <View style={styles.radioInner} />}
        </View>
        <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    section: {
        marginBottom: 20,
    },
    labelTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: 15,
    },
    // Radiobuttons
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.borderInput,
        borderRadius: 10,
        marginBottom: 10,
    },
    radioSelected: {
        borderColor: Colors.primary,
        backgroundColor: Colors.background,
    },
    radioOuter: {
        height: 22,
        width: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    radioLabel: {
        fontSize: 14,
        color: Colors.textGray,
    },
    radioLabelSelected: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    //Parameters
    paramBlock: {
        backgroundColor: Colors.backgroundInput,
        borderWidth: 1,
        borderColor: Colors.borderInput,
        borderRadius: 12,
        padding: 10,
        marginBottom: 5,
        marginTop:5
    },
    paramHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 10,
    },
    paramLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.textGray,
        textTransform: 'uppercase',
        marginBottom:8
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.borderInput,
        borderRadius: 8,
        padding: 12,
        backgroundColor: 'white',
        fontSize: 14,
        color: Colors.textDark,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    footerDivider: {
        height: 1,
        marginVertical: 10,
    }
});