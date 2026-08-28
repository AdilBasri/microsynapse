import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

export const SubscriptionContext = createContext();

const initialSubscriptions = [
  { id: "1", name: "Netflix", price: "149.99₺ / ay", nextPayment: "2025-04-30", duration: "1 Ay" },
  { id: "2", name: "Spotify", price: "59.99₺ / ay", nextPayment: "2025-04-04", duration: "1 Ay" },
  { id: "3", name: "Youtube Premium", price: "79.99₺ / ay", nextPayment: "2025-04-07", duration: "1 Ay" },
  { id: "4", name: "Amazon Prime", price: "39.99₺ / ay", nextPayment: "2025-04-21", duration: "1 Ay" },
  { id: "5", name: "HBO Max", price: "229.99₺ / ay", nextPayment: "2025-04-26", duration: "1 Ay" },
];

export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);

  const fetchSubscriptions = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 saniye sonra iptal et

    try {
      const token = await AsyncStorage.getItem("token"); // <-- Eksik olan satır eklendi!
      const response = await fetch(`${API_BASE_URL}/subscriptions/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeout); // ✅ zaman aşımı olmadıysa temizle

      const result = await response.json();
      

      if (result.status) {
        const mapped = result.subscriptions.map((sub) => ({
          id: sub._id,
          name: sub.company_name,
          price: sub.price + " / ay",
          nextPayment: sub.date.split("T")[0],
          duration: "1 Ay",
          category: sub.category || sub.subs_type || "-",
          subs_type: sub.subs_type || "",
        }));
        setSubscriptions(mapped);
      } else {
        console.warn("Abonelikler alınamadı:", result.message);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn("Abonelik verisi alınamadı: İstek zaman aşımına uğradı (5 sn)");
      } else {
        console.error("Abonelik verisi alınırken hata:", error);
      }
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const addSubscription = (subscription) => {
    setSubscriptions(prev => [...prev, subscription]);
  };

  const removeSubscription = (id) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  return (
    <SubscriptionContext.Provider value={{ subscriptions, addSubscription, removeSubscription, fetchSubscriptions }}>
      {children}
    </SubscriptionContext.Provider>
  );
};