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
  webAppUrl: "https://voxifyweb.netlify.app",
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


// Send password recovery email
export async function sendPasswordRecovery(email) {
  try {
    // The recovery URL should point to your Next.js web app
    const recoveryUrl = `${webAppUrl}/reset-password`; // e.g., 'https://yourapp.com/reset-password'
    
    // const recoveryUrl = https://voxifyweb.netlify.app/reset-password; // e.g., 'https://yourapp.com/reset-password'

    // const response = await account.createRecovery(email, recoveryUrl);
    const response = await account.createRecovery(email, recoveryUrl);

    console.log('Password recovery email sent:', response);

    return {
      success: true,
      message: "Password recovery link has been sent to your email address. Please check your inbox and follow the instructions to reset your password."
    };

  } catch (error) {
    console.error('Password recovery error:', error);

    // Handle specific Appwrite errors
    if (error.code === 400) {
      throw new Error("Invalid email address. Please check and try again.");
    } else if (error.code === 404) {
      throw new Error("No account found with this email address.");
    } else {
      throw new Error(error.message || "Failed to send recovery email. Please try again.");
    }
  }
}

// Update password with recovery secret (for Next.js web app)
export async function updatePasswordWithRecovery(userId, secret, newPassword) {
  try {
    const response = await account.updateRecovery(userId, secret, newPassword);

    console.log('Password updated successfully:', response);

    return {
      success: true,
      message: "Password has been updated successfully. You can now sign in with your new password."
    };

  } catch (error) {
    console.error('Password update error:', error);

    // Handle specific Appwrite errors
    if (error.code === 400) {
      throw new Error("Invalid or expired recovery link. Please request a new password reset.");
    } else if (error.code === 401) {
      throw new Error("Invalid recovery credentials. Please try again.");
    } else {
      throw new Error(error.message || "Failed to update password. Please try again.");
    }
  }
}

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Main function to handle password recovery request
export async function handlePasswordRecoveryRequest(email) {
  try {
    // Validate email format
    if (!email || !isValidEmail(email)) {
      throw new Error("Please enter a valid email address.");
    }

    // Send recovery email
    const result = await sendPasswordRecovery(email);

    return result;

  } catch (error) {
    console.error('Password recovery request failed:', error);
    throw error;
  }
}
