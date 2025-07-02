import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
    Text,
    View,
  Button,
} from "react-native";
import { scanPhoto, getCurrentUser } from '../../lib/appwrite';
import { CameraView, Camera, useCameraPermissions  } from 'expo-camera';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
const CameraPreview = () => {
    const cameraRef = useRef(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  
    
    if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Camera permission required</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }
const handleScan = async () => {
    if (!cameraRef.current) return;
    
    try {
      const result = await scanPhoto(user.$id);
        Alert.alert("Success", "Text extracted and saved!");
        return result;
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };
     useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await getCurrentUser(); // Verify this function's behavior
        // console.log("Current User:", currentUser); // Log for debugging
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setUploading(false);
      }
    };
    getUser();
     }, []);
    
    
  return (
    <CameraView
      ref={cameraRef}
      style={StyleSheet.absoluteFill}
      facing="back"
      mode="picture"
    >
      {/* <TouchableOpacity  
        onPress={handleScan}
      > */}
        <View style={styles.scanButtonContainer}>
        <Button 
          title="Scan Document" 
          onPress={() => handleScan} 
        />
      </View>
        
      {/* </TouchableOpacity> */}
    </CameraView>
  );
};
export default CameraPreview

const styles = StyleSheet.create({
    icon2: {
        padding: 10,
        backgroundColor: "#d4ac0d",
        borderRadius: 100,
    },
    iconTxt: {
        fontWeight: "bold",
        fontSize: 12,
    },
})