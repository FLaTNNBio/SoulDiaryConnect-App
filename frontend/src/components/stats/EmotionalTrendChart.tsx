import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  FlatList,
  Alert,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/Colors'; 
import { commonStyles } from '../../styles/CommonStyles';
import Chip from '../buttons/Chip';

const screenWidth = Dimensions.get('window').width;

const yAxisLabels: { [key: number]: string } = {
  1: 'Negative', 2: 'Ansiose', 3: 'Neutre', 4: 'Positive', 
};

const fullEmotionNames: { [key: number]: string } = {
  1: 'Emotività Negativa', 2: 'Stato Ansioso', 3: 'Emotività Neutra', 4: 'Emotività Positiva', 
};

const quickFilters = [
  { id: 'all', label: 'Tutti', emoji: '' },
  { id: '7d', label: 'Ultimi 7 gg', emoji: '' },
  { id: '1m', label: 'Ultimo mese', emoji: '' },
  { id: '3m', label: 'Ultimi 3 mesi', emoji: '' },
  { id: '1y', label: 'Ultimo anno', emoji: '' },
];

const mesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const anni = ['2024', '2025', '2026'];

interface EmotionalTrendChartProps {
  data?: {
    dates: string[];
    full_dates?: string[];
    emotions: string[];
    values: number[];
  };
}

