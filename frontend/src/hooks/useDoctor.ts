import { useState, useCallback } from 'react';
import { API_URL } from '../constants/Config';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


export const useDoctor = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [profile, setProfile] = useState<any>(null);
    const [patients, setPatients] = useState<any[]>([]);
    const [patientNotes, setPatientNotes] = useState<any[]>([]);
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);

    // 1. Doctor profile
    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await axios.get(`${API_URL}/doctor/profile/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'success') {
                setProfile(response.data.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Errore nel caricamento del profilo");
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Patient's List
    const fetchPatients = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            // Assicurati che l'URL coincida con quello del tuo file urls.py in Django
            // Di solito era '/api/medico/pazienti/' nei messaggi precedenti
            const response = await axios.get(`${API_URL}/doctor/patients/`, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'success') {
                setPatients(response.data.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Errore nel caricamento dei pazienti");
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Patient's notes list
    const fetchPatientNotes = useCallback(async (codiceFiscale: string) => {
        setLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await axios.get(`${API_URL}/doctor/patients/${codiceFiscale}/notes/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'success') {
                setPatientNotes(response.data.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Errore nel caricamento note");
        } finally {
            setLoading(false);
        }
    }, []);

    // 4. Patient's info
    const fetchPatientDetails = useCallback(async (codiceFiscale: string) => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await axios.get(`${API_URL}/doctor/patients/${codiceFiscale}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'success') {
                setSelectedPatient(response.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 5. Single Patient's note details
    const fetchNoteDetails = useCallback(async (patientId: string, noteId: number) => {
        setLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await axios.get(
                `${API_URL}/doctor/patients/${patientId}/notes/${noteId}/`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.status === 'success') {
                setSelectedNote(response.data.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Errore nel caricamento dei dettagli");
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        profile,
        patientNotes,
        patients,
        selectedPatient,
        fetchProfile,
        fetchPatientNotes,
        fetchPatientDetails,
        fetchPatients,
        selectedNote,
        fetchNoteDetails
    };
};