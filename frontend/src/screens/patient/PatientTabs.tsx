import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import PatientProfileScreen from './tabs/PatientProfileScreen';
import PatientDoctorScreen from './tabs/PatientDoctorScreen';
import PatientDiaryScreen from './tabs/PatientDiaryScreen';

const Tab = createBottomTabNavigator();

export default function PatientTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Diario" 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          // Altezza base (es. 60) + lo spazio di sicurezza inferiore (che su Android spesso è 0, su iOS è ~34)
          height: 60 + insets.bottom, 
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10, // Se c'è una safe area usa quella, altrimenti dai un minimo di 10
          paddingTop: 10,
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textGray,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';
          if (route.name === 'Diario') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Medico') {
            iconName = focused ? 'medkit' : 'medkit-outline';
          } else if (route.name === 'Profilo') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Diario" 
        component={PatientDiaryScreen} 
      />

      <Tab.Screen 
        name="Medico" 
        component={PatientDoctorScreen} 
      />

      <Tab.Screen 
        name="Profilo" 
        component={PatientProfileScreen} 
      />
      
    </Tab.Navigator>
  );
}