export default function EmotionalTrendChart({ data }: EmotionalTrendChartProps) {
  const [selectedQuickFilter, setSelectedQuickFilter] = useState('3m'); 
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'month' | 'year' | null>(null);

  // Funzione per determinare il colore del pallino in base al valore dell'emozione
  const getPointColor = (value: number) => {
    if (value >= 3.5) return '#66BB6A'; // Verde (Positivo)
    if (value >= 2.5) return '#BA68C8'; // Lilla (Neutro)
    if (value >= 1.8) return '#FFCA28'; // Giallo (Ansioso)
    return '#EF5350';                   // Rosso (Negativo)
  };

  const handleReset = () => {
    setSelectedQuickFilter('3m');
    setSelectedMonth(null);
    setSelectedYear(null);
  };

  const openModal = (type: 'month' | 'year') => {
    setModalType(type);
    setModalVisible(true);
  };

  const selectItem = (item: string) => {
    setSelectedQuickFilter(''); 
    if (modalType === 'month') {
      setSelectedMonth(item);
    } else {
      setSelectedYear(item);
    }
    setModalVisible(false);
  };

  // --- LOGICA DI FILTRAGGIO ---
  const filteredData = useMemo(() => {
    if (!data || !data.dates || data.dates.length === 0) return null;
    if (!data.full_dates) return data;

    let indices: number[] = [];
    const today = new Date();

    data.full_dates.forEach((dateStr, index) => {
      const d = new Date(dateStr);
      let include = true;

      if (selectedQuickFilter === '7d') {
        const diffDays = Math.ceil((today.getTime() - d.getTime()) / (1000 * 3600 * 24));
        if (diffDays > 7) include = false;
      } else if (selectedQuickFilter === '1m') {
        const diffDays = Math.ceil((today.getTime() - d.getTime()) / (1000 * 3600 * 24));
        if (diffDays > 30) include = false;
      } else if (selectedQuickFilter === '3m') {
        const diffDays = Math.ceil((today.getTime() - d.getTime()) / (1000 * 3600 * 24));
        if (diffDays > 90) include = false;
      } else if (selectedQuickFilter === '1y') {
        const diffDays = Math.ceil((today.getTime() - d.getTime()) / (1000 * 3600 * 24));
        if (diffDays > 365) include = false;
      }

      if (selectedMonth) {
        const monthIndex = mesi.indexOf(selectedMonth);
        if (d.getMonth() !== monthIndex) include = false;
      }
      if (selectedYear) {
        if (d.getFullYear().toString() !== selectedYear) include = false;
      }

      if (include) indices.push(index);
    });

    if (indices.length === 0) return null;

    return {
      dates: indices.map(i => data.dates[i]),
      values: indices.map(i => data.values[i]),
      emotions: indices.map(i => data.emotions[i]),
      full_dates: indices.map(i => data.full_dates![i]),
    };
  }, [data, selectedQuickFilter, selectedMonth, selectedYear]);

  // --- PREPARAZIONE DATI GRAFICO ---
  const hasData = filteredData && filteredData.dates.length > 0;
  const chartValues = hasData 
    ? (filteredData.values.length === 1 ? [filteredData.values[0], filteredData.values[0]] : filteredData.values) 
    : [3, 3]; 
    
  const chartLabels = hasData 
    ? (filteredData.dates.length === 1 ? [filteredData.dates[0], filteredData.dates[0]] : filteredData.dates) 
    : ['Nessun', 'Dato'];

  const handleDataPointClick = (pointData: any) => {
    const val = Math.round(pointData.value);
    const dateLabel = chartLabels[pointData.index];
    let emotionName = fullEmotionNames[val] || 'Sconosciuta';
    if (hasData && filteredData.emotions && filteredData.emotions[pointData.index]) {
      const rawEmotion = filteredData.emotions[pointData.index];
      emotionName = rawEmotion.charAt(0).toUpperCase() + rawEmotion.slice(1);
    }
    
    Alert.alert(
      "Dettaglio Rilevazione",
      `Data: ${dateLabel}\nEmozione Registrata: ${emotionName}\nValore: ${val}/4`,
      [{ text: "Chiudi", style: "cancel" }]
    );
  };

  const finalChartData = {
    labels: chartLabels,
    datasets: [{
      data: chartValues,
      color: (opacity = 1) => `rgba(0, 110, 199, ${opacity})`, 
      strokeWidth: 3,
    }],
  };

  const dynamicWidth = Math.max(screenWidth - 40, chartLabels.length * 60);

  return (
    <View style={commonStyles.border_card}>
      <Text style={styles.sectionLabel}>Filtri rapidi</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFilterContainer} contentContainerStyle={{ gap: 8 }}>
        {quickFilters.map((filter) => (
          <Chip
            key={filter.id}
            label={filter.label}
            isActive={selectedQuickFilter === filter.id}
            onPress={() => {
              setSelectedQuickFilter(filter.id);
              setSelectedMonth(null);
              setSelectedYear(null);
            }}
          />
        ))}
      </ScrollView>
      
      <Text style={styles.sectionLabel}>Periodo specifico</Text>
      <View style={styles.specificPeriodRow}>
        <TouchableOpacity style={[styles.dropdownButton, selectedMonth ? styles.dropdownActive : null]} onPress={() => openModal('month')}>
          <Text style={styles.dropdownText}>{selectedMonth || 'Mese'}</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.textGray} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.dropdownButton, selectedYear ? styles.dropdownActive : null]} onPress={() => openModal('year')}>
          <Text style={styles.dropdownText}>{selectedYear || 'Anno'}</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.textGray} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Ionicons name="refresh" size={16} color={Colors.red} />
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.chartWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ paddingLeft: 0, paddingRight: 30 }}>
          {hasData ? (
            <LineChart
              data={finalChartData}
              width={dynamicWidth} 
              height={280}
              segments={3} 
              fromZero={false} 
              onDataPointClick={handleDataPointClick}
              getDotColor={(dataPoint) => getPointColor(dataPoint)} // <--- PALLINI COLORATI
              formatYLabel={(yValue) => {
                const val = Math.round(parseFloat(yValue));
                return yAxisLabels[val] || '';
              }}
              chartConfig={{
                backgroundColor: Colors.white,
                backgroundGradientFrom: Colors.white,
                backgroundGradientTo: Colors.white,
                decimalPlaces: 0, 
                color: (opacity = 1) => `rgba(0, 110, 199, ${opacity})`, 
                labelColor: () => Colors.textGray,
                propsForDots: { r: '6', strokeWidth: '2', stroke: Colors.white },
                fillShadowGradient: Colors.primary, 
                fillShadowGradientOpacity: 0.1, 
                useShadowColorFromDataset: false,
                propsForBackgroundLines: { strokeDasharray: "6", stroke: Colors.borderInput },
              }}
              bezier
              style={{ marginTop: 10, borderRadius: 16 }}
            />
          ) : (
            <View style={{ width: screenWidth - 40, height: 280, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="stats-chart-outline" size={40} color={Colors.borderInput} />
                <Text style={{color: Colors.textGray, marginTop: 10}}>Nessun dato nel periodo selezionato.</Text>
            </View>
          )}
        </ScrollView>
      </View>
      
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleziona {modalType === 'month' ? 'Mese' : 'Anno'}</Text>
            <FlatList
              data={modalType === 'month' ? mesi : anni}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => selectItem(item)}>
                  <Text style={[styles.modalItemText, ((modalType === 'month' && selectedMonth === item) || (modalType === 'year' && selectedYear === item)) && styles.modalItemTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginVertical: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textGray, marginBottom: 8, textTransform: 'uppercase' },
  resetButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: Colors.borderRed, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
  resetText: { fontSize: 12, fontWeight: '600', color: Colors.red },
  quickFilterContainer: { marginBottom: 20 },
  specificPeriodRow: { flexDirection: 'row', gap: 12 },
  dropdownButton: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: Colors.borderInput, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, backgroundColor: Colors.backgroundInput },
  dropdownActive: { borderColor: Colors.primary, backgroundColor: '#F0F7FF' },
  dropdownText: { fontSize: 14, color: Colors.textDark },
  chartWrapper: { width: '100%', marginTop: 20 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '50%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: Colors.textDark },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: Colors.borderInput },
  modalItemText: { fontSize: 16, textAlign: 'center', color: Colors.textDark },
  modalItemTextActive: { color: Colors.primary, fontWeight: 'bold' }
});