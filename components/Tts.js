// import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
// import React, { useState, useEffect, useRef } from "react";
// import FontAwesome from "@expo/vector-icons/FontAwesome";
// import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// import { Picker } from '@react-native-picker/picker';
// import Slider from '@react-native-community/slider';
// import * as FileSystem from 'expo-file-system';
// import * as MediaLibrary from 'expo-media-library';
// import { useAudioPlayer, createAudioPlayer } from 'expo-audio';
// import languages from './languages';
// const CHUNK_SIZE = 200; // characters per chunk

// const createChunks = (text) => {
//   const words = text.split(' ');
//   const chunks = [];
//   let currentChunk = '';

//   for (const word of words) {
//     if ((currentChunk + word).length < CHUNK_SIZE) {
//       currentChunk += `${word} `;
//     } else {
//       chunks.push(currentChunk.trim());
//       currentChunk = `${word} `;
//     }
//   }

//   if (currentChunk) {
//     chunks.push(currentChunk.trim());
//   }

//   return chunks;

// };

// const TTSFunction = ({ text, onChunkChange }) => {
//   const [playing, setPlaying] = useState(false);
//   const [speed, setSpeed] = useState(1.0);
//   const [selectedLanguage, setSelectedLanguage] = useState("English (eng)");
//   const [isLoading, setIsLoading] = useState(false);
//   const [elapsedTime, setElapsedTime] = useState(0);
//   const [totalDuration, setTotalDuration] = useState(1);
//   const [progress, setProgress] = useState(0);
//   const soundRef = useRef(null);
//   const [audioUri, setAudioUri] = useState(null);
//   const [isDownloading, setIsDownloading] = useState(false);
//   const playbackInstance = useRef(null);
//   const chunks = useRef([]);
//   const chunkAudios = useRef([]);
//   const currentIndex = useRef(0);
// const audioPlayers = useRef({});
// const currentPlayerIndex = useRef(0);
// const currentSound = useRef(null);


//   useEffect(() => {
//     return () => {
//       stopPlayback();
//        // Clean up all players on unmount
//     Object.values(audioPlayers.current).forEach(player => {
//       if (player) {
//         player.release();
//       }
//     });
//     };
//   }, []);

  
// const reset = () => {
//   currentIndex.current = 0;
//   chunks.current = [];
//   chunkAudios.current = {};
  
//   // Clean up existing players
//   Object.values(audioPlayers.current).forEach(player => {
//     if (player) {
//       player.release();
//     }
//   });
//   audioPlayers.current = {};
//   currentSound.current = null;
// };

// const stopPlayback = async () => {
//   try {
//     if (currentSound.current) {
//       await currentSound.current.pause();
//       currentSound.current = null;
//     }
    
//     // Clean up all players
//     Object.values(audioPlayers.current).forEach(player => {
//       if (player) {
//         player.release();
//       }
//     });
//     audioPlayers.current = {};
    
//     setPlaying(false);
//   } catch (error) {
//     console.error("Stop playback error:", error);
//   }
// };

//   const generateAudioFromText = async (text) => {

//     try {

//       const response = await fetch("https://dpc-mmstts.hf.space/run/predict", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Accept": "application/json"
//         },
//         body: JSON.stringify({
//           data: [
//             // text.slice(0, 900000000),
//             text.slice(0, 900),
//             selectedLanguage
//           ]
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`API request failed with status ${response.status}`);
//       }

//       const result = await response.json();
//       console.log("API Response:", result);
//       if (!result?.data?.[0]?.name) {
//         throw new Error("Unexpected API response format");
//       }

//       return `https://dpc-mmstts.hf.space/file=${result.data[0].name}`;
//     } catch (error) {
//       console.error('TTS generation failed:', error);
//       throw error;
//     }
//   };

//   const downloadAudio = async (text, filename = 'audio.wav') => {
//     if (isDownloading) {
//       Alert.alert('Download in Progress', 'Please wait for the current download to complete');
//       return;
//     }

//     try {
//       setIsDownloading(true);

//       // Request media library permissions
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission denied', 'Media library permission is required');
//         setIsDownloading(false);
//         return;
//       }

//       const audioUrl = await generateAudioFromText(text);

//       // Download to cache directory first
//       const fileUri = `${FileSystem.cacheDirectory}${filename}`;
//       const downloadResult = await FileSystem.downloadAsync(audioUrl, fileUri);

