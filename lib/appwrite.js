import emailjs from '@emailjs/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer as BufferPolyfill } from 'buffer';
import * as FileSystem from "expo-file-system";
import mammoth from "mammoth"; // For Word document text extraction
import {
  Account,
  Avatars,
  Client,
  Databases,
  Functions,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";
export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.company.VoxifyApp",
  projectId: "6781ffea00354ecae5ca",
  databaseId: "678225de0029c6d82768",
  usersCollectionId: "6782270b0011ef9d63d9",
  documentCollectionId: "6782292f002ebedeac72",
  textCollectionId: "6797305700168882224d",
  webCollectionId: "67980e18003da84092ef",
  scanCollectionId: "679aa917001990138b97",
  storageId: "67822e6200158bc006df",
  TextExtraction: "text-extraction",
  pdfExtractFunctionId: '67d0b92d00230d006769',
  otpCollectionId: "68723f8400111858a9e4", // Create this collection
  sendEmailFunctionId: "68725983001a56112a93", // Create this function
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  usersCollectionId,
  documentCollectionId,
  webCollectionId,
  storageId,
} = config;

const client = new Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const functions = new Functions(client);

// EmailJS configuration (you need to set this up at emailjs.com)
const EMAILJS_CONFIG = {
  serviceId: 'service_b84su78',
  templateId: 'template_rkuwk4w',
  publicKey: 'xFhVsuxvqbl4YC_1X'
};

export const initializeEmailJS = () => {
  emailjs.init(EMAILJS_CONFIG.publicKey);
};

