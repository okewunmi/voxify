// import {
//   StyleSheet,
//   Text,
//   View,
//   ActivityIndicator,
//   Alert,
//   TextInput,
//   TouchableOpacity,
// } from "react-native";
// import React, { useState } from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
// import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// import AntDesign from "@expo/vector-icons/AntDesign";

// const into = () => {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [form, setForm] = useState({
//     email: "",
//   });
// const submit = async () => {

//         console.log("forget password");


//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <View style={styles.view}>
//         <Text style={styles.txt}>Forget Password?</Text>
//         <Text style={styles.txts}>We'll send you a One-Time Password (OTP) to help you reset your password. Please enter the email associated with the your voxify accounts</Text>
//       </View>

//       <View style={styles.Box}>
//         <Text style={styles.label}>Registered email address</Text>
//         <View style={styles.touchInput}>
//           <MaterialCommunityIcons
//             name="email-outline"
//             size={22}
//             color="black"
//           />
//           <TextInput
//             placeholder="yourmail@gmail.com"
//             keyboardType="email-address"
//             style={styles.input}
//             value={form.email}
//             onChangeText={(text) => setForm({ ...form, email: text })}
//           />
//         </View>
//       </View>
//       <View style={styles.sign}>
//         <TouchableOpacity
//           style={styles.signbtn}
//           onPress={submit}
//           disabled={isSubmitting}
//         >
//           <Text style={styles.signTxt}>
//             {isSubmitting ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               "Send OTP Code"
//             )}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default into;

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     // justifyContent: "flex-start",
//     // alignItems: "center",
//     height: "100%",
//     backgroundColor: "#fff",
//     padding: 20,
//   },

//   view: {
//     backgroundColor: "#fff",
//   },
//   txt:{
//     fontSize: 20,
//     fontWeight: 'bold',

//   },
//   txts: {
//     fontSize: 13,
//     fontWeight: '500',
//      paddingVertical: 20,
//   },
//   Box: {
//     gap: 6,
//   },

