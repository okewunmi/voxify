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
  webAppUrl: 'https://voxifyweb.netlify.app'
 
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


// Helper function to generate avatar URL
const generateAvatarUrl = (user) => {
  try {
    const initials = user.username || user.email || "User";
    return avatars.getInitials(initials, 100, 100).toString();
  } catch (error) {
    console.log("Avatar generation failed:", error);
    return null;
  }
};

// **User Authentication**
// export async function createUser(email, password, username) {
//   try {
//     const newAccount = await account.create(ID.unique(), email, password, username);

//     if (!newAccount || !newAccount.$id) {
//       throw new Error("New account creation failed");
//     }

//     await signIn(email, password);

//     const newUser = await databases.createDocument(
//       config.databaseId,
//       config.usersCollectionId,
//       ID.unique(),
//       {
//         email: email,
//         password: password,
//         accountId: newAccount.$id,
//         username: username,
//       }
//     );

//     return newUser;
//   } catch (error) {
//     throw new Error(error);
//   }
// }

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

    // Add avatar URL to the user object
    const userWithAvatar = {
      ...newUser,
      avatarUrl: generateAvatarUrl(newUser)
    };

    return userWithAvatar;
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
// export async function getCurrentUser() {
//   try {
//     const currentAccount = await getAccount();
//     if (!currentAccount) throw new Error("No account found");

//     const currentUser = await databases.listDocuments(
//       config.databaseId,
//       config.usersCollectionId,
//       [Query.equal("accountId", currentAccount.$id)]
//     );

//     if (!currentUser || currentUser.documents.length === 0) {
//       throw new Error("No user document found for this account");
//     }

//     return currentUser.documents[0];
//   } catch (error) {
//     console.log("getCurrentUser error:", error.message || error);
//     return null;
//   }
// }
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

    const user = currentUser.documents[0];
    
    // Add avatar URL to the user object
    const userWithAvatar = {
      ...user,
      avatarUrl: generateAvatarUrl(user)
    };

    return userWithAvatar;
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
    // console.log("=== UPLOADFILE START ===");
    // console.log("File being uploaded:", JSON.stringify(file, null, 2));

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(file.uri);
    // console.log("File info:", fileInfo);

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

    // Upload to Appwrite storage
    const uploadedFile = await storage.createFile(
      config.storageId,
      ID.unique(),
      fileInput
    );

    if (!uploadedFile || !uploadedFile.$id) {
      throw new Error("File upload failed");
    }

    // console.log("File uploaded successfully. ID:", uploadedFile.$id);

    // FIXED: Generate URL manually instead of using getFileView()
    const fileUrl = `${config.endpoint}/storage/buckets/${config.storageId}/files/${uploadedFile.$id}/view?project=${config.projectId}`;

    // console.log("UPLOADFILE - Generated fileUrl:", fileUrl);
    // console.log("UPLOADFILE - FileUrl length:", fileUrl.length);
    // console.log("UPLOADFILE - FileUrl type:", typeof fileUrl);
    // console.log("UPLOADFILE - Config endpoint:", config.endpoint);
    // console.log("UPLOADFILE - Config storageId:", config.storageId);
    // console.log("UPLOADFILE - Config projectId:", config.projectId);

    // Validate that we have a proper URL
    if (!fileUrl || typeof fileUrl !== 'string') {
      throw new Error("Failed to generate file URL");
    }

    // Length check
    if (fileUrl.length > 2000) {
      console.warn(`URL is ${fileUrl.length} chars, which may be too long for database`);
      // Try without project parameter
      const shortUrl = `${config.endpoint}/storage/buckets/${config.storageId}/files/${uploadedFile.$id}/view`;
      // console.log("Trying shorter URL:", shortUrl);
      // console.log("Shorter URL length:", shortUrl.length);
      
      if (shortUrl.length <= 2000) {
        const result = {
          fileUrl: shortUrl,
          fileId: uploadedFile.$id,
          storageId: config.storageId
        };
        // console.log("UPLOADFILE RETURN (short):", result);
        // console.log("=== UPLOADFILE END ===");
        return result;
      } else {
        throw new Error(`Even the shortened URL is too long (${shortUrl.length} chars). Please use a custom domain.`);
      }
    }

    // Return both fileId AND storageId (bucketId)
    const result = {
      fileUrl,
      fileId: uploadedFile.$id,
      storageId: config.storageId
    };
    
    // console.log("UPLOADFILE RETURN:", result);
    // console.log("UPLOADFILE RETURN fileUrl type:", typeof result.fileUrl);
    // console.log("UPLOADFILE RETURN fileUrl length:", result.fileUrl.length);
    // console.log("=== UPLOADFILE END ===");
    
    return result;
  } catch (error) {
    // console.error("Detailed upload error:", error);
    throw new Error("Error uploading document: " + error.message);
  }
};

