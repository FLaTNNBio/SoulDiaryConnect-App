// import React, { useEffect, useMemo } from 'react';
// import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { Colors } from '../../../../../constants/Colors';
// import { commonStyles } from '../../../../../styles/CommonStyles';
// import NotesList from '../../../../../components/notes/NotesList';
// import { useDoctor } from '../../../../../hooks/useDoctor';

// export default function NoteListScreen() {
//     const route = useRoute<any>();
//     // Leggiamo il patientId passato dal navigatore padre (DoctorPatientDetailsTabs)
//     const { patientId } = route.params || {};
    
//     const { fetchPatientNotes, patientNotes, loading, error } = useDoctor();

//     useEffect(() => {
//         if (patientId) {
//             fetchPatientNotes(patientId);
//         }
//     }, [patientId, fetchPatientNotes]);

//     // Trasformiamo i dati per il componente grafico NotesList
//     const displayNotes = useMemo(() => {
//         const mesi = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
//         return patientNotes.map(n => {
//             const date = new Date(n.data_iso);
//             return {
//                 id: n.id,
//                 day: date.getDate().toString().padStart(2, '0'),
//                 month: mesi[date.getMonth()],
//                 text: n.testo,
//                 time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
//             };
//         });
//     }, [patientNotes]);

//     if (loading && patientNotes.length === 0) {
//         return <ActivityIndicator size="large" color={Colors.primary} style={{marginTop: 50}} />;
//     }

//     return (
//         <ScrollView style={{ flex: 1, backgroundColor: Colors.white }} showsVerticalScrollIndicator={false}>
//             <View style={[commonStyles.page_left, {marginTop: 20}]}>
//                 {displayNotes.length > 0 ? (
//                     <NotesList 
//                         notes={displayNotes} 
//                         onNotePress={(id) => console.log("Nota cliccata:", id)} 
//                     />
//                 ) : (
//                     <Text style={styles.emptyText}>Nessuna nota trovata per questo paziente.</Text>
//                 )}
//             </View>
//         </ScrollView>
//     );
// }

// const styles = StyleSheet.create({
//     emptyText: { textAlign: 'center', marginTop: 40, color: Colors.grey, fontStyle: 'italic' }
// });


import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native'; // Aggiunto useNavigation
import { Colors } from '../../../../../constants/Colors';
import { commonStyles } from '../../../../../styles/CommonStyles';
import NotesList from '../../../../../components/notes/NotesList';
import { useDoctor } from '../../../../../hooks/useDoctor';

export default function NoteListScreen() {
    const navigation = useNavigation<any>(); // Inizializza navigazione
    const route = useRoute<any>();
    const { patientId } = route.params || {};
    
    const { fetchPatientNotes, patientNotes, loading, error } = useDoctor();

    useEffect(() => {
        if (patientId) {
            fetchPatientNotes(patientId);
        }
    }, [patientId, fetchPatientNotes]);

    const displayNotes = useMemo(() => {
        const mesi = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
        return patientNotes.map(n => {
            const date = new Date(n.data_iso || n.data_nota); // Gestisce entrambi i formati
            return {
                id: n.id,
                day: date.getDate().toString().padStart(2, '0'),
                month: mesi[date.getMonth()],
                text: n.testo_paziente || n.testo,
                time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
            };
        });
    }, [patientNotes]);

    if (loading && patientNotes.length === 0) {
        return <ActivityIndicator size="large" color={Colors.primary} style={{marginTop: 50}} />;
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: Colors.white }} showsVerticalScrollIndicator={false}>
            <View style={[commonStyles.page_left, {marginTop: 20}]}>
                {displayNotes.length > 0 ? (
                    <NotesList 
                        notes={displayNotes} 
                        onNotePress={(id) => {
                            navigation.navigate('NoteDetailsForm', { 
                                patientId: patientId, // ID del paziente che abbiamo già nel route.params
                                noteId: id 
                            });
                        }} 
                    />
                ) : (
                    <Text style={styles.emptyText}>Nessuna nota trovata per questo paziente.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    emptyText: { textAlign: 'center', marginTop: 40, color: Colors.grey, fontStyle: 'italic' }
});