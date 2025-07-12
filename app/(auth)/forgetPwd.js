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
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import {
//   sendOTPToEmail,
//   verifyOTPAndUpdatePassword,
//   generateOTP,
//   sendCustomOTPEmail,
//   storeOTP,
//   verifyStoredOTP,
//   updateUserPassword,
// } from '../../lib/appwrite';

// const ForgotPasswordScreen = () => {
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
//   const [loading, setLoading] = useState(false);
//   const [userId, setUserId] = useState('');
//   const [secret, setSecret] = useState('');
  
//   const router = useRouter();

//   // Step 1: Send OTP to email
//   const handleSendOTP = async () => {
//     if (!email) {
//       Alert.alert('Error', 'Please enter your email address');
//       return;
//     }

//     if (!validateEmail(email)) {
//       Alert.alert('Error', 'Please enter a valid email address');
//       return;
//     }

//     setLoading(true);
    
//     try {
//       // Method 1: Using Appwrite's built-in password recovery
//       const recovery = await sendOTPToEmail(email);
//       setUserId(recovery.userId);
//       setSecret(recovery.secret);
      
//       Alert.alert(
//         'Success',
//         'OTP has been sent to your email. Please check your inbox.',
//         [{ text: 'OK', onPress: () => setCurrentStep(2) }]
//       );
      
//     } catch (error) {
//       console.error('Send OTP error:', error);
      
//       if (error.message === 'Email not registered') {
//         Alert.alert('Error', 'This email is not registered with us. Please sign up first.');
//       } else {
//         Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Alternative method using custom OTP
//   const handleSendCustomOTP = async () => {
//     if (!email) {
//       Alert.alert('Error', 'Please enter your email address');
//       return;
//     }

//     setLoading(true);
    
//     try {
//       // Generate OTP
//       const generatedOTP = generateOTP();
      
//       // Store OTP temporarily
//       await storeOTP(email, generatedOTP);
      
//       // Send OTP via custom email function
//       await sendCustomOTPEmail(email, generatedOTP);
      
//       Alert.alert(
//         'Success',
//         'OTP has been sent to your email. Please check your inbox.',
//         [{ text: 'OK', onPress: () => setCurrentStep(2) }]
//       );
      
//     } catch (error) {
//       console.error('Send custom OTP error:', error);
//       Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 2: Verify OTP
//   const handleVerifyOTP = async () => {
//     if (!otp || otp.length !== 6) {
//       Alert.alert('Error', 'Please enter a valid 6-digit OTP');
//       return;
//     }

//     setLoading(true);
    
//     try {
//       // If using custom OTP method
//       if (!userId) {
//         await verifyStoredOTP(email, otp);
//         setCurrentStep(3);
//         Alert.alert('Success', 'OTP verified successfully!');
//       } else {
//         // If using Appwrite's built-in method, move to password step
//         setCurrentStep(3);
//         Alert.alert('Success', 'Please enter your new password');
//       }
//     } catch (error) {
//       console.error('Verify OTP error:', error);
//       Alert.alert('Error', error.message || 'Invalid OTP. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 3: Update password
//   const handleUpdatePassword = async () => {
//     if (!newPassword || newPassword.length < 8) {
//       Alert.alert('Error', 'Password must be at least 8 characters long');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       Alert.alert('Error', 'Passwords do not match');
//       return;
//     }

//     setLoading(true);
    
//     try {
//       if (userId && secret) {
//         // Using Appwrite's built-in method
//         await verifyOTPAndUpdatePassword(userId, secret, newPassword);
//       } else {
//         // Using custom method
//         await updateUserPassword(email, newPassword);
//       }
      
//       Alert.alert(
//         'Success',
//         'Password updated successfully!',
//         [
//           {
//             text: 'OK',
//             onPress: () => router.push('/password-reset-success')
//           }
//         ]
//       );
      
//     } catch (error) {
//       console.error('Update password error:', error);
//       Alert.alert('Error', error.message || 'Failed to update password. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const handleResendOTP = () => {
//     setCurrentStep(1);
//     setOtp('');
//     Alert.alert('Info', 'Please enter your email again to resend OTP');
//   };

//   const renderStep1 = () => (
//     <View style={styles.stepContainer}>
//       <Text style={styles.title}>Forgot Password</Text>
//       <Text style={styles.subtitle}>
//         Enter your email address associated with the your voxify account and we'll send you an OTP to reset your password
//       </Text>
      
//       <TextInput
//         style={styles.input}
//         placeholder="Email Address"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//         autoCapitalize="none"
//         autoCorrect={false}
//       />
      
//       <TouchableOpacity
//         style={[styles.button, loading && styles.buttonDisabled]}
//         onPress={handleSendCustomOTP}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.buttonText}>Send OTP</Text>
//         )}
//       </TouchableOpacity>
      
//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => router.back()}
//       >
//         <Text style={styles.backButtonText}>Back to Login</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderStep2 = () => (
//     <View style={styles.stepContainer}>
//       <Text style={styles.title}>Verify OTP</Text>
//       <Text style={styles.subtitle}>
//         Enter the 6-digit OTP sent to {email}
//       </Text>
      
//       <TextInput
//         style={styles.input}
//         placeholder="Enter OTP"
//         value={otp}
//         onChangeText={setOtp}
//         keyboardType="numeric"
//         maxLength={6}
//         textAlign="center"
//       />
      
//       <TouchableOpacity
//         style={[styles.button, loading && styles.buttonDisabled]}
//         onPress={handleVerifyOTP}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.buttonText}>Verify OTP</Text>
//         )}
//       </TouchableOpacity>
      
//       <TouchableOpacity
//         style={styles.linkButton}
//         onPress={handleResendOTP}
//       >
//         <Text style={styles.linkButtonText}>Resend OTP</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderStep3 = () => (
//     <View style={styles.stepContainer}>
//       <Text style={styles.title}>Reset Password</Text>
//       <Text style={styles.subtitle}>
//         Enter your new password
//       </Text>
      
//       <TextInput
//         style={styles.input}
//         placeholder="New Password"
//         value={newPassword}
//         onChangeText={setNewPassword}
//         secureTextEntry
//         autoCapitalize="none"
//       />
      
//       <TextInput
//         style={styles.input}
//         placeholder="Confirm New Password"
//         value={confirmPassword}
//         onChangeText={setConfirmPassword}
//         secureTextEntry
//         autoCapitalize="none"
//       />
      
//       <TouchableOpacity
//         style={[styles.button, loading && styles.buttonDisabled]}
//         onPress={handleUpdatePassword}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.buttonText}>Update Password</Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <KeyboardAvoidingView 
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//     >
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         {currentStep === 1 && renderStep1()}
//         {currentStep === 2 && renderStep2()}
//         {currentStep === 3 && renderStep3()}
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     padding: 20,
//   },
//   stepContainer: {
//     backgroundColor: '#fff',
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
//     lineHeight: 22,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 15,
//     fontSize: 16,
//     marginBottom: 20,
//     backgroundColor: '#fff',
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
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   backButton: {
//     alignItems: 'center',
//     padding: 10,
//   },
//   backButtonText: {
//     color: '#007AFF',
//     fontSize: 16,
//   },
//   linkButton: {
//     alignItems: 'center',
//     padding: 10,
//   },
//   linkButtonText: {
//     color: '#007AFF',
//     fontSize: 16,
//     textDecorationLine: 'underline',
//   },
// });

// export default ForgotPasswordScreen;

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
  Platform
} from 'react-native';
import { sendPasswordResetOTP, verifyPasswordResetOTP, resetPassword } from '../../lib/appwrite';

const PasswordResetScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Send OTP to email
  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetOTP(email);
      Alert.alert('Success', 'OTP sent to your email address');
      setStep(2);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
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
    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email, newPassword);
      Alert.alert(
        'Success',
        'Password reset successfully! Please sign in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('SignIn')
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
      <Text style={styles.subtitle}>Enter your email address to receive an OTP</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
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
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>
      
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
        style={styles.resendButton}
        onPress={handleSendOTP}
        disabled={isLoading}
      >
        <Text style={styles.resendButtonText}>Resend OTP</Text>
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
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    fontSize: 24,
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
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
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  resendButton: {
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default PasswordResetScreen;