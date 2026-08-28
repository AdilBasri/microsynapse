import React, { useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SubscriptionContext } from "../context/SubscriptionContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Türkçe takvim ayarları
LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  monthNamesShort: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  dayNames: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
  dayNamesShort: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],
  today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

export default function SubscriptionCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const navigation = useNavigation();
  const { subscriptions, fetchSubscriptions } = useContext(SubscriptionContext);

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
  };

  const allItems = subscriptions.reduce((acc, sub) => {
    if (!acc[sub.nextPayment]) acc[sub.nextPayment] = [];
    acc[sub.nextPayment].push({ 
      id: sub.id, 
      name: sub.name, 
      price: sub.price, 
      duration: sub.duration 
    });
    return acc;
  }, {});

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  useFocusEffect(
    useCallback(() => {
      fetchSubscriptions();
    }, [])
  );

  const markedDates = Object.keys(allItems).reduce((acc, date) => {
    const isSelected = selectedDate === date;
    acc[date] = {
      marked: true,
      dotColor: isSelected ? "#ffffff" : "#000000",
      selected: isSelected,
      selectedColor: isSelected ? "#4CAF50" : undefined,
      selectedTextColor: isSelected ? "#ffffff" : undefined,
    };
    return acc;
  }, {});

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: '#4CAF50',
    };
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.calendarWrapper}>
          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            firstDay={1}
            locale={'tr'}
            theme={{
              backgroundColor: "#ffffff",
              calendarBackground: "#ffffff",
              selectedDayBackgroundColor: "#4CAF50",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#4CAF50",
              dayTextColor: "#000000",
              textDisabledColor: "#C0C0C0",
              dotColor: "#000000",
              selectedDotColor: "#ffffff",
              arrowColor: "#000000",
              monthTextColor: "#000000",
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>
        <View style={styles.calendarBorderBottom} />

        {selectedDate && allItems[selectedDate] && (
          <ScrollView 
            style={styles.scrollArea}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <Text style={styles.selectedDateText}>
              {selectedDate.split("-").reverse().join(".")}
            </Text>

            {allItems[selectedDate].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.form}
                onPress={() =>
                  navigation.navigate("SubscriptionDetails", {
                    subscription: {
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      nextPayment: formatDate(selectedDate),
                      duration: item.duration,
                    },
                  })
                }
              >
                <View style={styles.subCards}>
                  <View style={styles.subCardTextForm}>
                    <Text style={styles.textName}>{item.name}</Text>
                    <Text style={{ color: "#4CAF50", fontSize: 16 }}>
                      {item.price.replace(' / ay', '')}
                      <Text style={{ color: "#000" }}> / ay</Text>
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={14} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop:
      Platform.OS === 'ios'
        ? 56
        : (StatusBar.currentHeight ?? 0) - 99, // StatusBar üzerine +20px boşluk
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  calendarBorderBottom: {
    borderBottomColor: "#cccccc",
    borderBottomWidth: 1,
    marginTop: 10,
    marginHorizontal: 22,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 10,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 20,
    marginTop: 16,
    marginLeft: 4,
  },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderColor: "#cccccc",
  },
  subCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  subCardTextForm: {
    flexDirection: "column",
    gap: 4,
    paddingHorizontal: 10,
  },
  textName: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "bold",
  },
  textPrice: {
    color: "#000000",
    fontSize: 16,
  },
});
