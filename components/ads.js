import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const AdSenseInterstitialModal = ({ visible, onClose, onAdClosed, autoShow = true }) => {
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [adDisplayed, setAdDisplayed] = useState(false);
    const webViewRef = useRef(null);

    // Replace with your ACTUAL AdSense publisher ID and ad unit ID
    const ADSENSE_PUBLISHER_ID = 'ca-pub-9552203090932814';
    const ADSENSE_AD_SLOT = '4710767514';

    // Improved AdSense HTML template
    const getAdSenseHTML = () => {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <title>Advertisement</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            html, body {
                width: 100%;
                height: 100%;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background-color: #f8f9fa;
                overflow-x: hidden;
            }
            .ad-container {
                width: 100%;
                height: 100vh;
                background: white;
                padding: 15px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: relative;
            }
            .ad-label {
                font-size: 12px;
                color: #666;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
                position: absolute;
                top: 50px;
                left: 50%;
                transform: translateX(-50%);
            }
            .ad-content {
                width: 100%;
                max-width: 100%;
                height: auto;
                min-height: 300px;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 40px;
            }
            .loading {
                color: #007AFF;
                font-size: 16px;
                text-align: center;
            }
            .error {
                color: #d32f2f;
                font-size: 16px;
                text-align: center;
                padding: 20px;
            }
            .close-timer {
                position: absolute;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 12px;
                color: #999;
                background: rgba(255,255,255,0.9);
                padding: 8px 16px;
                border-radius: 20px;
                text-align: center;
            }
            ins.adsbygoogle {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                min-height: 250px !important;
            }
            
            /* Ensure ads take full space */
            .adsbygoogle[data-ad-format="auto"] {
                display: block !important;
                width: 100% !important;
            }
        </style>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}"
                crossorigin="anonymous"></script>
    </head>
    <body>
        <div class="ad-container">
            <div class="ad-label">Advertisement</div>
            
            <div class="ad-content">
                <!-- AdSense Responsive Display Ad -->
                <ins class="adsbygoogle"
                     style="display:block; width:100%; height:auto; min-height:250px;"
                     data-ad-client="${ADSENSE_PUBLISHER_ID}"
                     data-ad-slot="${ADSENSE_AD_SLOT}"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            </div>
            
            <div class="close-timer" id="closeTimer">
                <div>Ad will close in <span id="countdown">15</span> seconds</div>
            </div>
        </div>

        <script>
            let countdownValue = 15;
            let countdownInterval;
            let adLoaded = false;

            function initializeAd() {
                try {
                    console.log('Initializing AdSense...');
                    
                    // Check if adsbygoogle is available
                    if (typeof adsbygoogle === 'undefined') {
                        throw new Error('AdSense script not loaded');
                    }

                    // Push ad configuration
                    (adsbygoogle = window.adsbygoogle || []).push({});
                    
                    console.log('AdSense initialized successfully');
                    adLoaded = true;
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'AD_LOADED',
                        success: true
                    }));

                    // Check if ad loaded after a delay
                    setTimeout(checkAdStatus, 3000);
                    
                } catch (error) {
                    console.error('AdSense initialization error:', error);
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'AD_ERROR',
                        error: error.message
                    }));
                }
            }

            function checkAdStatus() {
                const adElement = document.querySelector('.adsbygoogle');
                if (adElement && adElement.innerHTML.trim() === '') {
                    console.warn('Ad may not have loaded properly');
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'AD_WARNING',
                        message: 'Ad content appears empty'
                    }));
                }
            }

            function startCountdown() {
                const countdownElement = document.getElementById('countdown');
                const timerElement = document.getElementById('closeTimer');
                
                if (!timerElement) return;
                
                countdownInterval = setInterval(() => {
                    countdownValue--;
                    if (countdownElement) {
                        countdownElement.textContent = countdownValue;
                    }
                    
                    if (countdownValue <= 0) {
                        clearInterval(countdownInterval);
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'AD_CLOSED',
                            autoClose: true
                        }));
                    }
                }, 1000);
            }

            // Wait for AdSense script to load
            function waitForAdSense(attempts = 0) {
                if (typeof adsbygoogle !== 'undefined') {
                    console.log('AdSense script loaded');
                    initializeAd();
                    startCountdown();
                } else if (attempts < 30) { // Wait up to 3 seconds
                    console.log('Waiting for AdSense script...', attempts);
                    setTimeout(() => waitForAdSense(attempts + 1), 100);
                } else {
                    console.error('AdSense script failed to load after 3 seconds');
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'AD_ERROR',
                        error: 'AdSense script timeout'
                    }));
                }
            }

            // Initialize when page loads
            window.addEventListener('load', () => {
                console.log('Page loaded, waiting for AdSense...');
                setTimeout(waitForAdSense, 500);
            });

            // Handle ad clicks
            document.addEventListener('click', function(e) {
                if (e.target.closest('.adsbygoogle')) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'AD_CLICKED'
                    }));
                }
            });

            // Debug logging
            window.addEventListener('error', function(e) {
                console.error('Page error:', e.error);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'PAGE_ERROR',
                    error: e.error.message
                }));
            });
        </script>
    </body>
    </html>
    `;
    };

    useEffect(() => {
        if (visible && autoShow) {
            loadAndShowAd();
        }

        return () => {
            setLoaded(false);
            setLoading(false);
            setError(null);
            setAdDisplayed(false);
        };
    }, [visible]);

    const loadAndShowAd = async () => {
        try {
            console.log('Loading AdSense ad...');
            setLoading(true);
            setError(null);
            setAdDisplayed(true);
        } catch (err) {
            console.error('Error loading AdSense ad:', err);
            setError('Failed to load advertisement');
            setLoading(false);
        }
    };

    const handleWebViewMessage = (event) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            console.log('WebView message:', message);

            switch (message.type) {
                case 'AD_LOADED':
                    setLoaded(true);
                    setLoading(false);
                    setError(null);
                    console.log('Ad loaded successfully');
                    break;

                case 'AD_ERROR':
                    console.error('Ad error:', message.error);
                    setError(message.error || 'Failed to load ad');
                    setLoading(false);
                    break;

                case 'AD_WARNING':
                    console.warn('Ad warning:', message.message);
                    break;

                case 'AD_CLICKED':
                    console.log('AdSense ad clicked');
                    break;

                case 'AD_CLOSED':
                    handleAdClosed();
                    break;

                case 'PAGE_ERROR':
                    console.error('Page error:', message.error);
                    break;
            }
        } catch (err) {
            console.error('Error parsing WebView message:', err);
        }
    };

    const handleAdClosed = () => {
        setAdDisplayed(false);
        setLoaded(false);
        setLoading(false);
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
        setError(null);
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

                    {/* Content Area - Full Size */}
                    <View style={styles.contentContainer}>
                        {loading && !loaded && (
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

                        {adDisplayed && (
                            <View style={styles.webViewContainer}>
                                <WebView
                                    ref={webViewRef}
                                    source={{ html: getAdSenseHTML() }}
                                    style={styles.webView}
                                    onMessage={handleWebViewMessage}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    allowsInlineMediaPlayback={true}
                                    mediaPlaybackRequiresUserAction={false}
                                    mixedContentMode="compatibility"
                                    startInLoadingState={true}
                                    renderLoading={() => (
                                        <View style={styles.webViewLoading}>
                                            <ActivityIndicator size="large" color="#007AFF" />
                                        </View>
                                    )}
                                    onLoad={() => console.log('WebView loaded')}
                                    onLoadEnd={() => console.log('WebView load ended')}
                                    onError={(syntheticEvent) => {
                                        const { nativeEvent } = syntheticEvent;
                                        console.error('WebView error: ', nativeEvent);
                                        setError('Failed to load advertisement');
                                        setLoading(false);
                                    }}
                                    onHttpError={(syntheticEvent) => {
                                        const { nativeEvent } = syntheticEvent;
                                        console.error('WebView HTTP error: ', nativeEvent.statusCode);
                                    }}
                                />
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
        width: '100%', // Full width
        height: '100%', // Full height
        backgroundColor: 'white',
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
        top: 40, // Adjust for status bar
        right: 20,
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: 'rgba(240, 240, 240, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        elevation: 5,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#666',
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
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
        flex: 1,
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
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    webViewContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    webView: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
    },
    webViewLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
});

export default AdSenseInterstitialModal;