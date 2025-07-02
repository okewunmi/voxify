import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import image from "../../assets/images/scan.png";
import { router } from "expo-router";
const into = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.img}>
        <Image source={image} style={styles.image} />
      </View>
      <View style={styles.view}>
        <View style={styles.box}>
          <View style={styles.boxTxt}>
            <Text style={styles.txt}>
              Scan Text from Ebooks, Documents & Web
            </Text>
            <Text style={styles.para}>
              Scan books, convert pdf, import from cloud storage, copy-paste
              text or even convert web pages by entering URL
            </Text>
          </View>
          <View style={styles.boxDot}>
            <View style={styles.dots}></View>
            <View style={styles.dot}></View>
            <View style={styles.dots}></View>
          </View>
          <View style={styles.boxbtn}>
            <TouchableOpacity
              style={[styles.btn, styles.btnGrey]}
              onPress={() => {
                router.push("/signIn");
              }}
            >
              <Text style={styles.btntxt1}> Skip </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnBlue]}
              onPress={() => {
                router.push("/intro3");
              }}
            >
              <Text style={styles.btntxt2}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default into;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    height: "100%",
  },
  view: {
    backgroundColor: "#fff",
    height: "50%",
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
  },

  box: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    backgroundColor: "#fff",
    height: "100%",
  },
  boxTxt: {
    width: "99%",
    marginTop: 10,
  },
  txt: {
    textAlign: "center",
    fontSize: 27,
    lineHeight: 35,
    fontWeight: "700",
  },
  para: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 15,
    lineHeight: 23,
    color: "grey",
  },
  boxDot: {
    gap: 7,
    marginTop: 20,
    flexDirection: "row",
  },
  dot: {
    height: 6,
    width: 30,
    borderRadius: 20,
    backgroundColor: "#3273F6",
  },
  img: {
    width: "85%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    margin: 30,
    borderRadius: 30,
    borderWidth: 3,
    zIndex: 100,
  },
  image: {
    width: "100%",
    height: "100%",
    // width: ,
    // height: 625,
    objectFit: "fill",
    borderRadius: 26,
  },
  dots: {
    height: 6,
    width: 10,
    borderRadius: 20,
    backgroundColor: "#cccc",
  },
  boxbtn: {
    marginTop: 85,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    width: "99%",
  },
  btn: {
    // padding: 13,
    width: 150,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
    //  backgroundColor: '#3273F6',
  },
  btntxt1: {
    color: "#3273F6",
    fontSize: 16,
  },
  btntxt2: {
    color: "#fff",
    fontSize: 16,
  },
  btnGrey: {
    backgroundColor: "#eeee",
  },
  btnBlue: {
    backgroundColor: "#3273F6",
  },
});
