import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native'; 
import { Colors } from '../../../../constants/Colors'; 
import { commonStyles } from '../../../../styles/CommonStyles';
import { Ionicons } from '@expo/vector-icons';
import NoteListScreen from './tabs/NoteListScreen';
import Navbar from '../../../../components/nav/Navbar';
import SummaryScreen from './tabs/SummaryScreen';
import MoodScreen from './tabs/MoodScreen';
import Avatar from '../../../../components/avatar/Avatar';
import { useDoctor } from '../../../../hooks/useDoctor';

const Tab = createMaterialTopTabNavigator();

function PatientTabsNavigator({ patientId }: { patientId: string }) {
  return (
    <Tab.Navigator
      initialRouteName="Note"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';

          if (route.name === 'Note') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Summary') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Mood') {
            iconName = focused ? 'happy' : 'happy-outline';
          }

          return <Ionicons name={iconName} size={18} color={color} />;
        },
        tabBarShowIcon: true,
        tabBarItemStyle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600', textTransform: 'none', marginLeft: 8 },
        tabBarIndicatorStyle: { backgroundColor: Colors.primary, height: 3, borderRadius: 3 },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grey,
        tabBarStyle: { elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: Colors.borderInput, backgroundColor: Colors.white },
      })}
    >
      {/* We use initialParams to pass the patient ID to the internal screens! */}
      <Tab.Screen 
        name="Note" 
        component={NoteListScreen} 
        options={{ title: 'Diario' }} 
        initialParams={{ patientId }} 
      />
      <Tab.Screen 
        name="Summary" 
        component={SummaryScreen}
        options={{ title: 'Riassunto' }} 
        initialParams={{ patientId }} 
      />
      <Tab.Screen 
        name="Mood" 
        component={MoodScreen} 
        options={{ title: 'Umore' }} 
        initialParams={{ patientId }} 
      />
    </Tab.Navigator>
  );
}

export default function DoctorPatientDetailsTabs() {
  const route = useRoute<any>();
  // Read the ID passed from DoctorListPatientsScreen
  const patientId = route.params?.patientId; 

  const { selectedPatient, loading, error, fetchPatientDetails } = useDoctor();

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails(patientId);
    }
  }, [patientId, fetchPatientDetails]);

  return (
    <SafeAreaView style={commonStyles.safe_container_log} edges={['top', 'bottom']}>
        <Navbar showBackArrow={true}/>
        
        {/* --- HEADER PATIENT --- */}
        <View style={styles.patientHeader}>
          {loading && !selectedPatient ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ flex: 1, padding: 20 }} />
          ) : error ? (
            <Text style={{ color: 'red', flex: 1, textAlign: 'center' }}>{error}</Text>
          ) : selectedPatient ? (
            <>
              <Avatar 
                firstName={selectedPatient.nome} 
                lastName={selectedPatient.cognome} 
              />

              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>
                  {selectedPatient.nome} {selectedPatient.cognome}
                </Text>
                
                <View style={styles.badgeContainer}>
                  {/* Badge CF */}
                  <View style={[styles.badge, { backgroundColor: Colors.background }]}>
                    <Text style={[styles.badgeText, { color: Colors.primary, marginLeft: 0, marginRight: 4 }]}>CF: </Text>
                    <Text style={[styles.badgeText, { color: Colors.grey, marginLeft: 0 }]}>
                      {selectedPatient.codice_fiscale}
                    </Text>
                  </View>

                  {/* Badge Date */}
                  <View style={[styles.badge, { backgroundColor: Colors.background }]}>
                    <Ionicons name="calendar-outline" size={12} color={Colors.primary} />
                    <Text style={[styles.badgeText, { color: Colors.grey }]}>
                      {selectedPatient.data_di_nascita}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          ) : null}
        </View>

        {/* --- TABS --- */}
        <View style={commonStyles.container_log}>
          {/* We pass the patientId to the navigator, so the individual tabs know which notes to load */}
          <PatientTabsNavigator patientId={patientId} />
        </View>
        
        <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  patientHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderInput },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 20, fontWeight: 'bold', color: Colors.textDark, marginBottom: 6 },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600', marginLeft: 4, textTransform: 'uppercase' }
});