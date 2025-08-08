// import { StyleSheet, Text, View, ActivityIndicator, Platform } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import React, { useEffect, useRef } from 'react';
// import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// import { useNavigation, router } from 'expo-router';
// import mobileAds from 'react-native-google-mobile-ads';

// const index = () => {
//   const navigation = useNavigation();


//   useEffect(() => {
//     const timer = setTimeout(() => {
//       router.push('intro1'); // Navigate to intro1.js after 5 seconds
//     }, 3000);

//     return () => clearTimeout(timer); // Clear timer on component unmount
//   }, [navigation]);
  
// //  useEffect(() => {
// //     // Initialize Google Mobile Ads SDK
// //     const initializeAds = async () => {
// //       try {
// //         await mobileAds().initialize();
// //         console.log('Google Mobile Ads initialized successfully');
        
// //         // Optional: Set request configuration
// //         await mobileAds().setRequestConfiguration({
// //           maxAdContentRating: 'G',
// //           tagForChildDirectedTreatment: false,
// //           tagForUnderAgeOfConsent: false,
// //           testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
// //         });
        
// //         console.log('Ad request configuration set');
// //       } catch (error) {
// //         console.error('Failed to initialize Google Mobile Ads:', error);
// //       }
// //     };

// //     initializeAds();
// //   }, []);



//   return (
//     <SafeAreaView style={styles.safe}>
//       <View style={styles.view}>
//         <View style={styles.Logo}>
//           <MaterialCommunityIcons
//             name="text-to-speech"
//             size={80}
//             color="#3273F6"
//           />
//         </View>

//         <Text style={styles.txt}> Voxify </Text>
//         {/* <View style={styles.rotate}></View> */}
//         <ActivityIndicator
//           size="large"
//           color="#fff"
//           style={styles.customIndicator}
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// export default index;

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: '#3273F6',
//     color: '#fff',
//   },
//   view: {
//     height: '100%',
//     display: 'flex',
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     paddingBottom: 90,
//   },
//   txt: {
//     color: '#fff',
//     fontSize: 30,
//     // fontWeight: "bold",
//     marginTop: 35,
//   },
//   rotate: {
//     // borderWidth: 4,
//     borderTopWidth: 4,
//     borderBottomWidth: 4,
//     borderLeftWidth: 4,
//     borderStyle: 'solid',
//     borderColor: '#fff',
//     borderRadius: 100,
//     width: 40,
//     height: 40,
//   },
//   customIndicator: {
//     marginTop: 180,
//     transform: [{ scale: 1.3 }], // Increase size by scaling
//   },
//   Logo: {
//     backgroundColor: '#fff',
//     borderRadius: 100,
//     padding: 15,
//   },
// });









// // {
// //   "cli": {
// //     "version": ">= 16.13.3",
// //     "appVersionSource": "remote"
// //   },
// //   "build": {
// //     "development": {
// //       "developmentClient": true,
// //       "distribution": "internal"
// //     },
// //     "preview": {
// //       "distribution": "internal"
// //     },
// //     "production": {
// //       "autoIncrement": true
// //     }
// //   },
// //   "submit": {
// //     "production": {}
// //   }
// // }


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

  // useEffect(() => {
  //   // Initialize Google Mobile Ads SDK for Android
  //   const initializeAds = async () => {
  //     try {
  //       console.log('Initializing Google Mobile Ads SDK...');
        
  //       // Initialize the SDK
  //       const adapterStatuses = await mobileAds().initialize();
  //       console.log('Google Mobile Ads initialized successfully:', adapterStatuses);

  //       // Set request configuration for Android
  //       await mobileAds().setRequestConfiguration({
  //         maxAdContentRating: 'G',
  //         tagForChildDirectedTreatment: false,
  //         tagForUnderAgeOfConsent: false,
  //         testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [], // Add your test device ID here if needed
  //       });

  //       console.log('Ad request configuration set for Android');
  //     } catch (error) {
  //       console.error('Failed to initialize Google Mobile Ads:', error);
  //       console.error('Error details:', error.message);
        
  //       // Check if the error is related to module not found
  //       if (error.message && error.message.includes('RNGoogleMobileAdsModule')) {
  //         console.error('The react-native-google-mobile-ads module is not properly linked.');
  //         console.error('Make sure to:');
  //         console.error('1. Install the module: npm install react-native-google-mobile-ads');
  //         console.error('2. Run: npx pod-install (if using iOS, but you mentioned Android only)');
  //         console.error('3. Rebuild your app');
  //       }
  //     }
  //   };

  //   initializeAds();
  // }, []);

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