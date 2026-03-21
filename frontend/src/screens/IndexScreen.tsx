// import React from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { StatusBar } from 'expo-status-bar';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { RootStackParamList } from '../../types';
// import { commonStyles } from '../styles/CommonStyles';
// import Logo from '../components/logos/Logo';
// import AuthButton from '../components/buttons/AuthButton';
// import { Colors } from '../constants/Colors';
// import Footer from '../components/Footer';

// type Props = NativeStackScreenProps<RootStackParamList, 'Index'>;

// export default function IndexScreen({ navigation }: Props) {
//   return (
//     <SafeAreaView style={commonStyles.container_not_log}>
//         <View style={[commonStyles.page, {gap: 10}]}>
//             <Logo />
//             <Text style={styles.tagline}>
//                 Il diario digitale, sempre al tuo fianco
//             </Text>
//             <AuthButton
//                 title="Accedi"
//                 variant="primary"
//                 iconName="log-in-outline"
//                 onPress={() => navigation.navigate('Login')}
//             />

//             <AuthButton
//                 title="Registrati"
//                 variant="outline"
//                 iconName="person-add-outline"
//                 onPress={() => navigation.navigate('Register')}
//             />
//         </View>
//         <Footer />
//       <StatusBar style="auto" />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//     tagline: {
//         fontSize: 16,
//         color: Colors.textGray,
//         textAlign: 'center',
//         fontWeight: '500',
//         lineHeight: 24,
//         marginBottom: 10
//   },
// });

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types';
import { commonStyles } from '../styles/CommonStyles';
import Logo from '../components/logos/Logo';
import AuthButton from '../components/buttons/AuthButton';
import { Colors } from '../constants/Colors';
import Footer from '../components/Footer';
import { useAccess } from '../hooks/useAccess'; 

type Props = NativeStackScreenProps<RootStackParamList, 'Index'>;

export default function IndexScreen({ navigation }: Props) {
  // Estraiamo la funzione di controllo e lo stato di caricamento
  const { checkSession, loading } = useAccess(navigation);

  // Facciamo partire il controllo in automatico appena si apre la schermata
  useEffect(() => {
    checkSession();
  }, []); // L'array vuoto significa "fallo solo una volta all'avvio"

  return (
    <SafeAreaView style={commonStyles.container_not_log}>
        <View style={[commonStyles.page, {gap: 10}]}>
            <Logo />
            <Text style={styles.tagline}>
                Il diario digitale, sempre al tuo fianco
            </Text>
            
            {/* Mostriamo un caricamento finché non ha finito di leggere la memoria */}
            {loading ? (
                <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={{ marginTop: 10, color: Colors.textGray }}>Accesso in corso...</Text>
                </View>
            ) : (
                /* Se loading è false (quindi nessun token trovato), mostra i pulsanti */
                <>
                    <AuthButton
                        title="Accedi"
                        variant="primary"
                        iconName="log-in-outline"
                        onPress={() => navigation.navigate('Login')}
                    />

                    <AuthButton
                        title="Registrati"
                        variant="outline"
                        iconName="person-add-outline"
                        onPress={() => navigation.navigate('Register')}
                    />
                </>
            )}
        </View>
        <Footer />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    tagline: {
        fontSize: 16,
        color: Colors.textGray,
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 24,
        marginBottom: 10
  },
});