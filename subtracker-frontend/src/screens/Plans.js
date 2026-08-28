import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Plans({ navigation }) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: '',
      headerBackTitle: 'Geri',
      headerBackTitleVisible: true,
      headerTitleAlign: 'center',
      headerTintColor: 'black',
      headerBackTitleStyle: {
        fontSize: 17,
        fontWeight: 'bold',
      },
    });
  }, [navigation]);

  const handlePlanSelect = (plan) => {
    navigation.navigate('Payment', { selectedPlan: plan });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Planlar</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePlanSelect('Premium Plan')}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planName}>Premium Plan</Text>
          <Ionicons name="person" size={25} />
        </View>

        <Text style={styles.price}>₺29 / ay</Text>
        <View style={styles.features}>
          <Text style={styles.feature}>• Tüm abonelikleri sınırsız ekle</Text>
          <Text style={styles.feature}>• Reklamsız kullanım</Text>
          <Text style={styles.feature}>• Premium destek</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePlanSelect('İşletme Planı')}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planName}>İşletme Planı</Text>
          <Ionicons name="business" size={25} />
        </View>

        <Text style={styles.price}>₺479 / ay</Text>
        <View style={styles.features}>
          <Text style={styles.feature}>• Çalışan hesabı ekleyebilme</Text>
          <Text style={styles.feature}>• Finansal raporlar</Text>
          <Text style={styles.feature}>• Ekip yönetimi araçları</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f8fbf8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#61941b',
    marginBottom: 10,
  },
  features: {
    marginLeft: 10,
  },
  feature: {
    fontSize: 16,
    marginBottom: 5,
  },
});
