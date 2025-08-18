import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const signIn = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.Logo}>
        <MaterialCommunityIcons name="text-to-speech" size={50} color="#fff" />
      </View>

      <View style={styles.heading}>
        <Text style={styles.head1}>Let's Get Started!</Text>
        <Text style={styles.head2}>Let's dive into your account</Text>
      </View>

      {/* <View style={styles.btnBox}>
        <TouchableOpacity style={styles.btn}>
          <View style={styles.group}>
            <AntDesign name="google" size={22} color="black" />
            <Text style={styles.groupTxt}> Continue with Google</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn}>
          <View style={styles.group}>
            <AntDesign name="apple1" size={22} color="black" />
            <Text style={styles.groupTxt}> Continue with Apple</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn}>
          <View style={styles.group}>
            <FontAwesome5 name="facebook" size={22} color="#3273F6" />
            <Text style={styles.groupTxt}> Continue with Facebook</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn}>
          <View style={styles.group}>
            <FontAwesome6 name="x-twitter" size={22} color="black" />
            <Text style={styles.groupTxt}> Continue with X</Text>
          </View>
        </TouchableOpacity>
      </View> */}

      <View style={styles.sign}>
        <TouchableOpacity
          style={styles.signbtn}
          onPress={() => {
            router.push("/signUp");
          }}
        >
          <Text style={styles.signTxt}> Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signInbtn}
          onPress={() => {
            router.push("/signIn");
          }}
        >
          <Text style={styles.signInTxt}> Sign In</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.policy}>
        <Text style={styles.policyTxt}>Privacy Policy</Text>
        <Text style={styles.policyTxt}>Terms of Service</Text>
      </View>
    </SafeAreaView>
  );
};

export default signIn;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
  },
  Logo: {
    backgroundColor: "#3273F6",
    borderRadius: 100,
    padding: 10,
  },
  heading: {
    marginTop: 50,
    width: "100%",
  },
  head1: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "600",
  },
  head2: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 10,
    color: "gray",
  },
  btnBox: {
    marginTop: 50,
    gap: 15,
  },
  btn: {
    borderWidth: 1,
    borderRadius: 30,
    width: 300,
    // height: 45,
    padding: 8,

    borderColor: "#eaeaea",
  },
  group: {
    gap: 30,
    flexDirection: "row",
    //  justifyContent: 'center',
    alignItems: "center",
  },
  groupTxt: {
    fontWeight: "600",
    fontSize: 15,
  },
  sign: {
    marginTop: 50,
    gap: 15,
  },
  signbtn: {
    backgroundColor: "#3273F6",
    borderRadius: 30,
    width: 320,
    padding: 12,
  },
  signTxt: {
    color: "#fff",
    textAlign: "center",
    fontSize: 17,
  },
  signInbtn: {
    backgroundColor: "#dde6fa",
    borderRadius: 30,
    width: 320,
    padding: 12,
  },
  signInTxt: {
    color: "#3273F6",
    textAlign: "center",
    fontSize: 17,
  },
  policy: {
    marginTop: 80,
    flexDirection: "row",
    // width: "100%",
    gap: 40,
  },
  policyTxt: {
    fontSize: 13,
    color: "gray",
  },
});
