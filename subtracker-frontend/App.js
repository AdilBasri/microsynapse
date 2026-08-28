import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Keyboard, Platform, Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
// import * as Google from 'expo-auth-session/providers/google';
// import { makeRedirectUri } from 'expo-auth-session';

// Ekranlar
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import ForgotPassword from './src/screens/ForgotPassword';
import PasswordReset from './src/screens/PasswordReset';
import ChangeName from './src/screens/ChangeName';
import Account from './src/screens/Account';
import SubscriptionList from './src/screens/SubscriptionList';
import SubscriptionCalendar from './src/screens/SubscriptionCalendar';
import NotificationsScreen from './src/screens/Notifications';
import AddSubManually from './src/screens/AddSubManually';
import Plans from './src/screens/Plans';
import NotificationSettings from './src/screens/NotificationSettings';
import Support from './src/screens/Support';
import OnboardingSwipper from './src/screens/OnboardingSwipper';
import { SubscriptionDetails } from './src/screens/SubscriptionDetails';
import Payment from './src/screens/Payment';
import PrivacySettings from './src/screens/PrivacySettings';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { API_BASE_URL } from '@env';

// --- Auth Stack ---
const AuthStack = createNativeStackNavigator();
function AuthStackScreen({ setAuthToken }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">{props => <Login {...props} setAuthToken={setAuthToken} />}</AuthStack.Screen>
      <AuthStack.Screen name="Signup">{props => <Signup {...props} setAuthToken={setAuthToken} />}</AuthStack.Screen>
      <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
      <AuthStack.Screen name="PasswordReset" component={PasswordReset} />
    </AuthStack.Navigator>
  );
}

// --- App Stack ---
const AppStack = createNativeStackNavigator();
function AppStackScreen({ setAuthToken }) {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="MainTabs">
        {props => <TabNavigator {...props} setAuthToken={setAuthToken} />}
      </AppStack.Screen>
      <AppStack.Screen name="SubscriptionList" component={SubscriptionList} />
      <AppStack.Screen name="SubscriptionCalendar" component={SubscriptionCalendar} />
      <AppStack.Screen name="AddSubManually" component={AddSubManually} />
      <AppStack.Screen name="Plans" component={Plans} />
      <AppStack.Screen name="NotificationSettings" component={NotificationSettings} />
      <AppStack.Screen name="Support" component={Support} />
      <AppStack.Screen name="ChangeName" component={ChangeName} />
      <AppStack.Screen name="Account">{props => <Account {...props} setAuthToken={setAuthToken} />}</AppStack.Screen>
      <AppStack.Screen name="SubscriptionDetails" component={SubscriptionDetails} />
      <AppStack.Screen name="Payment" component={Payment} />
      <AppStack.Screen name="PasswordReset" component={PasswordReset} />
      <AppStack.Screen name="PrivacySettings" component={PrivacySettings} />
    </AppStack.Navigator>
  );
}

// --- Tab Navigator ---
const Tab = createBottomTabNavigator();
function DummyScreen() { return null; }

function TabNavigator({ navigation, setAuthToken }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [authToken, setAuthTokenState] = useState(null);

  // 1- Google Auth ayarları (YORUMA ALINDI)
  /*
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '1010949602364-1ftj1lkgo1to6hifoq3cmol2l2iihq77.apps.googleusercontent.com',
    iosClientId:    '1010949602364-qq7o552t8grh6k8nucgt147l6vjv2jjl.apps.googleusercontent.com',
    androidClientId:'1010949602364-q2n5qajlro211r6hgp2qagu72ommci8h.apps.googleusercontent.com',
    scopes: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
    redirectUri: makeRedirectUri({ useProxy: true }),
  });
  */

  // 2- authToken'ı AsyncStorage'dan çek
  useEffect(() => {
    AsyncStorage.getItem('token').then(token => setAuthTokenState(token));
  }, []);

  // 3- Google login sonucu ile yönlendirme ve backend'e gönderme (YORUMA ALINDI)
  /*
  useEffect(() => {
    async function handleGoogleResponse() {
      if (response?.type === 'success' && authToken) {
        const { authentication } = response;
        try {
          const result = await fetch(`${API_BASE_URL}/user/google-credentials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ credentials: authentication }),
          }).then(res => res.json());

          Alert.alert(
            result.status ? 'Başarılı' : 'Hata',
            result.message || (result.status ? 'Abonelikleriniz çekiliyor.' : 'Bir hata oluştu.')
          );
          if (result.status) {
            setModalVisible(false);
            navigation.navigate('SubscriptionList');
          }
        } catch (err) {
          Alert.alert('Hata', 'Google ile ekleme sırasında bir hata oluştu.');
        }
      }
    }
    handleGoogleResponse();
  }, [response, authToken]);
  */

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: isKeyboardVisible ? { display: 'none' } : styles.tabBar,
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Takvim"
          component={SubscriptionCalendar}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }}
        />
        <Tab.Screen
          name="Ödemeler"
          component={SubscriptionList}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="card" size={size} color={color} /> }}
        />
        <Tab.Screen
          name="AbonelikEkle"
          component={DummyScreen}
          options={{
            tabBarLabel: () => null,
            tabBarButton: props => (
              <TouchableOpacity {...props} onPress={() => setModalVisible(true)} style={styles.addButton}>
                <Ionicons name="add-circle" size={33} color="#ff0000" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen
          name="Bildirimler"
          component={NotificationsScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} /> }}
        />
        <Tab.Screen
          name="Hesap"
          children={props => <Account {...props} setAuthToken={setAuthToken} />}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }}
        />
      </Tab.Navigator>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Abonelik Ekleme Seçenekleri</Text>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('AddSubManually');
                  }}
                >
                  <Text style={styles.optionText}>ELLE EKLE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  // Google ile ekle butonuna basınca boş bir html sayfasına yönlendir
                  onPress={() => {
                    setModalVisible(false);
                    // Boş bir HTML sayfasına yönlendir
                    import('react-native').then(({ Linking }) => {
                      Linking.openURL('https://www.google.com/blank.html');
                    });
                  }}
                  style={styles.googleOptionButton}
                >
                  <Ionicons name="logo-google" size={16} style={styles.googleIcon} />
                  <Text style={styles.googleOptionText}>GOOGLE İLE EKLE</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeText}>KAPAT</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

