
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCurrentUser,
  getAllUserContent,
} from "../../lib/appwrite";

import Card from "../../components/Card";
import CardTxt from "../../components/CardTxt";
import CardWeb from "../../components/CardWeb";
import CardScan from "../../components/CardScan";

const DATA = [
  { id: "1", title: "All" },
  { id: "2", title: "Documents" },
  { id: "3", title: "Scan" },
  { id: "4", title: "Text" },
  { id: "5", title: "Web URL" },
];

const Item = ({ item, onPress, backgroundColor, textColor }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.scrollBtn, { backgroundColor }]}
  >
    <Text style={[styles.scrollTxt, { color: textColor }]}>{item.title}</Text>
  </TouchableOpacity>
);

const Library = () => {
  const [selectedId, setSelectedId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [cachedDocuments, setCachedDocuments] = useState(null);
  const [content, setContent] = useState([]);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedId ? "#3273F6" : "#fff";
    const color = item.id === selectedId ? "white" : "black";

    return (
      <Item
        item={item}
        onPress={() => setSelectedId(item.id)}
        backgroundColor={backgroundColor}
        textColor={color}
      />
    );
  };

  const renderItems = ({ item }) => {
    switch (item.docType) {
      case "Document":
        return <Card item={item} />;
      case "Text":
        return <CardTxt item={item} />;
      case "Web":
        return <CardWeb item={item} />;
        case "Scan":
        return <CardScan item={item} />;
      default:
        return null;
    }
  };

  // Load cached data on initial mount
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cached = await AsyncStorage.getItem('documents');
        if (cached) {
          setCachedDocuments(JSON.parse(cached));
          setDocuments(JSON.parse(cached));
        }
      } catch (error) {
        console.error('Error loading cached data:', error);
      }
    };
    
    loadCachedData();
  }, []);

  // Initialize data and fetch user/documents
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const allContent = await getAllUserContent(currentUser.$id);
          setDocuments(allContent);
          // Cache the new data
          await AsyncStorage.setItem('documents', JSON.stringify(allContent));
        }
      } catch (error) {
        setError('Failed to load content');
        Alert.alert("Error", "Failed to load content");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const fetchDocuments = async () => {
    setError(null);
    try {
      const allContent = await getAllUserContent(user.$id);
      setDocuments(allContent);
      await AsyncStorage.setItem('documents', JSON.stringify(allContent));
    } catch (error) {
      setError('Failed to fetch documents');
      Alert.alert("Error", "Failed to fetch documents");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3273F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <View style={styles.Logo}>
          <MaterialCommunityIcons
            name="text-to-speech"
            size={20}
            color="#fff"
          />
        </View>
        <Text style={styles.head}>Library</Text>
        <TouchableOpacity>
          <Feather name="search" size={28} color="black" />
        </TouchableOpacity>
      </View>
      
      <View>
        <View style={styles.topBtn}>
          <TouchableOpacity style={[styles.btn, styles.btnBlue]}>
            <Text style={[styles.btnTxt, styles.btnTxt1]}>Files</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnGrey]}>
            <Text style={[styles.btnTxt, styles.btnTxt2]}>Favourites</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recentDoc}>
        <FlatList
          data={documents}
          renderItem={renderItems}
          keyExtractor={(item) => item.$id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          style={styles.flatList}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      </View>
    </SafeAreaView>
  );
};

export default Library;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    height: "100%",
    backgroundColor: "#fff",
    paddingVertical: 25,
    paddingHorizontal: 15,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  head: {
    fontSize: 20,
    fontWeight: "700",
  },
  Logo: {
    backgroundColor: "#3273F6",
    borderRadius: 100,
    padding: 5,
  },
  topBtn: {
    marginVertical: 20,
    width: "100%",
    flexDirection: "row",
    height: 40,
  },
  btn: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    borderRadius: 6,
  },
  btnBlue: {
    backgroundColor: "#3273F6",
  },
  btnGrey: {
    backgroundColor: "#dedede",
  },
  btnTxt: {
    textAlign: "center",
    fontWeight: "black",
  },
  btnTxt1: {
    color: "#fff",
  },
  btnTxt2: {
    color: "#000",
  },
  // scroll: {
  //   height: 50,
  //   marginBottom:50
  // },
  scrollBtn: {
    paddingVertical: 8,
    paddingHorizontal: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dedede",
    height: 35,
    borderRadius: 20,
    marginRight: 10,
  },
  scrollTxt: {
    fontSize: 13,
    color: "#000",
    height: "100%",
    fontWeight: "bold",
  },
  recentDoc: {
    width: "100%",
    alignItems: "center",
  },
  flatList: {},
  flatListContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
