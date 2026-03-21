import { useState } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/Config';
import { UserRole } from '../components/TypeSelector';

export const useAccess = (navigation: any) => {
    const [loading, setLoading] = useState(false);

    // ==========================================
    // ----- CONTROLLO SESSIONE (NUOVO) ------
    // ==========================================
    const checkSession = async () => {
        setLoading(true);
        try {
            // Controlla se c'è un token salvato
            const token = await SecureStore.getItemAsync('userToken');
            const userType = await AsyncStorage.getItem('user_type');

            if (token && userType) {
                // L'utente è già loggato! Lo reindirizziamo subito
                if (userType === 'medico') {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'DoctorTabs' }],
                    });
                } else {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'PatientTabs' }],
                    });
                }
            }
            // Se non c'è token, non fa nulla e lascia l'utente nella pagina di Login
        } catch (error) {
            console.error("Errore nel recupero della sessione", error);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // ----- REGISTRAZIONE ------
    // ==========================================
    const handleRegister = async (userType: UserRole, form: any) => {
        setLoading(true);

        const data = new FormData();
        data.append('user_type', userType === 'doctor' ? 'medico' : 'paziente');
        data.append('nome', form.nome);
        data.append('cognome', form.cognome);
        data.append('email', form.email);
        data.append('password', form.password);

        if (userType === 'doctor') {
            data.append('indirizzo_studio', form.indirizzoStudio);
            data.append('citta', form.citta);
            data.append('numero_civico', form.numeroCivico);
            data.append('numero_telefono_studio', form.telefonoStudio);
            data.append('numero_telefono_cellulare', form.telefonoCellulare);
        } else {
            data.append('codice_fiscale', form.codiceFiscale);
            data.append('data_di_nascita', form.dataNascita);
            data.append('med', form.medicoRiferimento);
        }

        try {
            const response = await axios.post(`${API_URL}/register/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.status === 'success') {
                Alert.alert("Successo", "Registrazione completata!");
                navigation.navigate('Login');
            } else {
                Alert.alert("Errore", response.data.message || "Errore sconosciuto");
            }
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.message || "Si è verificato un problema durante la registrazione.";
            Alert.alert("Errore", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // ----- LOGIN ------
    // ==========================================
    const handleLogin = async (email: string, password: string) => {
        setLoading(true);

        const data = new FormData();
        data.append('email', email);
        data.append('password', password);

        try {
            const response = await axios.post(`${API_URL}/login/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.status === 'success') {
                // 1. Salva il Token JWT e le info base
                await SecureStore.setItemAsync('userToken', response.data.token);
                await AsyncStorage.setItem('user_type', response.data.user_type);
                await AsyncStorage.setItem('user_id', response.data.user_id);

                // 2. Resetta lo stack di navigazione
                if (response.data.user_type === 'medico') {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'DoctorTabs' }],
                    });
                } else {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'PatientTabs' }],
                    });
                }
            } else {
                Alert.alert("Accesso Negato", response.data.message);
            }
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.message || "Credenziali non valide o errore di rete.";
            Alert.alert("Errore di Login", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // ----- LOGOUT ------
    // ==========================================
    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync('userToken');
            await AsyncStorage.removeItem('user_type');
            await AsyncStorage.removeItem('user_id');
            
            navigation.reset({
                index: 0,
                routes: [{ name: 'Index' }], 
            });
        } catch (error) {
            console.error("Errore durante il logout", error);
            Alert.alert("Errore", "Impossibile completare il logout.");
        }
    };

    return {
        checkSession,
        handleRegister,
        handleLogin,
        handleLogout,
        loading
    };
};