// --- Root Stack ---
const RootStack = createNativeStackNavigator();

export default function App() {
  const [authToken, setAuthToken] = useState(null);
  const [hasOnboarded, setHasOnboarded] = useState(null);
  const [loading, setLoading] = useState(true);

  // Push notification token state
  const [expoPushToken, setExpoPushToken] = useState('');
  // Notification listeners refs
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    AsyncStorage.multiGet(['token', 'hasOnboarded']).then(results => {
      const token = results.find(r => r[0] === 'token')[1];
      const onboard = results.find(r => r[0] === 'hasOnboarded')[1];
      setAuthToken(token && token !== 'undefined' ? token : null);
      setHasOnboarded(onboard === 'true');
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && authToken) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          setExpoPushToken(token);
          sendTokenToBackend(token, authToken);
        }
      });

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        Alert.alert('Bildirim geldi!', notification.request.content.title);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Bildirim tıklandı:', response);
      });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }
  }, [loading, authToken]);

  const finishOnboarding = () => {
    AsyncStorage.setItem('hasOnboarded', 'true');
    setHasOnboarded(true);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SubscriptionProvider>
        <NavigationContainer>
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {!hasOnboarded ? (
              <RootStack.Screen name="Onboarding">
                {props => <OnboardingSwipper {...props} onDone={finishOnboarding} />}
              </RootStack.Screen>
            ) : !authToken ? (
              <RootStack.Screen name="Auth">
                {props => <AuthStackScreen {...props} setAuthToken={setAuthToken} />}
              </RootStack.Screen>
            ) : (
              <RootStack.Screen name="App">
                {props => <AppStackScreen {...props} setAuthToken={setAuthToken} />}
              </RootStack.Screen>
            )}
          </RootStack.Navigator>
        </NavigationContainer>
      </SubscriptionProvider>
    </GestureHandlerRootView>
  );
}

// Bildirim izin alma
async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Push bildirim izni gerekli!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
  } else {
    alert('Gerçek cihazda test edin!');
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return token;
}

// Backend’e token gönderme
async function sendTokenToBackend(token, authToken) {
  try {
    const response = await fetch('https://your-backend-url/api/users/push-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ expoPushToken: token }),
    });
    if (!response.ok) {
      console.warn("Token backend'e gönderilirken hata:", response.statusText);
    }
  } catch (error) {
    console.error('Token gönderme hatası:', error);
  }
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
    borderRadius: 40,
    marginVertical: Platform.select({ ios: 30, android: 20 }),
    marginHorizontal: 20,
    paddingHorizontal: 10,
    position: 'absolute',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: Platform.select({ ios: { width: 0, height: 5 }, android: { width: 0, height: 3 } }),
    height: Platform.select({ ios: 80, android: 70 }),
    paddingTop: Platform.select({ ios: 15, android: 10 }),
    overflow: 'visible',
  },
  addButton: { top: 2, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderColor: '#ccc',
    borderTopWidth: 0.1,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  optionButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginVertical: 5,
  },
  optionText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  googleOptionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#000',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleOptionText: { color: '#000', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  closeButton: { marginTop: Platform.select({ ios: 0, android: 20 }), padding: Platform.select({ ios: 22, android: 0 }) },
    closeText: { color: 'red', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});