// **User Authentication**
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(ID.unique(), email, password, username);

    if (!newAccount || !newAccount.$id) {
      throw new Error("New account creation failed");
    }

    await signIn(email, password);

    const newUser = await databases.createDocument(
      config.databaseId,
      config.usersCollectionId,
      ID.unique(),
      {
        email: email,
        password: password,
        accountId: newAccount.$id,
        username: username,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// Sign Out
export async function signOut() {
  try {
    await account.deleteSession('current');
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw new Error("No account found");

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.usersCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0) {
      throw new Error("No user document found for this account");
    }

    return currentUser.documents[0];
  } catch (error) {
    console.log("getCurrentUser error:", error.message || error);
    return null;
  }
}


export async function getFilePreview(fileId) {
  try {
    return storage.getFileView(config.storageId, fileId);
  } catch (error) {
    throw new Error("Failed to get file preview");
  }
}
// Upload Document
export const uploadFile = async (file) => {
  try {
    console.log("File being uploaded:", JSON.stringify(file, null, 2));

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(file.uri);
    console.log("File info:", fileInfo);

    // React Native file handling for Appwrite
    const fileName = file.name || file.uri.split('/').pop();
    const mimeType = file.type || 'application/pdf'; // default to PDF if type is missing

    // Create a proper file input for Appwrite
    const fileInput = {
      name: fileName,
      type: mimeType,
      uri: file.uri,
      size: fileInfo.size
    };

    // When using Appwrite with React Native, you need to use the Input.file constructor
    const uploadedFile = await storage.createFile(
      config.storageId,
      ID.unique(),
      fileInput
    );

    if (!uploadedFile || !uploadedFile.$id) {
      throw new Error("File upload failed");
    }

    console.log("File uploaded successfully. ID:", uploadedFile.$id);

    const fileUrl = storage.getFileView(config.storageId, uploadedFile.$id).href;

    // Return both fileId AND storageId (bucketId)
    return {
      fileUrl,
      fileId: uploadedFile.$id,
      storageId: config.storageId // Add this to ensure we pass the correct bucketId
    };
  } catch (error) {
    console.error("Detailed upload error:", error);
    throw new Error("Error uploading document: " + error.message);
  }
};
// Create document record in database
export async function createDocument(file, userId, fileUrl, extractedText) {
  try {
    const newDocument = await databases.createDocument(
      config.databaseId,
      config.documentCollectionId,
      ID.unique(),
      {
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileUrl: fileUrl,
        createdAt: new Date().toISOString(),
        fileSize: file.size,
        language: "English",
        userId: userId,
        extractedText: extractedText || "empty",
        docType: "Document",
      }
    );
    return newDocument;
  } catch (error) {
    throw new Error(error);
  }
}

export const extractTextFromFile = async (file) => {
  try {
    if (!file || !file.name) {
      throw new Error("Invalid file object or missing filename");
    }

    // console.log("Processing file:", file.name);
    // console.log("File URI:", file.uri);

    const fileExtension = file.name.split(".").pop().toLowerCase();

    // Upload to your storage (e.g., Appwrite) — unchanged
    const { fileUrl, fileId, storageId } = await uploadFile(file);
    // console.log("File uploaded to Appwrite. ID:", fileId);

    let extractedText = "Text extraction not supported for this file type.";

    if (fileExtension === "pdf") {
      try {
        // Read the file as base64
        // console.log("Reading PDF file as base64...");
        const pdfBase64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (!pdfBase64) {
          throw new Error("Failed to read PDF file - empty content");
        }

        console.log("Sending to Hugging Face Space...");
        const response = await fetch("https://seawolf2357-pdf-text-extractor.hf.space/run/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            data: [
              {
                "name": file.name,
                "data": `data:application/pdf;base64,${pdfBase64}`
              }
            ]
          })
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error("API Error Response:", errorBody);
          throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        // console.log("API Response:", result);

        if (result && result.data) {
          extractedText = result.data[0] || "No text could be extracted";
          console.log("PDF text extraction successful.");
        } else {
          extractedText = "No text could be extracted from the PDF.";
          console.log("Unexpected response format:", result);
        }

      } catch (error) {
        console.error("PDF text extraction error:", error);
        extractedText = "Failed to extract text from PDF: " + error.message;
      }
    }
    // DOCX support (unchanged)
    else if (fileExtension === "docx" || fileExtension === "doc") {
      try {
        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        if (!fileInfo.exists) {
          throw new Error("Could not find file in options");
        }

        const fileData = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const buffer = BufferPolyfill.from(fileData, "base64");

        const result = await mammoth.extractRawText({ arrayBuffer: buffer.buffer });

        extractedText = result.value || "No text extracted";

        if (result.messages?.length) {
          console.log("Mammoth messages:", result.messages);
        }
      } catch (docError) {
        console.error("DOCX extraction error:", docError);
        extractedText = "Failed to extract text from DOCX: " + docError.message;
      }
    }

    return {
      extractedText,
      fileUrl,
      fileId,
    };
  } catch (error) {
    console.error("Text extraction failed:", error);
    throw new Error("Text extraction failed: " + error.message);
  }
};

export async function createtext(text, userId) {
  try {
    const newText = await databases.createDocument(
      config.databaseId,
      config.textCollectionId,
      ID.unique(),
      {
        text,
        createdAt: new Date().toISOString(),
        userId: userId,
        docType: "Text",
      }
    );
    return newText;
  } catch (error) {
    throw new Error(error);
  }
}

