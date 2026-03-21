import React, { useState, useCallback } from 'react'; // NUOVO: Rimosso useEffect, aggiunto useCallback
import { 
    View, 
    Text, 
    ScrollView,
    StyleSheet,
    TextInput,
    ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; 
import { commonStyles } from '../../../styles/CommonStyles';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../../../components/Footer';
import Navbar from '../../../components/nav/Navbar';
import PatientsList from '../../../components/patients/PatientsList';

import { useDoctor } from '../../../hooks/useDoctor';

export default function DoctorListPatientsScreen() {
    const navigation = useNavigation<any>();

    const { patients, loading, error, fetchPatients } = useDoctor();
    const [searchText, setSearchText] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchPatients();
        }, [fetchPatients])
    );

    const formattedPatients = patients.map((p: any) => ({
        id: p.codice_fiscale,
        name: `${p.nome} ${p.cognome}`,
        lastUpdate: 'Paziente attivo', 
        hasNew: false 
    }));

    const filteredPatients = formattedPatients.filter(p => 
        p.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return ( 
        <SafeAreaView style={commonStyles.safe_container_log} edges={['top']}>
            <Navbar/>
            <View style={commonStyles.container_log}>
                {/* --- Header --- */}
                <View style={styles.header}>
                    <Text style={styles.title}>I tuoi Pazienti</Text>
                    <Text style={styles.subtitle}>Gestisci i diari</Text>
                </View>

                {/* --- Search --- */}
                <View style={commonStyles.inputContainer}>
                    <Ionicons name="search-outline" size={20} color={Colors.grey} />
                    <TextInput 
                        style={[commonStyles.input, {marginLeft: 10}]}
                        placeholder="Cerca paziente..."
                        placeholderTextColor={Colors.placeholderInput}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                {/* --- ScrollView --- */}
                <ScrollView 
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1}} 
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[commonStyles.page_left]}>
                        {loading && patients.length === 0 ? ( 
                            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
                        ) : error ? (
                            <Text style={{ color: Colors.red, textAlign: 'center', marginTop: 50, alignSelf:'center' }}>{error}</Text>
                        ) : filteredPatients.length === 0 ? (
                            <Text style={{ textAlign: 'center', marginTop: 50, color: Colors.grey, alignSelf:'center' }}>
                                {searchText ? "Nessun paziente trovato con questo nome." : "Non hai ancora nessun paziente assegnato."}
                            </Text>
                        ) : (
                            /* --- Patients List --- */
                            <PatientsList 
                                patients={filteredPatients} 
                                onPatientPress={(id, name) => {
                                    navigation.navigate('DoctorPatientDetailsTabs', { 
                                        patientId: id, 
                                        patientName: name 
                                    });
                                }} 
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
    header: {
        paddingVertical: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.grey,
        marginTop: 4,
    }  
});