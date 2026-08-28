import React, { useState, useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CaptchaInput from '../context/CaptchaInput';
const zxcvbn = (pwd) => ({ score: !pwd ? 0 : pwd.length < 6 ? 1 : pwd.length < 9 ? 2 : pwd.length < 12 ? 3 : 4 });
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const PasswordReset = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const [captchaState, setCaptchaState] = useState({ captchaText: '', userInput: '' });

  const navigation = useNavigation();

  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirm = () => setShowConfirm(!showConfirm);

  const handleSubmit = async () => {
    setPasswordError('');
    setPasswordConfirmError('');
    setCaptchaError('');

    let hasError = false;

    if (!password.trim()) {
      setPasswordError('Şifre boş olamaz');
      hasError = true;
    }

    if (!passwordConfirm.trim()) {
      setPasswordConfirmError('Şifre boş olamaz');
      hasError = true;
    }

    if (!hasError) {
      if (password !== passwordConfirm) {
        setPasswordConfirmError('Şifreler eşleşmiyor.');
        return;
      }

      if (!captchaState.userInput.trim()) {
        setCaptchaError('Captcha boş bırakılamaz.');
        return;
      }

      const userInput = captchaState.userInput.trim();
      const captchaText = captchaState.captchaText.trim();

      if (captchaText !== userInput) {
        setCaptchaError('Captcha yanlış, büyük küçük harfe dikkat edin.');
        return;
      }

      // --- Şifre değiştirme isteği ---
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/user/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword: password }),
        });
        const json = await response.json();
        if (json.status) {
          Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi.');
          navigation.goBack();
        } else {
          Alert.alert('Hata', json.message || 'Şifre değiştirilemedi.');
        }
      } catch (err) {
        Alert.alert('Hata', 'Bağlantı hatası.');
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

  const passwordStrength = zxcvbn(password).score;

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'red';
      case 1: return 'orange';
      case 2: return 'yellow';
      case 3: return 'lightgreen';
      case 4: return 'green';
      default: return 'gray';
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ backgroundColor: '#fff' }}
          contentContainerStyle={{ padding: 24, paddingBottom: 110, minHeight: '100%' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Yeni şifreni gir</Text>

          {/* Şifre input */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={handleTogglePassword} style={styles.icon}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#666" />
            </TouchableOpacity>
          </View>

          {passwordError ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={14} color="#000" style={{ marginRight: 4 }} />
              <Text style={styles.errorText}>{passwordError}</Text>
            </View>
          ) : null}

          {/* Şifre gücü göstergesi */}
          {password.length > 0 && (
            <>
              <View
                style={[
                  styles.passwordStrengthBar,
                  { backgroundColor: getPasswordStrengthColor() },
                ]}
              />
              <Text
                style={{
                  color: getPasswordStrengthColor(),
                  textAlign: 'center',
                  marginBottom: 10,
                }}
              >
                {
                  ['Çok Zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok Güçlü'][passwordStrength]
                }
              </Text>
            </>
          )}

          {/* Şifreyi onayla input */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Şifreyi Onayla"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirm}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
            />
            <TouchableOpacity onPress={handleToggleConfirm} style={styles.icon}>
              <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={22} color="#666" />
            </TouchableOpacity>
          </View>

          {passwordConfirmError ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={14} color="#000" style={{ marginRight: 4 }} />
              <Text style={styles.errorText}>{passwordConfirmError}</Text>
            </View>
          ) : null}

          {/* Captcha */}
          <CaptchaInput onChange={(state) => setCaptchaState(state)} />

          {captchaError ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={14} color="#000" style={{ marginRight: 4 }} />
              <Text style={styles.errorText}>{captchaError}</Text>
            </View>
          ) : null}

          {/* Buton */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>ŞİFREYİ ONAYLA</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default PasswordReset;

const styles = StyleSheet.create({
  title: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000',
  },
  icon: {
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  passwordStrengthBar: {
    height: 5,
    borderRadius: 5,
    marginVertical: 5,
  },
});
