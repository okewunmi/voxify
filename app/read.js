import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const into = () => {
  return (
    <SafeAreaView style={styles.safe}>
        <View style={styles.boxTxt}>
          <Text style={styles.txt}> Transform Text into Speech with AI</Text>
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
  
});
