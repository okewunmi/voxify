import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
// import { Audio } from 'expo-av';
// import { Audio } from 'expo-audio';
import { useAudioPlayer, createAudioPlayer } from 'expo-audio';
import languages from './languages';
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

const TTSFunction = ({ text, onChunkChange }) => {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState("English (eng)");
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(1);
  const [progress, setProgress] = useState(0);
  const soundRef = useRef(null);
  const [audioUri, setAudioUri] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const playbackInstance = useRef(null);
  const chunks = useRef([]);
  const chunkAudios = useRef([]);
  const currentIndex = useRef(0);
const audioPlayers = useRef({});
const currentPlayerIndex = useRef(0);
const currentSound = useRef(null);


  useEffect(() => {
    return () => {
      stopPlayback();
       // Clean up all players on unmount
    Object.values(audioPlayers.current).forEach(player => {
      if (player) {
        player.release();
      }
    });
    };
  }, []);

  

  // const reset = () => {
  //   chunks.current = [];
  //   chunkAudios.current = [];
  //   currentIndex.current = 0;
  //   setProgress(0);
  //   setElapsedTime(0);
  // };
const reset = () => {
  currentIndex.current = 0;
  chunks.current = [];
  chunkAudios.current = {};
  
  // Clean up existing players
  Object.values(audioPlayers.current).forEach(player => {
    if (player) {
      player.release();
    }
  });
  audioPlayers.current = {};
  currentSound.current = null;
};
  // const stopPlayback = async () => {
  //   try {
  //     if (playbackInstance.current) {
  //       await playbackInstance.current.stopAsync();
  //       await playbackInstance.current.unloadAsync();
  //       playbackInstance.current = null;
  //     }
  //     setPlaying(false);
  //     reset();
  //   } catch (error) {
  //     console.error("Stop error:", error);
  //   }
  // };
const stopPlayback = async () => {
  try {
    if (currentSound.current) {
      await currentSound.current.pause();
      currentSound.current = null;
    }
    
    // Clean up all players
    Object.values(audioPlayers.current).forEach(player => {
      if (player) {
        player.release();
      }
    });
    audioPlayers.current = {};
    
    setPlaying(false);
  } catch (error) {
    console.error("Stop playback error:", error);
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
            // text.slice(0, 900000000),
            text.slice(0, 900),
            selectedLanguage
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);
      if (!result?.data?.[0]?.name) {
        throw new Error("Unexpected API response format");
      }

      return `https://dpc-mmstts.hf.space/file=${result.data[0].name}`;
    } catch (error) {
      console.error('TTS generation failed:', error);
      throw error;
    }
  };

  const downloadAudio = async (text, filename = 'audio.wav') => {
    if (isDownloading) {
      Alert.alert('Download in Progress', 'Please wait for the current download to complete');
      return;
    }

    try {
      setIsDownloading(true);

      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Media library permission is required');
        setIsDownloading(false);
        return;
      }

      const audioUrl = await generateAudioFromText(text);

      // Download to cache directory first
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      const downloadResult = await FileSystem.downloadAsync(audioUrl, fileUri);

      if (downloadResult.status === 200) {
        // Save to media library
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

  const preloadNextChunk = async () => {
    const nextIndex = currentIndex.current + 1;
    if (nextIndex < chunks.current.length && !chunkAudios.current[nextIndex]) {
      const nextText = chunks.current[nextIndex];
      try {
        const audioUrl = await generateAudioFromText(nextText);
        chunkAudios.current[nextIndex] = audioUrl;
      } catch (error) {
        console.error('Error preloading next chunk:', error);
      }
    }
  };


  // const playChunk = async () => {
  //   const index = currentIndex.current;
  //   if (index >= chunks.current.length) {
  //     setPlaying(false);
  //     return;
  //   }

  //   if (!chunkAudios.current[index]) {
  //     setTimeout(playChunk, 1000);
  //     return;
  //   }

  //   const filePath = chunkAudios.current[index];

  //   if (playbackInstance.current) {
  //     await playbackInstance.current.unloadAsync();
  //   }

  //   try {
  //     const { sound } = await Audio.Sound.createAsync(
  //       { uri: filePath },
  //       { shouldPlay: false, rate: speed }
  //     );

  //     playbackInstance.current = sound;
  //     setAudioUri(filePath);

  //     // Notify parent component of the active chunk
  //     onChunkChange?.(currentIndex.current);


  //     sound.setOnPlaybackStatusUpdate((status) => {
  //       if (status.isLoaded) {
  //         setElapsedTime(
  //           status.positionMillis +
  //           index * (totalDuration / chunks.current.length)
  //         );

  //         if (status.didJustFinish) {
  //           currentIndex.current++;
  //           onChunkChange?.(currentIndex.current);
  //           setProgress(
  //             (currentIndex.current / chunks.current.length) * 100
  //           );
  //           playChunk();
  //         }
  //       }
  //     });

  //     await sound.playAsync();
  //     preloadNextChunk();
  //   } catch (error) {
  //     console.error('Playback error:', error);
  //     setPlaying(false);
  //   }
  // };
const playChunk = async () => {
  try {
    const audioUrl = chunkAudios.current[currentIndex.current];
    if (!audioUrl) return;

    // Clean up previous player if exists
    if (audioPlayers.current[currentIndex.current]) {
      audioPlayers.current[currentIndex.current].release();
    }

    // Create new player for this chunk
    const player = createAudioPlayer({ uri: audioUrl });
    audioPlayers.current[currentIndex.current] = player;
    currentSound.current = player; // Now this ref exists

    // Set up event listener for when playback finishes
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        // Move to next chunk or finish
        if (currentIndex.current < chunks.current.length - 1) {
          currentIndex.current++;
          playChunk();
        } else {
          setPlaying(false);
        }
      }
    });

    // Start playback
    await player.play();
    
  } catch (error) {
    console.error("Playback error:", error);
    setPlaying(false);
  }
};

  // const speak = async () => {
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
const speak = async () => {
  if (!text) return;

  if (playing) {
    await stopPlayback();
    return;
  }

  try {
    reset();
    setPlaying(true);
    setIsLoading(true);

    chunks.current = createChunks(text);
    setTotalDuration(estimateDuration(text) * 1000);

    const initialLoads = [];
    const chunksToLoad = Math.min(3, chunks.current.length);

    for (let i = 0; i < chunksToLoad; i++) {
      const chunkText = chunks.current[i];
      initialLoads.push((async () => {
        const audioUrl = await generateAudioFromText(chunkText);
        chunkAudios.current[i] = audioUrl;
      })());
    }

    await Promise.all(initialLoads);
    setIsLoading(false);
    currentIndex.current = 0;
    playChunk();
  } catch (error) {
    console.error("Speech generation error:", error);
    Alert.alert("Error", "Failed to generate speech");
    setIsLoading(false);
    setPlaying(false);
  }
};
  // Separate download function
  const handleDownload = async () => {
    if (!text) return;

    if (isDownloading) {
      Alert.alert('Download in Progress', 'Please wait for the current download to complete');
      return;
    }

    await downloadAudio(text, `speech_${Date.now()}.wav`);
  };
  const restart = async () => {
    if (playbackInstance.current) {
      await playbackInstance.current.setPositionAsync(0);
      await playbackInstance.current.playAsync();
      currentIndex.current = 0;
      setProgress(0);
      setElapsedTime(0);
      onChunkChange?.(-1);
    }
  };

  const increaseSpeed = () => {
    const newSpeed = speed < 2.0 ? speed + 0.25 : 1.0;
    setSpeed(newSpeed);
    if (playbackInstance.current && playing) {
      playbackInstance.current.setRateAsync(newSpeed, true);
    }
  };

  const estimateDuration = (text) => {
    const words = text.split(/\s+/).length;
    return ((words / 150) * 60); // seconds
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

      <Slider
        style={{ width: '100%', height: 35 }}
        minimumValue={0}
        maximumValue={totalDuration}
        value={elapsedTime}
        minimumTrackTintColor="#3273F6"
        maximumTrackTintColor="#d3d3d3"
        onSlidingComplete={async (value) => {
          if (playbackInstance.current) {
            const chunkDuration = totalDuration / chunks.current.length;
            const newChunkIndex = Math.floor(value / chunkDuration);
            currentIndex.current = Math.min(newChunkIndex, chunks.current.length - 1);
            await playbackInstance.current.setPositionAsync(value % chunkDuration);
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
          ) : playing ? (
            <FontAwesome name="pause" size={28} color="white" />
          ) : (
            <FontAwesome name="play" size={22} color="white" />
          )}
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
            // your existing styles
            { opacity: isDownloading ? 0.5 : 1 }
          ]}
        >
          {isDownloading ? (
            // <ActivityIndicator size="small" color="gray" />
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
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    // marginTop: 14,

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
