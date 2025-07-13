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

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { sendPasswordResetOTP, verifyPasswordResetOTP, resetPassword } from '../../lib/appwrite';

const PasswordResetScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetOTP(email);
      Alert.alert('Success', 'OTP sent to your email address. Please check your inbox and spam folder.');
      setStep(2);
      startResendTimer();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Error', 'OTP must be 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      await verifyPasswordResetOTP(email, otp);
      Alert.alert('Success', 'OTP verified successfully');
      setStep(3);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter your new password');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      Alert.alert(
        'Weak Password',
        'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        [
          { text: 'Continue Anyway', onPress: () => performPasswordReset() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    await performPasswordReset();
  };

  const performPasswordReset = async () => {
    setIsLoading(true);
    try {
      await resetPassword(email, newPassword);
      Alert.alert(
        'Success',
        'Password reset successfully! Please sign in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear all form data
              setEmail('');
              setOtp('');
              setNewPassword('');
              setConfirmPassword('');
              setStep(1);
              navigation.navigate('SignIn');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your email address associated with your Voxify account and we'll send you an OTP to reset your password
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSendOTP}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Send OTP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {email}
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleVerifyOTP}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep(1)}
      >
        <Text style={styles.backButtonText}>Back to Email</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.resendButton, resendTimer > 0 && styles.resendButtonDisabled]}
        onPress={handleSendOTP}
        disabled={isLoading || resendTimer > 0}
      >
        <Text style={[styles.resendButtonText, resendTimer > 0 && styles.resendButtonTextDisabled]}>
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>New Password</Text>
      <Text style={styles.subtitle}>Enter your new password</Text>
      
      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <Text style={styles.passwordHint}>
        Password should be at least 8 characters and contain uppercase, lowercase, numbers, and special characters
      </Text>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep(2)}
      >
        <Text style={styles.backButtonText}>Back to OTP</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  stepContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
  resendButton: {
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#007bff',
    fontSize: 14,
  },
  resendButtonTextDisabled: {
    color: '#999',
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default PasswordResetScreen;