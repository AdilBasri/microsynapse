import { Ionicons } from '@expo/vector-icons';
import { useLayoutEffect } from 'react';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

export default function NotificationSettings() {
  const [instantNotifications, setInstantNotifications] = useState(true);
  const [lowPriority, setLowPriority] = useState(true);
  const [mediumPriority, setMediumPriority] = useState(true);
  const [highPriority, setHighPriority] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPriorityKey, setSelectedPriorityKey] = useState(null);

  const [daySettings, setDaySettings] = useState({
    low: 30,
    medium: 15,
    high: 3,
  });

  const navigation = useNavigation();
  const route = useRoute();

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

  const openModal = (priorityKey) => {
    setSelectedPriorityKey(priorityKey);
    setModalVisible(true);
  };

  const handleDaySelect = (day) => {
    setDaySettings((prev) => ({
      ...prev,
      [selectedPriorityKey]: day,
    }));
    setModalVisible(false);
  };

  const renderDayOption = ({ item }) => (
    <TouchableOpacity
      style={styles.dayOption}
      onPress={() => handleDaySelect(item)}
    >
      <Text>{item} gün</Text>
    </TouchableOpacity>
  );

  // Bildirim ayarlarını kaydetmek için:
  const handleApprove = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const body = {
        instantNotifications,
        lowPriority,
        mediumPriority,
        highPriority,
        daySettings,
      };

      const response = await fetch(
        `${API_BASE_URL}/subscription/notification/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      const json = await response.json();
      if (json.status) {
        alert(json.message);
      } else {
        alert(json.message || 'Bildirim ayarları kaydedilemedi.');
      }
    } catch (err) {
      alert('Bağlantı hatası.');
    }
  };

  // Anlık bildirimler değiştiğinde alt seçenekleri de kapat
  const handleInstantNotifications = (value) => {
    setInstantNotifications(value);
    if (!value) {
      setLowPriority(false);
      setMediumPriority(false);
      setHighPriority(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bildirim Ayarları</Text>
      <View style={styles.option}>
        <Text style={styles.label}>Anlık Bildirimler</Text>
        <Switch
          value={instantNotifications}
          onValueChange={handleInstantNotifications}
          trackColor={{ false: '#ccc', true: '#000' }}
          thumbColor={instantNotifications ? '#fff' : '#fff'}
        />
      </View>
      <Text style={styles.subtitle}>Önceliğe Göre Bildirimler</Text>
      <View style={styles.option}>
        <Text style={styles.label}>Düşük Öncelik</Text>
        <TouchableOpacity
          style={{ flexDirection: 'row', marginRight: 20, opacity: instantNotifications ? 1 : 0.5 }}
          onPress={() => instantNotifications && openModal('low')}
          disabled={!instantNotifications}
        >
          <Text style={styles.dayText}>{daySettings.low} gün</Text>
          <Ionicons name="pencil" />
        </TouchableOpacity>
        <Switch
          value={lowPriority}
          onValueChange={setLowPriority}
          trackColor={{ false: '#ccc', true: '#000' }}
          thumbColor={lowPriority ? '#fff' : '#fff'}
          disabled={!instantNotifications}
        />
      </View>
      <View style={styles.option}>
        <Text style={styles.label}>Orta Öncelik</Text>
        <TouchableOpacity
          style={{ flexDirection: 'row', marginRight: 20, opacity: instantNotifications ? 1 : 0.5 }}
          onPress={() => instantNotifications && openModal('medium')}
          disabled={!instantNotifications}
        >
          <Text style={styles.dayText}>{daySettings.medium} gün</Text>
          <Ionicons name="pencil" />
        </TouchableOpacity>
        <Switch
          value={mediumPriority}
          onValueChange={setMediumPriority}
          trackColor={{ false: '#ccc', true: '#000' }}
          thumbColor={mediumPriority ? '#fff' : '#fff'}
          disabled={!instantNotifications}
        />
      </View>
      <View style={styles.option}>
        <Text style={styles.label}>Yüksek Öncelik</Text>
        <TouchableOpacity
          style={{ flexDirection: 'row', marginRight: 20, opacity: instantNotifications ? 1 : 0.5 }}
          onPress={() => instantNotifications && openModal('high')}
          disabled={!instantNotifications}
        >
          <Text style={styles.dayText}>{daySettings.high} gün</Text>
          <Ionicons name="pencil" />
        </TouchableOpacity>
        <Switch
          value={highPriority}
          onValueChange={setHighPriority}
          trackColor={{ false: '#ccc', true: '#000' }}
          thumbColor={highPriority ? '#fff' : '#fff'}
          disabled={!instantNotifications}
        />
      </View>
      <Text style={styles.dayInfoText}>
        Seçilen günde bir bildirim gelir.
      </Text>

      {/* Gün Seçimi Modali */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <FlatList
                  data={Array.from({ length: 365 }, (_, i) => i + 1)}
                  keyExtractor={(item) => item.toString()}
                  renderItem={renderDayOption}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: '#ff4949', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>KAPAT</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Onayla Butonu Ana Ekran Altında */}
      <TouchableOpacity
        style={styles.approveButton}
        onPress={() => {
          handleApprove();
          setModalVisible(false);
          navigation.goBack();
        }}
      >
        <Text style={styles.approveButtonText}>ONAYLA</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    marginHorizontal: 30,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 30,
    marginTop: 30,
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginVertical: 2,
    marginHorizontal: 30,
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  dayText: {
    marginRight: 12,
    color: '#000',
  },
  dayInfoText: {
    marginLeft: 30,
    marginTop: 10,
    color: '#9b9b9b',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '70%',
    alignItems: 'center',
    maxHeight: '60%',
  },
  dayOption: {
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  closeButton: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 6,
    marginTop: 20,
    width: '100%',
  },
  approveButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 30,
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
