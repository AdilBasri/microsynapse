import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, Modal } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SubscriptionContext } from '../context/SubscriptionContext';
import { Ionicons } from '@expo/vector-icons';
import { useLayoutEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

export default function AddSubManually({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [duration, setDuration] = useState(1);
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [category, setCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const categoryOptions = [
    "Maaş Ödemesi",
    "Elektrik/Su/Doğalgaz",
    "Domain&Hosting",
    "Kargo&Lojistik Sözleşmesi",
    "Ofis/Kira",
    "İnternet&GSM",
  ];

  const { addSubscription } = useContext(SubscriptionContext);

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

  const handleAddSubscription = async () => {
    setNameError("");
    setPriceError("");
    setCategoryError("");

    let hasError = false;
    const formattedDate = date.toISOString().split("T")[0];

    if (!name) {
      setNameError("Abonelik ismi boş olamaz");
      hasError = true;
    }

    if (!price) {
      setPriceError("Tutar boş olamaz");
      hasError = true;
    }

    if (!category) {
      setCategoryError("Lütfen bir kategori seçiniz");
      hasError = true;
    }

    if (hasError) return;

    try {
      const token = await AsyncStorage.getItem("token");

      const newSubscription = {
        company_name: name,
        price: price + "₺",
        date: formattedDate,
        subs_date: `${duration} Ay`,
        subs_type: category, // <-- Backend ile uyumlu!
      };

      const response = await fetch(
        `${API_BASE_URL}/subscription/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newSubscription),
        }
      );

      const result = await response.json();

      if (result.status) {
        alert("Abonelik başarıyla eklendi!");
        navigation.goBack();
      } else {
        alert("Eklenemedi: " + (result.message || "Hata oluştu"));
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
      alert("Sunucuya bağlanırken hata oluştu.");
    }
  };

  const handleConfirmDate = (selecteDate) => {
    setDate(selecteDate);
    setShowPicker(false);
  }

  const durationOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Elle Abonelik Ekle</Text>

          <Text style={styles.label}>Abonelik İsmi</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Netflix"
          />
          {nameError ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={14} color="#000" style={{ marginRight: 4 }} />
              <Text style={styles.errorText}>{nameError}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Tutar (₺)</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="49.99₺"
            keyboardType="numeric"
          />
          {priceError ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={14} color="#000" style={{ marginRight: 4 }} />
              <Text style={styles.errorText}>{priceError}</Text>
            </View>
          ) : null}

          <Text style={styles.labelDate}>Tarih</Text>
          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
            <Text>{date.toLocaleDateString('tr-TR')}</Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={showPicker}
            mode="date"
            date={date}
            onConfirm={handleConfirmDate}
            onCancel={() => setShowPicker(false)}
            locale="tr-TR"
            textColor="#000"
            confirmTextIOS="Onayla"
            cancelTextIOS="İptal Et"
          />

          <Text style={styles.label}>Abonelik Süresi</Text>
          <TouchableOpacity onPress={() => setShowDurationPicker(true)} style={styles.dateButton}>
            <Text>{duration} Ay</Text>
          </TouchableOpacity>

          <Modal visible={showDurationPicker} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setShowDurationPicker(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    {durationOptions.map((month) => (
                      <TouchableOpacity
                        key={month}
                        style={styles.modalOption}
                        onPress={() => {
                          setDuration(month);
                          setShowDurationPicker(false);
                        }}
                      >
                        <Text style={styles.modalOptionText}>{month} Ay</Text>
                      </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowDurationPicker(false)}
                    >
                      <Text style={styles.closeButtonText}>KAPAT</Text>
                    </TouchableOpacity>

                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <Text style={styles.label}>Abonelik Kategorisi</Text>
          <TouchableOpacity onPress={() => setShowCategoryPicker(true)} style={styles.dateButton}>
            <Text>{category || "Kategori Seçiniz"}</Text>
          </TouchableOpacity>

          {categoryError ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={14} color="#000" style={{ marginRight: 4 }} />
              <Text style={styles.errorText}>{categoryError}</Text>
            </View>
          ) : null}

          <Modal visible={showCategoryPicker} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setShowCategoryPicker(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    {categoryOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.modalOption}
                        onPress={() => {
                          setCategory(option);
                          setShowCategoryPicker(false);
                        }}
                      >
                        <Text style={styles.modalOptionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowCategoryPicker(false)}
                    >
                      <Text style={styles.closeButtonText}>KAPAT</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <TouchableOpacity style={styles.addButton} onPress={handleAddSubscription}>
            <Text style={styles.addButtonText}>EKLE</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    alignSelf: 'center',
    color: '#000',
    marginBottom: 20,
  },
  label: {
    marginTop: 20,
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  labelDate: {
    marginTop: 20,
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#b7b7b7',
    borderRadius: 6,
    padding: 14,
    marginTop: 5,
  },
  dateButton: {
    padding: 15,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginTop: 5,
    alignItems: 'center',
  },
  addButton: {
    marginTop: 30,
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
    marginTop: 5,
    marginLeft: 5,
  },
  errorText: {
    color: '#ff7676',
    fontSize: 12,
    marginLeft: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: 250,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalOption: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 18,
    color: 'black',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#ff4949',
    fontSize: 18,
    fontWeight: 'bold',
  },
});