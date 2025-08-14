import { FontAwesome, FontAwesome6, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as SQLite from 'expo-sqlite';
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AdSenseInterstitialModal from './Adsense.js';

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
    this.initPromise = null;
  }

  async init() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._initDatabase();
    return this.initPromise;
  }

  async _initDatabase() {
    try {
      // Use the new async API
      this.db = await SQLite.openDatabaseAsync('audio_cache.db');

      if (!this.db) {
        throw new Error('Failed to open database');
      }

      // Create tables with proper error handling
      await this.db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS audio_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text_hash TEXT NOT NULL,
          language TEXT NOT NULL,
          chunk_index INTEGER NOT NULL,
          audio_uri TEXT NOT NULL,
          file_path TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          is_cached INTEGER DEFAULT 0,
          UNIQUE(text_hash, language, chunk_index)
        );
      `);

      // Create indexes separately to avoid issues
      try {
        await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_text_hash_lang ON audio_cache(text_hash, language);');
        await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_created_at ON audio_cache(created_at);');
        await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_is_cached ON audio_cache(is_cached);');
      } catch (indexError) {
        console.warn('Index creation warning:', indexError);
        // Continue even if indexes fail
      }

      this.initialized = true;
      console.log('Database initialized successfully');

      // Clean old cache entries (older than 7 days)
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      await this.cleanOldEntries(weekAgo);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      this.initialized = false;
      this.db = null;
      throw error;
    }
  }

  async generateTextHash(text, language) {
    try {
      const combined = `${text}_${language}`;
      return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.MD5, combined);
    } catch (error) {
      console.error('Error generating hash:', error);
      // Fallback to simple hash
      return `${text.length}_${language}_${Date.now()}`;
    }
  }

  async getCachedAudio(textHash, language, chunkIndex) {
    try {
      await this.init();
      if (!this.db) return null;

      const result = await this.db.getFirstAsync(
        'SELECT audio_uri, file_path, is_cached FROM audio_cache WHERE text_hash = ? AND language = ? AND chunk_index = ? AND is_cached = 1',
        [textHash, language, chunkIndex]
      );

      if (result) {
        // Check if file still exists
        try {
          const fileInfo = await FileSystem.getInfoAsync(result.file_path);
          if (fileInfo.exists) {
            return result.file_path;
          } else {
            // File deleted, remove from cache
            await this.removeCachedAudio(textHash, language, chunkIndex);
          }
        } catch (fileError) {
          console.warn('File check error:', fileError);
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
    try {
      await this.init();
      if (!this.db) return null;

      // Download and save audio file
      const fileName = `audio_${textHash}_${language}_${chunkIndex}.wav`;
      const filePath = `${FileSystem.documentDirectory}audio_cache/${fileName}`;

      // Ensure directory exists
      const dirPath = `${FileSystem.documentDirectory}audio_cache/`;
      try {
        const dirInfo = await FileSystem.getInfoAsync(dirPath);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
        }
      } catch (dirError) {
        console.error('Directory creation error:', dirError);
        return null;
      }

      // Download audio file
      const downloadResult = await FileSystem.downloadAsync(audioUri, filePath);

      if (downloadResult.status === 200) {
        // Save to database with is_cached = 1
        await this.db.runAsync(
          'INSERT OR REPLACE INTO audio_cache (text_hash, language, chunk_index, audio_uri, file_path, created_at, is_cached) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [textHash, language, chunkIndex, audioUri, filePath, Date.now(), 1]
        );

        console.log(`Audio cached successfully: chunk ${chunkIndex}`);
        return filePath;
      }

      return null;
    } catch (error) {
      console.error('Error caching audio:', error);
      return null;
    }
  }

  async markAsUncached(textHash, language, chunkIndex) {
    try {
      await this.init();
      if (!this.db) return;

      await this.db.runAsync(
        'UPDATE audio_cache SET is_cached = 0 WHERE text_hash = ? AND language = ? AND chunk_index = ?',
        [textHash, language, chunkIndex]
      );
    } catch (error) {
      console.error('Error marking as uncached:', error);
    }
  }

  async removeCachedAudio(textHash, language, chunkIndex) {
    try {
      await this.init();
      if (!this.db) return;

      // Get file path before deleting
      const result = await this.db.getFirstAsync(
        'SELECT file_path FROM audio_cache WHERE text_hash = ? AND language = ? AND chunk_index = ?',
        [textHash, language, chunkIndex]
      );

      if (result && result.file_path) {
        // Delete file if exists
        try {
          const fileInfo = await FileSystem.getInfoAsync(result.file_path);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(result.file_path);
          }
        } catch (fileError) {
          console.warn('File deletion error:', fileError);
        }
      }

      // Remove from database
      await this.db.runAsync(
        'DELETE FROM audio_cache WHERE text_hash = ? AND language = ? AND chunk_index = ?',
        [textHash, language, chunkIndex]
      );
    } catch (error) {
      console.error('Error removing cached audio:', error);
    }
  }

  async cleanOldEntries(beforeTimestamp) {
    try {
      await this.init();
      if (!this.db) return;

      // Get old entries to delete their files
      const oldEntries = await this.db.getAllAsync(
        'SELECT file_path FROM audio_cache WHERE created_at < ?',
        [beforeTimestamp]
      );

      // Delete files
      for (const entry of oldEntries) {
        if (entry.file_path) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(entry.file_path);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(entry.file_path);
            }
          } catch (error) {
            console.warn('Error deleting old cache file:', error);
          }
        }
      }

      // Remove from database
      await this.db.runAsync('DELETE FROM audio_cache WHERE created_at < ?', [beforeTimestamp]);
    } catch (error) {
      console.error('Error cleaning old cache entries:', error);
    }
  }

  async getAllCachedChunks(textHash, language) {
    try {
      await this.init();
      if (!this.db) return {};

      const results = await this.db.getAllAsync(
        'SELECT chunk_index, file_path FROM audio_cache WHERE text_hash = ? AND language = ? AND is_cached = 1 ORDER BY chunk_index',
        [textHash, language]
      );

      const cachedChunks = {};
      for (const result of results) {
        if (result.file_path) {
          // Verify file exists
          try {
            const fileInfo = await FileSystem.getInfoAsync(result.file_path);
            if (fileInfo.exists) {
              cachedChunks[result.chunk_index] = result.file_path;
            } else {
              // Mark as uncached if file doesn't exist
              await this.markAsUncached(textHash, language, result.chunk_index);
            }
          } catch (fileError) {
            console.warn('File verification error:', fileError);
            await this.markAsUncached(textHash, language, result.chunk_index);
          }
        }
      }

      return cachedChunks;
    } catch (error) {
      console.error('Error getting all cached chunks:', error);
      return {};
    }
  }

  async getCacheStats(textHash, language) {
    try {
      await this.init();
      if (!this.db) return { total: 0, cached: 0 };

      const result = await this.db.getFirstAsync(
        'SELECT COUNT(*) as total, SUM(is_cached) as cached FROM audio_cache WHERE text_hash = ? AND language = ?',
        [textHash, language]
      );

      return {
        total: result?.total || 0,
        cached: result?.cached || 0
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { total: 0, cached: 0 };
    }
  }
}

const TTSFunction = ({ text, onChunkChange }) => {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState("English (eng)");
  const [isLoading, setIsLoading] = useState(false);
  const [isPreparingAudio, setIsPreparingAudio] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cacheStatus, setCacheStatus] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showAd, setShowAd] = useState(false);

  // Refs for audio management
  const chunks = useRef([]);
  const chunkAudios = useRef({});
  const currentIndex = useRef(0);
  const currentSound = useRef(null);
  const isPlayingChunk = useRef(false);
  const shouldStop = useRef(false);
  const progressInterval = useRef(null);
  const chunkStartTime = useRef(0);
  const totalElapsedTime = useRef(0);
  const preloadQueue = useRef(new Set());
  const audioCacheDB = useRef(new AudioCacheDB());
  const textHash = useRef('');
  const pausedPosition = useRef(0);
  const isMounted = useRef(true);
  const isScreenFocused = useRef(true);

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

  // Track focus state to stop audio when navigating away
  useFocusEffect(
    React.useCallback(() => {
      isScreenFocused.current = true;
      return () => {
        isScreenFocused.current = false;
        // Stop audio when losing focus (navigating away)
        if (playing) {
          stopAudio();
        }
      };
    }, [playing])
  );

  useEffect(() => {
    isMounted.current = true;
    // Initialize audio and database
    initializeAudio();

    // Initialize database with error handling
    audioCacheDB.current.init().catch(error => {
      console.error('Database initialization failed:', error);
    });

    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, []);

  useEffect(() => {
    // Generate text hash when text or language changes
    if (text && isMounted.current) {
      generateTextHashAsync();
    }
  }, [text, selectedLanguage]);

  const initializeAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false, // Changed to false to prevent background playback
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  };

  const generateTextHashAsync = async () => {
    if (text && isMounted.current) {
      try {
        const hash = await audioCacheDB.current.generateTextHash(text, selectedLanguage);
        textHash.current = hash;
        updateCacheStatus();
      } catch (error) {
        console.error('Error generating text hash:', error);
        textHash.current = `${text.length}_${selectedLanguage}_${Date.now()}`;
      }
    }
  };

  const updateCacheStatus = async () => {
    if (!textHash.current || !text || !isMounted.current) return;

    try {
      const textChunks = createChunks(text);
      const stats = await audioCacheDB.current.getCacheStats(textHash.current, selectedLanguage);

      if (stats.cached === textChunks.length && textChunks.length > 0) {
        setCacheStatus('Fully cached');
      } else if (stats.cached > 0) {
        setCacheStatus(`${stats.cached}/${textChunks.length} cached`);
      } else {
        setCacheStatus('Not cached');
      }
    } catch (error) {
      console.error('Error updating cache status:', error);
      setCacheStatus('Cache unavailable');
    }
  };

  const cleanup = async () => {
    stopProgressTracking();
    if (currentSound.current) {
      try {
        await currentSound.current.unloadAsync();
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
      currentSound.current = null;
    }
  };

  const startProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (playing && !paused && chunks.current.length > 0 && isMounted.current && isScreenFocused.current) {
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

    if (isMounted.current) {
      setElapsedTime(0);
      setProgress(0);
      setPaused(false);
      setIsPreparingAudio(false);
      setLoadingMessage('');
    }
  };

  const stopPlayback = async () => {
    try {
      shouldStop.current = true;
      stopProgressTracking();

      if (currentSound.current) {
        await currentSound.current.pauseAsync();
        await currentSound.current.unloadAsync();
        currentSound.current = null;
      }

      isPlayingChunk.current = false;
      if (isMounted.current) {
        setPlaying(false);
        setPaused(false);
      }
    } catch (error) {
      console.error("Stop playback error:", error);
      if (isMounted.current) {
        setPlaying(false);
        setPaused(false);
      }
    }
  };

  const pausePlayback = async () => {
    try {
      if (currentSound.current && playing && !paused) {
        await currentSound.current.pauseAsync();
        if (isMounted.current) {
          setPaused(true);
        }
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
      if (currentSound.current && playing && paused && isScreenFocused.current) {
        // Update start time to account for paused duration
        chunkStartTime.current = Date.now() - (pausedPosition.current * 1000);

        await currentSound.current.playAsync();
        if (isMounted.current) {
          setPaused(false);
        }
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
    if (!isMounted.current || !isScreenFocused.current) return null;

    setLoadingMessage(`Loading audio chunk ${chunkIndex + 1}/${chunks.current.length}...`);

    // Check cache first
    try {
      const cachedPath = await audioCacheDB.current.getCachedAudio(
        textHash.current,
        selectedLanguage,
        chunkIndex
      );

      if (cachedPath && isMounted.current) {
        return `file://${cachedPath}`;
      }
    } catch (error) {
      console.warn('Cache check failed:', error);
    }

    // Generate new audio only if still mounted and focused
    if (!isMounted.current || !isScreenFocused.current) return null;

    const audioUrl = await generateAudioFromText(chunkText);

    // Cache the audio in background (don't wait for it)
    if (isMounted.current && isScreenFocused.current) {
      audioCacheDB.current.cacheAudio(
        textHash.current,
        selectedLanguage,
        chunkIndex,
        audioUrl
      ).then(() => {
        // Update cache status after caching
        if (isMounted.current) {
          updateCacheStatus();
        }
      }).catch(error => {
        console.warn('Background caching failed:', error);
      });
    }

    return audioUrl;
  };

  const preloadNextChunks = async (startIndex, count = 2) => { // Reduced from 3 to 2
    if (!isMounted.current || !isScreenFocused.current) return;

    const loadPromises = [];

    for (let i = startIndex; i < Math.min(startIndex + count, chunks.current.length); i++) {
      if (!chunkAudios.current[i] && !preloadQueue.current.has(i)) {
        preloadQueue.current.add(i);
        loadPromises.push((async () => {
          try {
            if (!isMounted.current || !isScreenFocused.current) {
              preloadQueue.current.delete(i);
              return;
            }
            const audioUri = await getOrGenerateAudio(chunks.current[i], i);
            if (audioUri && isMounted.current && isScreenFocused.current) {
              chunkAudios.current[i] = audioUri;
            }
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
    if (shouldStop.current || currentIndex.current >= chunks.current.length || !isMounted.current || !isScreenFocused.current) {
      if (isMounted.current) {
        setPlaying(false);
        setIsPreparingAudio(false);
        setLoadingMessage('');
      }
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
      while (!chunkAudios.current[chunkIndex] && attempts < 30 && isMounted.current && isScreenFocused.current) { // Reduced from 50 to 30
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!isMounted.current || !isScreenFocused.current) {
        isPlayingChunk.current = false;
        return;
      }

      if (!chunkAudios.current[chunkIndex]) {
        const audioUri = await getOrGenerateAudio(chunks.current[chunkIndex], chunkIndex);
        if (audioUri && isMounted.current && isScreenFocused.current) {
          chunkAudios.current[chunkIndex] = audioUri;
        } else {
          isPlayingChunk.current = false;
          return;
        }
      }

      // Clean up previous sound
      if (currentSound.current) {
        try {
          await currentSound.current.unloadAsync();
        } catch (error) {
          console.error("Error unloading previous sound:", error);
        }
      }

      // Create new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: chunkAudios.current[chunkIndex] },
        {
          shouldPlay: false,
          rate: speed,
          isLooping: false,
        }
      );

      if (!isMounted.current || !isScreenFocused.current) {
        await sound.unloadAsync();
        isPlayingChunk.current = false;
        return;
      }

      currentSound.current = sound;
      chunkStartTime.current = Date.now();

      const onPlaybackStatusUpdate = (status) => {
        if (status.didJustFinish && !shouldStop.current && !paused && isMounted.current && isScreenFocused.current) {
          const chunkDuration = estimateDuration(chunks.current[chunkIndex]) / chunks.current.length;
          totalElapsedTime.current += chunkDuration;

          isPlayingChunk.current = false;
          currentIndex.current++;

          if (currentIndex.current < chunks.current.length) {
            preloadNextChunks(currentIndex.current + 1, 3); // Reduced from 4 to 3
            setTimeout(() => playNextChunk(), 100);
          } else {
            if (isMounted.current) {
              setPlaying(false);
              setIsPreparingAudio(false);
              setLoadingMessage('');
            }
            stopProgressTracking();
          }
        }
      };

      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      await sound.playAsync();

      if (!playing && isMounted.current) {
        setPlaying(true);
      }

      if (isMounted.current) {
        setIsPreparingAudio(false);
        setLoadingMessage('');
      }

      if (!progressInterval.current) {
        startProgressTracking();
      }

      if (chunkIndex + 1 < chunks.current.length) {
        preloadNextChunks(chunkIndex + 1, 3); // Reduced from 4 to 3
      }

    } catch (error) {
      console.error("Playback error:", error);
      isPlayingChunk.current = false;
      if (isMounted.current) {
        setPlaying(false);
        setIsPreparingAudio(false);
        setLoadingMessage('');
      }
      stopProgressTracking();
      if (isMounted.current) {
        Alert.alert("Playback Error", "Failed to play audio chunk");
      }
    }
  };

  const speak = async () => {
    if (!text || !isMounted.current || !isScreenFocused.current) return;

    // Prevent multiple simultaneous operations
    if (isLoading || isPreparingAudio) {
      if (isMounted.current) {
        Alert.alert("Loading", "Audio is currently loading. Please wait...");
      }
      return;
    }

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
      if (!isMounted.current || !isScreenFocused.current) return;

      setPlaying(true);
      setIsLoading(true);
      setIsPreparingAudio(true);
      setLoadingMessage('Preparing audio...');
      shouldStop.current = false;

      chunks.current = createChunks(text);
      const estimatedDuration = estimateDuration(text);
      setTotalDuration(estimatedDuration * 1000);

      // Check cache status
      try {
        const cachedChunks = await audioCacheDB.current.getAllCachedChunks(
          textHash.current,
          selectedLanguage
        );

        // Load cached chunks
        for (const [index, filePath] of Object.entries(cachedChunks)) {
          chunkAudios.current[parseInt(index)] = `file://${filePath}`;
        }
      } catch (error) {
        console.warn('Cache loading failed:', error);
      }

      if (!isMounted.current || !isScreenFocused.current) return;

      // Preload first 3 chunks (reduced from 5)
      await preloadNextChunks(0, 3);

      if (!isMounted.current || !isScreenFocused.current) return;

      setIsLoading(false);
      currentIndex.current = 0;

      startProgressTracking();
      playNextChunk();

    } catch (error) {
      console.error("Speech generation error:", error);
      if (isMounted.current) {
        Alert.alert("Error", "Failed to generate speech");
        setIsLoading(false);
        setIsPreparingAudio(false);
        setLoadingMessage('');
        setPlaying(false);
      }
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

  const executeDownload = async () => {
    if (!text) return;
    if (isDownloading) {
      Alert.alert('Download in Progress', 'Please wait for the current download to complete');
      return;
    }
    await downloadAudio(text, `speech_${Date.now()}.wav`);
  };

  const handleDownload = async () => {
    // Store the actual upload function as pending action
    pendingActionRef.current = executeDownload;

    // Show the ad
    setShowAd(true);
  };



  const restart = async () => {
    if (isLoading || isPreparingAudio) {
      Alert.alert("Loading", "Please wait for the current operation to complete");
      return;
    }

    await stopPlayback();
    reset();
    setTimeout(() => {
      if (isMounted.current && isScreenFocused.current) {
        speak();
      }
    }, 100);
  };

  const increaseSpeed = async () => {
    if (isLoading || isPreparingAudio) {
      Alert.alert("Loading", "Please wait for the current operation to complete");
      return;
    }

    const newSpeed = speed < 2.0 ? speed + 0.25 : 1.0;
    setSpeed(newSpeed);

    if (playing && currentSound.current && !paused) {
      try {
        await currentSound.current.setRateAsync(newSpeed, false);
      } catch (error) {
        console.warn("Could not update playback speed:", error.message);
        // Restart current chunk with new speed
        const currentChunk = currentIndex.current;
        await currentSound.current.pauseAsync();
        await currentSound.current.unloadAsync();
        currentSound.current = null;
        isPlayingChunk.current = false;

        setTimeout(() => {
          if (isMounted.current && isScreenFocused.current) {
            playNextChunk();
          }
        }, 100);
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

  const getPlayButtonContent = () => {
    if (isLoading || isPreparingAudio) {
      return <ActivityIndicator color="white" />;
    } else if (playing && !paused) {
      return <FontAwesome name="pause" size={28} color="white" />;
    } else {
      return <FontAwesome name="play" size={22} color="white" />;
    }
  };

  const isButtonDisabled = () => {
    return isLoading || isPreparingAudio || !text;
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
            enabled={!playing && !isLoading && !isPreparingAudio}
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

      {(isLoading || isPreparingAudio) && loadingMessage && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3273F6" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      )}

      <Slider
        style={{ width: '100%', height: 35 }}
        minimumValue={0}
        maximumValue={totalDuration}
        value={elapsedTime}
        minimumTrackTintColor="#3273F6"
        maximumTrackTintColor="#d3d3d3"
        disabled={!playing || isLoading || isPreparingAudio}
        onSlidingComplete={async (value) => {
          if (playing && chunks.current.length > 0 && !isLoading && !isPreparingAudio && isMounted.current && isScreenFocused.current) {
            const estimatedDuration = estimateDuration(text);
            const chunkDuration = estimatedDuration / chunks.current.length;
            const newChunkIndex = Math.floor((value / 1000) / chunkDuration);
            const targetIndex = Math.min(Math.max(0, newChunkIndex), chunks.current.length - 1);

            if (targetIndex !== currentIndex.current) {
              currentIndex.current = targetIndex;
              totalElapsedTime.current = targetIndex * chunkDuration;

              if (currentSound.current) {
                await currentSound.current.pauseAsync();
                await currentSound.current.unloadAsync();
                currentSound.current = null;
              }
              isPlayingChunk.current = false;
              setIsPreparingAudio(true);
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
        <TouchableOpacity
          style={[styles.controlButton, { opacity: isButtonDisabled() ? 0.5 : 1 }]}
          onPress={restart}
          disabled={isButtonDisabled()}
        >
          <FontAwesome6 name="rotate-left" size={22} color="#9E9898" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, { opacity: isButtonDisabled() ? 0.7 : 1 }]}
          onPress={speak}
          disabled={isButtonDisabled()}
        >
          {getPlayButtonContent()}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { opacity: !playing ? 0.5 : 1 }]}
          onPress={stopAudio}
          disabled={!playing}
        >
          <FontAwesome name="stop" size={22} color="#9E9898" />
          <Text style={styles.controlText}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { opacity: isButtonDisabled() ? 0.5 : 1 }]}
          onPress={increaseSpeed}
          disabled={isButtonDisabled()}
        >
          <View style={styles.speedContainer}>
            <Text style={styles.speedText}>{speed.toFixed(2)}x</Text>
          </View>
          <Text style={styles.controlText}>Speed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDownload}
          disabled={isDownloading || !text || isLoading || isPreparingAudio}
          style={[
            styles.controlButton,
            { opacity: (isDownloading || !text || isLoading || isPreparingAudio) ? 0.5 : 1 }
          ]}
        >
          {isDownloading ? (
            <MaterialCommunityIcons name="progress-download" size={24} color="black" />
          ) : (
            <MaterialIcons name="download" size={24} color="black" />
          )}
        </TouchableOpacity>
      </View>

      {/* Loading overlay */}
      {(isLoading || isPreparingAudio) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#3273F6" />
            <Text style={styles.loadingOverlayText}>
              {isLoading ? 'Initializing...' : loadingMessage || 'Preparing audio...'}
            </Text>
          </View>
        </View>
      )}

      {/* Ad Interstitial Modal */}

      <AdSenseInterstitialModal
        visible={showAd}
        onClose={handleCloseAd}
        onAdClosed={handleAdClosed}
        autoShow={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    padding: 16,
    position: 'relative',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3273F6',
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingOverlayText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3273F6',
    textAlign: 'center',
  },
});

export default TTSFunction;