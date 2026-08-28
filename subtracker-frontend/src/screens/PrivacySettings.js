import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import privacyPolicy from '../texts/privacyPolicy';
import kvkk from '../texts/kvkk';
import keepData from '../texts/keepData';

export default function PrivacySettings({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); 

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

  let modalTitle = '';
  let modalContent = '';
  if (modalType === "gizlilik") {
    modalTitle = "Gizlilik Politikası";
    modalContent = privacyPolicy;
  } else if (modalType === "kvkk") {
    modalTitle = "KVKK Aydınlatma Metni";
    modalContent = kvkk;
  } else if (modalType === "keepData") {
    modalTitle = "Veri Saklama ve İmha Politikası";
    modalContent = keepData;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gizlilik Ayarları</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => { setModalType("gizlilik"); setModalVisible(true); }}
      >
        <Text style={styles.buttonText}>Gizlilik Politikası</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => { setModalType("kvkk"); setModalVisible(true); }}
      >
        <Text style={styles.buttonText}>KVKK Aydınlatma Metni</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => { setModalType("keepData"); setModalVisible(true); }}
      >
        <Text style={styles.buttonText}>Veri Saklama ve İmha Politikası</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <ScrollView style={{ maxHeight: 350, marginBottom: 16 }}>
              <Text style={styles.modalText}>{modalContent}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>KAPAT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", padding: 24 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 30, marginTop: 20 },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    marginVertical: 10,
    width: "90%",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
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