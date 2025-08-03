
// import React, { useState, useEffect } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import {
//   InterstitialAd,
//   AdEventType,
//   TestIds,
// } from 'react-native-google-mobile-ads';

// const { width, height } = Dimensions.get('window');

// // Initialize the interstitial ad
// // Use TestIds.INTERSTITIAL for testing, replace with your actual ad unit ID for production
// const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-2962255342437267/5785387487';

// const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
//   requestNonPersonalizedAdsOnly: true,
//   keywords: ['fashion', 'clothing'],
// });

// const AdInterstitialModal = ({ visible, onClose, onAdClosed, autoShow = true }) => {
//   const [loaded, setLoaded] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (visible && autoShow) {
//       loadAndShowAd();
//     }
    
//     // Set up ad event listeners
//     const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
//       setLoaded(true);
//       setLoading(false);
//       setError(null);
//     });

//     const unsubscribeOpened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
//       console.log('Interstitial ad opened');
//     });

//     const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
//       console.log('Interstitial ad closed');
//       setLoaded(false);
//       handleAdClosed();
//     });

//     const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
//       console.log('Interstitial ad error:', error);
//       setError(error.message || 'Failed to load ad');
//       setLoading(false);
//       setLoaded(false);
//     });

//     // Cleanup listeners
//     return () => {
//       unsubscribeLoaded();
//       unsubscribeOpened();
//       unsubscribeClosed();
//       unsubscribeError();
//     };
//   }, [visible]);

//   const loadAndShowAd = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       // Load the ad
//       await interstitial.load();
      
//       // Show the ad once loaded
//       if (loaded) {
//         interstitial.show();
//       }
//     } catch (err) {
//       console.error('Error loading interstitial ad:', err);
//       setError('Failed to load advertisement');
//       setLoading(false);
//     }
//   };

//   const handleAdClosed = () => {
//     onAdClosed && onAdClosed();
//     onClose && onClose();
//   };

//   const handleManualClose = () => {
//     Alert.alert(
//       'Close Ad',
//       'Are you sure you want to close this advertisement?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Close',
//           onPress: () => {
//             handleAdClosed();
//           },
//         },
//       ]
//     );
//   };

//   const handleRetryLoad = () => {
//     loadAndShowAd();
//   };

//   if (!visible) return null;

//   return (
//     <Modal
//       visible={visible}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={handleManualClose}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.modalContainer}>
//           {/* Close Button */}
//           <TouchableOpacity 
//             style={styles.closeButton} 
//             onPress={handleManualClose}
//             hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//           >
//             <Text style={styles.closeButtonText}>✕</Text>
//           </TouchableOpacity>

//           {/* Content Area */}
//           <View style={styles.contentContainer}>
//             {loading && (
//               <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#007AFF" />
//                 <Text style={styles.loadingText}>Loading Advertisement...</Text>
//               </View>
//             )}

//             {error && (
//               <View style={styles.errorContainer}>
//                 <Text style={styles.errorText}>
//                   {error}
//                 </Text>
//                 <TouchableOpacity 
//                   style={styles.retryButton} 
//                   onPress={handleRetryLoad}
//                 >
//                   <Text style={styles.retryButtonText}>Retry</Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//             {!loading && !error && (
//               <View style={styles.adContainer}>
//                 <Text style={styles.adLabel}>Advertisement</Text>
//                 <Text style={styles.adDescription}>
//                   Your interstitial ad will appear automatically.
//                   {loaded ? ' Ad is ready!' : ' Please wait...'}
//                 </Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: width * 0.9,
//     maxHeight: height * 0.8,
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 20,
//     position: 'relative',
//     elevation: 10,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 15,
//     right: 15,
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1,
//   },
//   closeButtonText: {
//     fontSize: 18,
//     color: '#666',
//     fontWeight: 'bold',
//   },
//   contentContainer: {
//     marginTop: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     minHeight: 200,
//   },
//   loadingContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//   },
//   errorContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#d32f2f',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   retryButton: {
//     backgroundColor: '#007AFF',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   adContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   adLabel: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 10,
//   },
//   adDescription: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 22,
//   },
// });

// export default AdInterstitialModal;

// // ExampleScreen.js - How to use the AdInterstitialModal component
// // import React, { useState } from 'react';
// // import {
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   StyleSheet,
// //   SafeAreaView,
// //   Alert,
// // } from 'react-native';
// // import AdInterstitialModal from './AdInterstitialModal';

// // const ExampleScreen = () => {
// //   const [showAd, setShowAd] = useState(false);

// //   // Example handler function that shows the ad
// //   const handleShowAd = () => {
// //     console.log('Showing interstitial ad...');
// //     setShowAd(true);
// //   };

// //   // Handler for when user completes an action (like TTS completion)
// //   const handleTTSComplete = () => {
// //     // Your TTS completion logic here
// //     console.log('TTS completed, showing ad...');
    
// //     // Show ad after TTS completion
// //     handleShowAd();
// //   };

// //   // Handler for when ad is closed
// //   const handleAdClosed = () => {
// //     console.log('Ad closed by user');
// //     setShowAd(false);
    
// //     // You can add additional logic here, like:
// //     // - Continuing to next screen
// //     // - Enabling certain features
// //     // - Tracking analytics
    
