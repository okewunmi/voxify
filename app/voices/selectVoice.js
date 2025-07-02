import { StyleSheet, Text, TouchableOpacity, View, Image, FlatList } from "react-native";
import React, { useState } from "react";

const DATA = [
  { id: "1", title: "All" },
  { id: "2", title: "English" },
  { id: "3", title: "Yoruba" },
  { id: "4", title: "Hausa" },
  { id: "5", title: "Igbo" },
];

const VOICE_DATA = {
  '1': [
    ...['zainab', 'jude', 'tayo', 'remi', 'idera', 'regina', 'chinenye', 'umar', 'osagie', 'joke', 'emma'],
    ...['hausa_female1', 'hausa_female2', 'hausa_male1', 'hausa_male2'],
    ...['igbo_female1', 'igbo_female2', 'igbo_male2'],
    ...['yoruba_female1', 'yoruba_female2', 'yoruba_male2']
  ],
  '2': ['zainab', 'jude', 'tayo', 'remi', 'idera', 'regina', 'chinenye', 'umar', 'osagie', 'joke', 'emma'],
  '3': ['yoruba_female1', 'yoruba_female2', 'yoruba_male2'],
  '4': ['hausa_female1', 'hausa_female2', 'hausa_male1', 'hausa_male2'],
  '5': ['igbo_female1', 'igbo_female2', 'igbo_male2']
};

const Item = ({ item, onPress, backgroundColor, textColor }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.scrollBtn, { backgroundColor }]}
  >
    <Text style={[styles.scrollTxt, { color: textColor }]}>{item.title}</Text>
  </TouchableOpacity>
);
// import Pic from '../assets/images/profile.jpg'
import Img from "../../assets/images/profile.jpg";
const VoiceCard = ({ name, isSelected, onPress }) => (
  <TouchableOpacity 
    style={[styles.card, isSelected && styles.selectedCard]}
    onPress={onPress}
  >
    <Image 
      source={require('../../assets/images/profile.jpg')}
      style={styles.voiceImage}
    />
    <Text style={styles.voiceName}>{name}</Text>
    {isSelected && <View style={styles.selectionIndicator} />}
  </TouchableOpacity>
);

const Voice = ({ item }) => {
  const [selectedId, setSelectedId] = useState('1');
  const [selectedVoice, setSelectedVoice] = useState(null);

  const handleLanguageChange = (id) => {
    setSelectedId(id);
    setSelectedVoice(null); // Reset voice selection when language changes
  };

  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedId ? "#3273F6" : "#fff";
    const color = item.id === selectedId ? "white" : "black";

    return (
      <Item
        item={item}
        onPress={() => handleLanguageChange(item.id)}
        backgroundColor={backgroundColor}
        textColor={color}
      />
    );
  };

  return (
    <View style={styles.view}>
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
        showsHorizontalScrollIndicator={false}
        horizontal
      />
      
      <FlatList
        data={VOICE_DATA[selectedId]}
        renderItem={({ item }) => (
          <VoiceCard 
            name={item}
            isSelected={selectedVoice === item}
            onPress={() => {
              setSelectedVoice(item);
              console.log("Selected Voice:", item); // You can use this value as needed
            }}
          />

        )}
        keyExtractor={(item) => item}
        numColumns={3}
        contentContainerStyle={styles.voicesFlatList}
        columnWrapperStyle={styles.columnWrapper}
        style={styles.flatVoice} 
      />
    
    </View>
  );
};

export default Voice;

const styles = StyleSheet.create({
  view :{
    height: "100%",
    flex: 1,
    backgroundColor: '#fff',
  
  },
  ViewHead:{
  justifyContent: 'center',
  alignItems: 'center',
  },
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
  flatList:{
    padding: 20,
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  selectedCard: {
    borderColor: '#3273F6',
    borderWidth: 2,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3273F6',
  },
  voiceImage: {
    width: 45,
    height: 45,
    borderRadius: 30,
    marginBottom: 8,
  },
  voiceName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  voicesFlatList:{
    // paddingVertical: 20,
    paddingHorizontal: 6,
    justifyContent: "flex-start",
    paddingBottom: 20 
  },
  columnWrapper: {
     
    
  },
  flatVoice: {
    flexGrow: 1,
  }
});