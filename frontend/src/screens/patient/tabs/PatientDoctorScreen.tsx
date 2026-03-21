import React, { useEffect } from 'react';
import { View, Text, ScrollView, Linking, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '../../../styles/CommonStyles';
import Footer from '../../../components/Footer';
import Navbar from '../../../components/nav/Navbar';
import { Colors } from '../../../constants/Colors';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { infoStyles } from '../../../styles/InfoStyles';
import { usePatient } from '../../../hooks/usePatient';

export default function PatientDoctorScreen() { 
    const { fetchDoctorInfo, doctorInfo, loading, error } = usePatient();

    useEffect(() => {
        fetchDoctorInfo();
    }, [fetchDoctorInfo]);

    const handleEmailPress = () => {
        if (doctorInfo?.email) Linking.openURL(`mailto:${doctorInfo.email}`);
    };

    const handlePhonePress = (num?: string) => {
        if (num) Linking.openURL(`tel:${num.replace(/ /g, '')}`);
    };

    if (loading && !doctorInfo) {
        return <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator size="large" color={Colors.primary}/></View>;
    }

    return ( 
        <SafeAreaView style={commonStyles.safe_container_log} edges={['top']}>
            <Navbar/>
            <View style={commonStyles.container_log}>
                <ScrollView contentContainerStyle={{ flexGrow: 1}} showsVerticalScrollIndicator={false}>
                    <View style={[commonStyles.page, {padding: 10}]}>
                        <View style={[commonStyles.card, {width: '100%'}]}>
                            <View style={[infoStyles.avatarContainer, {backgroundColor: Colors.background}]}>
                                <Ionicons name="medkit" size={48} color={Colors.primary} />
                            </View>

                            <Text style={infoStyles.infoPrimary}>{doctorInfo?.nome || "Medico non assegnato"}</Text>
                            <Text style={infoStyles.infoSecondary}>{doctorInfo?.specializzazione || "Psicoterapeuta"}</Text>

                            <View style={infoStyles.divider} />

                            <View style={{marginTop: 20}}>
                                <TouchableOpacity 
                                    style={infoStyles.contactRow} 
                                    onPress={handleEmailPress} 
                                    disabled={!doctorInfo?.email}
                                >
                                    <View style={infoStyles.iconContainer}>
                                        <Ionicons name="mail-outline" size={22} color={Colors.grey} />
                                    </View>
                                    <View style={infoStyles.contactInfo}>
                                        <Text style={infoStyles.contactLabel}>Email</Text>
                                        <Text style={infoStyles.contactValue}>{doctorInfo?.email || "N/D"}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="#ccc" />
                                </TouchableOpacity>

                                <View style={infoStyles.contactRow}>
                                    <View style={infoStyles.iconContainer}>
                                        <Ionicons name="location-outline" size={22} color={Colors.grey} />
                                    </View>
                                    <View style={infoStyles.contactInfo}>
                                        <Text style={infoStyles.contactLabel}>Indirizzo Studio</Text>
                                        <Text style={infoStyles.contactValue}>{doctorInfo?.indirizzo || "N/D"}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity 
                                    style={infoStyles.contactRow} 
                                    onPress={() => handlePhonePress(doctorInfo?.telefono)}
                                    disabled={!doctorInfo?.telefono}
                                >
                                    <View style={infoStyles.iconContainer}>
                                        <Ionicons name="call-outline" size={22} color={Colors.grey} />
                                    </View>
                                    <View style={infoStyles.contactInfo}>
                                        <Text style={infoStyles.contactLabel}>Telefono Studio</Text>
                                        <Text style={infoStyles.contactValue}>{doctorInfo?.telefono || "N/D"}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="#ccc" />
                                </TouchableOpacity>

                                {doctorInfo?.cellulare && (
                                    <TouchableOpacity 
                                        style={infoStyles.contactRow} 
                                        onPress={() => handlePhonePress(doctorInfo?.cellulare)}
                                    >
                                        <View style={infoStyles.iconContainer}>
                                            <Ionicons name="phone-portrait-outline" size={22} color={Colors.grey} />
                                        </View>
                                        <View style={infoStyles.contactInfo}>
                                            <Text style={infoStyles.contactLabel}>Cellulare</Text>
                                            <Text style={infoStyles.contactValue}>{doctorInfo.cellulare}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                    <Footer />
                </ScrollView>
            </View>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}