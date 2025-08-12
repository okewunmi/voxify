import React, { useEffect, useCallback } from "react";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import GlobalProvider, { useGlobalContext } from "../context/GlobalProvider";
import { TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import mobileAds from "react-native-google-mobile-ads";
// Prevent auto hiding of splash screen
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    regular: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || error) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
    }
  }, [error]);

  if (!fontsLoaded && !error) {
    return null; // Keep showing splash screen
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <GlobalProvider>
        <Stack
          screenOptions={{
            title: "",
            headerStyle: {
              backgroundColor: "#fff",
            },
            headerTintColor: "#000",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="file/[fileId]" options={{ headerShown: false }} />
          <Stack.Screen name="txt/[txtId]" options={{ headerShown: false }} />
          <Stack.Screen name="type/typing" options={{ headerShown: false }} />
          <Stack.Screen name="url/[urlId]" options={{ headerShown: false }} />
          <Stack.Screen
            name="imgScan/[scanId]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="scan/scanpage" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </GlobalProvider>
    </View>
  );
};

export default RootLayout;
