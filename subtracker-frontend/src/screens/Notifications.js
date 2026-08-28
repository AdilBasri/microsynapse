// src/screens/Notifications.js
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, Alert, Platform, StatusBar } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';

export default function NotificationsScreen() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();

  console.log("Constants:", Constants);

  useEffect(() => {
    console.log("useEffect çalıştı, Constants.isDevice:", Constants.isDevice);

    registerForPushNotificationsAsync().then(async token => {
      console.log("registerForPushNotificationsAsync dönen token:", token);
      if (token) {
        setExpoPushToken(token);
        // --- PUSH TOKEN'I BACKEND'E GÖNDER ---
        const userToken = await AsyncStorage.getItem("token");
        console.log("AsyncStorage'dan alınan kullanıcı tokenı:", userToken);
        if (userToken) {
          fetch(`${API_BASE_URL}/user/push-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ expoPushToken: token }),
          })
            .then(res => res.json())
            .then(json => {
              if (!json.status) {
                console.warn("Push token kaydedilemedi:", json.message);
              } else {
                console.log("Push token başarıyla kaydedildi.");
              }
            })
            .catch(err => {
              console.error("Push token gönderilemedi:", err);
            });
        } else {
          console.warn("Kullanıcı tokenı bulunamadı, push token backend'e gönderilemedi.");
        }
        // --- SONU ---
      } else {
        console.warn("registerForPushNotificationsAsync token null döndü.");
      }
    });

    // Bildirim geldiğinde alert göster
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Bildirim alındı:", notification);
      Alert.alert("Yeni Bildirim", notification.request.content.title);
    });

    // Bildirime tıklanınca logla
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Bildirim tıklandı:", response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
    console.log("registerForPushNotificationsAsync başladı");
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      console.log("Mevcut izin durumu:", existingStatus);
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log("İzin istendi, yeni durum:", finalStatus);
      }
      if (finalStatus !== "granted") {
        Alert.alert("İzin reddedildi", "Push bildirim izinleri gerekli.");
        console.warn("Push bildirim izni verilmedi.");
        return null;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo Push Token:", token);
    } else {
      Alert.alert("Uyarı", "Push bildirimleri gerçek cihazda test edin.");
      console.warn("Constants.isDevice false, gerçek cihazda değilsin.");
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
      console.log("Android notification channel ayarlandı.");
    }

    return token;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Bildirimler</Text>
      <Text>Token: {expoPushToken}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop:
      Platform.OS === "ios" ? 56 : (StatusBar.currentHeight ?? 0) + 0,
    alignItems: "center",
  },
  titleText: {
    fontSize: 24,
    marginVertical: 20,
    fontWeight: "600",
  },
});