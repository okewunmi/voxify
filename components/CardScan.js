import { Alert, StyleSheet, Text, TouchableOpacity, View, Modal, Pressable, TextInput, Image } from "react-native";
import React, { useState } from "react";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from "expo-router";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { deleteScanDocById, updateWebById } from '../lib/appwrite';

const CardScan = ({ item }) => {
  const [show, setShow] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState(item.link || '');
  const { link, createdAt, $id, docType } = item;
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

  const formatTitle = (link) => {
    if (!link) return 'Scanned Image';
    return link.length > 20 ? `${link.slice(0, 27)}...` : link;
  };

  // 🧹 Deletion Confirmation Dialog
  const handleDelete = () => {
    Alert.alert(
      "Delete Confirmation",
      "Are you sure you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sure",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteScanDocById($id);
              console.log("Deleted successfully");
              setShow(false); // close menu after deletion
            } catch (error) {
              console.error("Failed to delete:", error.message);
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  // ✏️ Rename Title Logic
  const handleRename = async () => {
    try {
      await updateWebById($id, { link: newTitle });
      console.log("Renamed successfully");
      setRenameModalVisible(false);
      setShow(false);
    } catch (error) {
      console.error("Failed to rename:", error.message);
    }
  };

  return (

    <View style={styles.Doc}>
      <TouchableOpacity
        onPress={() => {
          if (item.$id) {
            router.push(`/imgScan/${item.$id}`);
          } else {
            console.warn('Document ID is missing');
          }
        }}
      >
        <View style={styles.docImgBox}>

          <View style={styles.docImg}>
            <AntDesign name="scan1" size={25} color="#3273F6" />
          </View>
          <View style={styles.docTxt}>
            <Text style={styles.docTxtHead}>{formatTitle(link)}</Text>
            <View style={styles.docTxtdate}>
              <Text style={styles.docTxtSmall}>{formatDate(createdAt || "Dec 20, 2024")}</Text>
              <Text style={styles.docTxtSmall}>{docType}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      < TouchableOpacity style={styles.docDot} onPress={() => setShow(!show)}>
        {show ? (<SimpleLineIcons name="close" size={18} color="red" />) : (<SimpleLineIcons name="options-vertical" size={18} color="black" />)}
      </TouchableOpacity>
      {show && (
        <View style={styles.docMenu}>
          <TouchableOpacity style={styles.docMenuItem} onPress={() => setRenameModalVisible(true)}>
            <MaterialIcons name="drive-file-rename-outline" size={20} color="black" />
            <View>
              <Text>Rename</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.docMenuItem, styles.docMenuItemSpace]}>
            <SimpleLineIcons name="star" size={16} color="black" />
            <View>
              <Text> Add to Favourites </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.docMenuItem} onPress={handleDelete}>
            <MaterialIcons name="delete-outline" size={20} color="red" />
            <View>
              <Text style={styles.docMenuItemDel}> Delete </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
      {/* Modal for Rename */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={renameModalVisible}
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: 280 }}>
            <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>Rename Title</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Enter new title"
              style={{ borderColor: '#ccc', borderWidth: 1, padding: 8, borderRadius: 5 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
              <Pressable onPress={() => setRenameModalVisible(false)} style={{ marginRight: 15 }}>
                <Text style={{ color: 'gray' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleRename}>
                <Text style={{ color: '#3273F6', fontWeight: 'bold' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CardScan;

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
    paddingVertical: 8,
    marginBottom: 5,
    position: 'relative',
  },
  docImgBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: "center",
  },
  docImg: {
    height: 48,
    width: 48,
    borderWidth: 1,
    marginRight: 5,
    borderColor: "#dedede",
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 200
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
  docDot: {
    paddingHorizontal: 10,
    zIndex: 11,
  },
  docMenu: {
    position: 'absolute',
    width: 170,
    // height: 130,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    right: 10,
    top: 50,
    justifyContent: 'space-around',
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    // Android Shadow
    elevation: 10,
    zIndex: 20,
  },
  docMenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  docMenuItemSpace: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#cecece',
  },
  docMenuItemDel: {
    color: 'red',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalBox: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalInput: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  modalCancel: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: "#eee",
  },

  modalSave: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: "#3273F6",
  },

});

