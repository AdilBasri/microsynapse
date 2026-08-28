import React, { useState, useLayoutEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Image,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import zxcvbn from "zxcvbn";
import { API_BASE_URL } from '@env';
import privacyPolicy from '../texts/privacyPolicy';
import kvkk from '../texts/kvkk';

const screenHeight = Dimensions.get("window").height;

export default function Signup({ navigation, setAuthToken }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordAgain, setShowPasswordAgain] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordAgainError, setPasswordAgainError] = useState("");
  const [policyChecked, setPolicyChecked] = useState(false);
  const [analysisChecked, setAnalysisChecked] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // "gizlilik" veya "kvkk"

  const passwordStrength = zxcvbn(password).score;

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return "red";
      case 1: return "orange";
      case 2: return "yellow";
      case 3: return "lightgreen";
      case 4: return "green";
      default: return "gray";
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

  const handleSignup = async () => {
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setPasswordAgainError("");

    let hasError = false;

    if (!name) {
      setNameError("Adınızı ve soyadınızı girin.");
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("E-posta adresinizi girin.");
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError("Geçerli bir e-posta adresi girin.");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Şifrenizi girin.");
      hasError = true;
    }

    if (!passwordAgain) {
      setPasswordAgainError("Şifrenizi tekrar girin.");
      hasError = true;
    } else if (password !== passwordAgain) {
      setPasswordAgainError("Şifreler eşleşmiyor.");
      hasError = true;
    }

    if (!policyChecked) {
      Alert.alert(
        "Hata",
        "Gizlilik Politikası’nı ve KVKK Aydınlatma Metni’ni kabul etmelisiniz.",
        [{ text: "Tamam" }]
      );
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      const userData = {
        name,
        email,
        password1: password,
        password2: passwordAgain,
      };

      const response = await fetch(`${API_BASE_URL}/user/create`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.status) {
        Alert.alert("Başarılı", "Kayıt başarılı!", [
          {
            text: "Tamam",
            onPress: async () => {
              await AsyncStorage.setItem("token", result.token);
              if (typeof setAuthToken === "function") setAuthToken(result.token);
            }
          }
        ]);
      } else {
        Alert.alert("Hata", result.message || "Kayıt işlemi başarısız oldu", [{ text: "Tamam" }]);
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
      Alert.alert("Hata", "Bağlantı hatası oluştu", [{ text: "Tamam" }]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={{ flex: 1, backgroundColor: "#ffffff" }}
          contentContainerStyle={[styles.container, { minHeight: screenHeight * 1.05 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.ImageWrapper}>
            <Image
              source={require("../images/subtracker-logo2.jpeg")}
              style={styles.logoImage}
            />
            <Text style={styles.logoImageText}>subtracker</Text>
          </View>

          <Text style={styles.signupText}>Kaydol</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.inputName}
              placeholder="Adınız ve soyadınız"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
            />
            {nameError ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} style={{ marginRight: 4 }} />
                <Text style={styles.errorText}>{nameError}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.inputEmail}
              placeholder="E-posta adresiniz"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            {emailError ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} style={{ marginRight: 4 }} />
                <Text style={styles.errorText}>{emailError}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Şifre</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.inputPasswordAgain, { color: '#000' }]}
                placeholder=" Şifreniz"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.iconContainer}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#333"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} style={{ marginRight: 4 }} />
                <Text style={styles.errorText}>{passwordError}</Text>
              </View>
            ) : null}

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
                    textAlign: "center",
                    marginBottom: 10,
                  }}
                >
                  {
                    ["Çok Zayıf", "Zayıf", "Orta", "Güçlü", "Çok Güçlü"][
                      passwordStrength
                    ]
                  }
                </Text>
              </>
            )}

            <Text style={styles.label}>Şifre (Tekrar)</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.inputPasswordAgain, { color: '#000' }]}
                placeholder=" Şifreniz (Tekrar)"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPasswordAgain}
                value={passwordAgain}
                onChangeText={setPasswordAgain}
              />
              <TouchableOpacity
                onPress={() => setShowPasswordAgain(!showPasswordAgain)}
                style={styles.iconContainer}
              >
                <Ionicons
                  name={showPasswordAgain ? "eye-off" : "eye"}
                  size={20}
                  color="#333"
                />
              </TouchableOpacity>
            </View>
            {passwordAgainError ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} style={{ marginRight: 4 }} />
                <Text style={styles.errorText}>{passwordAgainError}</Text>
              </View>
            ) : null}

            {/* KVKK ve Gizlilik kutucukları */}
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setPolicyChecked(!policyChecked)}
              >
                {policyChecked ? (
                  <Ionicons name="checkbox" size={20} color="#4CAF50" />
                ) : (
                  <Ionicons name="square-outline" size={20} color="#aaa" />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                <Text
                  style={styles.linkText}
                  onPress={() => { setModalType("gizlilik"); setModalVisible(true); }}
                >
                  Gizlilik Politikası
                </Text>
                <Text>’nı ve </Text>
                <Text
                  style={styles.linkText}
                  onPress={() => { setModalType("kvkk"); setModalVisible(true); }}
                >
                  KVKK Aydınlatma Metni’ni
                </Text>
                <Text> okudum, kabul ediyorum.</Text>
              </Text>
            </View>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAnalysisChecked(!analysisChecked)}
              >
                {analysisChecked ? (
                  <Ionicons name="checkbox" size={20} color="#4CAF50" />
                ) : (
                  <Ionicons name="square-outline" size={20} color="#aaa" />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                Verilerimin analiz amaçlı kullanılmasına izin veriyorum.
              </Text>
            </View>

            <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
              <Text style={styles.signupButtonText}>KAYDOL</Text>
            </TouchableOpacity>
          </View>

          {/* Modal */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {modalType === "gizlilik"
                    ? "Gizlilik Politikası"
                    : "KVKK Aydınlatma Metni"}
                </Text>
                <ScrollView style={{ maxHeight: 350, marginBottom: 16 }}>
                  <Text style={styles.modalText}>
                    {modalType === "gizlilik" ? privacyPolicy : kvkk}
                  </Text>
                </ScrollView>
                <View style={{ height: 24 }} />
                <TouchableOpacity
                  style={styles.modalApproveButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalApproveButtonText}>Okudum, Onaylıyorum</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseButtonText}>KAPAT</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 130 : 30,
  },
  ImageWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  logoImage: {
    width: 65,
    height: 65,
    borderRadius: 50,
    resizeMode: "contain",
  },
  logoImageText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: -5,
  },
  signupText: {
    fontSize: 26,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
    fontWeight: "600",
  },
  form: {
    width: "85%",
    borderRadius: 15,
    backgroundColor: "#ffffff",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
    marginTop: 10,
  },
  inputName: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 14,
    fontSize: 16,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#b7b7b7",
  },
  inputEmail: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 14,
    fontSize: 16,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#b7b7b7",
  },
  inputPassword: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputPasswordAgain: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#b7b7b7",
    marginBottom: 5,
  },
  iconContainer: {
    padding: 10,
  },
  passwordStrengthBar: {
    height: 5,
    borderRadius: 5,
    marginVertical: 5,
  },
  signupButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'flex-start',
    marginBottom: 10,
    marginLeft: 5,
  },
  errorText: {
    color: "#ff7676",
    fontSize: 12,
    marginLeft: 3,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 2,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxText: {
    fontSize: 13,
    color: "#333",
    flex: 1,
    flexWrap: "wrap",
  },
  linkText: {
    textDecorationLine: "underline",
    color: "#007AFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
    textAlign: "left",
  },
  modalApproveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: "center",
    marginBottom: 10,
  },
  modalApproveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalCloseButton: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "red",
    fontSize: 15,
    fontWeight: "bold",
  },
});