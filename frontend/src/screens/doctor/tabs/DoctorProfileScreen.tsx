import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '../../../styles/CommonStyles';
import { infoStyles } from '../../../styles/InfoStyles';
import { Colors } from '../../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import Footer from '../../../components/Footer';
import Navbar from '../../../components/nav/Navbar';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import AuthButton from '../../../components/buttons/AuthButton';
import { useDoctor } from '../../../hooks/useDoctor'; 
import { useAccess } from '../../../hooks/useAccess';


export default function DoctorProfileScreen() { 
    const navigation = useNavigation<any>();

    // From Hooks
    const { profile, loading, error, fetchProfile } = useDoctor();
    const { handleLogout: performLogout } = useAccess(navigation);

    // Upload data as soon as the screen opens
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // const doctorInfo = {
    //     nome: 'Giuseppe',
    //     cognome: 'Veronesi',
    //     email: 'giuseppe.veronesi@studio.it',
    //     indirizzo: 'Via dei Mille 45, Roma',
    //     telefono: '06 12345678'
    // };

    // const handleLogout = () => {
    //     Alert.alert(
    //     "Logout",
    //     "Sei sicuro di voler uscire?",
    //     [
    //         { text: "Annulla", style: "cancel" },
    //         { 
    //         text: "Esci", 
    //         style: "destructive", 
    //         onPress: () => navigation.replace('Login') 
    //         }
    //     ]
    //     );
    // };
    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Sei sicuro di voler uscire?",
            [
                { text: "Annulla", style: "cancel" },
                { 
                    text: "Esci", 
                    style: "destructive", 
                    onPress: () => performLogout() 
                }
            ]
        );
    };

    return ( 
        <SafeAreaView style={commonStyles.safe_container_log} edges={['top']}>
            <Navbar/>
            <View style={commonStyles.container_log}>
                <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1}} 
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                >
                    <View style={[commonStyles.page, {padding: 10}]}>
                        <View style={[commonStyles.card, {width: '100%'}]}>
                            
                            <View style={[ infoStyles.avatarContainer, {backgroundColor: Colors.background}]}>
                                <Ionicons name="medkit" size={48} color={Colors.primary} />
                            </View>

                            {loading && !profile ? (
                                <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 20 }} />
                            ) : error ? (
                                <Text style={{ color: 'red', textAlign: 'center', marginVertical: 10 }}>{error}</Text>
                            ) : (
                                <>
                                    <Text style={infoStyles.infoPrimary}>{profile?.nome} {profile?.cognome}</Text>

                                    <View style={infoStyles.infoRow}>
                                        <Text style={infoStyles.infoLabel}>Email</Text>
                                        <Text style={infoStyles.infoValue}>{profile?.email}</Text>
                                    </View>
                                    <View style={infoStyles.divider} />

                                    <View style={infoStyles.infoRow}>
                                        <Text style={infoStyles.infoLabel}>Indirizzo</Text>
                                        <Text style={infoStyles.infoValue}>Via {profile?.indirizzo_studio} {profile?.numero_civico}, {profile?.citta}</Text>
                                    </View>
                                    <View style={infoStyles.divider} />

                                    <View style={infoStyles.infoRow}>
                                        <Text style={infoStyles.infoLabel}>Telefono Studio</Text>
                                        <Text style={infoStyles.infoValue}>{profile?.numero_telefono_studio}</Text>
                                    </View>
                                    <View style={infoStyles.divider} />

                                    <View style={infoStyles.infoRow}>
                                        <Text style={infoStyles.infoLabel}>Telefono Cellulare</Text>
                                        <Text style={infoStyles.infoValue}>{profile?.numero_telefono_cellulare}</Text>
                                    </View>

                                    <View style={{ marginTop: 20 }} > 
                                        <AuthButton 
                                            title="Esci dal profilo" 
                                            onPress={handleLogout} 
                                            variant='logout'
                                        />
                                    </View>
                                </>
                            )}

                            {/* <Text style={infoStyles.infoPrimary}>{doctorInfo.nome} {doctorInfo.cognome}</Text>

                            <View style={infoStyles.infoRow}>
                                <Text style={infoStyles.infoLabel}>Email</Text>
                                <Text style={infoStyles.infoValue}>{doctorInfo.email}</Text>
                            </View>

                            <View style={infoStyles.divider} />

                            <View style={infoStyles.infoRow}>
                                <Text style={infoStyles.infoLabel}>Indirizzo</Text>
                                <Text style={infoStyles.infoValue}>{doctorInfo.indirizzo}</Text>
                            </View>

                            <View style={infoStyles.divider} />

                            <View style={infoStyles.infoRow}>
                                <Text style={infoStyles.infoLabel}>Telefono</Text>
                                <Text style={infoStyles.infoValue}>{doctorInfo.telefono}</Text>
                            </View>

                            <View style={{ marginTop: 20 }} > 
                                <AuthButton 
                                    title="Esci dal profilo" 
                                    onPress={handleLogout} 
                                    variant='logout'
                                />
                            </View> */}

                        </View>
                    </View>
                    <Footer />
                </ScrollView>
            </View>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}