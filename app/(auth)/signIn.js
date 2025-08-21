import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Checkbox from "expo-checkbox";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";
import { getCurrentUser, signIn, signOut } from "../../lib/appwrite";
import { router, Link } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";

const SignIn = () => {
  const [isChecked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmting, setIssubmtting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { setUser, setIsLogged } = useGlobalContext();


  const submit = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in both email and password fields.");
      return;
    }

    setIssubmtting(true);

    try {
      // Step 1: Sign out existing session if any
      try {
        await signOut(); // from lib/appwrite.js
      } catch (err) {
        console.log("No active session to sign out or signOut failed:", err.message);
      }

      // Step 2: Sign in the user
      await signIn(form.email, form.password);

      // Step 3: Confirm the session by retrieving the current user document
      const result = await getCurrentUser();

      // Step 4: Proceed only if user account is successfully retrieved
      if (result) {
        setUser(result);
        setIsLogged(true);
        Alert.alert("Success", "User signed in successfully");
        router.replace("/home");
      } else {
        throw new Error("User session could not be verified.");
      }

    } catch (error) {
      Alert.alert(
        "Login Failed",
        error.message || "An error occurred. Please try again."
      );
    } finally {
      setIssubmtting(false);
    }
  };


  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.view}>
        <Text style={styles.heading}>Welcome Back! </Text>
        <Text style={styles.txt}>
          Access your saved conversions, and continue where you left off.
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
              keyboardType="email-address"
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
        <View style={styles.boxprivacy}>
          <Checkbox
            style={styles.checkbox}
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? "" : "#3273F6"}
          />
          <Text style={styles.privacy}>Remember me   </Text>
          <Link href="" style={styles.privacy2} onPress={() => {
            router.push("/forgetPwd");
          }}>
            Forgot Password?
          </Link>
        </View>
        <View style={styles.boxsignIn}>
          <Text style={styles.privacy}>Dont't have an account? </Text>
          <Link href="/signUp" style={styles.privacy2}>
            Sign up
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
          onPress={submit}
          disabled={isSubmitting}
        >
          <Text style={styles.signTxt}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              "Sign in"
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    paddingHorizontal: 22,
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
    marginTop: 12,
    color: "grey",
  },
  privacy: {
    fontSize: 14,
    color: "#17202a",
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
    marginTop: 40,
    gap: 22,
    color: "#000"
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
    height: 44,
    alignItems: "center",
    // justifyContent: "space-between"
  },
  input: {
    height: 44,
    width: "80%",
    color: '#000'
  },
  boxprivacy: {
    flexDirection: "row",
    gap: 40
  },
  boxsignIn: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: -2,
    gap: 20,
  },
  checkbox: {
    marginRight: 10,
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