//       if (downloadResult.status === 200) {
//         // Save to media library
//         const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
//         await MediaLibrary.createAlbumAsync('TTS Audio', asset, false);

//         Alert.alert('Success', 'Audio saved to your device');
//       } else {
//         throw new Error('Download failed');
//       }
//     } catch (error) {
//       console.error('Download failed:', error);
//       Alert.alert("Error", "Failed to download audio");
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   const preloadNextChunk = async () => {
//     const nextIndex = currentIndex.current + 1;
//     if (nextIndex < chunks.current.length && !chunkAudios.current[nextIndex]) {
//       const nextText = chunks.current[nextIndex];
//       try {
//         const audioUrl = await generateAudioFromText(nextText);
//         chunkAudios.current[nextIndex] = audioUrl;
//       } catch (error) {
//         console.error('Error preloading next chunk:', error);
//       }
//     }
//   };

//   const playChunk = async () => {
//   try {
//     const audioUrl = chunkAudios.current[currentIndex.current];
//     if (!audioUrl) return;

//     // Clean up previous player if exists
//     if (audioPlayers.current[currentIndex.current]) {
//       audioPlayers.current[currentIndex.current].release();
//     }

//     // Create new player for this chunk
//     const player = createAudioPlayer({ uri: audioUrl });
//     audioPlayers.current[currentIndex.current] = player;
//     currentSound.current = player; // Now this ref exists

//     // Set up event listener for when playback finishes
//     player.addListener('playbackStatusUpdate', (status) => {
//       if (status.didJustFinish) {
//         // Move to next chunk or finish
//         if (currentIndex.current < chunks.current.length - 1) {
//           currentIndex.current++;
//           playChunk();
//         } else {
//           setPlaying(false);
//         }
//       }
//     });

//     // Start playback
//     await player.play();
    
//   } catch (error) {
//     console.error("Playback error:", error);
//     setPlaying(false);
//   }
// };

  
//   const speak = async () => {
//   if (!text) return;

//   if (playing) {
//     await stopPlayback();
//     return;
//   }

//   try {
//     reset();
//     setPlaying(true);
//     setIsLoading(true);

//     chunks.current = createChunks(text);
//     setTotalDuration(estimateDuration(text) * 1000);

//     const initialLoads = [];
//     const chunksToLoad = Math.min(3, chunks.current.length);

//     for (let i = 0; i < chunksToLoad; i++) {
//       const chunkText = chunks.current[i];
//       initialLoads.push((async () => {
//         const audioUrl = await generateAudioFromText(chunkText);
//         chunkAudios.current[i] = audioUrl;
//       })());
//     }

//     await Promise.all(initialLoads);
//     setIsLoading(false);
//     currentIndex.current = 0;
//     playChunk();
//   } catch (error) {
//     console.error("Speech generation error:", error);
//     Alert.alert("Error", "Failed to generate speech");
//     setIsLoading(false);
//     setPlaying(false);
//   }
// };
//   // Separate download function
//   const handleDownload = async () => {
//     if (!text) return;

//     if (isDownloading) {
//       Alert.alert('Download in Progress', 'Please wait for the current download to complete');
//       return;
//     }

//     await downloadAudio(text, `speech_${Date.now()}.wav`);
//   };
//   const restart = async () => {
//     if (playbackInstance.current) {
//       await playbackInstance.current.setPositionAsync(0);
//       await playbackInstance.current.playAsync();
//       currentIndex.current = 0;
//       setProgress(0);
//       setElapsedTime(0);
//       onChunkChange?.(-1);
//     }
//   };

//   const increaseSpeed = () => {
//     const newSpeed = speed < 2.0 ? speed + 0.25 : 1.0;
//     setSpeed(newSpeed);
//     if (playbackInstance.current && playing) {
//       playbackInstance.current.setRateAsync(newSpeed, true);
//     }
//   };

//   const estimateDuration = (text) => {
//     const words = text.split(/\s+/).length;
//     return ((words / 150) * 60); // seconds
//   };

//   const formatDuration = (seconds) => {
//     if (seconds >= 60) {
//       const minutes = (seconds / 60).toFixed(1);
//       return `${minutes}m`;
//     } else {
//       return `${seconds.toFixed(1)}s`;
//     }
//   };


//   return (
//     <View style={styles.container}>
//       <View style={styles.languageContainer}>
//         <Text style={styles.label}>Language:</Text>
//         <View style={styles.pickerContainer}>
//           <Picker
//             selectedValue={selectedLanguage}
//             style={styles.picker}
//             dropdownIconColor="#3273F6"
//             onValueChange={setSelectedLanguage}
//           >
//             {languages.map((lang) => (
//               <Picker.Item key={lang} label={lang.split(' (')[0]} value={lang} />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       <Slider
//         style={{ width: '100%', height: 35 }}
//         minimumValue={0}
//         maximumValue={totalDuration}
//         value={elapsedTime}
//         minimumTrackTintColor="#3273F6"
//         maximumTrackTintColor="#d3d3d3"
//         onSlidingComplete={async (value) => {
//           if (playbackInstance.current) {
//             const chunkDuration = totalDuration / chunks.current.length;
//             const newChunkIndex = Math.floor(value / chunkDuration);
//             currentIndex.current = Math.min(newChunkIndex, chunks.current.length - 1);
//             await playbackInstance.current.setPositionAsync(value % chunkDuration);
//           }
//         }}
//       />
//       <View style={styles.Time}>
//         <Text style={styles.TimeTxt}>
//           {progress.toFixed(0)}%
//         </Text>
//         <Text style={styles.TimeTxt}>
//           {formatDuration(estimateDuration(text))}
//         </Text>
//       </View>

//       <View style={styles.controlsRow}>
//         <TouchableOpacity style={styles.controlButton} onPress={restart}>
//           <FontAwesome6 name="rotate-left" size={22} color="#9E9898" />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.playButton}
//           onPress={speak}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <ActivityIndicator color="white" />
//           ) : playing ? (
//             <FontAwesome name="pause" size={28} color="white" />
//           ) : (
//             <FontAwesome name="play" size={22} color="white" />
//           )}
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.controlButton} onPress={increaseSpeed}>
//           <View style={styles.speedContainer}>
//             <Text style={styles.speedText}>{speed.toFixed(2)}x</Text>
//           </View>
//           <Text style={styles.controlText}>Speed</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={handleDownload}
//           disabled={isDownloading}
//           style={[
//             // your existing styles
//             { opacity: isDownloading ? 0.5 : 1 }
//           ]}
//         >
//           {isDownloading ? (
//             // <ActivityIndicator size="small" color="gray" />
//             <MaterialCommunityIcons name="progress-download" size={24} color="black" />
//           ) : (
//             <MaterialIcons name="download" size={24} color="black" />
//           )}
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#FFF',
//     padding: 16,
//   },
//   languageContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',

