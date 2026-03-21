import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import IndexScreen from './src/screens/IndexScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PatientTabs from './src/screens/patient/PatientTabs';
import DoctorTabs from './src/screens/doctor/DoctorTabs';
import NoteDetailScreen from './src/screens/patient/tabs/NoteDetailScreen';
import DoctorPatientDetailsTabs from './src/screens/doctor/tabs/patientDetailsTabs/DoctorPatientDetailsTabs';
import NoteDetailsFormScreen from './src/screens/doctor/tabs/patientDetailsTabs/tabs/noteFormScreen/NoteDetailsFormScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Index">
              <Stack.Screen 
                name="Index" 
                component={IndexScreen} 
                options={{ headerShown: false }}  
              />
              <Stack.Screen 
                name="Login" 
                component={LoginScreen}
                options={{ headerShown: false }}  
              />
              <Stack.Screen 
                name="Register" 
                component={RegisterScreen} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="PatientTabs" 
                component={PatientTabs} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="DoctorTabs" 
                component={DoctorTabs} 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="NoteDetails" 
                component={NoteDetailScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="DoctorPatientDetailsTabs" 
                component={DoctorPatientDetailsTabs} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="NoteDetailsForm" 
                component={NoteDetailsFormScreen} 
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
    </SafeAreaProvider>
  );
}