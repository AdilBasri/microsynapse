import React, { useEffect, useState } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '@env';

export default function AccountScreen({ route, setAuthToken }) {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', plan: '' });

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserInfo = async () => {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          return;
        }
        try {
          const response = await fetch(`${API_BASE_URL}/user/info`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await response.json();
          if (result.status) {
            setUserInfo({
              name: result.user.name,
              email: result.user.email,
              plan: result.user.plan || '', // plan bilgisini ekle
            });
          } else {
            console.warn("Kullanıcı bilgisi alınamadı:", result.message);
          }
        } catch (error) {
          console.error("Kullanıcı bilgisi hatası:", error);
        }
      };
      fetchUserInfo();
    }, [navigation])
  );

  useEffect(() => {
    if (route.params?.updatedName) {
      setUserInfo(prev => ({ ...prev, name: route.params.updatedName }));
    }
  }, [route.params]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Uyarı', 'Galeriye erişim izni gerekiyor!', [
        { text: 'Ayarlar', onPress: () => Linking.openSettings() },
        { text: 'Kapat', style: 'cancel' },
      ]);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // ÇIKIŞ
  const handleLogOut = async () => {
    try {
      await AsyncStorage.removeItem("token");
      if (typeof setAuthToken === "function") setAuthToken(null);
    } catch (error) {
      Alert.alert('Hata', "Çıkış sırasında hata oluştu.");
    }
  };

  // HESAP SİLME
  const handleDeleteAccount = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/user/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (result.status) {
        Alert.alert('Bilgi', "Hesabınız başarıyla silindi.");
        await AsyncStorage.removeItem("token");
        if (typeof setAuthToken === "function") setAuthToken(null);
      } else {
        Alert.alert('Hata', result.message || "Hesap silinemedi.");
      }
    } catch (error) {
      console.error("Hesap silme hatası:", error);
      Alert.alert('Hata', "Bağlantı hatası oluştu.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContent}>
          
          {/* Profil */}
          <View style={styles.header}>
            <View style={styles.profilePicForm}>
              <Image
                source={
                  selectedImage
                    ? { uri: selectedImage }
                    : require('../images/default user.jpg')
                }
                style={styles.profilePic}
              />
              <TouchableOpacity
                style={styles.profilePicButton}
                onPress={pickImage}
              >
                <Text style={styles.profilePicButtonText}>Resim Yükle</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfos}>
              <Text style={styles.accountName}>{userInfo.name}</Text>
              <Text style={styles.accountMail}>{userInfo.email}</Text>
            </View>
          </View>

          {/* Premium Butonları */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.greenButton}
              onPress={() => navigation.navigate('Plans')}
            >
              <Ionicons name="diamond-outline" size={20} color={'white'} />
              <Text style={styles.greenButtonText}>PREMİUM'A GEÇ</Text>
            </TouchableOpacity>

            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.halfButton}>
                <Text style={styles.greenButtonText}>ANALİZ/RAPOR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.halfButton}>
                <Text style={styles.greenButtonText}>FATURA ARŞİVİ</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ayarlar */}
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsHeader}>Ayarlar</Text>
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => navigation.navigate('NotificationSettings')}
            >
              <Text style={styles.settingsText}>Bildirimleri Özelleştir</Text>
            </TouchableOpacity>
            {/* GİZLİLİK AYARLARI */}
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => navigation.navigate('PrivacySettings')}
            >
              <Text style={styles.settingsText}>Gizlilik Ayarları</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => navigation.navigate('Support')}
            >
              <Text style={styles.settingsText}>Destek</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => {
                const iosUrl = 'https://apps.apple.com/app/id0000000000';
                const androidUrl =
                  'https://play.google.com/store/apps/details?id=com.example';
                const storeUrl =
                  Platform.OS === 'ios' ? iosUrl : androidUrl;
                Linking.openURL(storeUrl).catch(err => {
                  console.warn("Link açılamadı:", err);
                  Alert.alert('Hata', "Bağlantı açılamıyor.");
                });
              }}
            >
              <Text style={styles.settingsText}>Uygulamaya Puan Ver</Text>
            </TouchableOpacity>
          </View>

          {/* Hesap Ayarları */}
          <View style={styles.accountSettingsContainer}>
            <Text style={styles.accountSettingsText}>Hesap Bilgileri</Text>
            <TouchableOpacity
              style={styles.accountSettingsItem}
              onPress={() => navigation.navigate('ChangeName')}
            >
              <Text style={styles.settingsText}>Ad Soyad Değiştir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.accountSettingsItem}
              onPress={() => navigation.navigate('PasswordReset')}
            >
              <Text style={styles.settingsText}>Şifre Değiştir</Text>
            </TouchableOpacity>
