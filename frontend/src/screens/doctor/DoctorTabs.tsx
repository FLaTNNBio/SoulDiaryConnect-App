import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // <-- Aggiunto
import { Colors } from '../../constants/Colors';
import DoctorListPatientsScreen from './tabs/DoctorListPatientsScreen';
import DoctorProfileScreen from './tabs/DoctorProfileScreen';
import DoctorParametersScreen from './tabs/DoctorParametersScreen';

const Tab = createBottomTabNavigator();

export default function DoctorTabs() {
  const insets = useSafeAreaInsets(); // <-- Calcolo dinamico dello spazio

  return (
    <Tab.Navigator
      initialRouteName="Pazienti" 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          // Altezza base dinamica che si adatta a iOS e Android
          height: 65 + insets.bottom, 
          paddingBottom: insets.bottom > 0 ? insets.bottom + 5 : 10,
          paddingTop: 10,
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        // Centratura perfetta di icona e testo
        tabBarItemStyle: {
          justifyContent: 'center', 
          alignItems: 'center',     
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textGray,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4, // Piccolo respiro tra icona e testo
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';
          if (route.name === 'Pazienti') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profilo') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Parametri') {
            iconName = focused ? 'cog' : 'cog-outline';
          }
          // Ingrandiamo leggermente le icone per coerenza con il layout del paziente
          return <Ionicons name={iconName} size={size + 2} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Pazienti" 
        component={DoctorListPatientsScreen} 
      />

      <Tab.Screen 
        name="Profilo" 
        component={DoctorProfileScreen} 
      />

      <Tab.Screen 
        name="Parametri" 
        component={DoctorParametersScreen} 
      />

    </Tab.Navigator>
  );
}