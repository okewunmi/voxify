import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { createScanDoc, getCurrentUser } from "../../lib/appwrite";
import { Link, router } from "expo-router";
const ScanScreen = () => {
  const cameraRef = useRef(null);
  const flatListRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(null);

  const [images, setImages] = useState([]); // Local state
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [user, setUser] = useState(null);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    (async () => {
      const libPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasMediaLibraryPermission(libPermission.status === "granted");

      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch {
        Alert.alert("Error", "Failed to load user data");
      }
    })();
  }, []);

  const addImage = (uri) => setImages((prev) => [...prev, uri]);
  const clearImages = () => setImages([]);

  const goPrev = () => {
    if (currentIndex > 0) {
      flatListRef.current.scrollToIndex({ index: currentIndex - 1, animated: true });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goNext = () => {
    if (currentIndex < images.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const getItemLayout = (data, index) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  });

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        setScanning(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true,
        });
        addImage(photo.uri);
      } catch (error) {
        Alert.alert("Error", "Failed to take picture: " + error.message);
      } finally {
        setScanning(false);
      }
    }
  };

  const pickFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10,
      });

      if (!result.canceled && result.assets) {
        result.assets.forEach((asset) => addImage(asset.uri));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images: " + error.message);
    }
  };

  const handleContinue = async () => {
  if (!user) return Alert.alert("User not loaded");
  setLoading(true);

  // API keys array - replace dummy keys with your real ones
  const apiKeys = [
    "K85326546888957", 
    "K82071167688957", 
    "K89242712488957"  
  ];

  let currentKeyIndex = 0;
  let requestCount = 0;
  const maxRequestsPerKey = 500;
  let allExtractedTexts = []; // Array to store text from each image
  let processedImages = []; // Array to store URIs of successfully processed images

  try {
    // Process each image individually
    for (let i = 0; i < images.length; i++) {
      const uri = images[i];
      let success = false;
      let attempts = 0;

      // Try each API key if the current one fails
      while (!success && attempts < apiKeys.length) {
        try {
          // Switch to next API key if current one has reached limit
          if (requestCount >= maxRequestsPerKey) {
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
            requestCount = 0;
            console.log(`Switching to API key ${currentKeyIndex + 1}`);
          }

          const formData = new FormData();
          formData.append("apikey", apiKeys[currentKeyIndex]);
          formData.append("language", "eng");
          formData.append("isOverlayRequired", "false");

          // Convert local image to blob
          const imageBlob = {
            uri,
            name: `image_${i}.jpg`,
            type: "image/jpeg",
          };

          formData.append("file", imageBlob);

          console.log(`Processing image ${i + 1}/${images.length} with API key ${currentKeyIndex + 1}`);

          const response = await fetch("https://api.ocr.space/parse/image", {
            method: "POST",
            body: formData,
            headers: {
              Accept: "application/json",
            },
          });

          const result = await response.json();

          // Check for API limit exceeded error
          if (result.OCRExitCode === 6 || (result.ErrorMessage && result.ErrorMessage.includes("limit"))) {
            console.log(`API key ${currentKeyIndex + 1} limit reached, switching to next key`);
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
            requestCount = 0;
            attempts++;
            continue;
          }

          if (
            result &&
            result.ParsedResults &&
            result.ParsedResults.length > 0
          ) {
            const extractedText = result.ParsedResults[0].ParsedText;
            
            if (extractedText && extractedText.trim()) {
              // Store the extracted text and image URI
              allExtractedTexts.push({
                imageIndex: i + 1,
                text: extractedText.trim(),
                uri: uri
              });
              processedImages.push(uri);
              
              console.log(`Successfully extracted text from image ${i + 1}`);
              success = true;
              requestCount++;
            } else {
              console.log(`No text found in image ${i + 1}, but continuing with other images`);
              success = true; // Continue processing other images
              requestCount++;
            }
          } else {
            throw new Error(`Failed to process image ${i + 1}: ${result.ErrorMessage || 'Unknown error'}`);
          }

        } catch (apiError) {
          console.error(`Error with API key ${currentKeyIndex + 1} for image ${i + 1}:`, apiError.message);
          
          // If it's a network error or API limit, try next key
          if (apiError.message.includes("limit") || apiError.message.includes("Network") || attempts === 0) {
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
            requestCount = 0;
            attempts++;
          } else {
            // If it's an image-specific error, skip to next image
            console.log(`Skipping image ${i + 1} due to processing error: ${apiError.message}`);
            break;
          }
        }
      }

      if (!success && attempts >= apiKeys.length) {
        console.error(`Failed to process image ${i + 1} with all API keys`);
      }
    }

    // Merge all extracted texts
    if (allExtractedTexts.length > 0) {
      // Create a combined text with page separators
      const mergedText = allExtractedTexts
        .map(item => `--- Page ${item.imageIndex} ---\n${item.text}`)
        .join('\n\n');

      // Create a single document with all the merged text
      // Use the first image URI as reference, or you could create a combined name
      const firstImageUri = processedImages[0];
      await createScanDoc(user.$id, firstImageUri, mergedText);

      Alert.alert(
        "Success", 
        `${allExtractedTexts.length} images processed and text merged into one document.`
      );
    } else {
      Alert.alert("Warning", "No text could be extracted from any images.");
    }

    clearImages();
    setShowPreview(false);
    router.replace("/library");

  } catch (error) {
    console.error("OCR error", error);
    Alert.alert("Error", "OCR failed: " + error.message);
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    clearImages();
    setShowPreview(false);
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white', textAlign: 'center', marginBottom: 10 }}>
          We need camera permission to continue
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={{ color: 'white' }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!showPreview ? (
        <>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />

          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.controlButton} onPress={pickFromLibrary}>
              <FontAwesome name="photo" size={26} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
              disabled={scanning}
            >
              {scanning ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>

            {images.length > 0 && (
              <TouchableOpacity
                style={styles.previewContainer}
                onPress={() => setShowPreview(true)}
              >
                <Image
                  source={{ uri: images[0] }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                {images.length > 1 && (
                  <View style={styles.imageCountBadge}>
                    <Text style={styles.imageCountText}>{images.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        <>
          {images.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No images to preview</Text>
            </View>
          ) : (
            <>
              <FlatList
                ref={flatListRef}
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.image} resizeMode="contain" />
                )}
                onViewableItemsChanged={onViewableItemsChanged.current}
                viewabilityConfig={viewConfigRef.current}
                getItemLayout={getItemLayout}
              />

              <View style={styles.controls}>
                <TouchableOpacity onPress={goPrev} disabled={currentIndex === 0}>
                  <FontAwesome name="chevron-left" size={24} color={currentIndex === 0 ? '#ccc' : '#000'} />
                </TouchableOpacity>

                <Text style={styles.counter}>{currentIndex + 1} / {images.length}</Text>

                <TouchableOpacity onPress={goNext} disabled={currentIndex === images.length - 1}>
                  <FontAwesome name="chevron-right" size={24} color={currentIndex === images.length - 1 ? '#ccc' : '#000'} />
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.previewActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.continueButton]}
              onPress={handleContinue}
              disabled={loading || images.length === 0}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cecece',
  },
  camera: {
    flex: 1,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  controlButton: {
    padding: 15,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  previewContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageCountBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  permissionButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
  image: {
    width: Dimensions.get('window').width,
    height: '98%',
    backgroundColor: '#fff',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    // borderRadius: 15,
    borderTopStartRadius: 22,
    borderTopEndRadius: 22,
  },
  counter: {
    marginHorizontal: 20,
    fontSize: 16,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
  },
  actionButton: {
    padding: 12,
    borderRadius: 25,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',

  },
  continueButton: {
    backgroundColor: '#0066cc',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});


export default ScanScreen;
