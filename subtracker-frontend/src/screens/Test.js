import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function test() {
  return (
    <View style={styles.container}>
      <View style={styles.boxOne}></View>
      <View style={styles.boxTwo}></View>
      <View style={styles.boxThree}></View>
      <View style={styles.boxFour}></View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  boxOne: {
    backgroundColor: 'red',
    height: '20%',
    width: '20%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  boxTwo: {
    backgroundColor: 'blue',
    height: '20%',
    width: '20%',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  boxThree: {
    backgroundColor: 'green',
    height: '20%',
    width: '20%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  boxFour: {
    backgroundColor: 'yellow',
    height: '20%',
    width: '20%',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },

})