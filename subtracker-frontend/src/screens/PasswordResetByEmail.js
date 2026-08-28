import { useNavigation, useRoute } from '@react-navigation/native';
import { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@env';

const PasswordResetByEmail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params || {};

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleReset = async () => {
    setPasswordError('');
    setPasswordConfirmError('');
    setMessage('');

    if (!password.trim()) {
      setPasswordError('Şifre boş olamaz');
      return;
    }
    if (!passwordConfirm.trim()) {
      setPasswordConfirmError('Şifreyi tekrar girin');
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordConfirmError('Şifreler eşleşmiyor');
      return;
    }
    if (!token) {
      setMessage('Bağlantı geçersiz veya süresi dolmuş.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/reset-password/${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password1: password, password2: passwordConfirm }),
        }
      );
      const json = await response.json();
      if (json.status) {
        Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi.');
        navigation.navigate('Login');
      } else {
        setMessage(json.message || 'Şifre değiştirilemedi.');
      }
    } catch (err) {
      setMessage('Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Yeni Şifre Belirle</Text>
          <Text style={styles.subtitle}>
            Lütfen yeni şifrenizi iki kez girin.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Yeni şifre"
            placeholderTextColor="#999"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />
          {passwordError ? (
            <View style={styles.errorRow}>
              <Ionicons
                name="alert-circle"
                size={14}
                color="#000"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.errorText}>{passwordError}</Text>
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Yeni şifre (tekrar)"
            placeholderTextColor="#999"
            secureTextEntry
            onChangeText={setPasswordConfirm}
            value={passwordConfirm}
          />
          {passwordConfirmError ? (
            <View style={styles.errorRow}>
              <Ionicons
                name="alert-circle"
                size={14}
                color="#000"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.errorText}>{passwordConfirmError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleReset}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Gönderiliyor...' : 'ŞİFREYİ SIFIRLA'}
            </Text>
          </TouchableOpacity>

          {message !== '' && <Text style={styles.message}>{message}</Text>}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default PasswordResetByEmail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    marginTop: 10,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 6,
    fontSize: 16,
    marginBottom: 5,
    color: '#000',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    marginTop: 20,
    textAlign: 'center',
    color: '#333',
    fontSize: 14,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
    marginLeft: 5,
  },
  errorText: {
    color: '#ff7676',
    fontSize: 12,
    marginLeft: 3,
  },
});