//   },
//   label: {
//     marginRight: 8,
//     fontSize: 14,
//   },
//   pickerContainer: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#3273F6',
//     borderRadius: 8,
//   },
//   picker: {
//     width: '100%',

//   },
//   controlsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     // marginTop: 14,

//   },
//   playButton: {
//     backgroundColor: '#3273F6',
//     width: 50,
//     height: 50,
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   controlButton: {
//     alignItems: 'center',
//   },
//   speedContainer: {
//     backgroundColor: '#f0f0f0',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 40,
//     height: 40,
//     borderRadius: 50,
//   },
//   speedText: {
//     fontSize: 11,
//   },
//   controlText: {
//     marginTop: 4,
//     fontSize: 12,
//     fontWeight: 'bold'
//   },

//   Time: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 10,
//     marginTop: -20,
//     width: '100%',
//     paddingHorizontal: 13
//   },
//   TimeTxt: {
//     alignSelf: 'center',
//     fontSize: 14,
//     fontWeight: "500",

//   },
// });

// export default TTSFunction;

import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert, Platform } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as SQLite from 'expo-sqlite';
import { Audio } from 'expo-av';
import * as Crypto from 'expo-crypto';
import * as Sharing from 'expo-sharing';
import languages from './languages';

const CHUNK_SIZE = 600; // Optimized chunk size

