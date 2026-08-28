import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect } from 'react';
import React, { useState } from 'react';
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

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

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

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePasswordReset = async () => {
    setEmailError('');
    setMessage('');
    setLoading(true);

    let hasError = false;

    if (!email.trim()) {
      setEmailError('E-posta adresiniz boş olamaz');
      hasError = true;
    } else if (!isValidEmail(email.trim())) {
      setEmailError('Lütfen geçerli bir e-posta adresi girin.');
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await response.json();
      setMessage(
        json.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.'
      );
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
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            Kayıtlı e-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="E-posta adresiniz"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
            value={email}
          />

          {emailError ? (
            <View style={styles.errorRow}>
              <Ionicons
                name="alert-circle"
                size={14}
                color="#000"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.errorText}>{emailError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handlePasswordReset}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Gönderiliyor...' : 'ŞİFRE SIFIRLAMA LİNKİ GÖNDER'}
            </Text>
          </TouchableOpacity>

          {message !== '' && <Text style={styles.message}>{message}</Text>}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;

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