<TouchableOpacity
  style={styles.accountSettingsItem}
  onPress={() => {
    if (userInfo.plan === 'premium') {
      Alert.alert(
        'Aboneliğinizi iptal etmek istediğinize emin misiniz?',
        'Aboneliğinizi iptal ettikten sonra hizmete erişiminiz sona erecek.',
        [
          {
            text: 'Evet',
            style: 'destructive',
            onPress: handleDeleteAccount,
          },
          { text: 'Hayır' },
        ],
        { cancelable: false }
      );
    }
  }}
  disabled={userInfo.plan !== 'premium'}
>
  <Text
    style={[
      styles.settingsText,
      userInfo.plan !== 'premium' && { color: '#888' } // Sadece yazı gri
    ]}
  >
    Aboneliğimi İptal Et
  </Text>
</TouchableOpacity>
            <TouchableOpacity
              style={styles.accountSettingsItem}
              onPress={() => {
                Alert.alert(
                  'Hesabınızı silmek istediğinize emin misiniz?',
                  'Hesabınız ve tüm verileriniz kalıcı olarak silinecek.',
                  [
                    {
                      text: 'Evet',
                      style: 'destructive',
                      onPress: handleDeleteAccount,
                    },
                    { text: 'Hayır' },
                  ],
                  { cancelable: false }
                );
              }}
            >
              <Text style={styles.settingsText}>Hesabı Sil</Text>
            </TouchableOpacity>
          </View>

          {/* Çıkış */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Çıkış yapmak istediğinize emin misiniz?',
                'Çıkış yaparsanız yeniden giriş yapmanız gerekecek.',
                [
                  {
                    text: 'Evet',
                    style: 'destructive',
                    onPress: handleLogOut,
                  },
                  { text: 'Hayır', style: 'cancel' },
                ],
                { cancelable: false }
              );
            }}
          >
            <Text style={styles.logoutButtonText}>ÇIKIŞ YAP</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
    paddingTop:
      Platform.OS === 'ios'
        ? 56
        : (StatusBar.currentHeight ?? 0) - 99,
  },
  innerContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    padding: 10,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profilePicForm: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  profilePicButton: {
    marginTop: 10,
    borderRadius: 6,
    backgroundColor: '#ebebeb',
    padding: 6,
  },
  profilePicButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: 'bold',
  },
  accountName: {
    marginLeft: 15,
    fontSize: 24,
    fontWeight: '700',
  },
  accountMail: {
    fontSize: 20,
    marginLeft: 15,
    marginTop: 10,
  },
  profilePic: {
    width: 65,
    height: 65,
    borderRadius: 50,
    backgroundColor: '#ebebeb',
  },
  profileInfos: {
    flexDirection: 'column',
    marginLeft: 10,
  },
  actionButtonsContainer: {
    marginBottom: 10,
  },
  greenButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    flexDirection: 'row',
    gap: 10,
  },
  greenButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    gap: 10,
  },
  halfButton: {
    flex: 1,
    backgroundColor: '#505050',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  settingsContainer: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 10,
  },
  settingsHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  settingsItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  settingsText: {
    fontSize: 16,
  },
  accountSettingsContainer: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 20,
  },
  accountSettingsText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  accountSettingsItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  logoutButton: {
    padding: 15,
    backgroundColor: '#000000',
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});