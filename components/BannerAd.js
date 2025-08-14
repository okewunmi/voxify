// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   ActivityIndicator,
//   TouchableOpacity,
// } from 'react-native';
// import {
//   BannerAd,
//   BannerAdSize,
// } from 'react-native-google-mobile-ads';

// const { width, height } = Dimensions.get('window');

// const ProductionBannerAd = ({ 
//   adUnitId, 
//   style = {}, 
//   onAdLoaded = null,
//   onAdFailedToLoad = null,
//   keywords = ['fashion', 'clothing', 'shopping', 'lifestyle', 'accessories'],
//   backgroundColor = '#b3d5ffff'
// }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [hasError, setHasError] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');

//   const handleAdLoaded = () => {
//     console.log('Banner ad loaded and ready to display');
//     setIsLoading(false);
//     setHasError(false);
//     setErrorMessage('');
    
//     if (onAdLoaded) {
//       onAdLoaded();
//     }
//   };

//   const handleAdFailedToLoad = (error) => {
//     console.error('Banner ad failed to load:', error);
//     setIsLoading(false);
//     setHasError(true);
//     setErrorMessage(error?.message || 'Failed to load advertisement');
    
//     if (onAdFailedToLoad) {
//       onAdFailedToLoad(error);
//     }
//   };

//   const handleRetryLoad = () => {
//     setIsLoading(true);
//     setHasError(false);
//     setErrorMessage('');
//   };

//   if (!adUnitId) {
//     return (
//       <View style={[styles.container, { backgroundColor: '#ffebee' }, style]}>
//         <Text style={styles.errorText}>No Ad Unit ID provided</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor }, style]}>
//       {/* Show loading only initially */}
//       {isLoading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="small" color="#3273F6" />
//           <Text style={styles.loadingText}>Loading Ad...</Text>
//         </View>
//       )}

//       {/* Show error state */}
//       {hasError && (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>Ad failed to load</Text>
//           <TouchableOpacity 
//             style={styles.retryButton} 
//             onPress={handleRetryLoad}
//           >
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Always render the BannerAd - this is key for display */}
//       {!hasError && (
//         <View style={styles.bannerContainer}>
//           <BannerAd
//             unitId={adUnitId}
//             size={BannerAdSize.BANNER}
//             requestOptions={{
//               requestNonPersonalizedAdsOnly: true,
//               keywords: keywords,
//             }}
//             onAdLoaded={handleAdLoaded}
//             onAdFailedToLoad={handleAdFailedToLoad}
//             onAdOpened={() => console.log('Banner ad opened')}
//             onAdClosed={() => console.log('Banner ad closed')}
//           />
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: '100%',
//     minHeight: 65, // Fixed minimum height
//     maxHeight: height * 0.2, // Maximum 15% of screen height
//     justifyContent: 'center',
//     alignItems: 'center',
//      position: 'relative',
//   },
//   bannerContainer: {
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     flex: 1,
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     flexDirection: 'row',
//     backgroundColor: 'rgba(255,255,255,0.8)',
//     zIndex: 1,
//   },
//   loadingText: {
//     marginLeft: 8,
//     fontSize: 12,
//     color: '#3273F6',
//     fontWeight: '500',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },
//   errorText: {
//     fontSize: 12,
//     color: '#d32f2f',
//     textAlign: 'center',
//     marginBottom: 8,
//     fontWeight: '500',
//   },
//   retryButton: {
//     backgroundColor: '#3273F6',
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: 4,
//   },
//   retryButtonText: {
//     color: 'white',
//     fontSize: 11,
//     fontWeight: '600',
//   },
// });

// export default ProductionBannerAd;

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';

const { width, height } = Dimensions.get('window');

