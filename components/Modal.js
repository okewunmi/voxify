import React from 'react';
import { StyleSheet, View, Modal } from 'react-native';

const Modal = () => {
    return (
        <View>
            
        </View>
    );
}

const styles = StyleSheet.create({
modalOverlay: {
    flex: 1,
    height: '100%',
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",

  },
  modalOverlaySummary: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    // height: "35%",
    minHeight: '35%',
    alignItems: 'center'
  },
  modalContentSummary: {
    width: 180,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,

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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#cecece',
    width: '100%',
    textAlign: 'center',
    paddingBottom: 15

  },
  modalTxt: {
    fontSize: 14,
  },
  modalBtns: {
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
    marginTop: 20
  },
  summaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderColor: '#cecece',
    borderWidth: 1,
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 10

  },
  summaryText: {
    color: "black",
    fontSize: 14,
    fontWeight: "bold",

  },
  summaryView: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  closeButton: {
    marginVertical: 5,
    alignSelf: 'flex-end'

  },
  closeText: {
    color: "blue",
  },
  language:{
     flexDirection: 'column',
     width: '100%',
     paddingHorizontal: 20,
     gap: 10,
     alignItems: 'center',
  },
  languageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  
    },
    label: {
      width: 50,
      fontSize: 14,
      fontWeight: 'bold'
    },
    pickerContainer: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#3273F6',
      borderRadius: 8,
     
    },
    picker: {
      width: '100%',
      height: 50,
     alignItems: 'center',
  
    },
    TranslateBtns:{
      gap: 20,
      flexDirection: 'row',
      marginTop: 10,
     marginLeft: 40
    },
    TranslateBtn:{
      borderRadius: 30,
      paddingVertical: 10,
      paddingHorizontal: 25,
      backgroundColor: '#3273F6',
    },
    TranslateBtnTxt:{
    color: '#fff'
    }
})

export default Modal;
