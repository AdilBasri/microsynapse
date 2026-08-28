import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Image, Platform, StatusBar, onDone } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Aboneliklerini Yönetmenin \nEn Kolay Yolu!',
    description: 'subtracker, tüm dijital aboneliklerini tek yerden takip etmeni sağlar. Ödemelerini, iptalleri ve fatura arşivlerini yönetmek artık çok kolay.',
    image: require('../images/1.png'),
    imageWidth: width * 0.6,
    imageHeight: width * 0.6,
    marginTop: 100,
  },
  {
    id: '2',
    title: 'Kontrolü Elinde Tut!',
    description: 'Tüm aboneliklerini zamanında yönet. İptalleri kolayca yap, artan fiyatları önceden öğren.',
    image: require('../images/2.png'),
    imageWidth: width * 0.7,
    imageHeight: width * 0.7,
    marginTop: 80,
  },
  {
    id: '3',
    title: 'Hadi, Sen de subtracker Ayrıcalıklarından Faydalan!',
    description: 'Şimdi başla, aboneliklerini akıllıca yönet. subtracker her zaman yanında!',
    image: require('../images/3.png'),
    imageWidth: width * 0.7,
    imageHeight: width * 0.7,
    marginTop: 90,
  },
];

export default function OnboardingScreen({ onDone }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef(null);
  const navigation = useNavigation();

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    }
  };

const goToLogin = () => {
  if (onDone) onDone();
};

  return (
    <View style={styles.container}>
      {/* Logo ve Hoşgeldiniz */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <Image source={require('../images/subtracker-logo2.jpeg')} style={styles.logoImage} />
          <Text style={styles.logoText}>subtracker</Text>
        </View>
        {/* <Text style={styles.welcomeText}>Hoş Geldiniz!</Text> */}
      </View>

      {/* FlatList */}
      <View style={{ flex: 1, zIndex: 1 }}>
        <FlatList
          data={slides}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image 
                source={item.image}
                style={{
                  width: item.imageWidth,
                  height: item.imageHeight,
                  resizeMode: 'contain',
                  marginTop: item.marginTop,
                  marginBottom: 10,
                }} 
              />
              <View style={styles.textWrapper}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          ref={slidesRef}
          contentContainerStyle={{ paddingTop: 0 }}
        />
      </View>

      {/* Arka Plan */}
      <View style={styles.footerBackground} />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentIndex === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={goToLogin}>
          <Text style={styles.loginButtonText}>GİRİŞ YAP</Text>
        </TouchableOpacity> 

        {currentIndex < slides.length - 1 && (
          <TouchableOpacity style={styles.nextButton} onPress={scrollToNext}>
            <Text style={styles.nextButtonText}>İLERİ</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop:
      Platform.OS === 'ios'
        ? 56
        : (StatusBar.currentHeight ?? 0) -99, 
  },
  headerWrapper: {
    alignItems: 'center',
    marginTop: 40,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 25,
  },
  logoText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
    marginLeft: 0,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: -10,
    color: '#000',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10,
    paddingTop: 0,
  },
  textWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: 20, 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  footerBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 450,
    backgroundColor: '#d9f2e6',
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    zIndex: 0,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#4CAF50',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 30,
    alignSelf: 'center',
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  nextButton: {
    backgroundColor: '#fff',
    borderColor: '#4CAF50',
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  nextButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});