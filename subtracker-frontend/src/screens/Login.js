import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const screenHeight = Dimensions.get("window").height;

export default function Login({ navigation, setAuthToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    let hasError = false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('E-posta adresinizi girin.');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError('Geçerli bir e-posta adresi girin.');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Şifrenizi girin.');
      hasError = true;
    }
    if (hasError) return;

    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (result.status) {
        await AsyncStorage.setItem('token', result.token);
        setAuthToken(result.token);
      } else {
        Alert.alert('Giriş Başarısız', result.message || 'E-posta ya da şifre hatalı.');
      }
    } catch (err) {
      console.error('Giriş hatası:', err);
      Alert.alert('Bağlantı Hatası', 'Sunucuya bağlanırken bir hata oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={[styles.container, { minHeight: screenHeight * 0.5 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <View style={styles.ImageWrapper}>
              <Image
                source={require('../images/subtracker-logo2.jpeg')}
                style={styles.logoImage}
              />
              <Text style={styles.logoImageText}>subtracker</Text>
            </View>

            <Text style={styles.loginText}>Oturum Aç</Text>
            <View style={styles.form}>
              <Text style={styles.label}>E-posta</Text>
              <TextInput
                style={styles.inputEmail}
                placeholder="E-posta adresiniz"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={14} color="#000" style={{ marginRight: 4 }} />
                  <Text style={styles.errorText}>{emailError}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Şifre</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.inputPassword, { color: '#000' }]}
                  placeholder="Şifreniz"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(v => !v)}
                  style={styles.iconContainer}
                >
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#333" />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={14} color="#000" style={{ marginRight: 4 }} />
                  <Text style={styles.errorText}>{passwordError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>Şifremi unuttum</Text>
                <View style={styles.underlineFix} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>OTURUM AÇ</Text>
              </TouchableOpacity>

              <Text style={styles.signupText}>Hesabınız yok mu?</Text>
              <TouchableOpacity
                style={styles.signupButton}
                onPress={() => navigation.navigate('Signup')}
              >
                <Text style={styles.signupButtonText}>KAYDOL</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop:
      Platform.OS === 'ios'
        ? 56
        : (StatusBar.currentHeight ?? 0) + 0,
    flexGrow: 1,
    paddingBottom: 55,
  },
  ImageWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  logoImage: {
    width: 65,
    height: 65,
    borderRadius: 50,
    resizeMode: 'contain',
  },
  logoImageText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: -5,
  },
  loginText: {
    fontSize: 26,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 20,
  },
  form: {
    width: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  inputEmail: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#b7b7b7',
    marginBottom: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#b7b7b7',
    marginBottom: 5,
  },
  inputPassword: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  iconContainer: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  underlineFix: {
    height: 1.5,
    backgroundColor: '#000',
    marginTop: -1.5,
  },
  forgotPasswordText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#000',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 30,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
    color: '#333',
  },
  signupButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 15,
    elevation: 5,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    marginLeft: 5,
  },
  errorText: {
    color: '#ff7676',
    fontSize: 12,
    marginLeft: 3,
  },
});