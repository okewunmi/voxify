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
  AdEventType,
} from 'react-native-google-mobile-ads';

const { width, height } = Dimensions.get('window');

const ProductionBannerAd = ({ 
  adUnitId, 
  style = {}, 
  onAdLoaded = null,
  onAdFailedToLoad = null,
  keywords = ['fashion', 'clothing', 'shopping', 'lifestyle'],
  showLoadingIndicator = true,
  backgroundColor = '#f5f5f5'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const bannerRef = useRef(null);

  useEffect(() => {
    // Reset states when adUnitId changes
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
  }, [adUnitId]);

  const handleAdLoaded = () => {
    console.log('Banner ad loaded successfully');
    setIsLoading(false);
    setHasError(false);
    setErrorMessage('');
    
    if (onAdLoaded) {
      onAdLoaded();
    }
  };

  const handleAdFailedToLoad = (error) => {
    console.error('Banner ad failed to load:', error);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(error?.message || 'Failed to load advertisement');
    
    if (onAdFailedToLoad) {
      onAdFailedToLoad(error);
    }
  };

  const handleAdOpened = () => {
    console.log('Banner ad opened');
  };

  const handleAdClosed = () => {
    console.log('Banner ad closed');
  };

  const handleRetryLoad = () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
    
    // Force re-render of BannerAd component
    if (bannerRef.current) {
      // The BannerAd will automatically retry when re-rendered
    }
  };

  if (!adUnitId) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No Ad Unit ID provided</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {/* Loading Indicator */}
      {isLoading && showLoadingIndicator && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#666" />
          <Text style={styles.loadingText}>Loading Ad...</Text>
        </View>
      )}

      {/* Error State */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ad failed to load</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleRetryLoad}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Banner Ad */}
      {!hasError && (
        <BannerAd
          ref={bannerRef}
          unitId={adUnitId}
          size={BannerAdSize.ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
            keywords: keywords,
          }}
          onAdLoaded={handleAdLoaded}
          onAdFailedToLoad={handleAdFailedToLoad}
          onAdOpened={handleAdOpened}
          onAdClosed={handleAdClosed}
        />
      )}

      {/* Fallback content when no ad is showing and loading is complete */}
      {!isLoading && !hasError && (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>Advertisement</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: height * 0.1, // 10% of screen height
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
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
    fontSize: 12,
    fontWeight: '600',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default ProductionBannerAd;