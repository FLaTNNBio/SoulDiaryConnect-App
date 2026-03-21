import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { commonStyles } from '../../../../../styles/CommonStyles';
import { Colors } from '../../../../../constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Footer from '../../../../../components/Footer';
import AuthButton from '../../../../../components/buttons/AuthButton';
import Chip from '../../../../../components/buttons/Chip'; 
import { useDoctor } from '../../../../../hooks/useDoctor';

export default function SummaryScreen() {
  const route = useRoute<any>();
  const { patientId } = route.params;

  const { clinicalSummary, fetchClinicalSummary, loading } = useDoctor();
  
  // Questo stato serve SOLO per decidere che periodo usare per la PROSSIMA generazione
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [isGenerating, setIsGenerating] = useState(false);

  const periods = [
    { id: '7days', label: 'Ultimi 7 giorni', emoji: '' },
    { id: '30days', label: 'Ultimo mese', emoji: '' },
    { id: '3months', label: 'Ultimi 3 mesi', emoji: '' },
    { id: 'year', label: 'Ultimo anno', emoji: '' },
  ];

  // Carica il riassunto all'avvio (di default prova a prendere quello degli ultimi 7 giorni)
  // Nota: l'array delle dipendenze NON include 'selectedPeriod', quindi non si ricarica se cambi chip
  useEffect(() => {
    if (patientId) {
      // Al primo avvio, controlla se c'è un riassunto recente
      fetchClinicalSummary(patientId, '7days', false);
    }
  }, [patientId, fetchClinicalSummary]);

  // Forza la generazione di un nuovo riassunto con l'IA basandosi sul chip selezionato
  const handleGenerateNew = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    // Usa il selectedPeriod scelto dall'utente
    const result = await fetchClinicalSummary(patientId, selectedPeriod, true);
    setIsGenerating(false);

    if (result) {
      Alert.alert("Successo ✨", `Il riassunto clinico per il periodo '${result.periodo_label}' è stato generato.`);
    } else {
      Alert.alert("Errore", "Impossibile generare il riassunto in questo momento.");
    }
  };

  // Funzione magica per trasformare **testo** in testo in grassetto
  const formatTestoIA = (text: string) => {
    if (!text) return null;
    
    // Divide il testo usando '**' come forbice
    const parti = text.split('**');
    
    return parti.map((parte, index) => {
      // Le parti dispari (1, 3, 5...) sono quelle che stavano in mezzo agli asterischi!
      if (index % 2 !== 0) {
        return <Text key={index} style={{ fontWeight: 'bold', color: Colors.textDark }}>{parte}</Text>;
      }
      // Le parti pari (0, 2, 4...) sono testo normale
      return <Text key={index}>{parte}</Text>;
    });
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: Colors.white }}
      contentContainerStyle={{ flexGrow: 1 }} 
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      
      {/* --- HEADER --- */}
      <View style={styles.headerContainer}>
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={14} color={Colors.primary} />
          <Text style={styles.aiBadgeText}>Generato con IA</Text>
        </View>

        <Text style={styles.mainTitle}>Riassunto Caso Clinico</Text>

        <View style={styles.headerTopRow}>
          <View style={styles.brainWrapper}>
             <MaterialCommunityIcons name="head-cog-outline" size={26} color={Colors.primary} />
          </View>
          <View style={styles.generationInfo}>
             <Text style={styles.lastGenLabel}>Ultima generazione</Text>
             <Text style={styles.lastGenDate}>
                {clinicalSummary?.data_generazione 
                    ? `${clinicalSummary.data_generazione} (${clinicalSummary.periodo_label})`
                    : "Nessun riassunto salvato"
                }
             </Text>
          </View>
        </View>
      </View>

      <View style={[commonStyles.page_left, { marginTop: 10, paddingHorizontal: 15 }]}>
        
        {/* --- FORM --- */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Genera per il periodo:</Text>
          
          <View style={styles.chipsContainer}>
            {periods.map((period) => (
              <Chip
                key={period.id}
                label={period.label}
                emoji={period.emoji}
                isActive={selectedPeriod === period.id}
                onPress={() => setSelectedPeriod(period.id)}
                hasInfo={false} 
              />
            ))}
          </View>

          {/* --- BUTTON --- */}
          <View style={styles.buttonWrapper}>
            <AuthButton 
              title={isGenerating ? "Sto analizzando le note..." : "Genera Nuovo Riassunto"} 
              onPress={handleGenerateNew} 
              iconFamily="material" 
              iconName={isGenerating ? "autorenew" : "auto-fix"} 
              variant="primary"
            />
          </View>
        </View>

        {/* --- RESULT --- */}
        <View style={styles.resultHeader}>
           <Ionicons name="document-text-outline" size={20} color={Colors.grey} />
           <Text style={styles.resultTitle}>Risultato Analisi</Text>
        </View>

        {/* Mostra il caricamento visivo SOLO quando stiamo comunicando col backend */}
        {loading && !isGenerating && !clinicalSummary?.testo_riassunto ? (
            <View style={{ padding: 30, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 10, color: Colors.grey }}>Recupero dati in corso...</Text>
            </View>
        ) : (
            <View style={commonStyles.border_card}>
                <Text style={[styles.summaryText, !clinicalSummary?.testo_riassunto && { fontStyle: 'italic', color: Colors.grey }]}>
                    {clinicalSummary?.testo_riassunto 
                        ? formatTestoIA(clinicalSummary.testo_riassunto) 
                        : "Seleziona un periodo e premi 'Genera Nuovo Riassunto' per avviare l'analisi."}
                </Text>
            </View>
        )}

      </View>
      
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.backgroundInput,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderInput,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0ecf2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  aiBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textDark,
    marginBottom: 15,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brainWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderInput,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  generationInfo: {
    marginLeft: 15,
  },
  lastGenLabel: {
    fontSize: 11,
    color: Colors.grey,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  lastGenDate: {
    fontSize: 13,
    color: Colors.textGray,
    marginTop: 2,
  },
  formSection: {
    paddingVertical: 10,
    width: '100%',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15, 
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 5,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 20,
    gap: 8,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    textTransform: 'uppercase',
  },
  summaryText: {
    fontSize: 16,
    color: Colors.textDark,
    lineHeight: 26,
  },
});