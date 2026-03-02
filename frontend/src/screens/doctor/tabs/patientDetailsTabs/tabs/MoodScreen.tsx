// import React from 'react';
// import { View, Text, StyleSheet, ScrollView } from 'react-native';
// import { commonStyles } from '../../../../../styles/CommonStyles';
// import { Colors } from '../../../../../constants/Colors';
// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import Footer from '../../../../../components/Footer';
// import StatsCard from '../../../../../components/stats/StatsCard';
// import EmotionLegendCard from '../../../../../components/stats/EmotionLegendCard';
// import EmotionalTrendChart from '../../../../../components/stats/EmotionalTrendChart';
// import MoodContextCorrelation from '../../../../../components/stats/MoodContextCorrelation';
// import MoodContextAverage from '../../../../../components/stats/MoodContextAverage';
// import { AlertCard } from '../../../../../components/AlertCard';

// export default function MoodScreen() {
//   const mockStats = {
//     totalNotes: 42,
//     averageScore: "7.5 / 10",
//     topEmotion: "Serenità",
//     topEmotionCount: 15,
//     isCritical: true
//   };

//   return (
//     <ScrollView 
//       style={{ flex: 1, backgroundColor: Colors.white }}
//       contentContainerStyle={{ flexGrow: 1 }} 
//       keyboardShouldPersistTaps="handled"
//       showsVerticalScrollIndicator={false}
//     >
//       <View style={[commonStyles.page_left, { marginTop: 20 }]}>

//         {/* --- CRITIC --- */}
//         {mockStats.isCritical && (
//           <AlertCard 
//             isCritic= {true}
//             title="Rilevato Stato Critico"
//             iconName="alert-decagram"
//             text="Il periodo selezionato mostra una flessione marcata. Si consiglia un colloquio di approfondimento immediato."
//           />
//         )}
        

//         {/* --- LEGEND SECTION --- */}
//         <EmotionLegendCard />


//         {/* --- STATS SECTION --- */}
//         <View style={styles.sectionHeader}>
//           <Ionicons name="stats-chart" size={20} color={Colors.primary} />
//           <Text style={styles.sectionTitle}>Statistiche Periodo</Text>
//         </View>

//         <StatsCard stats={mockStats} />

//         {/* --- GRAPHS SECTION --- */}
//         <View style={styles.sectionHeader}>
//           <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={20} color={Colors.primary} />
//           <Text style={styles.sectionTitle}>Andamento Emotivo</Text>
//         </View>

//         <EmotionalTrendChart />

//         <View style={styles.sectionHeader}>
//           <MaterialCommunityIcons name="account-group-outline" size={20} color={Colors.primary} />
//           <Text style={styles.sectionTitle}>Umore - Contesto Sociale</Text>
//         </View>

//         <MoodContextCorrelation />

//         <View style={styles.sectionHeader}>
//           <MaterialCommunityIcons name="chart-bar" size={20} color={Colors.primary} />
//           <Text style={styles.sectionTitle}>Media emotiva per contesto</Text>
//         </View>

//         <MoodContextAverage />

//       </View>
//       <Footer />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     gap: 10,
//   },
//   sectionTitle: {
//     fontSize: 19,
//     fontWeight: 'bold',
//     color: Colors.textDark,
//   }
// });

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { commonStyles } from '../../../../../styles/CommonStyles';
import { Colors } from '../../../../../constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Footer from '../../../../../components/Footer';
import StatsCard from '../../../../../components/stats/StatsCard';
import EmotionLegendCard from '../../../../../components/stats/EmotionLegendCard';
import EmotionalTrendChart from '../../../../../components/stats/EmotionalTrendChart';
import MoodContextCorrelation from '../../../../../components/stats/MoodContextCorrelation';
import MoodContextAverage from '../../../../../components/stats/MoodContextAverage';
import { AlertCard } from '../../../../../components/AlertCard';
import { useDoctor } from '../../../../../hooks/useDoctor';

export default function MoodScreen() {
  const route = useRoute<any>();
  const { patientId } = route.params;

  // Importiamo le funzioni dal nostro hook
  const { moodStats, fetchMoodStats, loading } = useDoctor();

  // Scarica i dati quando si apre la pagina
  useEffect(() => {
    if (patientId) {
      fetchMoodStats(patientId);
    }
  }, [patientId, fetchMoodStats]);

  // Se sta caricando, mostriamo la rotellina
  if (loading && !moodStats) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, color: Colors.grey }}>Analisi andamento in corso...</Text>
      </View>
    );
  }

  // Se non ci sono note o non ci sono dati, mostriamo un messaggio vuoto
  if (!moodStats || !moodStats.statistiche || moodStats.statistiche.totale_note === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white, padding: 20 }}>
        <Ionicons name="document-text-outline" size={60} color={Colors.borderInput} />
        <Text style={{ marginTop: 15, fontSize: 18, color: Colors.textGray, textAlign: 'center' }}>
          Nessun dato disponibile.
        </Text>
        <Text style={{ marginTop: 5, fontSize: 14, color: Colors.grey, textAlign: 'center' }}>
          Il paziente non ha ancora scritto note sufficienti per generare le statistiche.
        </Text>
      </View>
    );
  }

  // Costruiamo l'oggetto stats formattato per il tuo componente StatsCard
  // La media massima nel nostro backend è 4 (Positive = 4, Neutral = 3, Anxious = 2, Negative = 1)
  const isCritical = moodStats.statistiche.media_emotiva > 0 && moodStats.statistiche.media_emotiva <= 2.2;
  
  const realStats = {
    totalNotes: moodStats.statistiche.totale_note,
    averageScore: `${moodStats.statistiche.media_emotiva} / 4`, 
    topEmotion: `${moodStats.statistiche.emozione_frequente_emoji || ''} ${moodStats.statistiche.emozione_frequente || 'N/A'}`.trim(),
    topEmotionCount: moodStats.statistiche.emozione_frequente_count,
    isCritical: isCritical
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: Colors.white }}
      contentContainerStyle={{ flexGrow: 1 }} 
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[commonStyles.page_left, { marginTop: 20, paddingHorizontal: 15 }]}>

        {/* --- CRITIC ALERT --- */}
        {realStats.isCritical && (
          <AlertCard 
            isCritic={true}
            title="Rilevato Stato Critico"
            iconName="alert-decagram"
            text="Il periodo analizzato mostra una flessione marcata (media bassa). Si consiglia un colloquio di approfondimento."
          />
        )}
        
        {/* --- LEGEND SECTION --- */}
        <EmotionLegendCard />

        {/* --- STATS SECTION --- */}
        <View style={styles.sectionHeader}>
          <Ionicons name="stats-chart" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Statistiche Generali</Text>
        </View>

        <StatsCard stats={realStats} />

        {/* --- GRAPHS SECTION --- */}
        {moodStats.andamento_emotivo && (
          <>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Andamento Emotivo</Text>
            </View>
            
            {/* Passiamo i dati al componente del grafico */}
            <EmotionalTrendChart data={moodStats.andamento_emotivo} />
          </>
        )}

        {moodStats.correlazione_contesto && (
          <>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-group-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Umore - Contesto Sociale</Text>
            </View>

            {/* Passiamo i dati ai grafici di contesto */}
            <MoodContextCorrelation data={moodStats.correlazione_contesto} />

            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="chart-bar" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Media emotiva per contesto</Text>
            </View>

            <MoodContextAverage data={moodStats.correlazione_contesto} />
          </>
        )}

      </View>
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 25, // Aggiunto margine per distanziare le sezioni
    gap: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: Colors.textDark,
  }
});