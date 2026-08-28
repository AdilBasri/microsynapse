import React, { useState, useLayoutEffect } from 'react'; // useState ve useLayoutEffect buradan
import { useNavigation } from '@react-navigation/native'; // useNavigation doğru yerden
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView, Platform, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const ChangeName = ({ navigation }) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

const handleNameChange = async (newName) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/user/update-name`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName }),
    });

      const result = await response.json();

      if (result.status) {
        alert("Ad başarıyla güncellendi!");
        // navigation.navigate("Account", { updatedName: newName }); // Güncellenen adı gönder
        navigation.goBack();
      } else {
        alert(result.message || "Ad güncellenemedi.");
      }
    } catch (error) {
      console.error("Ad güncelleme hatası:", error);
      alert("Bağlantı hatası oluştu.");
    }
  };

  const handleSave = () => {
    setNameError("");

    let hasError = false;

    if (!name.trim()) {
      setNameError("Ad soyad boş olamaz");
      hasError = true;
    }

    if (!hasError) {
      handleNameChange(name); // Adı güncelleme fonksiyonunu çağır

      if (navigation.canGoBack()) {
        navigation.goBack(); // Bir önceki ekrana dön
      } else {
        console.warn("Geri gidilecek bir ekran yok."); // Hata yerine bir uyarı göster
        navigation.navigate("Account"); // Eğer geri gidilecek ekran yoksa Account ekranına yönlendir
      }
    } 
  };

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: '#fff' }}>
          <Text style={styles.title}>Ad Soyad Değiştir</Text>
          <TextInput
            style={styles.input}
            placeholder="Adınız ve soyadınız"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>KAYDET</Text>
          </TouchableOpacity>
          {nameError ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color="#000" style={{ marginRight: 4 }} />
          <Text style={styles.errorText}>{nameError}</Text>
        </View>
      ) : null}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ChangeName;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    // paddingTop: Platform.OS === 'ios' ? 56 : 56,
  },
  title: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 15,
    fontSize: 16,
    // marginBottom: 15,
    color: '#000',
  },
  saveButton: {
    padding: 15,
    backgroundColor: '#000000',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
  },
  cancelButtonText: {
    color: '#000',
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
});
