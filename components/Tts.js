// import React, { useState, useEffect, useRef } from "react";
// import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
// import { FontAwesome, FontAwesome6, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { Picker } from '@react-native-picker/picker';
// import Slider from '@react-native-community/slider';
// import * as FileSystem from 'expo-file-system';
// import * as MediaLibrary from 'expo-media-library';
// import { createAudioPlayer } from 'expo-audio';
// // import languages from './languages'; // Make sure this file exists and has a default export

// // Fallback languages array in case the import fails
// const defaultLanguages = [
//   "English (eng)",
//   "Spanish (spa)", 
//   "French (fra)",
//   "German (deu)",
//   "Italian (ita)",
//   "Portuguese (por)",
//   "Russian (rus)",
//   "Chinese (cmn)",
//   "Japanese (jpn)",
//   "Korean (kor)"
// ];

// // Try to import languages, fallback to default if it fails
// let languages;
// try {
//   languages = require('./languages').default || defaultLanguages;
// } catch (error) {
//   console.warn('Could not import languages file, using default languages');
//   languages = defaultLanguages;
// } export

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
//   const [isDownloading, setIsDownloading] = useState(false);
  
//   // Refs for audio management
//   const chunks = useRef([]);
//   const chunkAudios = useRef({});
//   const currentIndex = useRef(0);
//   const currentPlayer = useRef(null);
//   const isPlayingChunk = useRef(false);
//   const shouldStop = useRef(false);
//   const progressInterval = useRef(null);
//   const chunkStartTime = useRef(0);
//   const totalElapsedTime = useRef(0);
//   const preloadQueue = useRef(new Set());

//   useEffect(() => {
//     return () => {
//       stopPlayback();
//       if (progressInterval.current) {
//         clearInterval(progressInterval.current);
//       }
//     };
//   }, []);

//   const startProgressTracking = () => {
//     if (progressInterval.current) {
//       clearInterval(progressInterval.current);
//     }

//     progressInterval.current = setInterval(() => {
//       if (playing && chunks.current.length > 0) {
//         const estimatedDuration = estimateDuration(text);
//         const chunkDuration = estimatedDuration / chunks.current.length;
//         const currentChunkElapsed = (Date.now() - chunkStartTime.current) / 1000;
//         const currentTotalElapsed = totalElapsedTime.current + currentChunkElapsed;
        
//         setElapsedTime(currentTotalElapsed * 1000); // Convert to milliseconds for slider
//         setProgress((currentTotalElapsed / estimatedDuration) * 100);
        
//         // Update chunk change callback
//         onChunkChange?.(currentIndex.current);
//       }
//     }, 100); // Update every 100ms for smooth progress
//   };

//   const stopProgressTracking = () => {
//     if (progressInterval.current) {
//       clearInterval(progressInterval.current);
//       progressInterval.current = null;
//     }
//   };

//   const reset = () => {
//     currentIndex.current = 0;
//     chunks.current = [];
//     chunkAudios.current = {};
//     isPlayingChunk.current = false;
//     shouldStop.current = false;
//     totalElapsedTime.current = 0;
//     chunkStartTime.current = 0;
//     preloadQueue.current.clear();
    
//     stopProgressTracking();
    
//     // Clean up current player
//     if (currentPlayer.current) {
//       try {
//         currentPlayer.current.release();
//       } catch (error) {
//         console.error("Error releasing player:", error);
//       }
//       currentPlayer.current = null;
//     }
    
//     setElapsedTime(0);
//     setProgress(0);
//   };

//   const stopPlayback = async () => {
//     try {
//       shouldStop.current = true;
//       stopProgressTracking();
      
//       if (currentPlayer.current) {
//         await currentPlayer.current.pause();
//         currentPlayer.current.release();
//         currentPlayer.current = null;
//       }

//       isPlayingChunk.current = false;
//       setPlaying(false);
//     } catch (error) {
//       console.error("Stop playback error:", error);
//       setPlaying(false);
//     }
//   };

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
//             text.slice(0, 900),
//             selectedLanguage
//           ]
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`API request failed with status ${response.status}`);
//       }

//       const result = await response.json();
      
//       if (!result?.data?.[0]?.name) {
//         throw new Error("Unexpected API response format");
//       }

