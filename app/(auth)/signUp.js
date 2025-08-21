import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Checkbox from "expo-checkbox";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router, Link } from "expo-router";
// Import signIn and signUp functions from your API or library
import { createUser } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const signUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isChecked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
  });

  // Handle Sign Up
  const handleSignUp = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", " All fields are required.");
      return;
    }
    const { email, password, username } = form;
    setIsSubmitting(true);
    try {
      const result = await createUser(email, password, username);
      // const user = result.user;
      setUser(result);
      setIsLogged(true);
      Alert.alert("Success", "Account created successfully!");
      router.replace("/signIn");
      return result;
    } catch (error) {
      Alert.alert("Sign Up Failed", error.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.view}>
        <Text style={styles.heading}>Join Voxify Today </Text>
        <Text style={styles.txt}>
          Sign up to unlock the full power of Voxify
        </Text>
      </View>

      <View style={styles.inputBox}>

        <View style={styles.Box}>
          <Text style={styles.label}>Email </Text>
          <View style={styles.touchInput}>
            <MaterialCommunityIcons
              name="email-outline"
              size={22}
              color="black"
            />
            <TextInput
              placeholder="Email"
              // keyboardType="email-address"
              style={styles.input}
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
            />
          </View>
        </View>

        <View style={styles.Box}>
          <Text style={styles.label}>Password </Text>
          <View style={styles.touchInput}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={22}
              color="black"
            />
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              style={styles.input}
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.Box}>
          <Text style={styles.label}>Usename </Text>
          <View style={styles.touchInput}>
            <MaterialCommunityIcons
              name="email-outline"
              size={22}
              color="black"
            />
            <TextInput
              placeholder="Username"
              // keyboardType="email-address"
              style={styles.input}
              value={form.username}
              onChangeText={(text) => setForm({ ...form, username: text })}
            />
          </View>
        </View>

        <View style={styles.boxprivacy}>
          <Checkbox
            style={styles.checkbox}
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? "" : "#3273F6"}
          />
          <Text style={styles.privacy}>I agreed to Voxify </Text>
          <Link href="" style={styles.privacy2}>
            Terms & Conditions.{" "}
          </Link>
        </View>
        <View style={styles.boxsignIn}>
          <Text style={styles.privacy}>Already have an account? </Text>
          <Link href="/signIn" style={styles.privacy2}>
            Sign in{" "}
          </Link>
        </View>

        <View style={styles.other}>
          <View style={styles.line}></View>
          {/* <Text style={styles.othertext}>or continue with</Text> */}
        </View>
      </View>

      {/* <View style={styles.icons}>
        <TouchableOpacity style={styles.icon}>
          <View style={styles.group}>
            <AntDesign name="google" size={22} color="black" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon}>
          <View style={styles.group}>
            <AntDesign name="apple1" size={22} color="black" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon}>
          <View style={styles.group}>
            <FontAwesome5 name="facebook" size={22} color="#3273F6" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon}>
          <View style={styles.group}>
            <FontAwesome6 name="x-twitter" size={22} color="black" />
          </View>
        </TouchableOpacity>
      </View> */}
      
      <View style={styles.sign}>
        <TouchableOpacity
          style={styles.signbtn}
          onPress={handleSignUp}
          disabled={isSubmitting}
        >
          <Text style={styles.signTxt}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              "Sign up"
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default signUp;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    paddingHorizontal: 20,

  },
  view: {
    justifyContent: "flex-start",
    width: "100%",
  },
  heading: {
    fontSize: 27,
    fontWeight: "bold",
    textAlign: "left",
  },
  txt: {
    fontSize: 15,
    marginTop: 8,
    color: "grey",
  },
  privacy: {
    fontSize: 14,
    color: "#17202a",
    gap: 30,
  },
  signbtn: {
    backgroundColor: "#3273F6",
    borderRadius: 30,
    width: 320,
    padding: 12,
    marginTop: 50,
  },
  signTxt: {
    color: "#fff",
    textAlign: "center",
    fontSize: 17,
  },

  inputBox: {
    marginTop: 20,
    gap: 22,
    color: "#000",
  },
  Box: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  touchInput: {
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#ecf0f1",
    flexDirection: "row",
    gap: 5,
    height: 40,
    alignItems: "center",
    // justifyContent: "space-between"
  },
  input: {
    height: 40,
    width: "80%",
    color: "#000"
  },
  boxprivacy: {
    flexDirection: "row",
    gap: 40
  },
  boxsignIn: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: -2,
    gap: 20
  },
  checkbox: {
    marginRight: 15,
  },
  privacy2: {
    color: "#3273F6",
    fontSize: 14,
   
  },
  other: {
    marginTop: 30,
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  othertext: {
    color: "grey",
    paddingHorizontal: 8,
    fontSize: 18,
    marginTop: -15,
    backgroundColor: "#fff",
  },
  line: {
    borderBottomWidth: 2,
    borderColor: "#ecf0f1",
    width: "100%",
  },
  icons: {
    marginTop: 20,
    flexDirection: "row",
    gap: 10,

    justifyContent: "center",
  },
  icon: {
    borderWidth: 1.5,
    borderColor: "#ecf0f1",
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
});
