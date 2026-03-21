import { useState, useCallback } from 'react';
import { API_URL } from '../constants/Config';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export interface AiParameter {
  id?: string;
  tipo: string;
  descrizione: string;
}

export interface AiSettings {
  tipo_nota: 'strutturato' | 'libero';
  lunghezza_nota: 'lungo' | 'breve';
  parametri: AiParameter[];
}

export const useDoctor = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [profile, setProfile] = useState<any>(null);
    const [patients, setPatients] = useState<any[]>([]);
    const [patientNotes, setPatientNotes] = useState<any[]>([]);
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [clinicalSummary, setClinicalSummary] = useState<any>(null);
    const [moodStats, setMoodStats] = useState<any>(null);
    const [aiSettings, setAiSettings] = useState<AiSettings | null>(null);

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

    // 6. Add clinical comment
    const addClinicalComment = useCallback(async (noteId: number, comment: string) => {
        setLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await axios.post(
                `${API_URL}/doctor/notes/${noteId}/comment/`,
                { commento: comment }, // Il payload JSON aspettato dalla view Django
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.status === 'success') {
                // Aggiorniamo istantaneamente la nota selezionata nel frontend
                setSelectedNote((prevNote: any) => {
                    if (!prevNote) return prevNote;
                    return {
                        ...prevNote,
                        commento_medico: response.data.data.commento_medico
                    };
                });
                return true; // Ritorna true per gestire eventuali alert nella UI
            }
            return false;
        } catch (err: any) {
            setError(err.response?.data?.message || "Errore nel salvataggio della valutazione");
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // 7. Generate summary
    const fetchClinicalSummary = useCallback(async (
        patientId: string, 
        periodo: string = '7days', 
        forceGenerate: boolean = false
    ) => {
        setLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            
            const endpoint = `${API_URL}/doctor/patients/${patientId}/summary/?periodo=${periodo}&genera=${forceGenerate ? '1' : '0'}`;

            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success') {
                setClinicalSummary(response.data.data);
                return response.data.data; // Utile se vuoi gestire la risposta direttamente nel componente
            }
            return null;
        } catch (err: any) {
            setError(err.response?.data?.message || "Errore nel caricamento del riassunto clinico");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // 8. Clinical Analysis
    const regenerateClinicalAnalysis = useCallback(async (noteId: number) => {
        setLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await axios.post(
                `${API_URL}/doctor/notes/${noteId}/regenerate-analysis/`,
                {}, // Nessun body necessario, basta l'ID nell'URL
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.status === 'success') {
                // Aggiorniamo la UI con il nuovo testo
                setSelectedNote((prevNote: any) => {
                    if (!prevNote) return prevNote;
                    return {
                        ...prevNote,
                        testo_clinico: response.data.data.testo_clinico
                    };
                });
                return true;
            }
            return false;
        } catch (err: any) {
            setError(err.response?.data?.message || "Errore durante la rigenerazione");
            return false;
        } finally {
            setLoading(false);
        }
    }, []);


    // 9. Mood Stats
    const fetchMoodStats = useCallback(async (patientId: string) => {
        setLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            
            // Chiamata all'API appena creata in Django
            const response = await axios.get(`${API_URL}/doctor/patients/${patientId}/mood-stats/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success') {
                setMoodStats(response.data.data);
                return response.data.data; // Restituiamo i dati per comodità
            }
            return null;
        } catch (err: any) {
            setError(err.response?.data?.message || "Errore nel caricamento delle statistiche dell'umore");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // 10. Get Parameters
    const fetchAiSettings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
        const token = await SecureStore.getItemAsync('userToken');
        
        const response = await axios.get(`${API_URL}/doctor/ai-parameters/`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status === 'success') {
            setAiSettings(response.data.data);
            return response.data.data;
        }
        return null;
        } catch (err: any) {
        setError(err.response?.data?.message || "Errore nel caricamento dei parametri IA");
        return null;
        } finally {
        setLoading(false);
        }
    }, []);

    // 10. Save Parameters
    const updateAiSettings = useCallback(async (newSettings: AiSettings) => {
        setLoading(true);
        setError(null);
        try {
        const token = await SecureStore.getItemAsync('userToken');
        
        const response = await axios.post(`${API_URL}/doctor/ai-parameters/`, newSettings, {
            headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
            }
        });

        if (response.data.status === 'success') {
            // Aggiorniamo lo stato locale con i nuovi dati appena salvati con successo
            setAiSettings(newSettings);
            return true; 
        }
        return false;
        } catch (err: any) {
        setError(err.response?.data?.message || "Errore nel salvataggio dei parametri IA");
        return false;
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
        fetchNoteDetails,
        addClinicalComment,
        regenerateClinicalAnalysis,
        fetchClinicalSummary,
        clinicalSummary,
        fetchMoodStats,
        moodStats,
        aiSettings,
        fetchAiSettings,
        updateAiSettings
    };
};