//       return `https://dpc-mmstts.hf.space/file=${result.data[0].name}`;
//     } catch (error) {
//       console.error('TTS generation failed:', error);
//       throw error;
//     }
//   };

//   // Aggressive preloading strategy
//   const preloadNextChunks = async (startIndex, count = 3) => {
//     const loadPromises = [];
    
//     for (let i = startIndex; i < Math.min(startIndex + count, chunks.current.length); i++) {
//       if (!chunkAudios.current[i] && !preloadQueue.current.has(i)) {
//         preloadQueue.current.add(i);
//         loadPromises.push((async () => {
//           try {
//             const audioUrl = await generateAudioFromText(chunks.current[i]);
//             chunkAudios.current[i] = audioUrl;
//             preloadQueue.current.delete(i);
//           } catch (error) {
//             console.error(`Error preloading chunk ${i}:`, error);
//             preloadQueue.current.delete(i);
//           }
//         })());
//       }
//     }
    
//     if (loadPromises.length > 0) {
//       await Promise.all(loadPromises);
//     }
//   };

//   const playNextChunk = async () => {
//     // Check if we should stop
//     if (shouldStop.current || currentIndex.current >= chunks.current.length) {
//       setPlaying(false);
//       isPlayingChunk.current = false;
//       stopProgressTracking();
//       return;
//     }

//     // Prevent overlapping playback
//     if (isPlayingChunk.current) {
//       return;
//     }

//     isPlayingChunk.current = true;
//     const chunkIndex = currentIndex.current;
    
//     try {
//       // Wait for current chunk audio if not ready
//       let attempts = 0;
//       while (!chunkAudios.current[chunkIndex] && attempts < 50) {
//         await new Promise(resolve => setTimeout(resolve, 100));
//         attempts++;
//       }

//       // If still no audio after waiting, generate it
//       if (!chunkAudios.current[chunkIndex]) {
//         const audioUrl = await generateAudioFromText(chunks.current[chunkIndex]);
//         chunkAudios.current[chunkIndex] = audioUrl;
//       }

//       // Clean up previous player
//       if (currentPlayer.current) {
//         try {
//           currentPlayer.current.release();
//         } catch (error) {
//           console.error("Error releasing previous player:", error);
//         }
//       }

//       // Create new player
//       const player = createAudioPlayer({ 
//         uri: chunkAudios.current[chunkIndex]
//       });
      
//       currentPlayer.current = player;

//       // Try to set playback rate using different possible methods
//       if (speed !== 1.0) {
//         try {
//           // Try different possible method names
//           if (typeof player.setRate === 'function') {
//             await player.setRate(speed);
//           } else if (typeof player.setPlaybackRate === 'function') {
//             await player.setPlaybackRate(speed);
//           } else if (typeof player.rate !== 'undefined') {
//             player.rate = speed;
//           }
//           // If none work, the speed will be handled at generation level
//         } catch (error) {
//           console.warn("Speed control not supported by audio player:", error.message);
//         }
//       }

//       // Update timing for progress tracking
//       chunkStartTime.current = Date.now();

//       // Set up completion handler
//       const handlePlaybackComplete = () => {
//         if (shouldStop.current) return;

//         // Update elapsed time
//         const chunkDuration = estimateDuration(chunks.current[chunkIndex]) / chunks.current.length;
//         totalElapsedTime.current += chunkDuration;
        
//         isPlayingChunk.current = false;
//         currentIndex.current++;
        
//         // Immediately play next chunk or finish
//         if (currentIndex.current < chunks.current.length) {
//           // Start aggressive preloading
//           preloadNextChunks(currentIndex.current + 1, 4);
//           // Immediately play next chunk without delay
//           setImmediate(() => playNextChunk());
//         } else {
//           setPlaying(false);
//           stopProgressTracking();
//         }
//       };

//       // Listen for playback completion
//       const statusListener = (status) => {
//         if (status.didJustFinish && !shouldStop.current) {
//           player.removeListener('playbackStatusUpdate', statusListener);
//           handlePlaybackComplete();
//         }
//       };

//       player.addListener('playbackStatusUpdate', statusListener);