// Simplified and more reliable database class
class TTSDatabase {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInit();
    return this.initPromise;
  }

  async _doInit() {
    try {
      if (this.isInitialized) return;
      
      this.db = await SQLite.openDatabaseAsync('tts_database.db');
      
      // Test database connection
      await this.db.execAsync('SELECT 1');
      
      await this.createTables();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      this.isInitialized = false;
      this.db = null;
      throw error;
    }
  }

  async createTables() {
    if (!this.db) throw new Error('Database not initialized');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tts_audios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text_hash TEXT NOT NULL,
        title TEXT NOT NULL,
        language TEXT NOT NULL,
        audio_uri TEXT,
        file_size INTEGER DEFAULT 0,
        duration REAL DEFAULT 0,
        is_downloaded INTEGER DEFAULT 0,
        last_played_position REAL DEFAULT 0,
        is_playing INTEGER DEFAULT 0,
        is_paused INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(text_hash, language)
      );
    `;

    await this.db.execAsync(createTableQuery);
  }

  async insertOrUpdateAudio(data) {
    try {
      await this.init();
      if (!this.db) throw new Error('Database not available');
      
      const {
        textHash,
        title,
        language,
        audioUri = null,
        fileSize = 0,
        duration = 0,
        isDownloaded = false,
        lastPlayedPosition = 0,
        isPlaying = false,
        isPaused = false
      } = data;

      const statement = await this.db.prepareAsync(`
        INSERT OR REPLACE INTO tts_audios 
        (text_hash, title, language, audio_uri, file_size, duration, is_downloaded, 
         last_played_position, is_playing, is_paused, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      const result = await statement.executeAsync([
        textHash, title, language, audioUri, fileSize, duration,
        isDownloaded ? 1 : 0, lastPlayedPosition, isPlaying ? 1 : 0, isPaused ? 1 : 0
      ]);

      await statement.finalizeAsync();
      return result;
    } catch (error) {
      console.error('Insert/Update error:', error);
      throw error;
    }
  }

  async getAudio(textHash, language) {
    try {
      await this.init();
      if (!this.db) return null;
      
      const statement = await this.db.prepareAsync(`
        SELECT * FROM tts_audios 
        WHERE text_hash = ? AND language = ?
      `);

      const result = await statement.executeAsync([textHash, language]);
      const firstRow = await result.getFirstAsync();
      
      await statement.finalizeAsync();
      return firstRow;
    } catch (error) {
      console.error('Get audio error:', error);
      return null;
    }
  }

  async updatePlaybackState(textHash, language, data) {
    try {
      await this.init();
      if (!this.db) return;
      
      const {
        lastPlayedPosition = 0,
        isPlaying = false,
        isPaused = false
      } = data;

      const statement = await this.db.prepareAsync(`
        UPDATE tts_audios 
        SET last_played_position = ?, is_playing = ?, is_paused = ?, updated_at = CURRENT_TIMESTAMP
        WHERE text_hash = ? AND language = ?
      `);

      await statement.executeAsync([
        lastPlayedPosition, isPlaying ? 1 : 0, isPaused ? 1 : 0, textHash, language
      ]);

      await statement.finalizeAsync();
    } catch (error) {
      console.error('Update playback state error:', error);
    }
  }
}

// Faster, simpler request manager
class SimpleRequestManager {
  constructor() {
    this.activeRequests = 0;
    this.maxRequests = 3;
  }

