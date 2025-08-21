// import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
// import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
// import { SafeAreaView } from "react-native-safe-area-context";
// import React from "react";
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import { useGlobalContext } from "../../context/GlobalProvider"; // adjust path if needed
// import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// import { signOut, getAccount } from "../../lib/appwrite";
// import ProductionBannerAd from "../../components/BannerAd";
// const profile = () => {
//   const { setIsLogged, setUser, user } = useGlobalContext();

//   const handleLogout = async () => {
//     try {
//       // Only attempt signOut without calling getAccount() first
//       await signOut();
//       setUser(null);
//       setIsLogged(false);
//     } catch (error) {
//       console.log("Logout failed:", error.message);
//       setUser(null);
//       setIsLogged(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <View style={styles.top}>
//         <View style={styles.Logo}>
//           <MaterialCommunityIcons
//             name="text-to-speech"
//             size={20}
//             color="#fff"
//           />
//         </View>
//         <Text style={styles.head}>Account</Text>
//         <TouchableOpacity>
//           <SimpleLineIcons name="options-vertical" size={18} color="black" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.preview}>
//         <View style={[styles.imgBox]}>
//           <FontAwesome6 name="crown" size={28} color="#f7b401" />
//         </View>
//         <TouchableOpacity style={styles.txtBox}>
//           <Text style={styles.heading}>Upgrade Plan Now!</Text>
//           <Text style={styles.txt}>
//             Enjoy all the benefits and explore posibilities
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.person}>
//         {/* <View style={styles.personPic}>
//           <Image source={image} style={styles.img} />
//         </View> */}
//         <Image
//           source={require("../../assets/images/profile.jpg")}
//           style={styles.personPic}
//         />
//         <View style={styles.txtBox}>
//           <Text style={styles.heading2}>{user.username || "User"}</Text>
//           <Text style={styles.txt2}>
//             {user.email || "OkewunmiAfeezOlaide@gmail.com"}
//           </Text>
//         </View>
//         <TouchableOpacity>
//           <MaterialIcons name="arrow-forward-ios" size={24} color="grey" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.card}>
//         <TouchableOpacity style={styles.logout}>
//           <MaterialIcons name="security" size={24} color="black" />
//           <View>
//             <Text style={styles.heading2}>Account & Security</Text>
//           </View>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.logout}>
//           <MaterialIcons name="subscriptions" size={24} />
//           <View>
//             <Text style={styles.heading2}>Billing & Subcriptions</Text>
//           </View>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.logout}>
//           <MaterialIcons name="credit-card" size={24} />
//           <View>
//             <Text style={styles.heading2}>Payment Methods</Text>
//           </View>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.logout}>
//           <MaterialIcons name="merge" size={24} color="black" />
//           <View>
//             <Text style={styles.heading2}>Linked Accounts</Text>
//           </View>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.logout}>
//           <MaterialIcons name="remove-red-eye" size={24} color="black" />
//           <View>
//             <Text style={styles.heading2}>App Apperance</Text>
//           </View>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.logout}>
//           <MaterialIcons name="logout" size={24} />
//           <View>
//             <Text style={styles.heading2}>Help & Support</Text>
//           </View>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.logout}>
//           <MaterialIcons name="star" size={24} />
//           <View>
//             <Text style={styles.heading2}>Rate Us</Text>
//           </View>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.logout}>
//           <MaterialIcons name="call" size={24} />
//           <View>
//             <Text style={styles.heading2}>Contact Developer</Text>
//           </View>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.logout} onPress={handleLogout}>
//           <MaterialIcons name="logout" size={24} color="red" />
//           <View>
//             <Text style={styles.red}>Logout</Text>
//           </View>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default profile;

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     alignItems: "center",
//     height: "100%",
//     backgroundColor: "#E1EBEE",
//     paddingVertical: 20,
//     paddingHorizontal: 12,
//     gap: 12,
//   },
//   top: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: "100%",
//     marginBottom: 10,

//     // height: 20,
//     alignItems: "center",
//   },
//   head: {
//     fontSize: 20,
//     fontWeight: "700",
//   },
//   Logo: {
//     backgroundColor: "#3273F6",
//     borderRadius: 100,
//     padding: 5,
//   },
//   preview: {
//     borderRadius: 10,
//     width: "100%",
//     height: 80,
//     backgroundColor: "#3273F6",
//     flexDirection: "row",
//     // justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 15,
//     gap: 15,