// //     Alert.alert('Thank you!', 'Thanks for viewing the advertisement!');
// //   };

// //   // Handler for manual close
// //   const handleCloseAd = () => {
// //     console.log('Ad modal closed');
// //     setShowAd(false);
// //   };

// //   // Example function that might trigger ad after some user action
// //   const handlePremiumFeature = () => {
// //     Alert.alert(
// //       'Premium Feature',
// //       'Watch an ad to unlock this feature temporarily?',
// //       [
// //         {
// //           text: 'Cancel',
// //           style: 'cancel',
// //         },
// //         {
// //           text: 'Watch Ad',
// //           onPress: handleShowAd,
// //         },
// //       ]
// //     );
// //   };

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <View style={styles.content}>
// //         <Text style={styles.title}>TTS App with AdMob Integration</Text>
        
// //         <TouchableOpacity 
// //           style={styles.button} 
// //           onPress={handleShowAd}
// //         >
// //           <Text style={styles.buttonText}>Show Interstitial Ad</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity 
// //           style={styles.button} 
// //           onPress={handleTTSComplete}
// //         >
// //           <Text style={styles.buttonText}>Simulate TTS Complete</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity 
// //           style={[styles.button, styles.premiumButton]} 
// //           onPress={handlePremiumFeature}
// //         >
// //           <Text style={styles.buttonText}>Premium Feature (Ad Required)</Text>
// //         </TouchableOpacity>
// //       </View>

// //       {/* Reusable Ad Modal Component */}
// //       <AdInterstitialModal
// //         visible={showAd}
// //         onClose={handleCloseAd}
// //         onAdClosed={handleAdClosed}
// //         autoShow={true} // Automatically show ad when modal opens
// //       />
// //     </SafeAreaView>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#f5f5f5',
// //   },
// //   content: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     padding: 20,
// //   },
// //   title: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //     marginBottom: 40,
// //     textAlign: 'center',
// //     color: '#333',
// //   },
// //   button: {
// //     backgroundColor: '#007AFF',
// //     paddingHorizontal: 30,
// //     paddingVertical: 15,
// //     borderRadius: 8,
// //     marginVertical: 10,
// //     minWidth: 250,
// //   },
// //   premiumButton: {
// //     backgroundColor: '#FF6B35',
// //   },
// //   buttonText: {
// //     color: 'white',
// //     fontSize: 16,
// //     fontWeight: '600',
// //     textAlign: 'center',
// //   },
// // });

// // export default ExampleScreen;

// AdInterstitialModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const { width, height } = Dimensions.get('window');

// Platform-specific ad unit IDs
const getAdUnitId = () => {
  if (__DEV__) {
    // Use test ads in development
    return TestIds.INTERSTITIAL;
  }
  
  // Production ad unit IDs
  if (Platform.OS === 'android') {
    return 'ca-app-pub-2962255342437267/5785387487'; // Android ad unit
  } else if (Platform.OS === 'ios') {
    return 'ca-app-pub-2962255342437267/7537452850'; // iOS ad unit
  }
  
  // Fallback to Android ad unit if platform is not detected
  return 'ca-app-pub-2962255342437267/5785387487';
};

// Initialize the interstitial ad with platform-specific ad unit ID
const adUnitId = getAdUnitId();

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['fashion', 'clothing'],
});

const AdInterstitialModal = ({ visible, onClose, onAdClosed, autoShow = true }) => {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible && autoShow) {
      loadAndShowAd();
    }
    
    // Set up ad event listeners
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
      setLoading(false);
      setError(null);
    });

    const unsubscribeOpened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
      console.log('Interstitial ad opened');
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed');
      setLoaded(false);
      handleAdClosed();
    });

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('Interstitial ad error:', error);
      setError(error.message || 'Failed to load ad');
      setLoading(false);
      setLoaded(false);
    });

    // Cleanup listeners
    return () => {
      unsubscribeLoaded();
      unsubscribeOpened();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [visible]);

  const loadAndShowAd = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load the ad
      await interstitial.load();
      
      // Show the ad once loaded
      if (loaded) {
        interstitial.show();
      }
    } catch (err) {
      console.error('Error loading interstitial ad:', err);
      setError('Failed to load advertisement');
      setLoading(false);
    }
  };

  const handleAdClosed = () => {
    onAdClosed && onAdClosed();
    onClose && onClose();
  };

  const handleManualClose = () => {
    Alert.alert(
      'Close Ad',
      'Are you sure you want to close this advertisement?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Close',
          onPress: () => {
            handleAdClosed();
          },
        },
      ]
    );
  };

  const handleRetryLoad = () => {
    loadAndShowAd();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleManualClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleManualClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Content Area */}
          <View style={styles.contentContainer}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading Advertisement...</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {error}
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={handleRetryLoad}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !error && (
              <View style={styles.adContainer}>
                <Text style={styles.adLabel}>Advertisement</Text>
                <Text style={styles.adDescription}>
                  Your interstitial ad will appear automatically.
                  {loaded ? ' Ad is ready!' : ' Please wait...'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    position: 'relative',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  contentContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  adContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  adLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  adDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default AdInterstitialModal;