//       // Start playback
//       await player.play();
      
//       // Ensure UI shows playing state
//       if (!playing) {
//         setPlaying(true);
//       }
      
//       // Start progress tracking if not already started
//       if (!progressInterval.current) {
//         startProgressTracking();
//       }
      
//       // Aggressive preloading of upcoming chunks
//       if (chunkIndex + 1 < chunks.current.length) {
//         preloadNextChunks(chunkIndex + 1, 4);
//       }

//     } catch (error) {
//       console.error("Playback error:", error);
//       isPlayingChunk.current = false;
//       setPlaying(false);
//       stopProgressTracking();
//     }
//   };

//   const speak = async () => {
//     if (!text) return;

//     if (playing) {
//       await stopPlayback();
//       return;
//     }

//     try {
//       reset();
//       setPlaying(true);
//       setIsLoading(true);
//       shouldStop.current = false;

//       chunks.current = createChunks(text);
//       const estimatedDuration = estimateDuration(text);
//       setTotalDuration(estimatedDuration * 1000);

//       // Aggressive initial preloading
//       await preloadNextChunks(0, 5);
      
//       setIsLoading(false);
//       currentIndex.current = 0;
      
//       // Start progress tracking
//       startProgressTracking();
      
//       // Start playback immediately
//       playNextChunk();
      
//     } catch (error) {
//       console.error("Speech generation error:", error);
//       Alert.alert("Error", "Failed to generate speech");
//       setIsLoading(false);
//       setPlaying(false);
//       stopProgressTracking();
//     }
//   };

//   const downloadAudio = async (text, filename = 'audio.wav') => {
//     if (isDownloading) {
//       Alert.alert('Download in Progress', 'Please wait for the current download to complete');
//       return;
//     }

//     try {
//       setIsDownloading(true);

//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission denied', 'Media library permission is required');
//         setIsDownloading(false);
//         return;
//       }

//       const audioUrl = await generateAudioFromText(text);
//       const fileUri = `${FileSystem.cacheDirectory}${filename}`;
//       const downloadResult = await FileSystem.downloadAsync(audioUrl, fileUri);

//       if (downloadResult.status === 200) {
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

//   const handleDownload = async () => {
//     if (!text) return;
//     if (isDownloading) {
//       Alert.alert('Download in Progress', 'Please wait for the current download to complete');
//       return;
//     }
//     await downloadAudio(text, `speech_${Date.now()}.wav`);
//   };

//   const restart = async () => {
//     await stopPlayback();
//     reset();
//     setTimeout(() => {
//       speak();
//     }, 100);
//   };

//   const increaseSpeed = async () => {
//     const newSpeed = speed < 2.0 ? speed + 0.25 : 1.0;
//     setSpeed(newSpeed);
    
//     // If currently playing, try to update the current player's speed
//     if (playing && currentPlayer.current) {
//       try {
//         // Try different possible method names for setting speed
//         if (typeof currentPlayer.current.setRate === 'function') {
//           await currentPlayer.current.setRate(newSpeed);
//         } else if (typeof currentPlayer.current.setPlaybackRate === 'function') {
//           await currentPlayer.current.setPlaybackRate(newSpeed);
//         } else if (typeof currentPlayer.current.rate !== 'undefined') {
//           currentPlayer.current.rate = newSpeed;
//         } else {
//           // If no speed control available, restart current chunk
//           const currentChunk = currentIndex.current;
//           await currentPlayer.current.pause();
//           currentPlayer.current.release();
//           currentPlayer.current = null;
//           isPlayingChunk.current = false;
          
//           setTimeout(() => {
//             playNextChunk();
//           }, 100);
//         }
//       } catch (error) {
//         console.warn("Could not update playback speed:", error.message);
//       }
//     }
//   };

//   const estimateDuration = (text) => {
//     const words = text.split(/\s+/).length;
//     return ((words / 150) * 60) / speed; // Adjust for speed
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
//           if (playing && chunks.current.length > 0) {
//             const estimatedDuration = estimateDuration(text);
//             const chunkDuration = estimatedDuration / chunks.current.length;
//             const newChunkIndex = Math.floor((value / 1000) / chunkDuration);
//             const targetIndex = Math.min(Math.max(0, newChunkIndex), chunks.current.length - 1);
            
