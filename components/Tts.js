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


import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert, Share } from "react-native";
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
import { useAudioPlayer, createAudioPlayer } from 'expo-audio';
import * as Crypto from 'expo-crypto';
import languages from './languages';

const CHUNK_SIZE = 200; // characters per chunk

// Database setup and management
class TTSDatabase {
  constructor() {
    this.db = null;
  }

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync('tts_database.db');
      await this.createTables();
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  async createTables() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tts_audios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text_hash TEXT NOT NULL,
        title TEXT NOT NULL,
        language TEXT NOT NULL,
        audio_uri TEXT,
        file_size INTEGER,
        duration REAL,
        is_downloaded BOOLEAN DEFAULT 0,
        last_played_position REAL DEFAULT 0,
        is_playing BOOLEAN DEFAULT 0,
        is_paused BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(text_hash, language)
      );
    `;

    await this.db.execAsync(createTableQuery);
  }

  async insertOrUpdateAudio(data) {
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

    const query = `
      INSERT OR REPLACE INTO tts_audios 
      (text_hash, title, language, audio_uri, file_size, duration, is_downloaded, 
       last_played_position, is_playing, is_paused, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    try {
      await this.db.runAsync(query, [
        textHash, title, language, audioUri, fileSize, duration,
        isDownloaded, lastPlayedPosition, isPlaying, isPaused
      ]);
    } catch (error) {
      console.error('Insert/Update error:', error);
      throw error;
    }
  }

  async getAudio(textHash, language) {
    const query = `
      SELECT * FROM tts_audios 
      WHERE text_hash = ? AND language = ?
    `;

    try {
      const result = await this.db.getFirstAsync(query, [textHash, language]);
      return result;
    } catch (error) {
      console.error('Get audio error:', error);
      return null;
    }
  }

  async updatePlaybackState(textHash, language, data) {
    const {
      lastPlayedPosition = 0,
      isPlaying = false,
      isPaused = false
    } = data;

    const query = `
      UPDATE tts_audios 
      SET last_played_position = ?, is_playing = ?, is_paused = ?, updated_at = CURRENT_TIMESTAMP
      WHERE text_hash = ? AND language = ?
    `;

    try {
      await this.db.runAsync(query, [
        lastPlayedPosition, isPlaying, isPaused, textHash, language
      ]);
    } catch (error) {
      console.error('Update playback state error:', error);
    }
  }

  async getAllAudios() {
    const query = `SELECT * FROM tts_audios ORDER BY updated_at DESC`;
    try {
      const results = await this.db.getAllAsync(query);
      return results;
    } catch (error) {
      console.error('Get all audios error:', error);
      return [];
    }
  }
}

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

  const audioPlayer = useRef(null);
  const database = useRef(new TTSDatabase());
  const textHash = useRef(null);
  const positionUpdateInterval = useRef(null);
  const chunks = useRef([]);
  const chunkAudios = useRef([]);
  const currentChunkIndex = useRef(0);

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
    await database.current.init();
    generateTextHash();
  };

  const generateTextHash = async () => {
    if (text) {
      textHash.current = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        text,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      await loadAudioRecord();
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
        setPaused(record.is_paused || false);
        setPlaying(record.is_playing || false);

        // Resume playback state if it was playing
        if (record.is_playing && record.audio_uri) {
          await resumePlayback(record);
        }
      } else {
        // Create new record
        await database.current.insertOrUpdateAudio({
          textHash: textHash.current,
          title: title,
          language: selectedLanguage,
          duration: estimateDuration(text) * 1000
        });
        await loadAudioRecord();
      }
    } catch (error) {
      console.error('Load audio record error:', error);
    }
  };

  const cleanup = async () => {
    if (positionUpdateInterval.current) {
      clearInterval(positionUpdateInterval.current);
    }

    if (audioPlayer.current) {
      try {
        await audioPlayer.current.pause();
        audioPlayer.current.release();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }

    // Update database with final state
    if (textHash.current && selectedLanguage) {
      await database.current.updatePlaybackState(textHash.current, selectedLanguage, {
        lastPlayedPosition: elapsedTime,
        isPlaying: false,
        isPaused: paused
      });
    }
  };

  const generateCompleteAudio = async (text, language) => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      chunks.current = createChunks(text);
      chunkAudios.current = [];

      // Generate audio for all chunks
      for (let i = 0; i < chunks.current.length; i++) {
        const chunkText = chunks.current[i];
        
        const response = await fetch("https://dpc-mmstts.hf.space/run/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            data: [chunkText.slice(0, 900), language]
          })
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        if (!result?.data?.[0]?.name) {
          throw new Error("Unexpected API response format");
        }

        const audioUrl = `https://dpc-mmstts.hf.space/file=${result.data[0].name}`;
        chunkAudios.current.push(audioUrl);

        // Update progress
        const progressPercent = ((i + 1) / chunks.current.length) * 100;
        setDownloadProgress(progressPercent);
      }

      // Merge all audio chunks into a single file
      const mergedAudioUri = await mergeAudioChunks(chunkAudios.current);
      
      // Save to permanent location
      const fileName = `tts_${textHash.current}_${language.replace(/[^a-zA-Z0-9]/g, '_')}.wav`;
      const permanentUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.copyAsync({
        from: mergedAudioUri,
        to: permanentUri
      });

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(permanentUri);
      
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

      setIsDownloading(false);
      return permanentUri;

    } catch (error) {
      console.error('Complete audio generation error:', error);
      setIsDownloading(false);
      throw error;
    }
  };

  const mergeAudioChunks = async (audioUrls) => {
    // This is a simplified merge - in practice, you might want to use a more sophisticated audio merging library
    // For now, we'll just download and concatenate the first chunk as a placeholder
    // In a real implementation, you'd use FFmpeg or similar for proper audio concatenation
    
    if (audioUrls.length === 0) return null;
    
    const firstAudioUrl = audioUrls[0];
    const tempUri = `${FileSystem.cacheDirectory}temp_merged_audio.wav`;
    
    const downloadResult = await FileSystem.downloadAsync(firstAudioUrl, tempUri);
    
    if (downloadResult.status === 200) {
      return downloadResult.uri;
    }
    
    throw new Error('Failed to merge audio chunks');
  };

  const play = async () => {
    try {
      if (!textHash.current || !selectedLanguage) return;

      let audioUri = currentAudioRecord?.audio_uri;

      // Check if audio exists and is downloaded
      if (!audioUri || !currentAudioRecord?.is_downloaded) {
        // Download complete audio first
        audioUri = await generateCompleteAudio(text, selectedLanguage);
        await loadAudioRecord(); // Refresh record
      }

      // Verify file exists
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file not found');
      }

      // Create audio player
      if (audioPlayer.current) {
        audioPlayer.current.release();
      }

      audioPlayer.current = createAudioPlayer({ uri: audioUri });
      
      // Set playback rate
      await audioPlayer.current.setRateAsync(speed);

      // Resume from last position if paused
      if (paused && elapsedTime > 0) {
        await audioPlayer.current.setPositionAsync(elapsedTime);
      }

      // Start playback
      await audioPlayer.current.play();
      
      setPlaying(true);
      setPaused(false);

      // Update database
      await database.current.updatePlaybackState(textHash.current, selectedLanguage, {
        lastPlayedPosition: elapsedTime,
        isPlaying: true,
        isPaused: false
      });

      // Start position tracking
      startPositionTracking();

      // Listen for playback completion
      audioPlayer.current.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          handlePlaybackComplete();
        }
      });

    } catch (error) {
      console.error('Play error:', error);
      Alert.alert('Error', 'Failed to play audio');
      setPlaying(false);
      setIsLoading(false);
    }
  };

  const pause = async () => {
    try {
      if (audioPlayer.current && playing) {
        await audioPlayer.current.pause();
        setPlaying(false);
        setPaused(true);

        // Stop position tracking
        if (positionUpdateInterval.current) {
          clearInterval(positionUpdateInterval.current);
        }

        // Update database
        await database.current.updatePlaybackState(textHash.current, selectedLanguage, {
          lastPlayedPosition: elapsedTime,
          isPlaying: false,
          isPaused: true
        });
      }
    } catch (error) {
      console.error('Pause error:', error);
    }
  };

  const stop = async () => {
    try {
      if (audioPlayer.current) {
        await audioPlayer.current.pause();
        await audioPlayer.current.setPositionAsync(0);
      }

      setPlaying(false);
      setPaused(false);
      setElapsedTime(0);
      setProgress(0);

      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }

      // Update database
      await database.current.updatePlaybackState(textHash.current, selectedLanguage, {
        lastPlayedPosition: 0,
        isPlaying: false,
        isPaused: false
      });

    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  const handlePlaybackComplete = async () => {
    setPlaying(false);
    setPaused(false);
    setElapsedTime(0);
    setProgress(0);

    if (positionUpdateInterval.current) {
      clearInterval(positionUpdateInterval.current);
    }

    // Update database
    await database.current.updatePlaybackState(textHash.current, selectedLanguage, {
      lastPlayedPosition: 0,
      isPlaying: false,
      isPaused: false
    });
  };

  const startPositionTracking = () => {
    if (positionUpdateInterval.current) {
      clearInterval(positionUpdateInterval.current);
    }

    positionUpdateInterval.current = setInterval(async () => {
      if (audioPlayer.current && playing) {
        try {
          const status = await audioPlayer.current.getStatusAsync();
          if (status.isLoaded) {
            const position = status.positionMillis || 0;
            const duration = status.durationMillis || totalDuration;
            
            setElapsedTime(position);
            setTotalDuration(duration);
            setProgress((position / duration) * 100);

            // Update database periodically (every 5 seconds)
            if (Math.floor(position / 5000) !== Math.floor((position - 1000) / 5000)) {
              await database.current.updatePlaybackState(textHash.current, selectedLanguage, {
                lastPlayedPosition: position,
                isPlaying: true,
                isPaused: false
              });
            }
          }
        } catch (error) {
          console.error('Position tracking error:', error);
        }
      }
    }, 1000);
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

      // Copy to a shareable location with a user-friendly name
      const language = selectedLanguage.split(' (')[0];
      const shareFileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${language}.wav`;
      const shareUri = `${FileSystem.cacheDirectory}${shareFileName}`;
      
      await FileSystem.copyAsync({
        from: audioUri,
        to: shareUri
      });

      // Share the audio file
      const shareResult = await Share.share({
        url: shareUri,
        title: `${title} - ${language}`,
        message: `Audio: ${title} in ${language}`
      });

      setIsSharing(false);

    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share audio');
      setIsSharing(false);
    }
  };

  const increaseSpeed = async () => {
    const newSpeed = speed < 2.0 ? speed + 0.25 : 1.0;
    setSpeed(newSpeed);
    
    if (audioPlayer.current && playing) {
      try {
        await audioPlayer.current.setRateAsync(newSpeed);
      } catch (error) {
        console.error('Speed change error:', error);
      }
    }
  };

  const handleSliderChange = async (value) => {
    if (audioPlayer.current && totalDuration > 0) {
      try {
        await audioPlayer.current.setPositionAsync(value);
        setElapsedTime(value);
        setProgress((value / totalDuration) * 100);

        // Update database
        await database.current.updatePlaybackState(textHash.current, selectedLanguage, {
          lastPlayedPosition: value,
          isPlaying: playing,
          isPaused: paused
        });
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
        disabled={!audioPlayer.current || isLoading || isDownloading}
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