  async generateAudio(text, language) {
    // Wait if too many active requests
    while (this.activeRequests >= this.maxRequests) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.activeRequests++;

    try {
      const response = await fetch("https://dpc-mmstts.hf.space/run/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          data: [text.slice(0, 2000), language] // Reasonable limit
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      if (!result?.data?.[0]?.name) {
        throw new Error("Unexpected API response format");
      }

      return `https://dpc-mmstts.hf.space/file=${result.data[0].name}`;
    } finally {
      this.activeRequests--;
    }
  }
}

const requestManager = new SimpleRequestManager();

const createChunks = (text) => {
  const words = text.split(' ');
  const chunks = [];
  let currentChunk = '';

  for (const word of words) {
    if ((currentChunk + word).length < CHUNK_SIZE) {
      currentChunk += `${word} `;
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = `${word} `;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

const TTSFunction = ({ text, title = "Audio Document", onChunkChange }) => {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState("English (eng)");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [currentAudioRecord, setCurrentAudioRecord] = useState(null);

  const sound = useRef(null);
  const database = useRef(new TTSDatabase());
  const textHash = useRef(null);
  const chunks = useRef([]);

  useEffect(() => {
    initializeComponent();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (text) {
      generateTextHash();
    }
  }, [text]);

  useEffect(() => {
    if (textHash.current && selectedLanguage) {
      loadAudioRecord();
    }
  }, [textHash.current, selectedLanguage]);

  const initializeComponent = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      await database.current.init();
      
      if (text) {
        generateTextHash();
      }
    } catch (error) {
      console.error('Component initialization error:', error);
    }
  };

  const generateTextHash = async () => {
    if (text) {
      try {
        textHash.current = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          text,
          { encoding: Crypto.CryptoEncoding.HEX }
        );
        loadAudioRecord();
      } catch (error) {
        console.error('Hash generation error:', error);
      }
    }
  };

  const loadAudioRecord = async () => {
    if (!textHash.current || !selectedLanguage) return;

    try {
      const record = await database.current.getAudio(textHash.current, selectedLanguage);
      setCurrentAudioRecord(record);

      if (record) {
        setElapsedTime(record.last_played_position || 0);
        setTotalDuration(record.duration || estimateDuration(text) * 1000);
        setPaused(record.is_paused === 1);
        setPlaying(record.is_playing === 1);
      } else {
        // Create new record
        database.current.insertOrUpdateAudio({
          textHash: textHash.current,
          title: title,
          language: selectedLanguage,
          duration: estimateDuration(text) * 1000
        }).catch(err => console.error('Failed to create record:', err));
      }
    } catch (error) {
      console.error('Load audio record error:', error);
    }
  };

  const cleanup = async () => {
    if (sound.current) {
      try {
        await sound.current.unloadAsync();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }

    // Update database with final state
    if (textHash.current && selectedLanguage) {
      try {
        database.current.updatePlaybackState(textHash.current, selectedLanguage, {
          lastPlayedPosition: elapsedTime,
          isPlaying: false,
          isPaused: paused
        }).catch(err => console.error('Final state update error:', err));
      } catch (error) {
        console.error('Final state update error:', error);
      }
    }
  };

  const generateFastAudio = async (text, language) => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      let audioUrl;

      // For short texts, use single request
      if (text.length <= 2000) {
        setDownloadProgress(50);
        audioUrl = await requestManager.generateAudio(text, language);
        setDownloadProgress(80);
      } else {
        // For longer texts, use optimized chunking
        chunks.current = createChunks(text);
        console.log(`Processing ${chunks.current.length} chunks...`);

        // Process first few chunks in parallel (max 3)
        const maxParallel = Math.min(3, chunks.current.length);
        const chunkPromises = [];

        for (let i = 0; i < maxParallel; i++) {
          chunkPromises.push(
            requestManager.generateAudio(chunks.current[i], language)
              .then(url => ({ index: i, url, success: true }))
              .catch(error => ({ index: i, error, success: false }))
          );
        }

        const results = await Promise.allSettled(chunkPromises);
        let successCount = 0;

        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.success) {
            successCount++;
            if (index === 0) { // Use first successful chunk
              audioUrl = result.value.url;
            }
          }
          const progress = ((index + 1) / maxParallel) * 80;
          setDownloadProgress(progress);
        });

