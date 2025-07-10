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

    try {
      for (const uri of images) {
        const formData = new FormData();
        formData.append("apikey", "K85326546888957");
        formData.append("language", "eng");
        formData.append("isOverlayRequired", "false");

        // Convert local image to blob
        const imageBlob = {
          uri,
          name: "image.jpg",
          type: "image/jpeg",
        };

        formData.append("file", imageBlob);

        const response = await fetch("https://api.ocr.space/parse/image", {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        const result = await response.json();

        if (
          result &&
          result.ParsedResults &&
          result.ParsedResults.length > 0
        ) {
          const extractedText = result.ParsedResults[0].ParsedText;
          await createScanDoc(user.$id, uri, extractedText.trim());
        } else {
          throw new Error("No text found in image.");
        }
      }

      Alert.alert("Success", "Images processed and saved.");
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
    backgroundColor: 'black',
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
    height: '80%',
    backgroundColor: '#fff',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
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
    padding: 15,
    borderRadius: 8,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default ScanScreen;
