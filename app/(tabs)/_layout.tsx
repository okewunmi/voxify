import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import Feather from '@expo/vector-icons/Ionicons';
import Foundation from '@expo/vector-icons/Foundation';
import Fontisto from '@expo/vector-icons/Fontisto';
import { IconSymbol } from '@/components/ui/IconSymbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import Entypo from '@expo/vector-icons/Entypo';
import { useGlobalContext } from '../../context/GlobalProvider';
import { StyleSheet } from 'react-native';

const TabLayout = () => {
  // const { loading, isLogged } = useGlobalContext();
  const { loading = true, isLogged = false } = useGlobalContext() ?? {};

  if (!loading && !isLogged) return <Redirect href="/signIn" />;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#3273F6',
          tabBarInactiveTintColor: '#9E9898',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            paddingTop: 5,
            height: 70,
            borderTopWidth: 1,
            borderColor: '#E0E0E0',
            elevation: 0,
            paddingBottom: 15,
            width: '100%',
            alignSelf: 'center',
            justifyContent: 'center',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <Foundation
                name={'home'}
                size={focused ? 30 : 25}
                color={focused ? '#3273F6' : '#9E9898'}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',

            tabBarIcon: ({ focused }) => (
              <Entypo
                name={'text-document'}
                size={focused ? 30 : 25}
                color={focused ? '#3273F6' : '#9E9898'}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => (
              <Feather
                name={'person'}
                size={focused ? 30 : 25}
                color={focused ? '#3273F6' : '#9E9898'}
              />
            ),
          }}
        />
      </Tabs>

      <StatusBar style="dark" />
    </>
  );
};

export default TabLayout;
