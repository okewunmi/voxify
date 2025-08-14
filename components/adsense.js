


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
} from 'react-native-google-mobile-ads';

const { width, height } = Dimensions.get('window');

// Production ad unit ID
const AD_UNIT_ID = 'ca-app-pub-2962255342437267/7029399978';

const AdInterstitialModal = ({ visible, onClose, onAdClosed, autoShow = true }) => {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const interstitialRef = useRef(null);
  const unsubscribersRef = useRef([]);

  // Create interstitial ad instance with optimized settings
  const createInterstitial = () => {
    try {
      console.log('Creating production interstitial ad');
      
      const interstitial = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: false, // Allow personalized ads for better variety
        keywords: ['fashion', 'clothing', 'shopping', 'lifestyle', 'accessories'],
        contentUrl: undefined, // Let AdMob decide
        neighboringContentUrls: undefined, // Let AdMob decide
      });
      
      interstitialRef.current = interstitial;
      return interstitial;
    } catch (error) {
      console.error('Error creating interstitial:', error);
      setError('Failed to initialize advertisement');
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
      
      // Show the ad immediately when loaded if autoShow is true
      if (autoShow) {
        setTimeout(() => {
          interstitial.show();
        }, 100); // Small delay to ensure UI is ready
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
      setError('Advertisement failed to load. Please try again.');
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
      // Start loading immediately when modal becomes visible
      loadAd();
    }

    // Cleanup on unmount or when visibility changes
    return () => {
      clearAdListeners();
      if (interstitialRef.current) {
        interstitialRef.current = null;
      }
    };
  }, [visible]);

  const loadAd = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoaded(false);
      
      // Create fresh interstitial instance
      const interstitial = createInterstitial();
      if (!interstitial) {
        setError('Failed to initialize advertisement');
        setLoading(false);
        return;
      }

      setupAdListeners(interstitial);
      
      console.log('Loading interstitial ad...');
      await interstitial.load();
      
    } catch (err) {
      console.error('Error loading interstitial ad:', err);
      setError('Failed to load advertisement. Please check your connection.');
      setLoading(false);
    }
  };

  const handleAdClosed = () => {
    // Reset state
    setLoaded(false);
    setLoading(false);
    setError(null);
    
    // Cleanup
    clearAdListeners();
    interstitialRef.current = null;
    
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
    // Clear previous instance and create new one
    clearAdListeners();
    interstitialRef.current = null;
    loadAd();
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
                <Text style={styles.subText}>This should only take a moment</Text>
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

            {loaded && !loading && !error && (
              <View style={styles.adContainer}>
                <Text style={styles.adLabel}>Advertisement Ready</Text>
                <Text style={styles.adDescription}>
                  Your advertisement is about to appear...
                </Text>
              </View>
            )}

            {!loading && !error && !loaded && (
              <View style={styles.adContainer}>
                <Text style={styles.adLabel}>Preparing Advertisement</Text>
                <Text style={styles.adDescription}>
                  Please wait while we prepare your advertisement...
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
    fontWeight: '600',
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
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
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#3273F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
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
    marginBottom: 12,
  },
  adDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default AdInterstitialModal;