//             if (targetIndex !== currentIndex.current) {
//               currentIndex.current = targetIndex;
//               totalElapsedTime.current = targetIndex * chunkDuration;
              
//               // Stop current playback and start from new position
//               if (currentPlayer.current) {
//                 await currentPlayer.current.pause();
//               }
//               isPlayingChunk.current = false;
//               playNextChunk();
//             }
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
//             styles.controlButton,
//             { opacity: isDownloading ? 0.5 : 1 }
//           ]}
//         >
//           {isDownloading ? (
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



import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import { FontAwesome, FontAwesome6, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { createAudioPlayer } from 'expo-audio';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

// Fallback languages array in case the import fails
const defaultLanguages = [
  "English (eng)",
  "Spanish (spa)", 
  "French (fra)",
  "German (deu)",
  "Italian (ita)",
  "Portuguese (por)",
  "Russian (rus)",
  "Chinese (cmn)",
  "Japanese (jpn)",
  "Korean (kor)"
];

// Try to import languages, fallback to default if it fails
let languages;
try {
  languages = require('./languages').default || defaultLanguages;
} catch (error) {
  console.warn('Could not import languages file, using default languages');
  languages = defaultLanguages;
}

const CHUNK_SIZE = 200; // characters per chunk

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

// Database helper class
class AudioCacheDB {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      this.db = await SQLite.openDatabaseAsync('audio_cache.db');
      
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS audio_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text_hash TEXT UNIQUE NOT NULL,
          language TEXT NOT NULL,
          chunk_index INTEGER NOT NULL,
          audio_uri TEXT NOT NULL,
          file_path TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          UNIQUE(text_hash, language, chunk_index)
        );
        
        CREATE INDEX IF NOT EXISTS idx_text_hash_lang ON audio_cache(text_hash, language);
        CREATE INDEX IF NOT EXISTS idx_created_at ON audio_cache(created_at);
      `);
      
      this.initialized = true;
      
      // Clean old cache entries (older than 7 days)
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      await this.cleanOldEntries(weekAgo);
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  async generateTextHash(text, language) {
    const combined = `${text}_${language}`;
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.MD5, combined);
  }

  async getCachedAudio(textHash, language, chunkIndex) {
    if (!this.initialized) await this.init();
    
    try {
      const result = await this.db.getFirstAsync(
        'SELECT audio_uri, file_path FROM audio_cache WHERE text_hash = ? AND language = ? AND chunk_index = ?',
        [textHash, language, chunkIndex]
      );
      
      if (result) {
        // Check if file still exists
        const fileInfo = await FileSystem.getInfoAsync(result.file_path);
        if (fileInfo.exists) {
          return result.file_path;
        } else {
          // File deleted, remove from cache
          await this.removeCachedAudio(textHash, language, chunkIndex);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached audio:', error);
      return null;
    }
  }

  async cacheAudio(textHash, language, chunkIndex, audioUri) {
    if (!this.initialized) await this.init();
    
    try {
      // Download and save audio file
      const fileName = `audio_${textHash}_${language}_${chunkIndex}.wav`;
      const filePath = `${FileSystem.documentDirectory}audio_cache/${fileName}`;
      
      // Ensure directory exists
      const dirPath = `${FileSystem.documentDirectory}audio_cache/`;
      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
      }
      
      // Download audio file
      const downloadResult = await FileSystem.downloadAsync(audioUri, filePath);
      
      if (downloadResult.status === 200) {
        // Save to database
        await this.db.runAsync(
          'INSERT OR REPLACE INTO audio_cache (text_hash, language, chunk_index, audio_uri, file_path, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [textHash, language, chunkIndex, audioUri, filePath, Date.now()]
        );
        
        return filePath;
      }
      
      return null;
    } catch (error) {
      console.error('Error caching audio:', error);
      return null;
    }
  }

  async removeCachedAudio(textHash, language, chunkIndex) {
    if (!this.initialized) await this.init();
    
    try {
      await this.db.runAsync(
        'DELETE FROM audio_cache WHERE text_hash = ? AND language = ? AND chunk_index = ?',
        [textHash, language, chunkIndex]
      );
    } catch (error) {
      console.error('Error removing cached audio:', error);
    }
  }

  async cleanOldEntries(beforeTimestamp) {
    if (!this.initialized) await this.init();
    
    try {
      // Get old entries to delete their files
      const oldEntries = await this.db.getAllAsync(
        'SELECT file_path FROM audio_cache WHERE created_at < ?',
        [beforeTimestamp]
      );
      
      // Delete files
      for (const entry of oldEntries) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(entry.file_path);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(entry.file_path);
          }
        } catch (error) {
          console.warn('Error deleting old cache file:', error);
        }
      }
      
      // Remove from database
      await this.db.runAsync('DELETE FROM audio_cache WHERE created_at < ?', [beforeTimestamp]);
    } catch (error) {
      console.error('Error cleaning old cache entries:', error);
    }
  }

  async getAllCachedChunks(textHash, language) {
    if (!this.initialized) await this.init();
    
    try {
      const results = await this.db.getAllAsync(
        'SELECT chunk_index, file_path FROM audio_cache WHERE text_hash = ? AND language = ? ORDER BY chunk_index',
        [textHash, language]
      );
      
      const cachedChunks = {};
      for (const result of results) {
        // Verify file exists
        const fileInfo = await FileSystem.getInfoAsync(result.file_path);
        if (fileInfo.exists) {
          cachedChunks[result.chunk_index] = result.file_path;
        }
      }
      
      return cachedChunks;
    } catch (error) {
      console.error('Error getting all cached chunks:', error);
      return {};
    }
  }
}

const TTSFunction = ({ text, onChunkChange }) => {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState("English (eng)");
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cacheStatus, setCacheStatus] = useState('');
  
  // Refs for audio management
  const chunks = useRef([]);
  const chunkAudios = useRef({});
  const currentIndex = useRef(0);
  const currentPlayer = useRef(null);
  const isPlayingChunk = useRef(false);
  const shouldStop = useRef(false);
  const progressInterval = useRef(null);
  const chunkStartTime = useRef(0);
  const totalElapsedTime = useRef(0);
  const preloadQueue = useRef(new Set());
  const audioCacheDB = useRef(new AudioCacheDB());
  const textHash = useRef('');
  const pausedPosition = useRef(0);

  useEffect(() => {
    // Initialize database
    audioCacheDB.current.init();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    // Generate text hash when text or language changes
    if (text) {
      generateTextHashAsync();
    }
  }, [text, selectedLanguage]);

  const generateTextHashAsync = async () => {
    if (text) {
      const hash = await audioCacheDB.current.generateTextHash(text, selectedLanguage);
      textHash.current = hash;
    }
  };

  const cleanup = () => {
    stopProgressTracking();
    if (currentPlayer.current) {
      try {
        currentPlayer.current.release();
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
      currentPlayer.current = null;
    }
  };

  const startProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (playing && !paused && chunks.current.length > 0) {
        const estimatedDuration = estimateDuration(text);
        const chunkDuration = estimatedDuration / chunks.current.length;
        const currentChunkElapsed = (Date.now() - chunkStartTime.current) / 1000;
        const currentTotalElapsed = totalElapsedTime.current + currentChunkElapsed;
        
        setElapsedTime(currentTotalElapsed * 1000);
        setProgress((currentTotalElapsed / estimatedDuration) * 100);
        
        onChunkChange?.(currentIndex.current);
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const reset = () => {
    currentIndex.current = 0;
    chunks.current = [];
    chunkAudios.current = {};
    isPlayingChunk.current = false;
    shouldStop.current = false;
    totalElapsedTime.current = 0;
    chunkStartTime.current = 0;
    pausedPosition.current = 0;
    preloadQueue.current.clear();
    
    stopProgressTracking();
    cleanup();
    
    setElapsedTime(0);
    setProgress(0);
    setPaused(false);
  };

  const stopPlayback = async () => {
    try {
      shouldStop.current = true;
      stopProgressTracking();
      
      if (currentPlayer.current) {
        await currentPlayer.current.pause();
        currentPlayer.current.release();
        currentPlayer.current = null;
      }

      isPlayingChunk.current = false;
      setPlaying(false);
      setPaused(false);
    } catch (error) {
      console.error("Stop playback error:", error);
      setPlaying(false);
      setPaused(false);
    }
  };

  const pausePlayback = async () => {
    try {
      if (currentPlayer.current && playing && !paused) {
        await currentPlayer.current.pause();
        setPaused(true);
        stopProgressTracking();
        
        // Save current position
        const chunkDuration = estimateDuration(text) / chunks.current.length;
        const currentChunkElapsed = (Date.now() - chunkStartTime.current) / 1000;
        pausedPosition.current = currentChunkElapsed;
      }
    } catch (error) {
      console.error("Pause playback error:", error);
    }
  };

  const resumePlayback = async () => {
    try {
      if (currentPlayer.current && playing && paused) {
        // Update start time to account for paused duration
        chunkStartTime.current = Date.now() - (pausedPosition.current * 1000);
        
        await currentPlayer.current.play();
        setPaused(false);
        startProgressTracking();
      }
    } catch (error) {
      console.error("Resume playback error:", error);
    }
  };

  const generateAudioFromText = async (text) => {
    try {
      const response = await fetch("https://dpc-mmstts.hf.space/run/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          data: [
            text.slice(0, 900),
            selectedLanguage
          ]
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
    } catch (error) {
      console.error('TTS generation failed:', error);
      throw error;
    }
  };

  const getOrGenerateAudio = async (chunkText, chunkIndex) => {
    // Check cache first
    const cachedPath = await audioCacheDB.current.getCachedAudio(
      textHash.current, 
      selectedLanguage, 
      chunkIndex
    );
    
    if (cachedPath) {
      return `file://${cachedPath}`;
    }
    
    // Generate new audio
    const audioUrl = await generateAudioFromText(chunkText);
    
    // Cache the audio
    const cachedFilePath = await audioCacheDB.current.cacheAudio(
      textHash.current,
      selectedLanguage,
      chunkIndex,
      audioUrl
    );
    
    return cachedFilePath ? `file://${cachedFilePath}` : audioUrl;
  };

  const preloadNextChunks = async (startIndex, count = 3) => {
    const loadPromises = [];
    
    for (let i = startIndex; i < Math.min(startIndex + count, chunks.current.length); i++) {
      if (!chunkAudios.current[i] && !preloadQueue.current.has(i)) {
        preloadQueue.current.add(i);
        loadPromises.push((async () => {
          try {
            const audioUri = await getOrGenerateAudio(chunks.current[i], i);
            chunkAudios.current[i] = audioUri;
            preloadQueue.current.delete(i);
          } catch (error) {
            console.error(`Error preloading chunk ${i}:`, error);
            preloadQueue.current.delete(i);
          }
        })());
      }
    }
    
    if (loadPromises.length > 0) {
      await Promise.all(loadPromises);
    }
  };

  const playNextChunk = async () => {
    if (shouldStop.current || currentIndex.current >= chunks.current.length) {
      setPlaying(false);
      isPlayingChunk.current = false;
      stopProgressTracking();
      return;
    }

    if (isPlayingChunk.current) {
      return;
    }

    isPlayingChunk.current = true;
    const chunkIndex = currentIndex.current;
    
    try {
      // Wait for current chunk audio if not ready
      let attempts = 0;
      while (!chunkAudios.current[chunkIndex] && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!chunkAudios.current[chunkIndex]) {
        const audioUri = await getOrGenerateAudio(chunks.current[chunkIndex], chunkIndex);
        chunkAudios.current[chunkIndex] = audioUri;
      }

      // Clean up previous player
      if (currentPlayer.current) {
        try {
          currentPlayer.current.release();
        } catch (error) {
          console.error("Error releasing previous player:", error);
        }
      }

      // Create new player
      const player = createAudioPlayer({ 
        uri: chunkAudios.current[chunkIndex]
      });
      
      currentPlayer.current = player;

      // Try to set playback rate
      if (speed !== 1.0) {
        try {
          if (typeof player.setRate === 'function') {
            await player.setRate(speed);
          } else if (typeof player.setPlaybackRate === 'function') {
            await player.setPlaybackRate(speed);
          } else if (typeof player.rate !== 'undefined') {
            player.rate = speed;
          }
        } catch (error) {
          console.warn("Speed control not supported by audio player:", error.message);
        }
      }

      chunkStartTime.current = Date.now();

      const handlePlaybackComplete = () => {
        if (shouldStop.current) return;

        const chunkDuration = estimateDuration(chunks.current[chunkIndex]) / chunks.current.length;
        totalElapsedTime.current += chunkDuration;
        
        isPlayingChunk.current = false;
        currentIndex.current++;
        
        if (currentIndex.current < chunks.current.length) {
          preloadNextChunks(currentIndex.current + 1, 4);
          setImmediate(() => playNextChunk());
        } else {
          setPlaying(false);
          stopProgressTracking();
        }
      };

      const statusListener = (status) => {
        if (status.didJustFinish && !shouldStop.current && !paused) {
          player.removeListener('playbackStatusUpdate', statusListener);
          handlePlaybackComplete();
        }
      };

      player.addListener('playbackStatusUpdate', statusListener);

      await player.play();
      
      if (!playing) {
        setPlaying(true);
      }
      
      if (!progressInterval.current) {
        startProgressTracking();
      }
      
      if (chunkIndex + 1 < chunks.current.length) {
        preloadNextChunks(chunkIndex + 1, 4);
      }

    } catch (error) {
      console.error("Playbook error:", error);
      isPlayingChunk.current = false;
      setPlaying(false);
      stopProgressTracking();
    }
  };

  const checkCacheStatus = async () => {
    if (!textHash.current) return;
    
    const cachedChunks = await audioCacheDB.current.getAllCachedChunks(
      textHash.current, 
      selectedLanguage
    );
    
    const totalChunks = chunks.current.length;
    const cachedCount = Object.keys(cachedChunks).length;
    
    if (cachedCount === totalChunks) {
      setCacheStatus('Fully cached');
    } else if (cachedCount > 0) {
      setCacheStatus(`${cachedCount}/${totalChunks} cached`);
    } else {
      setCacheStatus('Not cached');
    }
    
    return cachedChunks;
  };

  const speak = async () => {
    if (!text) return;

    if (playing && !paused) {
      await pausePlayback();
      return;
    }

    if (playing && paused) {
      await resumePlayback();
      return;
    }

    try {
      reset();
      setPlaying(true);
      setIsLoading(true);
      shouldStop.current = false;

      chunks.current = createChunks(text);
      const estimatedDuration = estimateDuration(text);
      setTotalDuration(estimatedDuration * 1000);

      // Check cache status
      const cachedChunks = await checkCacheStatus();
      
      // Load cached chunks
      for (const [index, filePath] of Object.entries(cachedChunks)) {
        chunkAudios.current[parseInt(index)] = `file://${filePath}`;
      }

      // Preload first few chunks (cached or generate new)
      await preloadNextChunks(0, 5);
      
      setIsLoading(false);
      currentIndex.current = 0;
      
      startProgressTracking();
      playNextChunk();
      
    } catch (error) {
      console.error("Speech generation error:", error);
      Alert.alert("Error", "Failed to generate speech");
      setIsLoading(false);
      setPlaying(false);
      stopProgressTracking();
    }
  };

  const stopAudio = async () => {
    await stopPlayback();
    reset();
  };

  const downloadAudio = async (text, filename = 'audio.wav') => {
    if (isDownloading) {
      Alert.alert('Download in Progress', 'Please wait for the current download to complete');
      return;
    }

    try {
      setIsDownloading(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Media library permission is required');
        setIsDownloading(false);
        return;
      }

      const audioUrl = await generateAudioFromText(text);
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      const downloadResult = await FileSystem.downloadAsync(audioUrl, fileUri);

      if (downloadResult.status === 200) {
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        await MediaLibrary.createAlbumAsync('TTS Audio', asset, false);
        Alert.alert('Success', 'Audio saved to your device');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert("Error", "Failed to download audio");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownload = async () => {
    if (!text) return;
    if (isDownloading) {
      Alert.alert('Download in Progress', 'Please wait for the current download to complete');
      return;
    }
    await downloadAudio(text, `speech_${Date.now()}.wav`);
  };

  const restart = async () => {
    await stopPlayback();
    reset();
    setTimeout(() => {
      speak();
    }, 100);
  };

  const increaseSpeed = async () => {
    const newSpeed = speed < 2.0 ? speed + 0.25 : 1.0;
    setSpeed(newSpeed);
    
    if (playing && currentPlayer.current && !paused) {
      try {
        if (typeof currentPlayer.current.setRate === 'function') {
          await currentPlayer.current.setRate(newSpeed);
        } else if (typeof currentPlayer.current.setPlaybackRate === 'function') {
          await currentPlayer.current.setPlaybackRate(newSpeed);
        } else if (typeof currentPlayer.current.rate !== 'undefined') {
          currentPlayer.current.rate = newSpeed;
        } else {
          const currentChunk = currentIndex.current;
          await currentPlayer.current.pause();
          currentPlayer.current.release();
          currentPlayer.current = null;
          isPlayingChunk.current = false;
          
          setTimeout(() => {
            playNextChunk();
          }, 100);
        }
      } catch (error) {
        console.warn("Could not update playback speed:", error.message);
      }
    }
  };

  const estimateDuration = (text) => {
    const words = text.split(/\s+/).length;
    return ((words / 150) * 60) / speed;
  };

  const formatDuration = (seconds) => {
    if (seconds >= 60) {
      const minutes = (seconds / 60).toFixed(1);
      return `${minutes}m`;
    } else {
      return `${seconds.toFixed(1)}s`;
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
          >
            {languages.map((lang) => (
              <Picker.Item key={lang} label={lang.split(' (')[0]} value={lang} />
            ))}
          </Picker>
        </View>
      </View>

      {cacheStatus && (
        <View style={styles.cacheStatusContainer}>
          <Text style={styles.cacheStatusText}>Cache: {cacheStatus}</Text>
        </View>
      )}

      <Slider
        style={{ width: '100%', height: 35 }}
        minimumValue={0}
        maximumValue={totalDuration}
        value={elapsedTime}
        minimumTrackTintColor="#3273F6"
        maximumTrackTintColor="#d3d3d3"
        onSlidingComplete={async (value) => {
          if (playing && chunks.current.length > 0) {
            const estimatedDuration = estimateDuration(text);
            const chunkDuration = estimatedDuration / chunks.current.length;
            const newChunkIndex = Math.floor((value / 1000) / chunkDuration);
            const targetIndex = Math.min(Math.max(0, newChunkIndex), chunks.current.length - 1);
            
            if (targetIndex !== currentIndex.current) {
              currentIndex.current = targetIndex;
              totalElapsedTime.current = targetIndex * chunkDuration;
              
              if (currentPlayer.current) {
                await currentPlayer.current.pause();
              }
              isPlayingChunk.current = false;
              playNextChunk();
            }
          }
        }}
      />

      <View style={styles.Time}>
        <Text style={styles.TimeTxt}>
          {progress.toFixed(0)}%
        </Text>
        <Text style={styles.TimeTxt}>
          {formatDuration(estimateDuration(text))}
        </Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlButton} onPress={restart}>
          <FontAwesome6 name="rotate-left" size={22} color="#9E9898" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={speak}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : playing && !paused ? (
            <FontAwesome name="pause" size={28} color="white" />
          ) : (
            <FontAwesome name="play" size={22} color="white" />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={stopAudio}>
          <FontAwesome name="stop" size={22} color="#9E9898" />
          <Text style={styles.controlText}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={increaseSpeed}>
          <View style={styles.speedContainer}>
            <Text style={styles.speedText}>{speed.toFixed(2)}x</Text>
          </View>
          <Text style={styles.controlText}>Speed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDownload}
          disabled={isDownloading}
          style={[
            styles.controlButton,
            { opacity: isDownloading ? 0.5 : 1 }
          ]}
        >
          {isDownloading ? (
            <MaterialCommunityIcons name="progress-download" size={24} color="black" />
          ) : (
            <MaterialIcons name="download" size={24} color="black" />
          )}
        </TouchableOpacity>
      </View>
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
  cacheStatusContainer: {
    paddingVertical: 5,
    alignItems: 'center',
  },
  cacheStatusText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
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
 });

export default TTSFunction;