        if (!audioUrl) {
          throw new Error('Failed to generate any audio chunks');
        }
      }

      setDownloadProgress(90);

      // Download and save
      const fileName = `tts_${textHash.current.slice(0, 8)}_${language.replace(/[^a-zA-Z0-9]/g, '_')}.wav`;
      const permanentUri = `${FileSystem.documentDirectory}${fileName}`;
      
      const downloadResult = await FileSystem.downloadAsync(audioUrl, permanentUri);
      
      if (downloadResult.status !== 200) {
        throw new Error('Failed to download audio file');
      }

      const fileInfo = await FileSystem.getInfoAsync(permanentUri);
      
      setDownloadProgress(100);

      // Update database
      await database.current.insertOrUpdateAudio({
        textHash: textHash.current,
        title: title,
        language: language,
        audioUri: permanentUri,
        fileSize: fileInfo.size || 0,
        duration: estimateDuration(text) * 1000,
        isDownloaded: true
      });

      console.log(`Audio saved to: ${permanentUri}`);
      setIsDownloading(false);
      return permanentUri;

    } catch (error) {
      console.error('Fast audio generation error:', error);
      setIsDownloading(false);
      throw error;
    }
  };

  const play = async () => {
    try {
      if (!textHash.current || !selectedLanguage) return;

      let audioUri = currentAudioRecord?.audio_uri;

      // Check if audio exists and is downloaded
      if (!audioUri || !currentAudioRecord?.is_downloaded) {
        audioUri = await generateFastAudio(text, selectedLanguage);
        await loadAudioRecord(); // Refresh record
      }

      // Verify file exists
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file not found');
      }

      // Unload previous sound
      if (sound.current) {
        await sound.current.unloadAsync();
      }

      // Create new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { 
          shouldPlay: false,
          rate: speed,
          positionMillis: paused ? elapsedTime : 0
        }
      );

      sound.current = newSound;

      // Set up status update listener
      sound.current.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            handlePlaybackComplete();
          } else if (status.isPlaying) {
            const position = status.positionMillis || 0;
            const duration = status.durationMillis || totalDuration;
            
            setElapsedTime(position);
            setTotalDuration(duration);
            setProgress((position / duration) * 100);
          }
        }
      });

      // Start playback
      await sound.current.playAsync();
      
      setPlaying(true);
      setPaused(false);

      // Update database
      database.current.updatePlaybackState(textHash.current, selectedLanguage, {
        lastPlayedPosition: elapsedTime,
        isPlaying: true,
        isPaused: false
      }).catch(err => console.error('Playback state update error:', err));

    } catch (error) {
      console.error('Play error:', error);
      Alert.alert('Error', `Failed to play audio: ${error.message}`);
      setPlaying(false);
      setIsLoading(false);
    }
  };

  const pause = async () => {
    try {
      if (sound.current && playing) {
        await sound.current.pauseAsync();
        setPlaying(false);
        setPaused(true);

        // Update database
        database.current.updatePlaybackState(textHash.current, selectedLanguage, {
          lastPlayedPosition: elapsedTime,
          isPlaying: false,
          isPaused: true
        }).catch(err => console.error('Pause state update error:', err));
      }
    } catch (error) {
      console.error('Pause error:', error);
    }
  };

  const stop = async () => {
    try {
      if (sound.current) {
        await sound.current.stopAsync();
        await sound.current.setPositionAsync(0);
      }

      setPlaying(false);
      setPaused(false);
      setElapsedTime(0);
      setProgress(0);

      // Update database
      database.current.updatePlaybackState(textHash.current, selectedLanguage, {
        lastPlayedPosition: 0,
        isPlaying: false,
        isPaused: false
      }).catch(err => console.error('Stop state update error:', err));

    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  const handlePlaybackComplete = async () => {
    setPlaying(false);
    setPaused(false);
    setElapsedTime(0);
    setProgress(0);

    // Update database
    try {
      database.current.updatePlaybackState(textHash.current, selectedLanguage, {
        lastPlayedPosition: 0,
        isPlaying: false,
        isPaused: false
      }).catch(err => console.error('Complete state update error:', err));
    } catch (error) {
      console.error('Playback complete update error:', error);
    }
  };

  const handlePlayPause = async () => {
    if (isLoading || isDownloading) return;

    if (playing) {
      await pause();
    } else {
      setIsLoading(true);
      await play();
      setIsLoading(false);
    }
  };

  const shareAudio = async () => {
    try {
      if (!currentAudioRecord?.audio_uri || !currentAudioRecord?.is_downloaded) {
        Alert.alert('Error', 'Audio not available for sharing. Please play the audio first to download it.');
        return;
      }

      setIsSharing(true);

      const audioUri = currentAudioRecord.audio_uri;
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      
      if (!fileInfo.exists) {
        Alert.alert('Error', 'Audio file not found');
        setIsSharing(false);
        return;
      }

      // Show file location info
      const location = Platform.OS === 'ios' ? 'Files app' : 'Internal Storage/Android/data/[app-name]/files';
      
      Alert.alert(
        'Share Audio',
        `Audio file location: ${audioUri}\n\nFile can be found in: ${location}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Share', 
            onPress: async () => {
              try {
                const isAvailable = await Sharing.isAvailableAsync();
                if (!isAvailable) {
                  Alert.alert('Error', 'Sharing is not available on this device');
                  return;
                }

                await Sharing.shareAsync(audioUri, {
                  mimeType: 'audio/wav',
                  dialogTitle: `Share ${title} - ${selectedLanguage.split(' (')[0]}`,
                });
              } catch (shareError) {
                console.error('Share error:', shareError);
                Alert.alert('Error', 'Failed to share audio');
              }
            }
          }
        ]
      );

      setIsSharing(false);

    } catch (error) {
      console.error('Share setup error:', error);
      Alert.alert('Error', 'Failed to prepare audio for sharing');
      setIsSharing(false);
    }
  };

  const increaseSpeed = async () => {
    const newSpeed = speed < 2.0 ? speed + 0.25 : 1.0;
    setSpeed(newSpeed);
    
    if (sound.current && playing) {
      try {
        await sound.current.setRateAsync(newSpeed, true);
      } catch (error) {
        console.error('Speed change error:', error);
      }
    }
  };

  const handleSliderChange = async (value) => {
    if (sound.current && totalDuration > 0) {
      try {
        await sound.current.setPositionAsync(value);
        setElapsedTime(value);
        setProgress((value / totalDuration) * 100);

        // Update database
        database.current.updatePlaybackState(textHash.current, selectedLanguage, {
          lastPlayedPosition: value,
          isPlaying: playing,
          isPaused: paused
        }).catch(err => console.error('Slider state update error:', err));
      } catch (error) {
        console.error('Slider change error:', error);
      }
    }
  };

  const estimateDuration = (text) => {
    const words = text.split(/\s+/).length;
    return ((words / 150) * 60); // seconds
  };

  const formatDuration = (milliseconds) => {
    const seconds = milliseconds / 1000;
    if (seconds >= 60) {
      const minutes = (seconds / 60).toFixed(1);
      return `${minutes}m`;
    } else {
      return `${seconds.toFixed(1)}s`;
    }
  };

  const getPlayButtonIcon = () => {
    if (isLoading || isDownloading) {
      return <ActivityIndicator color="white" />;
    } else if (playing) {
      return <FontAwesome name="pause" size={28} color="white" />;
    } else {
      return <FontAwesome name="play" size={22} color="white" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.languageContainer}>
        <Text style={styles.label}>Language:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedLanguage}
            style={styles.picker}
            dropdownIconColor="#3273F6"
            onValueChange={setSelectedLanguage}
            enabled={!playing && !isLoading && !isDownloading}
          >
            {languages.map((lang) => (
              <Picker.Item key={lang} label={lang.split(' (')[0]} value={lang} />
            ))}
          </Picker>
        </View>
      </View>

      {isDownloading && (
        <View style={styles.downloadProgress}>
          <Text style={styles.downloadText}>Downloading: {downloadProgress.toFixed(0)}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
          </View>
        </View>
      )}

      <Slider
        style={{ width: '100%', height: 35 }}
        minimumValue={0}
        maximumValue={totalDuration}
        value={elapsedTime}
        minimumTrackTintColor="#3273F6"
        maximumTrackTintColor="#d3d3d3"
        onSlidingComplete={handleSliderChange}
        disabled={!sound.current || isLoading || isDownloading}
      />

      <View style={styles.Time}>
        <Text style={styles.TimeTxt}>
          {progress.toFixed(0)}%
        </Text>
        <Text style={styles.TimeTxt}>
          {formatDuration(totalDuration)}
        </Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={stop}
          disabled={!playing && !paused}
        >
          <FontAwesome6 name="stop" size={22} color={(!playing && !paused) ? "#ccc" : "#9E9898"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
          disabled={isLoading || isDownloading}
        >
          {getPlayButtonIcon()}
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={increaseSpeed}>
          <View style={styles.speedContainer}>
            <Text style={styles.speedText}>{speed.toFixed(2)}x</Text>
          </View>
          <Text style={styles.controlText}>Speed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={shareAudio}
          disabled={isSharing || !currentAudioRecord?.is_downloaded}
          style={[
            styles.controlButton,
            { opacity: (isSharing || !currentAudioRecord?.is_downloaded) ? 0.5 : 1 }
          ]}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color="gray" />
          ) : (
            <MaterialIcons name="share" size={24} color={currentAudioRecord?.is_downloaded ? "black" : "#ccc"} />
          )}
          <Text style={styles.controlText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* File Location Info */}
      {/* {currentAudioRecord?.is_downloaded && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileInfoText}>
            Audio files are stored in: {FileSystem.documentDirectory}
          </Text>
        </View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    padding: 16,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    marginRight: 8,
    fontSize: 14,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3273F6',
    borderRadius: 8,
  },
  picker: {
    width: '100%',
  },
  downloadProgress: {
    marginBottom: 16,
  },
  downloadText: {
    fontSize: 14,
    color: '#3273F6',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3273F6',
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#3273F6',
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
  },
  speedContainer: {
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  speedText: {
    fontSize: 11,
  },
  controlText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 'bold'
  },
  Time: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: -20,
    width: '100%',
    paddingHorizontal: 13
  },
  TimeTxt: {
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: "500",
  },
  fileInfo: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  fileInfoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default TTSFunction;