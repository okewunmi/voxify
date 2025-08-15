import { FontAwesome6 } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TTSFunction from "../../components/Tts";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getDocumentById } from "../../lib/appwrite";
import AdSenseInterstitialModal from "../../components/Adsense.js";

const createChunks = (text, maxWords = 30) => {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks;
};

const FileView = () => {
  const { fileId } = useLocalSearchParams();
  const navigation = useNavigation();
  // const { modalVisible, setModalVisible } = useGlobalContext();
  const { isModalVisible, setIsModalVisible } = useGlobalContext();
  const [document, setDocument] = useState(null);
  const [documentSummary, setDocumentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSummaryModal, setIsSummaryModal] = useState(false);
  const [isTranslateModal, setIsTranslateModal] = useState(false);
  const [isTranslateModalSelect, setIsTranslateModalSelect] = useState(false);
  const [selectedLanguageFrom, setSelectedLanguageFrom] = useState("English");
  const [selectedLanguageTo, setSelectedLanguageTo] = useState("English");
  const scrollViewRef = useRef(null);
  const chunkRefs = useRef([]);
  const [showAd, setShowAd] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);
  const languages = [
    "Acehnese (Arabic script)",
    "Acehnese (Latin script)",
    "Afrikaans",
    "Akan",
    "Amharic",
    "Armenian",
    "Assamese",
    "Asturian",
    "Awadhi",
    "Ayacucho Quechua",
    "Balinese",
    "Bambara",
    "Banjar (Arabic script)",
    "Banjar (Latin script)",
    "Bashkir",
    "Basque",
    "Belarusian",
    "Bemba",
    "Bengali",
    "Bhojpuri",
    "Bosnian",
    "Buginese",
    "Bulgarian",
    "Burmese",
    "Catalan",
    "Cebuano",
    "Central Atlas Tamazight",
    "Central Aymara",
    "Central Kanuri (Arabic script)",
    "Central Kanuri (Latin script)",
    "Central Kurdish",
    "Chhattisgarhi",
    "Chinese (Simplified)",
    "Chinese (Traditional)",
    "Chokwe",
    "Crimean Tatar",
    "Croatian",
    "Czech",
    "Danish",
    "Dari",
    "Dutch",
    "Dyula",
    "Dzongkha",
    "Eastern Panjabi",
    "Eastern Yiddish",
    "Egyptian Arabic",
    "English",
    "Esperanto",
    "Estonian",
    "Ewe",
    "Faroese",
    "Fijian",
    "Finnish",
    "Fon",
    "French",
    "Friulian",
    "Galician",
    "Ganda",
    "Georgian",
    "German",
    "Greek",
    "Guarani",
    "Gujarati",
    "Haitian Creole",
    "Halh Mongolian",
    "Hausa",
    "Hebrew",
    "Hindi",
    "Hungarian",
    "Icelandic",
    "Igbo",
    "Ilocano",
    "Indonesian",
    "Irish",
    "Italian",
    "Japanese",
    "Javanese",
    "Jingpho",
    "Kabiyè",
    "Kabuverdianu",
    "Kabyle",
    "Kamba",
    "Kannada",
    "Kashmiri (Arabic script)",
    "Kashmiri (Devanagari script)",
    "Kazakh",
    "Khmer",
    "Kikongo",
    "Kikuyu",
    "Kimbundu",
    "Kinyarwanda",
    "Korean",
    "Kyrgyz",
    "Lao",
    "Latgalian",
    "Ligurian",
    "Limburgish",
    "Lingala",
    "Lithuanian",
    "Lombard",
    "Luba-Kasai",
    "Luo",
    "Luxembourgish",
    "Macedonian",
    "Magahi",
    "Maithili",
    "Malayalam",
    "Maltese",
    "Maori",
    "Marathi",
    "Meitei (Bengali script)",
    "Mesopotamian Arabic",
    "Minangkabau (Latin script)",
    "Mizo",
    "Modern Standard Arabic",
    "Moroccan Arabic",
    "Mossi",
    "Najdi Arabic",
    "Nepali",
    "Nigerian Fulfulde",
    "North Azerbaijani",
    "North Levantine Arabic",
    "Northern Kurdish",
    "Northern Sotho",
    "Northern Uzbek",
    "Norwegian Bokmål",
    "Norwegian Nynorsk",
    "Nuer",
    "Nyanja",
    "Occitan",
    "Odia",
    "Pangasinan",
    "Papiamento",
    "Plateau Malagasy",
    "Polish",
    "Portuguese",
    "Romanian",
    "Rundi",
    "Russian",
    "Samoan",
    "Sango",
    "Sanskrit",
    "Santali",
    "Sardinian",
    "Scottish Gaelic",
    "Serbian",
    "Shan",
    "Shona",
    "Sicilian",
    "Silesian",
    "Sindhi",
    "Sinhala",
    "Slovak",
    "Slovenian",
    "Somali",
    "South Azerbaijani",
    "South Levantine Arabic",
    "Southern Pashto",
    "Southern Sotho",
    "Southwestern Dinka",
    "Spanish",
    "Standard Latvian",
    "Standard Malay",
    "Standard Tibetan",
    "Sundanese",
    "Swahili",
    "Swati",
    "Swedish",
    "Tagalog",
    "Tajik",
    "Tamasheq (Latin script)",
    "Tamasheq (Tifinagh script)",
    "Tamil",
    "Tatar",
    "Ta’izzi-Adeni Arabic",
    "Telugu",
    "Thai",
    "Tigrinya",
    "Tok Pisin",
    "Tosk Albanian",
    "Tsonga",
    "Tswana",
    "Tumbuka",
    "Tunisian Arabic",
    "Turkish",
    "Turkmen",
    "Twi",
    "Ukrainian",
    "Umbundu",
    "Urdu",
    "Uyghur",
    "Venetian",
    "Vietnamese",
    "Waray",
    "Welsh",
    "West Central Oromo",
    "Western Persian",
    "Wolof",
    "Xhosa",
    "Yoruba",
    "Yue Chinese",
    "Zulu",
  ];

