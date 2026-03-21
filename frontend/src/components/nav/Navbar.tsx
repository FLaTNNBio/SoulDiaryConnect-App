import React from 'react';
import { Image, Text, View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// 1. Ora abbiamo solo showBackArrow
interface NavbarProps {
  showBackArrow?: boolean; 
}

export default function Navbar({ showBackArrow = false }: NavbarProps) {
  const navigation = useNavigation();

  // 2. La funzione fa solo una cosa: torna indietro nella cronologia
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        
        {showBackArrow && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
        )}

        <Text style={styles.appTitle}>SoulDiary</Text>
        <Image 
          source={require('../../../assets/logo2.png')} 
          style={styles.logo}
          resizeMode="contain" 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (i tuoi stili rimangono identici)
  container: {
    width: '100%',
    height: Platform.OS === 'ios' ? 60 : 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderInput,
    paddingTop: Platform.OS === 'ios' ? 0 : 0, 
    zIndex: 10, 
  },
  leftContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-start',
  },
  backButton: {
    marginRight: 10,
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 17, 
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: 5,
    marginBottom: 0, 
  },
  logo: {
    width: 80, 
    height: 30, 
  }
});