const ProductionBannerAd = ({ 
  adUnitId, 
  style = {}, 
  onAdLoaded = null,
  onAdFailedToLoad = null,
  keywords = ['fashion', 'clothing', 'shopping', 'lifestyle', 'accessories'],
  backgroundColor = '#b3d5ffff',
  maxRetryAttempts = 5, // Increased default attempts
  retryDelayMs = 3000, // Increased delay to 3 seconds
  autoRetryOnNoFill = true,
  enableProgressiveDelay = true // Enable progressive delay between retries
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [adKey, setAdKey] = useState(0); // Force re-render of BannerAd component
  
  const retryTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleAdLoaded = () => {
    console.log('Banner ad loaded and ready to display');
    if (!mountedRef.current) return;
    
    setIsLoading(false);
    setHasError(false);
    setErrorMessage('');
    setRetryCount(0); // Reset retry count on successful load
    
    if (onAdLoaded) {
      onAdLoaded();
    }
  };

  const handleAdFailedToLoad = (error) => {
    console.error('Banner ad failed to load:', error);
    if (!mountedRef.current) return;
    
    const errorCode = error?.code;
    const isNoFillError = errorCode === 'googleMobileAds/error-code-no-fill';
    
    // Check if we should retry (before incrementing retry count)
    const shouldRetry = autoRetryOnNoFill && isNoFillError && retryCount < maxRetryAttempts;
    
    console.log(`Ad load failed. Error code: ${errorCode}, Retry count: ${retryCount}/${maxRetryAttempts}, Will retry: ${shouldRetry}`);
    
    if (shouldRetry) {
      // Calculate delay with progressive backoff if enabled
      const currentDelay = enableProgressiveDelay 
        ? retryDelayMs * Math.pow(1.5, retryCount) // 1.5x multiplier for each retry
        : retryDelayMs;
      
      console.log(`Auto-retrying ad load in ${currentDelay}ms... (Attempt ${retryCount + 1}/${maxRetryAttempts})`);
      
      // Increment retry count first
      setRetryCount(prev => prev + 1);
      
      // Show loading state during retry delay
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
      
      retryTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setAdKey(prev => prev + 1); // Force BannerAd to re-mount
        }
      }, currentDelay);
    } else {
      // Show error state if max retries reached or not a no-fill error
      setIsLoading(false);
      setHasError(true);
      setErrorMessage(error?.message || 'Failed to load advertisement');
      
      console.log(`Auto-retry disabled or max attempts reached. Showing error state.`);
      
      if (onAdFailedToLoad) {
        onAdFailedToLoad(error);
      }
    }
  };

  const handleManualRetry = () => {
    console.log('Manual retry triggered');
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
    setRetryCount(0);
    setAdKey(prev => prev + 1); // Force BannerAd to re-mount
  };

  if (!adUnitId) {
    return (
      <View style={[styles.container, { backgroundColor: '#ffebee' }, style]}>
        <Text style={styles.errorText}>No Ad Unit ID provided</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {/* Show loading state */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#3273F6" />
          <Text style={styles.loadingText}>
            {retryCount > 0 ? `Loading Ad... (Retry ${retryCount}/${maxRetryAttempts})` : 'Loading Ad...'}
          </Text>
        </View>
      )}

      {/* Show error state only when max retries reached */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {retryCount >= maxRetryAttempts 
              ? `No ads available right now (${maxRetryAttempts} attempts)`
              : 'Ad failed to load'
            }
          </Text>
          <Text style={styles.errorSubText}>
            {retryCount >= maxRetryAttempts 
              ? 'Please try again later or check your connection'
              : 'Tap to retry manually'
            }
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleManualRetry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* BannerAd component - key prop forces re-mount on retry */}
      {!hasError && (
        <View style={styles.bannerContainer}>
          <BannerAd
            key={adKey} // This forces the component to re-mount on retry
            unitId={adUnitId}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
              keywords: keywords,
            }}
            onAdLoaded={handleAdLoaded}
            onAdFailedToLoad={handleAdFailedToLoad}
            onAdOpened={() => console.log('Banner ad opened')}
            onAdClosed={() => console.log('Banner ad closed')}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 60,
    maxHeight: height * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bannerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 1,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#3273F6',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  errorSubText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#3273F6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ProductionBannerAd;