// Modified extractTextFromFile function to use Netlify API
export const extractTextFromFile = async (file) => {
  try {
    if (!file || !file.name) {
      throw new Error("Invalid file object or missing filename");
    }

    // console.log("=== EXTRACTTEXTFROMFILE START ===");
    // console.log("Processing file:", file.name);
    // console.log("File URI:", file.uri);

    // First upload the file to get the URL
    const uploadResult = await uploadFile(file);
    // console.log("EXTRACTTEXTFROMFILE - Upload result:", uploadResult);
    // console.log("EXTRACTTEXTFROMFILE - Upload result type:", typeof uploadResult);
    
    const { fileUrl, fileId, storageId } = uploadResult;
    
    // console.log("EXTRACTTEXTFROMFILE - Destructured fileUrl:", fileUrl);
    // console.log("EXTRACTTEXTFROMFILE - FileUrl type:", typeof fileUrl);
    // console.log("EXTRACTTEXTFROMFILE - FileUrl length:", fileUrl?.length);
    // console.log("File uploaded to Appwrite. ID:", fileId);

    let extractedText = "Text extraction not supported for this file type.";

    try {
      // console.log("Starting text extraction using Netlify API...");
      
      // Create FormData for the API request
      const formData = new FormData();
      
      // For React Native, we need to create a proper file object
      const fileBlob = {
        uri: file.uri,
        type: file.type || 'application/pdf',
        name: file.name
      };
      
      formData.append('document', fileBlob);

      // Call the Netlify API
      const response = await fetch("https://voxifyweb.netlify.app/api/extract-text", {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type header, let the browser set it with boundary
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        const errorBody = await response.text();
        // console.error("API Error Response:", errorBody);
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
      }

      const result = await response.json();
      // console.log("API Response received");

      if (result && result.text) {
        extractedText = result.text || "No text could be extracted";
        // console.log(`Text extraction successful. Extracted ${extractedText.length} characters.`);
        
        // Log additional metadata if available
        if (result.metadata) {
          console.log("Extraction metadata:", result.metadata);
        }
      } else if (result && result.error) {
        extractedText = `Extraction failed: ${result.error}`;
        console.log("API returned error:", result.error);
      } else {
        extractedText = "No text could be extracted from the document.";
        console.log("Unexpected response format:", result);
      }

    } catch (extractionError) {
      console.error("Text extraction error:", extractionError);
      extractedText = "Failed to extract text: " + extractionError.message;
    }

    // IMPORTANT: Verify fileUrl hasn't been corrupted
    // console.log("EXTRACTTEXTFROMFILE - Before returning:");
    // console.log("- FileUrl:", fileUrl);
    // console.log("- FileUrl type:", typeof fileUrl);
    // console.log("- FileUrl length:", fileUrl?.length);
    // console.log("- ExtractedText length:", extractedText?.length);
    
    const returnData = {
      extractedText,
      fileUrl,
      fileId,
    };
    
    console.log("EXTRACTTEXTFROMFILE - Return data:", {
      extractedTextLength: returnData.extractedText?.length,
      fileUrl: returnData.fileUrl,
      fileUrlLength: returnData.fileUrl?.length,
      fileId: returnData.fileId
    });
    // console.log("=== EXTRACTTEXTFROMFILE END ===");

    return returnData;
  } catch (error) {
    console.error("Text extraction failed:", error);
    throw new Error("Text extraction failed: " + error.message);
  }
};

// Create document record in database
export async function createDocument(file, userId, fileUrl, extractedText) {
  try {
    // console.log("=== createDocument DEBUG ===");
    // console.log("Received fileUrl:", fileUrl);
    // console.log("Received fileUrl length:", fileUrl?.length);
    // console.log("Received fileUrl type:", typeof fileUrl);
    // console.log("First 200 chars of fileUrl:", fileUrl?.substring(0, 200));
    // console.log("Last 200 chars of fileUrl:", fileUrl?.substring(fileUrl.length - 200));
    // console.log("===============================");

    // Validate fileUrl
    if (!fileUrl || typeof fileUrl !== 'string') {
      throw new Error("Invalid fileUrl: must be a non-empty string");
    }
    
    // Check if fileUrl is corrupted (too long)
    if (fileUrl.length > 2000) {
      console.error("FileUrl is corrupted! Length:", fileUrl.length);
      console.error("FileUrl content:", fileUrl);
      throw new Error(`FileUrl is corrupted (${fileUrl.length} chars). Check your uploadFile function.`);
    }

    // Since your Appwrite field is 1GB, no need to truncate extractedText
    const processedText = extractedText || "empty";

    // console.log("Creating document with:");
    // console.log("- Title:", file.name.replace(/\.[^/.]+$/, ""));
    // console.log("- FileUrl:", fileUrl);
    // console.log("- FileUrl length:", fileUrl.length);
    // console.log("- ExtractedText length:", processedText.length);

    const documentData = {
      title: file.name.replace(/\.[^/.]+$/, ""),
      fileUrl: fileUrl,
      createdAt: new Date().toISOString(),
      fileSize: file.size,
      language: "English",
      userId: userId,
      extractedText: processedText,
      docType: "Document",
    };

    // console.log("Document data prepared, creating in database...");

    const newDocument = await databases.createDocument(
      config.databaseId,
      config.documentCollectionId,
      ID.unique(),
      documentData
    );
    
    // console.log("Document created successfully with ID:", newDocument.$id);
    return newDocument;
    
  } catch (error) {
    console.error("Database creation error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      type: error.type
    });
    
    // Log all field lengths for debugging
    console.error("Field lengths:", {
      title: file.name.replace(/\.[^/.]+$/, "").length,
      fileUrl: fileUrl?.length || 0,
      extractedText: (extractedText || "empty").length,
      userId: userId?.length || 0,
      fileSize: file.size,
      language: "English".length,
      docType: "Document".length
    });
    
    throw new Error("Failed to create document: " + error.message);
  }
}

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
    const recoveryUrl = `${config.webAppUrl}/reset-password`; // e.g., 'https://yourapp.com/reset-password'
    
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
