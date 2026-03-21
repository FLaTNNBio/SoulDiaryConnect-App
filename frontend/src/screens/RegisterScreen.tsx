import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types';
import { commonStyles } from '../styles/CommonStyles';
import Logo from '../components/logos/Logo';
import AuthButton from '../components/buttons/AuthButton';
import { Colors } from '../constants/Colors';
import Footer from '../components/Footer';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import TypeSelector, { UserRole } from '../components/TypeSelector';
import { useAccess } from '../hooks/useAccess';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
    const { handleRegister, loading } = useAccess(navigation);

    const [userType, setUserType] = useState<UserRole>('patient');
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [form, setForm] = useState({
        nome: '',
        cognome: '',
        email: '',
        password: '',
        indirizzoStudio: '',
        numeroCivico: '',
        citta: '',
        telefonoStudio: '',
        telefonoCellulare: '',
        codiceFiscale: '',
        dataNascita: '',
        medicoRiferimento: '',
    });

    const updateForm = (key: string, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    return (
        <SafeAreaView style={commonStyles.container_not_log}>
            <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            >
            <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1}} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[commonStyles.page, {gap: 10}]}>
                    <Logo scale={0.75}/>
                    <View style={[commonStyles.card, {width: '100%'}]}>
                        <Text style={commonStyles.welcomeTitle}>Crea Account</Text>
                        <Text style={commonStyles.welcomeSub}>Seleziona il tuo profilo e registrati</Text>
                        
                        {/* --- USER TYPE SELECTOR --- */ }
                        <TypeSelector 
                            userType={userType} 
                            setUserType={setUserType} 
                        />

                        {/* --- INPUT FIELDS [COMMON] --- */ }
                        <View style={[commonStyles.row, {justifyContent: 'space-between'}]}>
                            {/* --- Name --- */ }
                            <View style={{ width: '48%' }}>
                                <Text style={commonStyles.inputLabel}>Nome</Text>
                                <View style={commonStyles.inputContainer}>
                                    <TextInput 
                                        style={commonStyles.input}
                                        placeholder="Nome"
                                        placeholderTextColor={Colors.placeholderInput}
                                        value={form.nome}
                                        onChangeText={(t) => updateForm('nome', t)}
                                    />
                                </View>
                            </View>
                            {/* --- Second Name --- */ }
                            <View style={{ width: '48%' }}>
                                <Text style={commonStyles.inputLabel}>Cognome</Text>
                                <View style={commonStyles.inputContainer}>
                                    <TextInput 
                                        style={commonStyles.input}
                                        placeholder="Cognome"
                                        placeholderTextColor={Colors.placeholderInput}
                                        value={form.cognome}
                                        onChangeText={(t) => updateForm('cognome', t)}
                                    />
                                </View>
                            </View>
                        </View>
                        
                        { /* --- Email --- */ }
                        <Text style={commonStyles.inputLabel}>Email</Text>
                        <View style={commonStyles.inputContainer}>
                            <TextInput 
                                style={commonStyles.input}
                                placeholder="la-tua@email.com"
                                placeholderTextColor={Colors.placeholderInput}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={form.email}
                                onChangeText={(t) => updateForm('email', t)}
                            />
                        </View>
                        
                        { /* --- Password --- */ }
                        <Text style={commonStyles.inputLabel}>Password</Text>
                        <View style={commonStyles.inputContainer}>
                            <TextInput 
                                style={commonStyles.input}
                                placeholder="Crea una password"
                                placeholderTextColor={Colors.placeholderInput} 
                                value={form.password}
                                onChangeText={(t) => updateForm('password', t)}
                                secureTextEntry={!isPasswordVisible}
                            />
                            <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)}>
                                <Ionicons 
                                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                                size={20} 
                                color={Colors.textGray} 
                                />
                            </TouchableOpacity>
                        </View>

                        {/* --- DOCTOR FIELDS --- */}
                        {userType === 'doctor' && (
                            <>
                                <View style={[commonStyles.row, {justifyContent: 'space-between'}]}>
                                    <View style={{ width: '65%' }}>
                                        <Text style={commonStyles.inputLabel}>Indirizzo Studio</Text>
                                        <View style={commonStyles.inputContainer}>
                                            <TextInput 
                                                style={commonStyles.input}
                                                placeholder="Via Roma"
                                                value={form.indirizzoStudio}
                                                onChangeText={(t) => updateForm('indirizzoStudio', t)}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ width: '30%' }}>
                                        <Text style={commonStyles.inputLabel}>N°</Text>
                                        <View style={commonStyles.inputContainer}>
                                            <TextInput 
                                                style={commonStyles.input}
                                                placeholder="10"
                                                value={form.numeroCivico}
                                                onChangeText={(t) => updateForm('numeroCivico', t)}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <Text style={commonStyles.inputLabel}>Città</Text>
                                <View style={commonStyles.inputContainer}>
                                    <TextInput 
                                        style={commonStyles.input}
                                        placeholder="Roma"
                                        value={form.citta}
                                        onChangeText={(t) => updateForm('citta', t)}
                                    />
                                </View>

                                <Text style={commonStyles.inputLabel}>Telefono Studio</Text>
                                <View style={commonStyles.inputContainer}>
                                    <TextInput 
                                        style={commonStyles.input}
                                        placeholder="06 12345678"
                                        keyboardType="phone-pad"
                                        value={form.telefonoStudio}
                                        onChangeText={(t) => updateForm('telefonoStudio', t)}
                                    />
                                </View>

                                <Text style={commonStyles.inputLabel}>Cellulare</Text>
                                <View style={commonStyles.inputContainer}>
                                    <TextInput 
                                        style={commonStyles.input}
                                        placeholder="333 1234567"
                                        keyboardType="phone-pad"
                                        value={form.telefonoCellulare}
                                        onChangeText={(t) => updateForm('telefonoCellulare', t)}
                                    />
                                </View>
                            </>
                        )}

                        { /* --- PATIENT FIELDS --- */ }
                        {userType === 'patient' && (
                            <>
                                <Text style={commonStyles.inputLabel}>Codice Fiscale</Text>
                                <View style={commonStyles.inputContainer}>
                                    <TextInput 
                                        style={commonStyles.input}
                                        placeholder="Codice Fiscale"
                                        autoCapitalize="characters"
                                        value={form.codiceFiscale}
                                        onChangeText={(t) => updateForm('codiceFiscale', t)}
                                    />
                                </View>

                                <Text style={commonStyles.inputLabel}>Data di nascita</Text>
                                <View style={commonStyles.inputContainer}>
                                    <TextInput 
                                        style={commonStyles.input}
                                        placeholder="GG/MM/AAAA"
                                        value={form.dataNascita}
                                        onChangeText={(t) => updateForm('dataNascita', t)}
                                    />
                                </View>

                                <Text style={commonStyles.inputLabel}>Medico di Riferimento</Text>
                                <View style={commonStyles.inputContainer}>
                                    <TextInput 
                                        style={commonStyles.input}
                                        placeholder="Cerca nome..."
                                        value={form.medicoRiferimento}
                                        onChangeText={(t) => updateForm('medicoRiferimento', t)}
                                    />
                                </View>
                            </>
                        )}

                        { /* --- REGISTER BUTTON --- */ }
                        {/* TODO: onPress Registrati */}
                        {/* <AuthButton 
                            title="Registrati" 
                            onPress={() => navigation.navigate('DoctorTabs')}
                            variant="primary"
                        /> */}
                        <AuthButton 
                            title={loading ? "Registrazione..." : "Registrati"} 
                            onPress={() => handleRegister(userType, form)} // CHIAMATA REALE
                            variant="primary"
                            // disabled={loading}
                        />

                        { /* --- LOGIN LINK --- */ }
                        <View style={[commonStyles.row, {marginTop: 10}]}>
                            <Text style={commonStyles.textBeforeLink}>Hai giàun account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={commonStyles.textLink}>Accedi</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
                </TouchableWithoutFeedback>
                <Footer />
            </ScrollView>
            </KeyboardAvoidingView>
        <StatusBar style="auto" />
        </SafeAreaView>
    );
}