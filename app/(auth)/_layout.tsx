import React from "react";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useGlobalContext } from "../../context/GlobalProvider";

const Layout = () => {
  const { loading, isLogged } = useGlobalContext();

  if (!loading && isLogged) return <Redirect href="/home" />;

  return (
    <>
      <Stack screenOptions={{
        contentStyle: { backgroundColor: "#3273F6" }, // Set background color
      }}>
        <Stack.Screen name="forgetPwd" options={{ headerShown: true, headerTitle: '' }} />
        <Stack.Screen name="intro1" options={{ headerShown: false }} />
        <Stack.Screen name="intro2" options={{ headerShown: false }} />
        <Stack.Screen name="intro3" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="signIn" options={{ headerBackVisible: true, headerTitle: '' }} />
        <Stack.Screen name="signUp" options={{ headerBackVisible: true, headerTitle: '' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
};

export default Layout;