//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 10,
//   },
//   ads: {
//     position: "absolute",
//     top: 110,
//     zIndex: -10,
//   },
//   imgBox: {
//     borderRadius: 100,
//     height: 45,
//     width: 45,
//     backgroundColor: "#ffff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   txtBox: {
//     justifyContent: "center",
//     alignContent: "flex-start",
//     // width: '5%',
//     height: "100%",
//     gap: 5,
//     marginLeft: -10,
//   },
//   heading: {
//     fontWeight: "900",
//     fontSize: 16,
//     color: "#fff",
//   },
//   heading2: {
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   txt: {
//     fontSize: 12,
//     // color: "#dedede",
//     color: "#eeee",
//   },
//   txt2: {
//     fontSize: 13,
//     marginTop: -4,
//     // marginLeft: -85,
//     fontWeight: "500",
//   },
//   person: {
//     backgroundColor: "#ffff",
//     height: 80,
//     borderRadius: 8,
//     width: "100%",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 10,
//     gap: 5,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,

//     // Android Shadow
//     elevation: 10,
//   },
//   personPic: {
//     borderRadius: 100,
//     height: 55,
//     width: 55,
//     objectFit: "cover",
//   },
//   card: {
//     width: "100%",
//     padding: 20,
//     // minHeight: 70,
//     height: 435,
//     justifyContent: "space-between",
//     // gap: 20,
//     backgroundColor: "#ffff",
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.5,
//     shadowRadius: 3.84,

//     // Android Shadow
//     elevation: 10,
//   },
//   logout: {
//     flexDirection: "row",
//     gap: 15,
//     alignItems: "center",
//   },
//   red: {
//     fontWeight: "bold",
//     color: "red",
//     fontSize: 14,
//   },
// });


import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useGlobalContext } from "../../context/GlobalProvider"; // adjust path if needed
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { signOut, getAccount } from "../../lib/appwrite";
import ProductionBannerAd from "../../components/BannerAd";

const profile = () => {
  const { setIsLogged, setUser, user } = useGlobalContext();

  const handleLogout = async () => {
    try {
      // Only attempt signOut without calling getAccount() first
      await signOut();
      setUser(null);
      setIsLogged(false);
    } catch (error) {
      console.log("Logout failed:", error.message);
      setUser(null);
      setIsLogged(false);
    }
  };

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
        <Text style={styles.head}>Account</Text>
        <TouchableOpacity>
          <SimpleLineIcons name="options-vertical" size={18} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.preview}>
        <View style={[styles.imgBox]}>
          <FontAwesome6 name="crown" size={28} color="#f7b401" />
        </View>
        <TouchableOpacity style={styles.txtBox}>
          <Text style={styles.heading}>Upgrade Plan Now!</Text>
          <Text style={styles.txt}>
            Enjoy all the benefits and explore posibilities
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.person}>
        {/* Use avatar from user object or fallback to default image */}
        {user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.personPic}
            onError={() => {
              console.log("Avatar failed to load, using fallback");
              // You could set a fallback avatar here or handle the error
            }}
          />
        ) : (
          <Image
            source={require("../../assets/images/profile.jpg")}
            style={styles.personPic}
          />
        )}
        
        <View style={styles.txtBox}>
          <Text style={styles.heading2}>{user?.username || "User"}</Text>
          <Text style={styles.txt2}>
            {user?.email || "your@gmail.com"}
          </Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="arrow-forward-ios" size={24} color="grey" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.logout}>
          <MaterialIcons name="security" size={24} color="black" />
          <View>
            <Text style={styles.heading2}>Account & Security</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout}>
          <MaterialIcons name="subscriptions" size={24} />
          <View>
            <Text style={styles.heading2}>Billing & Subcriptions</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout}>
          <MaterialIcons name="credit-card" size={24} />
          <View>
            <Text style={styles.heading2}>Payment Methods</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout}>
          <MaterialIcons name="merge" size={24} color="black" />
          <View>
            <Text style={styles.heading2}>Linked Accounts</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout}>
          <MaterialIcons name="remove-red-eye" size={24} color="black" />
          <View>
            <Text style={styles.heading2}>App Apperance</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout}>
          <MaterialIcons name="logout" size={24} />
          <View>
            <Text style={styles.heading2}>Help & Support</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout}>
          <MaterialIcons name="star" size={24} />
          <View>
            <Text style={styles.heading2}>Rate Us</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout}>
          <MaterialIcons name="call" size={24} />
          <View>
            <Text style={styles.heading2}>Contact Developer</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="red" />
          <View>
            <Text style={styles.red}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default profile;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    backgroundColor: "#E1EBEE",
    paddingVertical: 20,
    paddingHorizontal: 12,
    gap: 12,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
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
  preview: {
    borderRadius: 10,
    width: "100%",
    height: 80,
    backgroundColor: "#3273F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  ads: {
    position: "absolute",
    top: 110,
    zIndex: -10,
  },
  imgBox: {
    borderRadius: 100,
    height: 45,
    width: 45,
    backgroundColor: "#ffff",
    alignItems: "center",
    justifyContent: "center",
  },
  txtBox: {
    justifyContent: "center",
    alignContent: "flex-start",
    height: "100%",
    gap: 5,
    marginLeft: -10,
  },
  heading: {
    fontWeight: "900",
    fontSize: 16,
    color: "#fff",
  },
  heading2: {
    fontSize: 14,
    fontWeight: "600",
  },
  txt: {
    fontSize: 12,
    color: "#eeee",
  },
  txt2: {
    fontSize: 13,
    marginTop: -4,
    fontWeight: "500",
  },
  person: {
    backgroundColor: "#ffff",
    height: 80,
    borderRadius: 8,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    gap: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  personPic: {
    borderRadius: 100,
    height: 55,
    width: 55,
    objectFit: "cover",
  },
  card: {
    width: "100%",
    padding: 20,
    height: 435,
    justifyContent: "space-between",
    backgroundColor: "#ffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 10,
  },
  logout: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
  red: {
    fontWeight: "bold",
    color: "red",
    fontSize: 14,
  },
});