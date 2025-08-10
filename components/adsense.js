import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const { width, height } = Dimensions.get('window');

// Android-only ad unit ID
const getAdUnitId = () => {
  if (__DEV__) {
    // Use test ads in development
    return TestIds.INTERSTITIAL;
  }
  
  // Production Android ad unit ID
  return 'ca-app-pub-2962255342437267/5785387487'; // Replace with your actual Android ad unit
  // return 'ca-app-pub-3940256099942544/1033173712'; // Replace with your actual Android ad unit
};

const AdInterstitialModal = ({ visible, onClose, onAdClosed, autoShow = true }) => {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const interstitialRef = useRef(null);
  const unsubscribersRef = useRef([]);

  // Create interstitial ad instance
  const createInterstitial = () => {
    try {
      const adUnitId = getAdUnitId();
      console.log('Creating Android interstitial with ad unit:', adUnitId);
      
      const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
        keywords: ['fashion', 'clothing'],
      });
      
      interstitialRef.current = interstitial;
      return interstitial;
    } catch (error) {
      console.error('Error creating interstitial:', error);
      setError('Failed to create advertisement');
      return null;
    }
  };

  // Set up ad event listeners
  const setupAdListeners = (interstitial) => {
    if (!interstitial) return;

    // Clear existing listeners
    clearAdListeners();

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded successfully');
      setLoaded(true);
      setLoading(false);
      setError(null);
      
      // Auto-show the ad when loaded and autoShow is true
      if (autoShow) {
        interstitial.show();
      }
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
      console.error('Interstitial ad error:', error);
      setError(error.message || 'Failed to load advertisement');
      setLoading(false);
      setLoaded(false);
    });

    // Store unsubscribe functions
    unsubscribersRef.current = [
      unsubscribeLoaded,
      unsubscribeOpened,
      unsubscribeClosed,
      unsubscribeError,
    ];
  };

  // Clear ad event listeners
  const clearAdListeners = () => {
    unsubscribersRef.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing from ad event:', error);
      }
    });
    unsubscribersRef.current = [];
  };

  useEffect(() => {
    if (visible) {
      const interstitial = createInterstitial();
      if (interstitial) {
        setupAdListeners(interstitial);
        
        if (autoShow) {
          loadAndShowAd();
        }
      }
    }

    // Cleanup on unmount or when visibility changes
    return () => {
      clearAdListeners();
    };
  }, [visible]);

  const loadAndShowAd = async () => {
    const interstitial = interstitialRef.current;
    if (!interstitial) {
      setError('Advertisement not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading interstitial ad...');
      await interstitial.load();
      
    } catch (err) {
      console.error('Error loading interstitial ad:', err);
      setError('Failed to load advertisement');
      setLoading(false);
    }
  };

  const handleAdClosed = () => {
    // Reset state
    setLoaded(false);
    setLoading(false);
    
    // Call callbacks
    if (onAdClosed) onAdClosed();
    if (onClose) onClose();
  };

  const handleManualClose = () => {
    Alert.alert(
      'Close Advertisement',
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
    // Recreate interstitial and try again
    const interstitial = createInterstitial();
    if (interstitial) {
      setupAdListeners(interstitial);
      loadAndShowAd();
    }
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
                <ActivityIndicator size="large" color="#3273F6" />
                <Text style={styles.loadingText}>Loading Advertisement...</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
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
                  {__DEV__ ? 'Test ad will appear automatically.' : 'Advertisement will appear automatically.'}
                  {loaded ? ' Ad is ready!' : ' Please wait...'}
                </Text>
                {__DEV__ && (
                  <Text style={styles.devText}>
                    Development Mode - Using Test Ads (Android)
                  </Text>
                )}
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
    backgroundColor: '#3273F6',
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
    marginBottom: 10,
  },
  devText: {
    fontSize: 14,
    color: '#3273F6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AdInterstitialModal;