//   label: {
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   touchInput: {
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     backgroundColor: "#ecf0f1",
//     flexDirection: "row",
//     gap: 5,
//     height: 40,
//     alignItems: "center",
//   },
//   input: {
//     height: 40,
//     width: "80%",
//   },
//   signbtn: {
//     backgroundColor: "#3273F6",
//     borderRadius: 30,
//     width: 320,
//     padding: 12,
//     justifyContent: "flex-end",
//   },
//   signTxt: {
//     color: "#fff",
//     textAlign: "center",
//     fontSize: 17,
//   },
// });




// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform
// } from 'react-native';
// import { sendPasswordResetOTP, verifyPasswordResetOTP, resetPassword } from '../../lib/appwrite';

// const PasswordResetScreen = ({ navigation }) => {
//   const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   // Step 1: Send OTP to email
//   const handleSendOTP = async () => {
//     if (!email.trim()) {
//       Alert.alert('Error', 'Please enter your email address');
//       return;
//     }

//     if (!email.includes('@') || !email.includes('.')) {
//       Alert.alert('Error', 'Please enter a valid email address');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await sendPasswordResetOTP(email);
//       Alert.alert('Success', 'OTP sent to your email address');
//       setStep(2);
//     } catch (error) {
//       Alert.alert('Error', error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Step 2: Verify OTP
//   const handleVerifyOTP = async () => {
//     if (!otp.trim() || otp.length !== 6) {
//       Alert.alert('Error', 'Please enter the 6-digit OTP');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await verifyPasswordResetOTP(email, otp);
//       Alert.alert('Success', 'OTP verified successfully');
//       setStep(3);
//     } catch (error) {
//       Alert.alert('Error', error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Step 3: Reset password
//   const handleResetPassword = async () => {
//     if (!newPassword.trim() || newPassword.length < 6) {
//       Alert.alert('Error', 'Password must be at least 8 characters long');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       Alert.alert('Error', 'Passwords do not match');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await resetPassword(email, newPassword);
//       Alert.alert(
//         'Success',
//         'Password reset successfully! Please sign in with your new password.',
//         [
//           {
//             text: 'OK',
//             // onPress: () => navigation.navigate('SignIn')
//             onPress: () => navigation.navigate('PasswordResetSuccess')
//           }
//         ]
//       );
//     } catch (error) {
//       Alert.alert('Error', error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderStep1 = () => (
//     <View style={styles.stepContainer}>
//       <Text style={styles.title}>Reset Password</Text>
//       <Text style={styles.subtitle}>Enter your email address associated with the your voxify account and we'll send you an OTP to reset your password </Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Email Address"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//         autoCapitalize="none"
//         editable={!isLoading}
//       />

//       <TouchableOpacity
//         style={[styles.button, isLoading && styles.buttonDisabled]}
//         onPress={handleSendOTP}
//         disabled={isLoading}
//       >
//         {isLoading ? (
//           <ActivityIndicator color="white" />
//         ) : (
//           <Text style={styles.buttonText}>Send OTP</Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => navigation.goBack()}
//       >
//         <Text style={styles.backButtonText}>Back to Sign In</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderStep2 = () => (
//     <View style={styles.stepContainer}>
//       <Text style={styles.title}>Enter OTP</Text>
//       <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Enter OTP"
//         value={otp}
//         onChangeText={setOtp}
//         keyboardType="number-pad"
//         maxLength={6}
//         editable={!isLoading}
//       />

//       <TouchableOpacity
//         style={[styles.button, isLoading && styles.buttonDisabled]}
//         onPress={handleVerifyOTP}
//         disabled={isLoading}
//       >
//         {isLoading ? (
//           <ActivityIndicator color="white" />
//         ) : (
//           <Text style={styles.buttonText}>Verify OTP</Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => setStep(1)}
//       >
//         <Text style={styles.backButtonText}>Back to Email</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.resendButton}
//         onPress={handleSendOTP}
//         disabled={isLoading}
//       >
//         <Text style={styles.resendButtonText}>Resend OTP</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderStep3 = () => (
//     <View style={styles.stepContainer}>
//       <Text style={styles.title}>New Password</Text>
//       <Text style={styles.subtitle}>Enter your new password</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="New Password"
//         value={newPassword}
//         onChangeText={setNewPassword}
//         secureTextEntry
//         editable={!isLoading}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Confirm New Password"
//         value={confirmPassword}
//         onChangeText={setConfirmPassword}
//         secureTextEntry
//         editable={!isLoading}
//       />

//       <TouchableOpacity
//         style={[styles.button, isLoading && styles.buttonDisabled]}
//         onPress={handleResetPassword}
//         disabled={isLoading}
//       >
//         {isLoading ? (
//           <ActivityIndicator color="white" />
//         ) : (
//           <Text style={styles.buttonText}>Reset Password</Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => setStep(2)}
//       >
//         <Text style={styles.backButtonText}>Back to OTP</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//     >
//       {step === 1 && renderStep1()}
//       {step === 2 && renderStep2()}
//       {step === 3 && renderStep3()}
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },
//   stepContainer: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 10,
//     color: '#333',
//   },
//   subtitle: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 30,
//     color: '#666',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 15,
//     fontSize: 16,
//     marginBottom: 20,
//     backgroundColor: '#f9f9f9',
//   },
//   button: {
//     backgroundColor: '#007AFF',
//     borderRadius: 8,
//     padding: 15,
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   buttonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   backButton: {
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   backButtonText: {
//     color: '#007AFF',
//     fontSize: 16,
//   },
//   resendButton: {
//     alignItems: 'center',
//   },
//   resendButtonText: {
//     color: '#666',
//     fontSize: 14,
//     textDecorationLine: 'underline',
//   },
// });

// export default PasswordResetScreen;

import { router } from "expo-router";
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { handlePasswordRecoveryRequest } from '../../lib/appwrite'; // Import the modified function
export default function PasswordRecoveryScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordRecovery = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const result = await handlePasswordRecoveryRequest(email.trim());

      if (result.success) {
        // Show success alert
        Alert.alert(
          'Recovery Email Sent',
          result.message,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to sign in screen
                // navigation.navigate('SignIn');
                router.replace("/signIn");
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handlePasswordRecovery}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.buttonText}>Sending...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Send Recovery Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              // onPress={() => navigation.navigate('SignIn')}
              onPress={() => router.replace("/signIn")}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Alternative alert implementation with custom styling
export function showSuccessAlert(message, onOK) {
  Alert.alert(
    'Success',
    message,
    [
      {
        text: 'OK',
        onPress: onOK,
        style: 'default',
      },
    ],
    {
      cancelable: false,
    }
  );
}

export function showErrorAlert(message) {
  Alert.alert(
    'Error',
    message,
    [
      {
        text: 'OK',
        style: 'default',
      },
    ],
    {
      cancelable: false,
    }
  );
}