import React, { useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  Platform,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  RefreshControl,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SubscriptionContext } from "../context/SubscriptionContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '@env';

const screenWidth = Dimensions.get("window").width;

export function SubscriptionList() {
  const { subscriptions, removeSubscription, fetchSubscriptions } = useContext(SubscriptionContext);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedSubscriptions, setSelectedSubscriptions] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState("date");

  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      setIsSelecting(false);
      setSelectedSubscriptions([]);
      fetchSubscriptions();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
  };

  const filteredSubscriptions = subscriptions.filter((subscription) =>
    subscription.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "Tarih Belirsiz";
    const [year, month, day] = dateStr.split("-");
    return `${(day || '').padStart(2, '0')}.${(month || '').padStart(2, '0')}.${year || ''}`;
  };

  const sortedSubscriptions = filteredSubscriptions.sort((a, b) => {
    if (sortBy === "name") return (a.name || '').localeCompare(b.name || '');
    if (sortBy === "date") return new Date(a.nextPayment || '1970-01-01') - new Date(b.nextPayment || '1970-01-01');
    if (sortBy === "price")
      return parseFloat((a.price || '0').replace("₺ / ay", "").replace(",", ".")) -
        parseFloat((b.price || '0').replace("₺ / ay", "").replace(",", "."));
    return 0;
  });

  const toggleSelection = (id) => {
    if (selectedSubscriptions.includes(id)) {
      setSelectedSubscriptions(selectedSubscriptions.filter((subId) => subId !== id));
    } else {
      setSelectedSubscriptions([...selectedSubscriptions, id]);
    }
  };

  const handleDeleteSelected = async () => {
    const token = await AsyncStorage.getItem("token");
    for (const id of selectedSubscriptions) {
      try {
        const response = await fetch(`${API_BASE_URL}/subscription/delete/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.status) removeSubscription(id);
        else console.warn(`Silinemedi: ${id}`, result.message);
      } catch (error) {
        console.error(`Hata oluştu: ${id}`, error);
      }
    }
    setSelectedSubscriptions([]);
    setIsSelecting(false);
  };

  const handleSortOption = (option) => {
    setSortBy(option);
    setShowSortModal(false);
  };

  const toggleSelectionMode = () => {
    if (isSelecting) setSelectedSubscriptions([]);
    setIsSelecting((prev) => !prev);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          {/* Arama ve butonlar */}
          <View style={styles.tabBar}>
            <View style={styles.searchInputWrapper}>
              <TextInput
                style={styles.searchBox}
                placeholder="Abonelik Ara"
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={20} color="gray" style={styles.clearIcon} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.actionsWrapper}>
              <TouchableOpacity style={styles.buttonSort} onPress={() => setShowSortModal(true)}>
                <Text style={styles.buttonSortText}>
                  {sortBy === "name" ? "İSME GÖRE" : sortBy === "date" ? "TARİHE GÖRE" : "FİYATA GÖRE"}
                </Text>
                <Ionicons name="chevron-down" size={20} style={{ marginLeft: 2 }} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconWrapper} onPress={toggleSelectionMode}>
                <Ionicons name="pencil" size={20} color={"white"} style={styles.editIcon} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showSortModal}
            onRequestClose={() => setShowSortModal(false)}
          >
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
              <View style={styles.modalOptionView}>
                {["name", "date", "price"].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={styles.modalOption}
                    onPress={() => handleSortOption(option)}
                  >
                    <Text style={styles.modalOptionText}>
                      {option === "name" ? "İSME GÖRE" : option === "date" ? "TARİHE GÖRE" : "FİYATA GÖRE"}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowSortModal(false)}
                >
                  <Text style={styles.modalCloseText}>KAPAT</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Silme butonu */}
          {isSelecting && selectedSubscriptions.length > 0 && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSelected}>
              <Text style={styles.deleteButtonText}>SEÇİLENLERİ SİL</Text>
            </TouchableOpacity>
          )}

          {/* Liste */}
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 90 }}
            data={sortedSubscriptions}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.subCards}
                onPress={() => {
                  if (isSelecting) toggleSelection(item.id);
                  else navigation.navigate("SubscriptionDetails", {
                    subscription: {
                      ...item,
                      nextPayment: formatDate(item.nextPayment),
                    },
                  });
                }}
              >
                <View style={styles.subCardItems}>
                  {isSelecting && (
                    <Ionicons
                      style={styles.checkIcon}
                      name={selectedSubscriptions.includes(item.id) ? "checkmark-circle" : "ellipse-outline"}
                      size={22}
                      color={selectedSubscriptions.includes(item.id) ? "#4CAF50" : "black"}
                    />
                  )}
                  <View style={styles.item}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.price}>
                      {item.price.replace(' / ay', '')}
                      <Text style={{ color: '#000' }}> / ay</Text>
                    </Text>
                    <Text>Sonraki ödeme: {formatDate(item.nextPayment)}</Text>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={14} />
                </View>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    paddingTop:
      Platform.OS === 'ios'
        ? 56
        : (StatusBar.currentHeight ?? 0) - 99,
  },
  tabBar: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginVertical: 10,
    paddingHorizontal: 6,
  },
  searchInputWrapper: {
    width: screenWidth * 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    flexShrink: 0,
  },
  searchBox: {
    flex: 1,
    paddingVertical: 8,
  },
  clearIcon: {
    marginLeft: 8,
  },
  actionsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
    width: screenWidth * 0.3,
    justifyContent: 'flex-end',
  },
  buttonSort: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonSortText: {
    marginRight: 4,
    minWidth: 75,
    textAlign: 'left',
  },
  iconWrapper: {
    backgroundColor: '#000',
    borderRadius: 20,
  },
  editIcon: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionView: {
    paddingVertical: 10,
    width: '70%',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#ffffff',
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
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#ff4949',
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff4949',
    padding: 14,
    marginVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  subCards: {
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  subCardItems: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 10,
  },
  item: {
    paddingHorizontal: 6,
    paddingVertical: 10,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  price: {
    fontSize: 14,
    color: "#4CAF50",
  },
});

export default SubscriptionList;
