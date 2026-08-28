import React from 'react';
import { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function Support() {
  const navigation = useNavigation();

    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: true,         // ✅ Header'ı göster
        headerTitle: '',           // ✅ Başlık boş
        headerBackTitle: 'Geri',   // ✅ Sol üstte "Geri" yazacak
        headerBackTitleVisible: true, // ✅ "Geri" yazısını görünür yap
        headerTitleAlign: 'center',   // opsiyonel, ortala (zaten boş olduğu için görünmez)
        headerTintColor: 'black',
        headerBackTitleStyle: {
          fontSize: 17,    // 👈 font büyüklüğü
          fontWeight: 'bold',  // 👈 font kalınlığı
        },
      });
    }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Destek</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bize Ulaşın</Text>
        <View style={styles.infos}>
          <Ionicons name="call" style={{fontSize:24}}></Ionicons>
          <Text style={styles.infoText}>
            +90 555 123 45 67
          </Text>
        </View>
        <View style={styles.infos}>
          <Ionicons name="mail" style={{fontSize:24}}></Ionicons>
          <Text style={styles.infoText}>
            destek@subtracker.com
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    // paddingTop: Platform.OS === 'ios' ? 56 : 56,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f8fbf8',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infos: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    fontSize: 16,
  },
});
