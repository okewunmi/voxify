import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGlobalContext } from "../../context/GlobalProvider"; // adjust path if needed

const Ai = () => {
  


  return (
    <SafeAreaView style={styles.safe} >
     

    </SafeAreaView>

  );
};

export default Ai;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    height: "100%",
    // backgroundColor: "#ebf5fb",
    backgroundColor: "#E1EBEE",
    paddingVertical: 20,
    paddingHorizontal: 15,
    gap: 15,
  },
  

});
