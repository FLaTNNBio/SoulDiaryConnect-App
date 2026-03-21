import React, { useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '../../../styles/CommonStyles';
import { useNavigation } from '@react-navigation/native';
import Footer from '../../../components/Footer';
import Navbar from '../../../components/nav/Navbar';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { Colors } from '../../../constants/Colors';
import AuthButton from '../../../components/buttons/AuthButton';
import { infoStyles } from '../../../styles/InfoStyles';
import { usePatient } from '../../../hooks/usePatient';
import * as SecureStore from 'expo-secure-store';

export default function PatientProfileScreen() {
    const navigation = useNavigation<any>();
    const { fetchPatientInfo, patientInfo, loading, error } = usePatient();

    useEffect(() => {
        fetchPatientInfo();
    }, [fetchPatientInfo]);

    const handleLogout = async () => {
        Alert.alert("Logout", "Sei sicuro di voler uscire?", [
            { text: "Annulla", style: "cancel" },
            { 
                text: "Esci", 
                style: "destructive", 
                onPress: async () => {
                    await SecureStore.deleteItemAsync('userToken');
                    navigation.replace('Login');
                } 
            }
        ]);
    };

    if (loading && !patientInfo) {
        return <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator size="large" color={Colors.primary}/></View>;
    }

    return ( 
        <SafeAreaView style={commonStyles.safe_container_log} edges={['top']}>
            <Navbar/>
            <View style={commonStyles.container_log}>
                <ScrollView contentContainerStyle={{ flexGrow: 1}} showsVerticalScrollIndicator={false}>
                    <View style={[commonStyles.page, {padding: 10}]}>
                        {error ? (
                            <View style={commonStyles.card}>
                                <Text style={{color: 'red', textAlign: 'center'}}>{error}</Text>
                                <AuthButton title="Riprova" onPress={fetchPatientInfo} />
                            </View>
                        ) : (
                            <View style={[commonStyles.card, {width: '100%'}]}>
                                <View style={[infoStyles.avatarContainer, {backgroundColor: Colors.backgroundInput}]}>
                                    <Ionicons name="person" size={48} color={Colors.grey} />
                                </View>

                                <Text style={infoStyles.infoPrimary}>{patientInfo?.nome} {patientInfo?.cognome}</Text>
                                <Text style={infoStyles.infoSecondary}>{patientInfo?.email}</Text>

                                <View style={infoStyles.infoRow}>
                                    <Text style={infoStyles.infoLabel}>Data di Nascita</Text>
                                    <Text style={infoStyles.infoValue}>{patientInfo?.data_nascita || "N/D"}</Text>
                                </View>

                                <View style={infoStyles.divider} />

                                <View style={infoStyles.infoRow}>
                                    <Text style={infoStyles.infoLabel}>Codice Fiscale</Text>
                                    <Text style={infoStyles.infoValue}>{patientInfo?.codice_fiscale}</Text>
                                </View>

                                <View style={{ marginTop: 20 }}> 
                                    <AuthButton 
                                        title="Esci dal profilo" 
                                        onPress={handleLogout} 
                                        variant='logout'
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                    <Footer />
                </ScrollView>
            </View>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}