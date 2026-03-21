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
import { useAccess } from '../hooks/useAccess';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { handleLogin, loading } = useAccess(navigation);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);

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
                  <Text style={commonStyles.welcomeTitle}>Bentornato!</Text>
                  <Text style={commonStyles.welcomeSub}>Accedi al tuo account per continuare</Text>
                  { /* --- EMAIL --- */ }
                  <Text style={commonStyles.inputLabel}>Email</Text>
                  <View style={commonStyles.inputContainer}>
                    <TextInput 
                      style={commonStyles.input}
                      placeholder="la-tua@email.com"
                      placeholderTextColor={Colors.placeholderInput}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  { /* --- PASSWORD --- */ }
                  <Text style={commonStyles.inputLabel}>Password</Text>
                  <View style={commonStyles.inputContainer}>
                    <TextInput 
                      style={commonStyles.input}
                      placeholder="La tua password"
                      placeholderTextColor={Colors.placeholderInput} 
                      value={password}
                      onChangeText={setPassword}
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

                  { /* --- LOGIN BUTTON --- */ }
                  <AuthButton 
                    title={loading ? "Accesso..." : "Accedi"} 
                    onPress={() =>handleLogin(email,password)}
                    variant="primary"
                  />

                  { /* --- REGISTER LINK --- */ }
                  <View style={[commonStyles.row, {marginTop: 10}]}>
                    <Text style={commonStyles.textBeforeLink}>Non hai un account? </Text>
                      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={commonStyles.textLink}>Registrati</Text>
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