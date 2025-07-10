import {
  StyleSheet,
  Alert,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { createtext, getCurrentUser } from "../../lib/appwrite";
const FileView = () => {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txt, setTxt] = useState("");
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  // Handle Save
  const handleSave = async () => {
    if (!txt.trim()) {
      Alert.alert("Error", " No text to save.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      
      const result = await createtext(txt, user.$id);
      // setForm(result);
      Alert.alert("Success", "Text is save successfully!");
      router.replace("/library");
      return result;
    } catch (error) {
      Alert.alert("Saving text Failed", error.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll}>
        <TextInput
          multiline
          editable
          inputMode="text"
          placeholder="Write or paste your text here..."
          style={styles.inputText}
          value={txt}
          onChangeText={setTxt}
        />
      </ScrollView>
      <TouchableOpacity style={styles.btnBox} onPress={handleSave}>
        <View style={styles.view}>
          <Text style={styles.txt}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              "Save"
            )}
          </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
export default FileView;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    height: "100%",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: -26,
    height: "100%",
  },
  inputText: {
    width: "100%",
    flex: 1,
    padding: 15,
    fontSize: 16,
    fontWeight: "light",
    wordSpacing: 10,
    textAlign: "justify",
  },
  btnBox: {
    alignSelf: "center",
    marginBottom: 25,
    backgroundColor: "#3273F6",
    padding: 15,
    borderRadius: 25,
    width: "90%",
    justifyContent: "center",
  },
  view: {
    alignSelf: "center",
  },
  txt: {
    color: "#fff",
    fontWeight: "bold",
  },
});