export async function createUrl(link, userId) {
  try {
    const newText = await databases.createDocument(
      config.databaseId,
      config.webCollectionId,
      ID.unique(),
      {
        createdAt: new Date().toISOString(),
        userId: userId,
        docType: "Web",
        link,
      }
    );
    return newText;
  } catch (error) {
    throw new Error(error);
  }
}
export async function createScanDoc(userId, imgUrl, extractedText) {
  try {
    const newDocument = await databases.createDocument(
      config.databaseId,
      config.scanCollectionId,
      ID.unique(),
      {
        userId,
        extractedText: extractedText || "empty",
        createdAt: new Date().toISOString(),
        imgUrl: imgUrl,
        docType: "Scan",
      }
    );
    return newDocument;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getDocuments(userId) {
  try {
    const documents = await databases.listDocuments(
      config.databaseId,
      config.documentCollectionId,
      [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"), // Sort by newest first
      ]
    );

    if (!documents) throw Error;

    return documents.documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw new Error(error);
  }
}
// Get a single document by ID
export async function getDocumentById(fileId) {
  try {
    const document = await databases.getDocument(
      config.databaseId,
      config.documentCollectionId,
      fileId
    );

    if (!document) throw Error;

    return document;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw new Error(error);
  }
}

export async function getTextById(txtId) {
  try {
    if (!txtId) {
      throw new Error("Text ID is required");
    }

    console.log("Fetching text with ID:", txtId); // Debug log

    const document = await databases.getDocument(
      config.databaseId,
      config.textCollectionId,
      txtId
    );

    if (!document) throw Error;

    return document;
  } catch (error) {
    console.error("Error fetching text:", error.message);
    throw new Error(error);
  }
}

export async function getWebById(urlId) {
  try {
    const document = await databases.getDocument(
      config.databaseId,
      config.webCollectionId,
      urlId
    );

    if (!document) throw Error;

    return document;
  } catch (error) {
    console.error("Error fetching url:", error);
    throw new Error(error);
  }
}
export async function getScanById(urlId) {
  try {
    const document = await databases.getDocument(
      config.databaseId,
      config.scanCollectionId,
      urlId
    );

    if (!document) throw Error;

    return document;
  } catch (error) {
    console.error("Error fetching url:", error);
    throw new Error(error);
  }
}

export async function updateWebById(docId, updatedFields) {
  try {
    return await
      databases.updateDocument
        (config.databaseId, config.documentCollectionId, docId, updatedFields);
  } catch (error) {
    throw new Error
      (error.message);
  }
}

// Delete Document
export async function deleteDocumentById(documentId) {
  try {
    await databases.deleteDocument(config.databaseId, config.documentCollectionId, documentId);
    return true;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new Error(error);
  }
}

// Delete Text
export async function deleteTextById(textId) {
  try {
    await databases.deleteDocument(
      config.databaseId,
      config.textCollectionId,
      textId);
    return true;
  } catch (error) {
    console.error("Error deleting text:", error);
    throw new Error(error);
  }
}

// Delete URL
export async function deleteWebById(webId) {
  try {
    await databases.deleteDocument
      (config.databaseId,
        config.webCollectionId,
        webId
      );
    return true;
  } catch (error) {
    console.error
      ("Error deleting web link:", error);
    throw new Error(error);
  }
}

// Delete Scan Document
export async function deleteScanDocById(scanId) {
  try {
    await databases.deleteDocument
      (
        config.databaseId,
        config.scanCollectionId,
        scanId
      );
    return true;
  } catch (error) {
    console.error("Error deleting scanned document:", error);
    throw new Error(error);
  }
}
export async function deleteDocument(documentId, fileUrl) {
  try {
    // Extract file ID from the fileUrl
    const fileId = fileUrl.split("/").pop();

    // Delete file from storage
    await storage.deleteFile(config.storageId, fileId);

    // Delete document record from database
    await databases.deleteDocument(
      config.databaseId,
      config.documentCollectionId,
      documentId
    );

    return true;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new Error(error);
  }
}

// create functions to fetch from each collection
export async function getAllUserContent(userId) {
  try {
    // Fetch from multiple collections in parallel
    const [documents, texts, webs, scans] = await Promise.all([
      databases.listDocuments(config.databaseId, config.documentCollectionId, [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
      ]),
      databases.listDocuments(config.databaseId, config.textCollectionId, [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
      ]),
      databases.listDocuments(config.databaseId, config.webCollectionId, [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
      ]),
      databases.listDocuments(config.databaseId, config.scanCollectionId, [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
      ]),
    ]);

    // Combine and add docType to each item
    return [
      ...documents.documents.map((doc) => ({ ...doc, docType: "Document" })),
      ...texts.documents.map((text) => ({ ...text, docType: "Text" })),
      ...webs.documents.map((web) => ({ ...web, docType: "Web" })),
      ...scans.documents.map((scan) => ({ ...scan, docType: "Scan" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error fetching content:", error);
    throw new Error(error);
  }
}

// // Generate and send OTP for password reset using EmailJS
// export async function sendPasswordResetOTP(email) {
//   try {
//     // First check if email exists in database
//     const userExists = await databases.listDocuments(
//       config.databaseId,
//       config.usersCollectionId,
//       [Query.equal("email", email)]
//     );

//     if (!userExists || userExists.documents.length === 0) {
//       throw new Error("Email not found. Please check your email address.");
//     }

//     // Generate 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

//     // Store OTP locally as backup
//     await AsyncStorage.setItem(`otp_${email}`, JSON.stringify({
//       otp,
//       expiresAt: expiresAt.toISOString(),
//       email
//     }));

//     // Store OTP in database
//     await databases.createDocument(
//       config.databaseId,
//       config.otpCollectionId,
//       ID.unique(),
//       {
//         email: email,
//         otp: otp,
//         expiresAt: expiresAt.toISOString(),
//         used: false,
//         type: "password_reset"
//       }
//     );

//     // Send OTP via EmailJS
//     await sendOTPEmailJS(email, otp);

//     return { success: true, message: "OTP sent to your email address" };
//   } catch (error) {
//     throw new Error(error.message || "Failed to send OTP");
//   }
// }

// // Send OTP email using EmailJS
// async function sendOTPEmailJS(email, otp) {
//   try {
//     const templateParams = {
//       to_email: email,
//       to_name: email.split('@')[0], // Use email prefix as name
//       otp_code: otp,
//       app_name: 'Voxify',
//       expiry_time: '10 minutes'
//     };

//     const response = await emailjs.send(
//       EMAILJS_CONFIG.serviceId,
//       EMAILJS_CONFIG.templateId,
//       templateParams,
//       EMAILJS_CONFIG.publicKey
//     );

//     console.log('Email sent successfully:', response.status, response.text);
//   } catch (error) {
//     console.error('EmailJS error:', error);
//     throw new Error('Failed to send email. Please try again.');
//   }
// }

// // Verify OTP for password reset
// export async function verifyPasswordResetOTP(email, otp) {
//   try {
//     // First check local storage for faster verification
//     const localOTP = await AsyncStorage.getItem(`otp_${email}`);
//     if (localOTP) {
//       const otpData = JSON.parse(localOTP);
//       if (otpData.otp === otp && new Date() < new Date(otpData.expiresAt)) {
//         // Remove local OTP after successful verification
//         await AsyncStorage.removeItem(`otp_${email}`);
//         return { success: true, message: "OTP verified successfully" };
//       }
//     }

//     // Fallback to database verification
//     const otpRecords = await databases.listDocuments(
//       config.databaseId,
//       config.otpCollectionId,
//       [
//         Query.equal("email", email),
//         Query.equal("otp", otp),
//         Query.equal("used", false),
//         Query.equal("type", "password_reset")
//       ]
//     );

//     if (!otpRecords || otpRecords.documents.length === 0) {
//       throw new Error("Invalid OTP. Please check and try again.");
//     }

//     const otpRecord = otpRecords.documents[0];

//     // Check if OTP is expired
//     const expiresAt = new Date(otpRecord.expiresAt);
//     const now = new Date();

//     if (now > expiresAt) {
//       throw new Error("OTP has expired. Please request a new one.");
//     }

//     // Mark OTP as used
//     await databases.updateDocument(
//       config.databaseId,
//       config.otpCollectionId,
//       otpRecord.$id,
//       {
//         used: true
//       }
//     );

//     return { success: true, message: "OTP verified successfully" };
//   } catch (error) {
//     throw new Error(error.message || "Failed to verify OTP");
//   }
// }

// // Reset password after OTP verification
// export async function resetPassword(email, newPassword) {
//   try {
//     // Get user document
//     const userDocs = await databases.listDocuments(
//       config.databaseId,
//       config.usersCollectionId,
//       [Query.equal("email", email)]
//     );

//     if (!userDocs || userDocs.documents.length === 0) {
//       throw new Error("User not found");
//     }

//     const userDoc = userDocs.documents[0];

//     // Update password in database
//     await databases.updateDocument(
//       config.databaseId,
//       config.usersCollectionId,
//       userDoc.$id,
//       {
//         password: newPassword, // In production, hash this password
//         updatedAt: new Date().toISOString()
//       }
//     );

//     // Send confirmation email
//     await sendPasswordResetConfirmation(email);

//     return { success: true, message: "Password reset successfully" };
//   } catch (error) {
//     throw new Error(error.message || "Failed to reset password");
//   }
// }

// // Send password reset confirmation email
// async function sendPasswordResetConfirmation(email) {
//   try {
//     const templateParams = {
//       to_email: email,
//       to_name: email.split('@')[0],
//       app_name: 'Voxify',
//       reset_time: new Date().toLocaleString()
//     };

//     // You'll need a separate template for confirmation emails
//     await emailjs.send(
//       EMAILJS_CONFIG.serviceId,
//       'template_jinj51c', // Replace with your confirmation template ID
//       templateParams,
//       EMAILJS_CONFIG.publicKey
//     );
//   } catch (error) {
//     console.log('Confirmation email failed:', error);
//     // Don't throw error here as password reset was successful
//   }
// }

// // Helper function to clean up expired OTPs
// export async function cleanupExpiredOTPs() {
//   try {
//     const now = new Date().toISOString();
//     const expiredOTPs = await databases.listDocuments(
//       config.databaseId,
//       config.otpCollectionId,
//       [Query.lessThan("expiresAt", now)]
//     );

//     for (const otp of expiredOTPs.documents) {
//       await databases.deleteDocument(
//         config.databaseId,
//         config.otpCollectionId,
//         otp.$id
//       );
//     }
//   } catch (error) {
//     console.log("Cleanup error:", error);
//   }
// }


// Generate and send OTP for password reset using EmailJS
export async function sendPasswordResetOTP(email) {
  try {
    // Initialize EmailJS if not already done
    emailjs.init(EMAILJS_CONFIG.publicKey);

    // First check if email exists in database
    const userExists = await databases.listDocuments(
      config.databaseId,
      config.usersCollectionId,
      [Query.equal("email", email)]
    );

    if (!userExists || userExists.documents.length === 0) {
      throw new Error("Email not found. Please check your email address.");
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store OTP locally as backup
    await AsyncStorage.setItem(`otp_${email}`, JSON.stringify({
      otp,
      expiresAt: expiresAt.toISOString(),
      email
    }));

    // Store OTP in database
    await databases.createDocument(
      config.databaseId,
      config.otpCollectionId,
      ID.unique(),
      {
        email: email,
        otp: otp,
        expiresAt: expiresAt.toISOString(),
        used: false,
        type: "password_reset"
      }
    );

    // Send OTP via EmailJS
    await sendOTPEmailJS(email, otp);

    return { success: true, message: "OTP sent to your email address" };
  } catch (error) {
    console.error('Full error object:', error);
    throw new Error(error.message || "Failed to send OTP");
  }
}

// Send OTP email using EmailJS
async function sendOTPEmailJS(email, otp) {
  try {
    // Ensure EmailJS is initialized
    emailjs.init(EMAILJS_CONFIG.publicKey);

    const templateParams = {
      to_email: email,
      to_name: email.split('@')[0], // Use email prefix as name
      otp_code: otp,
      app_name: 'Voxify',
      expiry_time: '10 minutes'
    };

    console.log('Sending email with config:', {
      serviceId: EMAILJS_CONFIG.serviceId,
      templateId: EMAILJS_CONFIG.templateId,
      publicKey: EMAILJS_CONFIG.publicKey
    });

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey // Pass public key explicitly
    );

    console.log('Email sent successfully:', response.status, response.text);
    return response;
  } catch (error) {
    console.error('EmailJS error details:', {
      message: error.message,
      status: error.status,
      text: error.text,
      config: EMAILJS_CONFIG
    });
    throw new Error('Failed to send email. Please try again.');
  }
}

// Alternative approach - initialize once and store reference
class EmailJSService {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (!this.initialized) {
      emailjs.init(EMAILJS_CONFIG.publicKey);
      this.initialized = true;
    }
  }

  async sendEmail(templateParams) {
    this.init(); // Ensure initialized

    return await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );
  }
}

// Create singleton instance
export const emailJSService = new EmailJSService();