// Use ref to store the pending function to execute after ad closes
  const pendingActionRef = useRef(null);

  // Handler for when ad is closed
  const handleAdClosed = () => {
    console.log('Ad closed by user');
    setShowAd(false);
    
    // Execute the pending action if it exists
    if (pendingActionRef.current) {
      console.log('Executing pending action after ad closed');
      const pendingAction = pendingActionRef.current;
      pendingActionRef.current = null; // Clear the pending action
      
      // Execute the pending function
      pendingAction();
    }
  };

  // Handler for manual close
  const handleCloseAd = () => {
    console.log('Ad modal closed');
    setShowAd(false);
    
  };

  useEffect(() => {
    fetchDocument();
  }, [fileId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 15, paddingRight: 10 }}>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <FontAwesome6 name="microchip" size={24} color="black" />
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => console.log('Download pressed')}>
            <MaterialIcons name="download" size={24} color="black" />
          </TouchableOpacity> */}
        </View>
      ),
    });
  }, [navigation]);

  const fetchDocument = async () => {
    try {
      const doc = await getDocumentById(fileId);
      setDocument(doc);
    } catch (error) {
      console.error("Error loading document:", error);
      Alert.alert("Error", "Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    console.log("Starting translating...");
    setIsModalVisible(false);
    setIsTranslateModalSelect(true);
  };

  const handleSummary = async () => {
    console.log("Starting summary...");
  };

// Modified handleFileUpload to show ad first
  const handleTranslation = async () => {
    // console.log('File upload initiated - showing ad first');
    
    // Store the actual upload function as pending action
    pendingActionRef.current = executehandleTranslation;
    
    // Show the ad
    setShowAd(true);
  };
  

  const executehandleTranslation = async () => {
    console.log("Starting translation...");
    setIsTranslateModalSelect(false);
    setIsTranslateModal(true);

    try {
      const text = documentSummary || document?.extractedText || "";
      if (!text.trim()) {
        console.warn("No text to translate.");
        setTranslatedText("No text available to translate.");
        return;
      }

      console.log("Text to translate:", text.substring(0, 100) + "...");

      // Method 1: Try direct prediction first
      try {
        console.log("Trying direct prediction method...");
        const directResponse = await fetch(
          "https://unesco-nllb.hf.space/run/predict",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              data: [text, selectedLanguageFrom, selectedLanguageTo],
              fn_index: 0,
            }),
          }
        );

        if (directResponse.ok) {
          const directResult = await directResponse.json();
          console.log("Direct prediction response:", directResult);

          if (
            directResult?.data &&
            Array.isArray(directResult.data) &&
            directResult.data[0]
          ) {
            setTranslatedText(cleanTranslatedText(directResult.data[0]));
            console.log(
              "Direct translation successful:",
              directResult.data[0].substring(0, 100) + "..."
            );
            return;
          }
        }
      } catch (directError) {
        console.log(
          "Direct method failed, trying async method:",
          directError.message
        );
      }

      // Method 2: Async method with improved polling
      const response = await fetch(
        "https://unesco-nllb.hf.space/call/translate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            data: [text, selectedLanguageFrom, selectedLanguageTo],
            event_data: null,
            fn_index: 0,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `Translation failed with status ${response.status}: ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Initial API Response:", result);

      // Handle the response
      if (result?.event_id) {
        console.log("Got event_id:", result.event_id);
        // Poll for the result using the event_id
        const translatedText = await pollForTranslationResult(result.event_id);
        setTranslatedText(translatedText);
        console.log(
          "Translation successful:",
          translatedText.substring(0, 100) + "..."
        );
      } else if (result?.data && Array.isArray(result.data) && result.data[0]) {
        // Direct result
        setTranslatedText(cleanTranslatedText(result.data[0]));
        console.log(
          "Direct translation successful:",
          result.data[0].substring(0, 100) + "..."
        );
      } else {
        console.warn("Translation returned unexpected format:", result);
        throw new Error("Translation returned no usable data");
      }
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText(
        `Translation failed: ${error.message}. Please try again.`
      );
    } finally {
      setTimeout(() => {
        setIsTranslateModal(false);
      }, 2000);
    }
  };

  // Helper function to poll for translation results
  const pollForTranslationResult = async (eventId, maxAttempts = 100) => {
    console.log("Starting to poll for result with event_id:", eventId);

    // Try different endpoint patterns
    const endpointPatterns = [
      `https://unesco-nllb.hf.space/call/translate/${eventId}`,
      `https://unesco-nllb.hf.space/api/queue/data/${eventId}`,
      `https://unesco-nllb.hf.space/queue/join/${eventId}`,
      `https://unesco-nllb.hf.space/queue/status/${eventId}`,
    ];

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Wait before polling (except first attempt)
        if (attempt > 0) {
          const waitTime = Math.min(1000 + attempt * 300, 2500);
          console.log(
            `Waiting ${waitTime}ms before poll attempt ${attempt + 1}`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }

        console.log(`Poll attempt ${attempt + 1}/${maxAttempts}`);

        // Try the primary endpoint first, then alternatives if it keeps failing
        const endpointIndex =
          attempt < 15
            ? 0
            : Math.min(
                Math.floor((attempt - 15) / 2),
                endpointPatterns.length - 1
              );
        const pollUrl = endpointPatterns[endpointIndex];

        if (endpointIndex > 0) {
          console.log(`Trying alternative endpoint: ${pollUrl}`);
        }

        const pollResponse = await fetch(pollUrl, {
          method: "GET",
          headers: {
            Accept: "text/event-stream, application/json, text/plain",
            "Cache-Control": "no-cache",
          },
        });

        console.log(
          `Poll attempt ${attempt + 1}, status: ${
            pollResponse.status
          }, endpoint: ${pollUrl}`
        );

        if (pollResponse.ok) {
          const responseText = await pollResponse.text();
          console.log(
            `Raw response (first 400 chars):`,
            responseText.substring(0, 400)
          );

          // Try to parse the result
          const translation = parseTranslationResponse(responseText);
          if (translation) {
            console.log("Successfully extracted translation");
            return translation;
          }

          // Check if we got a heartbeat or processing message
          if (
            responseText.includes("event: heartbeat") ||
            responseText.includes("event: process_starts") ||
            responseText.includes("event: process_generating") ||
            responseText.includes('"status": "processing"') ||
            responseText.includes('"status": "pending"')
          ) {
            console.log("Received processing message, continuing to poll...");
            continue;
          }

          // Check if the job is complete but we just can't parse it yet
          if (
            responseText.includes("event: complete") ||
            responseText.includes('"status": "complete"')
          ) {
            console.log("Job marked as complete, trying to parse...");
            // Continue to next iteration to try parsing again
            continue;
          }

          console.log(
            "Response received but no translation found, continuing to poll..."
          );
        } else if (pollResponse.status === 404) {
          // Only log 404s for the first few attempts on primary endpoint
          if (attempt < 5 || endpointIndex > 0) {
            console.log("Event not found yet, continuing to poll...");
          }
        } else if (pollResponse.status === 503) {
          console.log("Service temporarily unavailable, continuing to poll...");
        } else {
          console.warn(
            `Unexpected status ${pollResponse.status}, continuing to poll...`
          );

          // Try to get error details
          try {
            const errorText = await pollResponse.text();
            console.log("Error response:", errorText.substring(0, 200));
          } catch (e) {
            console.log("Could not read error response");
          }
        }
      } catch (error) {
        console.warn(`Poll attempt ${attempt + 1} failed:`, error.message);
        // Continue polling unless it's the last attempt
        if (attempt === maxAttempts - 1) {
          throw error;
        }
      }
    }

    throw new Error(
      `Translation timeout after ${maxAttempts} attempts. The service may be busy or the event ID is invalid.`
    );
  };

  // Helper function to parse different response formats
  const parseTranslationResponse = (responseText) => {
    console.log("Parsing response text...");

    try {
      // Method 1: Look for SSE event: complete with data
      if (responseText.includes("event: complete")) {
        console.log("Found 'event: complete', looking for data...");

        // Look for the last data line after event: complete
        const lines = responseText.split("\n");
        let foundComplete = false;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          if (line === "event: complete") {
            foundComplete = true;
            continue;
          }

          if (foundComplete && line.startsWith("data: ")) {
            try {
              const dataStr = line.substring(6); // Remove 'data: '
              const parsed = JSON.parse(dataStr);

              if (
                Array.isArray(parsed) &&
                parsed.length > 0 &&
                typeof parsed[0] === "string"
              ) {
                console.log("Found translation in complete event data");
                return cleanTranslatedText(parsed[0]);
              }
            } catch (e) {
              console.log("Failed to parse complete event data:", e.message);
            }
          }
        }
      }

      // Method 2: Look for any data: [...] patterns
      const dataRegex = /data:\s*\[(.*?)\]/g;
      let match;
      const allMatches = [];

      while ((match = dataRegex.exec(responseText)) !== null) {
        try {
          const dataArray = JSON.parse(`[${match[1]}]`);
          if (
            dataArray.length > 0 &&
            typeof dataArray[0] === "string" &&
            dataArray[0].trim()
          ) {
            allMatches.push(dataArray[0]);
          }
        } catch (e) {
          continue;
        }
      }

      if (allMatches.length > 0) {
        // Return the last (most recent) translation
        const lastTranslation = allMatches[allMatches.length - 1];
        console.log("Found translation in data array");
        return cleanTranslatedText(lastTranslation);
      }

      // Method 3: Try to parse entire response as JSON
      const jsonResponse = JSON.parse(responseText);
      if (
        jsonResponse?.data &&
        Array.isArray(jsonResponse.data) &&
        jsonResponse.data[0]
      ) {
        console.log("Found translation in JSON response");
        return cleanTranslatedText(jsonResponse.data[0]);
      }
    } catch (parseError) {
      console.log("JSON parsing failed, trying line-by-line parsing");

      // Method 4: Line by line parsing for malformed JSON
      const lines = responseText.split("\n");
      for (const line of lines) {
        if (line.includes("data:") && line.includes('"')) {
          try {
            // Extract quoted strings from the line
            const quotedStrings = line.match(/"([^"\\]*(\\.[^"\\]*)*)"/g);
            if (quotedStrings && quotedStrings.length > 0) {
              for (const quoted of quotedStrings) {
                const cleaned = quoted.slice(1, -1); // Remove quotes
                if (cleaned.length > 10) {
                  // Assume translation is longer than 10 chars
                  console.log("Found translation in quoted string");
                  return cleanTranslatedText(cleaned);
                }
              }
            }
          } catch (e) {
            continue;
          }
        }
      }
    }

    console.log("No translation found in response");
    return null;
  };

  // Helper function to clean translated text
  const cleanTranslatedText = (text) => {
    if (!text || typeof text !== "string") return text;

    return (
      text
        // Decode Unicode escapes
        .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) =>
          String.fromCharCode(parseInt(hex, 16))
        )
        // Decode common escape sequences
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\")
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\r/g, "\r")
        // Trim whitespace
        .trim()
    );
  };

  const handleChunkChange = (index) => {
    setActiveIndex(index);
    if (chunkRefs.current[index]) {
      chunkRefs.current[index].measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y: y - 60, animated: true });
        },
        (error) => console.error("measureLayout error:", error)
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3273F6" />
      </View>
    );
  }

  if (!document) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No document found</Text>
      </View>
    );
  }

  const chunks = createChunks(document?.extractedText || "");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView ref={scrollViewRef} style={styles.scroll}>
        <View style={styles.boxTxt}>
          <Text style={styles.headerTitle}>
            {document?.title || "Untitled"}
          </Text>
        </View>
        {/*
        <View>
          {chunks.map((chunk, index) => (
            <Text
              key={index}
              ref={(ref) => (chunkRefs.current[index] = ref)}
              style={[
                styles.txt,
                index === activeIndex && styles.activeChunk,
              ]}
            >
              {chunk}
            </Text>
          ))}
       </View>*/}
        <View>
          {translatedText ? (
            <Text style={styles.txt}>{translatedText}</Text>
          ) : documentSummary ? (
            <Text style={styles.txt}>{documentSummary}</Text>
          ) : (
            chunks.map((chunk, index) => (
              <Text
                key={index}
                ref={(ref) => (chunkRefs.current[index] = ref)}
                style={[
                  styles.txt,
                  index === activeIndex && styles.activeChunk,
                ]}
              >
                {chunk}
              </Text>
            ))
          )}
        </View>
      </ScrollView>
      <TTSFunction
        text={
          translatedText || documentSummary || document?.extractedText || ""
        }
        onChunkChange={handleChunkChange}
      />

      {/* Modal triggered by header icon */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <AntDesign name="closecircleo" size={22} color="red" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Artificial Intellingent </Text>
            <View style={styles.modalBtns}>
              {/*<TouchableOpacity
                style={styles.summaryButton}
                // onPress={() => setIsModalVisible(false)}
                onPress={handleSummary}
              >
                <View style={styles.summaryView}>
                  <MaterialIcons name="summarize" size={22} color="gold" />
                  <Text style={styles.summaryText}>Summarize</Text>
                </View>

                <MaterialIcons name="arrow-forward-ios" size={20} color="grey" />
              </TouchableOpacity>*/}
              <TouchableOpacity
                style={styles.summaryButton}
                onPress={handleTranslate}
              >
                <View style={styles.summaryView}>
                  <MaterialIcons name="translate" size={22} color="gold" />
                  <Text style={styles.summaryText}>Translate</Text>
                </View>

                <MaterialIcons
                  name="arrow-forward-ios"
                  size={20}
                  color="grey"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal triggered Summary*/}
      <Modal
        visible={isSummaryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSummaryModal(false)}
      >
        <View style={styles.modalOverlaySummary}>
          <View style={styles.modalContentSummary}>
            <FontAwesome name="cogs" size={70} color="brown" />
            <Text style={styles.modalTxt}>Summary... </Text>
          </View>
        </View>
      </Modal>

      {/* Modal for Translation selection */}
      <Modal
        visible={isTranslateModalSelect}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsTranslateModalSelect(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsTranslateModalSelect(false)}
            >
              <AntDesign name="closecircleo" size={22} color="red" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Translate </Text>
            <View style={styles.language}>
              <View style={styles.languageContainer}>
                <Text style={styles.label}>From:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedLanguageFrom}
                    style={styles.picker}
                    dropdownIconColor="#3273F6"
                    onValueChange={setSelectedLanguageFrom}
                  >
                    {languages.map((lang) => (
                      <Picker.Item
                        key={lang}
                        label={lang.split(" (")[0]}
                        value={lang}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.languageContainer}>
                <Text style={styles.label}>To:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedLanguageTo}
                    style={styles.picker}
                    dropdownIconColor="#3273F6"
                    onValueChange={setSelectedLanguageTo}
                  >
                    {languages.map((lang) => (
                      <Picker.Item
                        key={lang}
                        label={lang.split(" (")[0]}
                        value={lang}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.TranslateBtns}>
                <TouchableOpacity
                  style={styles.TranslateBtn}
                  onPress={handleTranslation}
                >
                  <Text style={styles.TranslateBtnTxt}> Translate </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.TranslateBtn}
                  onPress={() => setIsTranslateModalSelect(false)}
                >
                  <Text style={styles.TranslateBtnTxt}> Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal triggered Translation*/}
      <Modal
        visible={isTranslateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsTranslateModal(false)}
      >
        <View style={styles.modalOverlaySummary}>
          <View style={styles.modalContentSummary}>
            <FontAwesome name="cogs" size={70} color="brown" />
            <Text style={styles.modalTxt}>Translating... </Text>
          </View>
        </View>
      </Modal>

      {/* Ad Interstitial Modal */}

       <AdSenseInterstitialModal
        visible={showAd}
        onClose={handleCloseAd}
        onAdClosed={handleAdClosed}
        autoShow={true}
      /> 
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#ebf5fb",
    // backgroundColor: "#eeee",
    paddingTop: 20,
    paddingHorizontal: 12,
    marginTop: -25.2,
  },
  boxTxt: {},
  headerTitle: {
    textAlign: "justify",
    lineHeight: 25,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  txt: {
    textAlign: "justify",
    lineHeight: 30,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  activeChunk: {
    backgroundColor: "#d0e6ff",
    padding: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    height: "100%",
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
    minHeight: "27%",
    alignItems: "center",
  },
  modalContentSummary: {
    width: 180,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,

    // iOS Shadow
    shadowColor: "#000",
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
    borderColor: "#cecece",
    width: "100%",
    textAlign: "center",
    paddingBottom: 15,
  },
  modalTxt: {
    fontSize: 14,
  },
  modalBtns: {
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
    marginTop: 20,
  },
  summaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderColor: "#cecece",
    borderWidth: 1,
    width: "100%",
    paddingVertical: 13,
    paddingHorizontal: 10,
  },
  summaryText: {
    color: "black",
    fontSize: 14,
    fontWeight: "bold",
  },
  summaryView: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  closeButton: {
    marginVertical: 5,
    alignSelf: "flex-end",
  },
  closeText: {
    color: "blue",
  },
  language: {
    flexDirection: "column",
    width: "100%",
    paddingHorizontal: 20,
    gap: 10,
    alignItems: "center",
  },
  languageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    width: 50,
    fontSize: 14,
    fontWeight: "bold",
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#3273F6",
    borderRadius: 8,
  },
  picker: {
    width: "100%",
    height: 50,
    alignItems: "center",
  },
  TranslateBtns: {
    gap: 20,
    flexDirection: "row",
    marginTop: 10,
    marginLeft: 40,
  },
  TranslateBtn: {
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: "#3273F6",
  },
  TranslateBtnTxt: {
    color: "#fff",
  },
});

export default FileView;
