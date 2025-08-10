import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, router } from 'expo-router';
import mobileAds from 'react-native-google-mobile-ads';

const index = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('intro1'); // Navigate to intro1.js after 3 seconds
    }, 3000);

    return () => clearTimeout(timer); // Clear timer on component unmount
  }, [navigation]);


  useEffect(()=>{
    mobileAds()
    .initialize()
    .then(adapterStatuses=>{

    })
  }, []);
  
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.view}>
        <View style={styles.Logo}>
          <MaterialCommunityIcons
            name="text-to-speech"
            size={80}
            color="#3273F6"
          />
        </View>

        <Text style={styles.txt}>Voxify</Text>
        <ActivityIndicator
          size="large"
          color="#fff"
          style={styles.customIndicator}
        />
      </View>
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#3273F6',
    color: '#fff',
  },
  view: {
    height: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 90,
  },
  txt: {
    color: '#fff',
    fontSize: 30,
    marginTop: 35,
  },
  customIndicator: {
    marginTop: 180,
    transform: [{ scale: 1.3 }],
  },
  Logo: {
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 15,
  },
});