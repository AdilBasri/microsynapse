import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Button,
} from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';

export default function Payment({ navigation, route }) {
  const [iframeToken, setIframeToken] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 1) Token + merchant_oid al
  const initiatePayment = async () => {
    const token = await AsyncStorage.getItem("token");
    const address = "Atatürk Cad. No:5, Ankara"; // örnek adres
    const phone = "05001234567"; // örnek telefon
    try {
      const res = await fetch(`${API_BASE_URL}/membership/paytr-initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_address: address, user_phone: phone }),
      });
      const json = await res.json();
      if (!json.status) throw new Error(json.message);
      setIframeToken(json.iframe_token);
      setModalVisible(true);
    } catch (err) {
      Alert.alert("Ödeme başlatılamadı", err.message);
      navigation.goBack();
    }
  };

  useEffect(() => {
    initiatePayment();
  }, []);

  // 2) WebView URL değişimini yakala
  const onNavStateChange = navState => {
    const url = navState.url;
    if (url.includes("/membership/paytr-success")) {
      setModalVisible(false);
      Alert.alert("Başarılı", "Ödemeniz tamamlandı!");
      if (route.params?.onSuccess) route.params.onSuccess();
      navigation.goBack();
    }
    if (url.includes("/membership/paytr-fail")) {
      setModalVisible(false);
      Alert.alert("Hata", "Ödeme başarısız oldu. Tekrar deneyin.");
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {!modalVisible && (
        <Button title="Ödemenizi Başlat" onPress={initiatePayment} />
      )}
      <Modal visible={modalVisible} animationType="slide">
        {iframeToken ? (
          <WebView
            source={{
              uri: `https://www.paytr.com/odeme/guvenli/${iframeToken}`,
            }}
            onNavigationStateChange={onNavStateChange}
            startInLoadingState
            renderLoading={() => (
              <ActivityIndicator style={styles.loader} size="large" />
            )}
          />
        ) : (
          <ActivityIndicator style={styles.loader} size="large" />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});