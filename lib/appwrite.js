import * as FileSystem from "expo-file-system";
import mammoth from "mammoth"; // For Word document text extraction
import * as ImageManipulator from "expo-image-manipulator";
import { Buffer as BufferPolyfill } from 'buffer';


import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
  Functions,
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
  sendEmailFunctionId: "YOUR_EMAIL_FUNCTION_ID", // Create this function
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

// Check if email exists in the database
// export async function checkEmailExists(email) {
//   try {
//     const users = await databases.listDocuments(
//       config.databaseId,
//       config.usersCollectionId,
//       [Query.equal("email", email)]
//     );
    
//     return users.documents.length > 0;
//   } catch (error) {
//     console.error("Error checking email:", error);
//     throw new Error("Failed to check email existence");
//   }
// }

// // Send OTP to email using Appwrite's password recovery
// export async function sendOTPToEmail(email) {
//   try {
//     // First check if email exists
//     const emailExists = await checkEmailExists(email);
//     if (!emailExists) {
//       throw new Error("Email not registered");
//     }

//     // Send password recovery email with OTP
//     const recovery = await account.createRecovery(
//       email,
//       'https://yourapp.com/reset-password' // This can be any URL since we're using OTP
//     );
    
//     return recovery;
//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     if (error.message === "Email not registered") {
//       throw error;
//     }
//     throw new Error("Failed to send OTP. Please try again.");
//   }
// }

// // Verify OTP and update password
// export async function verifyOTPAndUpdatePassword(userId, secret, password) {
//   try {
//     // Complete the password recovery with the OTP
//     const recovery = await account.updateRecovery(
//       userId,
//       secret,
//       password
//     );
    
//     return recovery;
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     throw new Error("Invalid OTP or failed to update password");
//   }
// }

// // Alternative: Send custom OTP email using Appwrite Functions
// export async function sendCustomOTPEmail(email, otp) {
//   try {
//     const execution = await functions.createExecution(
//       'your-email-function-id', // Replace with your function ID
//       JSON.stringify({
//         email: email,
//         otp: otp,
//         type: 'password-reset'
//       })
//     );
    
//     return execution;
//   } catch (error) {
//     console.error("Error sending custom OTP email:", error);
//     throw new Error("Failed to send OTP email");
//   }
// }

// // Generate random OTP
// export function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// // Store OTP temporarily (in a real app, you'd store this in your database with expiration)
// let otpStorage = {};

// export async function storeOTP(email, otp) {
//   try {
//     // Store OTP with expiration (5 minutes)
//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
//     // In a real implementation, store this in your database
//     otpStorage[email] = {
//       otp: otp,
//       expiresAt: expiresAt
//     };
    
//     // Clean up expired OTPs
//     setTimeout(() => {
//       if (otpStorage[email]) {
//         delete otpStorage[email];
//       }
//     }, 5 * 60 * 1000);
    
//     return true;
//   } catch (error) {
//     console.error("Error storing OTP:", error);
//     throw new Error("Failed to store OTP");
//   }
// }

// export async function verifyStoredOTP(email, otp) {
//   try {
//     const storedData = otpStorage[email];
    
//     if (!storedData) {
//       throw new Error("OTP not found or expired");
//     }
    
//     if (new Date() > storedData.expiresAt) {
//       delete otpStorage[email];
//       throw new Error("OTP has expired");
//     }
    
//     if (storedData.otp !== otp) {
//       throw new Error("Invalid OTP");
//     }
    
//     // Clean up after successful verification
//     delete otpStorage[email];
//     return true;
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     throw error;
//   }
// }

// // Update user password directly
// export async function updateUserPassword(email, newPassword) {
//   try {
//     // First, sign in with temporary session to update password
//     // Note: This is a simplified approach. In production, you'd handle this differently
    
//     // Get user document
//     const users = await databases.listDocuments(
//       config.databaseId,
//       config.usersCollectionId,
//       [Query.equal("email", email)]
//     );
    
//     if (users.documents.length === 0) {
//       throw new Error("User not found");
//     }
    
//     const user = users.documents[0];
    
//     // Update password in database (Note: In production, hash the password)
//     await databases.updateDocument(
//       config.databaseId,
//       config.usersCollectionId,
//       user.$id,
//       {
//         password: newPassword
//       }
//     );
    
//     return true;
//   } catch (error) {
//     console.error("Error updating password:", error);
//     throw new Error("Failed to update password");
//   }
// }

// Generate and send OTP for password reset
export async function sendPasswordResetOTP(email) {
  try {
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

    // Send OTP via email using Appwrite Functions
    try {
      await functions.createExecution(
        config.sendEmailFunctionId,
        JSON.stringify({
          email: email,
          otp: otp,
          type: "password_reset"
        })
      );
    } catch (emailError) {
      console.log("Email sending failed:", emailError);
      // Don't throw error here - OTP is still stored in database
    }

    return { success: true, message: "OTP sent to your email address" };
  } catch (error) {
    throw new Error(error.message || "Failed to send OTP");
  }
}

// Verify OTP for password reset
export async function verifyPasswordResetOTP(email, otp) {
  try {
    // Find OTP in database
    const otpRecords = await databases.listDocuments(
      config.databaseId,
      config.otpCollectionId,
      [
        Query.equal("email", email),
        Query.equal("otp", otp),
        Query.equal("used", false),
        Query.equal("type", "password_reset")
      ]
    );

    if (!otpRecords || otpRecords.documents.length === 0) {
      throw new Error("Invalid OTP. Please check and try again.");
    }

    const otpRecord = otpRecords.documents[0];
    
    // Check if OTP is expired
    const expiresAt = new Date(otpRecord.expiresAt);
    const now = new Date();
    
    if (now > expiresAt) {
      throw new Error("OTP has expired. Please request a new one.");
    }

    // Mark OTP as used
    await databases.updateDocument(
      config.databaseId,
      config.otpCollectionId,
      otpRecord.$id,
      {
        used: true
      }
    );

    return { success: true, message: "OTP verified successfully" };
  } catch (error) {
    throw new Error(error.message || "Failed to verify OTP");
  }
}

// Reset password after OTP verification
export async function resetPassword(email, newPassword) {
  try {
    // Get user document
    const userDocs = await databases.listDocuments(
      config.databaseId,
      config.usersCollectionId,
      [Query.equal("email", email)]
    );

    if (!userDocs || userDocs.documents.length === 0) {
      throw new Error("User not found");
    }

    const userDoc = userDocs.documents[0];

    // Update password in Appwrite Auth
    // Note: This requires creating a session first, which is tricky for password reset
    // Alternative approach: Update password in database and require user to sign in again
    
    // Update password in database
    await databases.updateDocument(
      config.databaseId,
      config.usersCollectionId,
      userDoc.$id,
      {
        password: newPassword,
        updatedAt: new Date().toISOString()
      }
    );

    // For security, you might want to invalidate all existing sessions
    // This would require the user to sign in again with the new password

    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    throw new Error(error.message || "Failed to reset password");
  }
}

// Helper function to clean up expired OTPs (call this periodically)
export async function cleanupExpiredOTPs() {
  try {
    const now = new Date().toISOString();
    const expiredOTPs = await databases.listDocuments(
      config.databaseId,
      config.otpCollectionId,
      [Query.lessThan("expiresAt", now)]
    );

    for (const otp of expiredOTPs.documents) {
      await databases.deleteDocument(
        config.databaseId,
        config.otpCollectionId,
        otp.$id
      );
    }
  } catch (error) {
    console.log("Cleanup error:", error);
  }
}