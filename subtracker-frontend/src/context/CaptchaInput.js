import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const CaptchaInput = ({onChange}) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    setCaptchaText(generateCaptcha());
  }, []);

  const handleRefresh = () => {
    const newCaptcha = generateCaptcha();
    setCaptchaText(newCaptcha);
    setUserInput('');
    if (onChange) {
      onChange({ captchaText: newCaptcha, userInput: '' });
    }
  };

  const handleInputChange = (text) => {
    setUserInput(text);
    if (onChange) {
      onChange({ captchaText, userInput: text });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Resimdeki metni gir</Text>

      <View style={styles.captchaBox}>
        <View style={styles.captchaImage}>
          <Text style={styles.captchaText}>{captchaText}</Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" />
          <Text style={styles.refreshText}>Yeni Resim</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.captchaInputView}>
        <TextInput
          style={styles.input}
          placeholder="Resimdeki metni yaz"
          placeholderTextColor="#999"
          value={userInput}
          onChangeText={handleInputChange}
          autoCapitalize="characters"
        />
      </View>
    </View>
  );
};

export default CaptchaInput;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
    fontWeight: '500',
  },
  captchaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  captchaImage: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    // transform: [{ rotate: '-2deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  captchaText: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 4,
    color: '#a3a3a3',
  },
  refreshButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 8,
  },
  refreshText: {
    color: '#000',
    fontWeight: 'bold',
  },
  captchaInputView: {
    marginBottom: 5,
  },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 14,
    fontSize: 16,
    color: '#000',
  },
});
