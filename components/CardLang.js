import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import {  useRouter} from "expo-router";
import Img from "../assets/images/home.png";
const Card = ({ item }) => {
  const { name, Language, $id } = item
  const router = useRouter();

// Format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTitle = (title) => {
    if (!title) return 'Untitled';
    return title.length > 20 ? `${title.slice(0, 27)}...` : title;
  };

  return (
    <TouchableOpacity
      style={styles.Doc}
      onPress={() => {
        if (item.$id) {
          router.push(`/file/${item.$id}`);
        } else {
          console.warn('Document ID is missing');
        }
      }}
    >
      <View style={styles.docImgBox}>
      <Image source={Img} style={styles.docImg} />
      <View style={styles.docTxt}>
        <Text style={styles.docTxtHead}>{formatTitle(title)}</Text>
        <View style={styles.docTxtdate}>
          <Text style={styles.docTxtSmall}>{formatDate(createdAt ||"Dec 20, 2024")}</Text>
            <Text style={styles.docTxtSmall}>{docType}</Text>
        </View>
        </View>
      </View>
      <TouchableOpacity>
        <SimpleLineIcons name="options-vertical" size={18} color="black" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default Card;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    height: "100%",
  },
  Doc: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#f2f3f4",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    marginBottom: 5
  },
  docImgBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: "center",
  },
  docImg: {
    height: 40,
    width: 40,
    borderWidth: 1,
    borderColor: "#b2babb",
    marginRight: 5,
  },
  docTxt: {
    flexDirection: "column",
    gap: 4,
  },
  docTxtHead: {
    fontSize: 12,
    fontWeight: "500",
    paddingRight: 10,
  },
  docTxtdate: {
    flexDirection: "row",
    gap: 20,
  },
  docTxtSmall: {
    fontSize: 11,
    color: "grey",
  },
});
