// src/screens/SubscriptionDetails.js
import React, { useState, useContext, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { SubscriptionContext } from '../context/SubscriptionContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_BASE_URL } from '@env';

export function SubscriptionDetails({ route }) {
  const { subscription } = route.params;
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { removeSubscription } = useContext(SubscriptionContext);
  const navigation = useNavigation();

  const handlePriorityChange = (priority) => {
    setSelectedPriority(priority);
    setModalVisible(false);
  };

const handleDelete = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/subscription/delete/${subscription.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (result.status) {
      removeSubscription(subscription.id); // local context'ten de sil
      navigation.goBack();
    } else {
      alert("Silme başarısız: " + (result.message || "Bilinmeyen hata"));
    }
  } catch (error) {
    console.error("Silme hatası:", error);
    alert("Sunucuya bağlanırken hata oluştu.");
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
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={styles.detailsContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.detailsTitle}>Abonelik Bilgileri</Text>
      <View style={styles.detailsForm}>
        <View style={styles.detailsFormItem}>
          <Text style={styles.detailsText}>• Abonelik: {subscription.name}</Text>
        </View>
        <View style={styles.detailsFormItem}>
          <Text style={styles.detailsText}>• Fiyat: {subscription.price}</Text>
        </View>
        <View style={styles.detailsFormItem}>
          <Text style={styles.detailsText}>• Sonraki Ödeme Tarihi: {subscription.nextPayment}</Text>
        </View>
        {subscription.duration && (
          <View style={styles.detailsFormItem}>
            <Text style={styles.detailsText}>• Abonelik Süresi: {subscription.duration}</Text>
          </View>
        )}

          <View style={styles.detailsFormItem}>
            <Text style={styles.detailsText}>• Abonelik Kategorisi: {subscription.category || subscription.subs_type || "-"} </Text>
          </View>
      </View>

      <View style={styles.optionsForm}>
        <View style={styles.priorityForm}>
          <Text style={styles.priorityTitle}>Öncelik Seviyesi</Text>
          <TouchableOpacity style={styles.prioritySelectButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.prioritySelectText}>{selectedPriority ? selectedPriority : 'Seç'}</Text>
            <Ionicons name="chevron-down" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {['DÜŞÜK', 'ORTA', 'YÜKSEK'].map((label, index) => (
                <TouchableOpacity key={index} style={styles.modalOptionPriority} onPress={() => handlePriorityChange(label)}>
                  <Text style={styles.modalOptionPriorityText}>{label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>KAPAT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.buttonForm}>
        <TouchableOpacity style={styles.buttonArchive}>
          <Text style={styles.buttonArchiveText}>ARŞİVLE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonDelete} onPress={handleDelete}>
          <Text style={styles.buttonDeleteText}>İPTAL ET</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonCancelForm}>
        <TouchableOpacity style={styles.buttonCancel}>
          <Text style={styles.buttonCancelText}>ABONELİĞİ İPTAL ET</Text>
        </TouchableOpacity>
        <View style={styles.buttonCancelInfoIconContainer}>
          <Ionicons name="information-circle-outline" size={16} color="gray" />
          <Text style={styles.buttonCancelInfoText}>
            Aboneliği iptal etme sayfasına yönlendirir.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  detailsContainer: { 
    padding: 20, 
    backgroundColor: "#fff", 
    margin: 10,
    borderRadius: 8,
    // paddingTop: Platform.OS === 'ios' ? 56 : 56,
  },
  detailsTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10 ,
  },
  detailsForm: {
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#ffffff',
    marginTop: 10,
  },
  detailsText: {
    fontSize: 18,
    marginVertical: 5,
    marginLeft: 10,
  },
  optionsForm: {
    marginTop: 15,
  },
    priorityForm: { 
      marginBottom: 20 
    },
    priorityTitle: { 
      fontSize: 18, 
      fontWeight: 'bold', 
      marginBottom: 10 
    },
    prioritySelectButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: 'gray',
    },
    prioritySelectText: { 
      fontSize: 16, 
      color: 'black', 
      fontWeight: '600',
    },
    modalOverlay: { 
      flex: 1, 
      backgroundColor: 'rgba(0,0,0,0.3)', 
      justifyContent: 'center', 
      alignItems: 'center', 
    },
    modalContainer: { 
      backgroundColor: 'white', 
      padding: 20, 
      borderRadius: 10, 
      width: '80%', 
      alignItems: 'center' ,
    },
    modalOptionView: {
      paddingVertical: 10, 
      width: '70%',
      alignItems: 'center', 
      borderRadius: 6,
      color: '#000000',
      backgroundColor: '#ffffff',
      fontSize: 14,
    },
    modalOption: {
      paddingVertical: 10, 
      marginTop: 10, 
      width: '40%',
      alignItems: 'center', 
      borderRadius: 6,
      backgroundColor: '#000000',
    },
    modalOptionText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    modalOptionPriority: { 
      paddingVertical: 10, 
      paddingHorizontal: 10,
      marginTop: 10, 
      width: '40%', 
      alignItems: 'center', 
      borderColor: '#000',
      borderRadius: 6,
      color: '#ffffff',
      backgroundColor: '#000000',
      fontSize: 14,
      fontWeight: '600',
    },
    modalOptionPriorityText: { 
      fontSize: 16, 
      color: '#ffffff',
      fontWeight: '600',
    },
    modalCloseButton: { 
      marginTop: 20, 
      padding: 10, 
      // backgroundColor: '#ff4949', 
      borderRadius: 6, 
      width: '100%' 
    },
    modalCloseText: { 
      color: '#ff4949', 
      fontSize: 18, 
      fontWeight: 'bold', 
      textAlign: 'center' 
    },
    buttonForm: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginTop: 20 
    },
    buttonArchive: { 
      backgroundColor: 'gray', 
      padding: 15, 
      borderRadius: 5, 
      flex: 1, 
      marginRight: 10, 
      alignItems: 'center' 
    },
    buttonArchiveText: { 
      color: 'white', 
      fontWeight: 'bold' 
    },
    buttonDelete: { 
      backgroundColor: '#ff4949', 
      padding: 15, 
      borderRadius: 5, 
      flex: 1, 
      alignItems: 'center' 
    },
    buttonDeleteText: { 
      color: 'white', 
      fontWeight: 'bold' 
    },
    buttonCancelForm: { 
      marginTop: 20, 
      alignItems: 'center' 
    },
    buttonCancel: { 
      backgroundColor: 'black', 
      padding: 15, 
      borderRadius: 5, 
      width: '100%', 
      alignItems: 'center' 
    },
    buttonCancelText: { 
      color: 'white', 
      fontWeight: 'bold' 
    },
    buttonCancelInfoIconContainer: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginTop: 8, 
    },
    buttonCancelInfoText: { 
      marginLeft: 5, 
      color: 'gray' 
    },
  
});

