import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  InteractionManager,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import Animated, {
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  cancelAnimation,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import ConfettiCannon from 'react-native-confetti-cannon'
import AsyncStorage from '@react-native-async-storage/async-storage'

const { width, height } = Dimensions.get('window')
const baseUrl = 'https://web-production-a314.up.railway.app'

const BubbleBathGame = ({ route, navigation }) => {
  const { cardId } = route.params
  const [wordPairs, setWordPairs] = useState([])
  const [words, setWords] = useState({ left: [], right: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [matchedPairs, setMatchedPairs] = useState([])
  const [selectedWord, setSelectedWord] = useState(null)
  const [incorrectPairs, setIncorrectPairs] = useState([])
  const [showInstructions, setShowInstructions] = useState(false)
  const [gameStats, setGameStats] = useState({
    attempts: 0,
    correctMatches: 0,
    startTime: null,
    endTime: null,
  })
  const [isInitialized, setIsInitialized] = useState(false)

  const confettiRef = useRef(null)
  const mounted = useRef(true)
  const animationRef = useRef(null)

  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
      if (animationRef.current) {
        cancelAnimation(animationRef.current)
      }
    }
  }, [])

  const shuffleArray = useCallback((array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }, [])

  const selectRandomPairs = useCallback(
    (pairs, count = 5) => {
      const shuffled = shuffleArray([...pairs])
      return shuffled.slice(0, Math.min(count, shuffled.length))
    },
    [shuffleArray]
  )

  const trophyAnimatedStyle = useAnimatedStyle(() => {
    const scale = withRepeat(
      withSpring(1.2, {
        damping: 4,
        mass: 0.5,
        stiffness: 80,
      }),
      -1,
      true
    )

    const translateY = withRepeat(
      withSpring(-10, {
        damping: 3,
        mass: 0.5,
        stiffness: 50,
      }),
      -1,
      true
    )

    return {
      transform: [
        {
          scale: scale,
        },
        {
          translateY: translateY,
        },
      ],
    }
  })

  const initializeGame = useCallback(
    (pairs) => {
      if (!pairs || pairs.length === 0 || !mounted.current) return

      InteractionManager.runAfterInteractions(() => {
        const englishWords = pairs.map((pair, index) => ({
          id: `en-${index}`,
          text: pair.english,
          type: 'english',
          pairId: index,
        }))

        const indonesianWords = pairs.map((pair, index) => ({
          id: `id-${index}`,
          text: pair.indonesian,
          type: 'indonesian',
          pairId: index,
        }))

        if (mounted.current) {
          setWords({
            left: shuffleArray(englishWords),
            right: shuffleArray(indonesianWords),
          })
          setMatchedPairs([])
          setIncorrectPairs([])
          setSelectedWord(null)
          setGameStats({
            attempts: 0,
            correctMatches: 0,
            startTime: Date.now(),
            endTime: null,
          })
          setIsInitialized(true)
        }
      })
    },
    [shuffleArray]
  )

  const fetchWordPairs = useCallback(async () => {
    if (!mounted.current) return

    try {
      setIsLoading(true)
      setError(null)

      const token = await AsyncStorage.getItem('token')
      if (!token) {
        navigation.replace('Auth')
        return
      }

      const response = await fetch(`${baseUrl}/api/cards/${cardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!mounted.current) return

      if (response.status === 404) {
        setError('Card not found. Please check if the card exists.')
        return
      }

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()
      if (!data.wordPairs || !Array.isArray(data.wordPairs)) {
        throw new Error('Invalid data format received')
      }

      if (data.wordPairs.length === 0) {
        setError('No word pairs available for this card.')
        return
      }

      if (mounted.current) {
        const selectedPairs = selectRandomPairs(data.wordPairs)
        setWordPairs(selectedPairs)
        initializeGame(selectedPairs)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      if (mounted.current) {
        setError(error.message || 'Failed to load word pairs')
        Alert.alert(
          'Error',
          'Failed to load word pairs. Please try again later.',
          [{ text: 'OK' }]
        )
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false)
      }
    }
  }, [cardId, navigation, initializeGame, selectRandomPairs])

  useEffect(() => {
    if (cardId && !isInitialized) {
      fetchWordPairs()
    }

    return () => {
      mounted.current = false
    }
  }, [cardId, fetchWordPairs, isInitialized])

  const handleWordClick = useCallback(
    (word) => {
      if (
        matchedPairs.includes(word.pairId) ||
        incorrectPairs.includes(word.pairId)
      ) {
        return
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      if (!selectedWord) {
        setSelectedWord(word)
      } else {
        if (selectedWord.id === word.id) {
          setSelectedWord(null)
          return
        }

        setGameStats((prev) => ({
          ...prev,
          attempts: prev.attempts + 1,
        }))

        if (
          selectedWord.pairId === word.pairId &&
          selectedWord.type !== word.type
        ) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          setMatchedPairs((prev) => [...prev, word.pairId])
          setIncorrectPairs((prev) => prev.filter((id) => id !== word.pairId))
          setGameStats((prev) => ({
            ...prev,
            correctMatches: prev.correctMatches + 1,
          }))

          if (matchedPairs.length + 1 === wordPairs.length) {
            if (confettiRef.current) {
              confettiRef.current.start()
            }
            setGameStats((prev) => ({
              ...prev,
              endTime: Date.now(),
            }))
          }
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
          setIncorrectPairs((prev) => [
            ...new Set([...prev, word.pairId, selectedWord.pairId]),
          ])
        }
        setSelectedWord(null)
      }
    },
    [matchedPairs, incorrectPairs, selectedWord, wordPairs.length]
  )

  const resetGame = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const newPairs = selectRandomPairs(wordPairs)
    initializeGame(newPairs)
  }, [selectRandomPairs, wordPairs, initializeGame])

  const navigateBack = useCallback(() => {
    navigation.navigate('Games', { cardId })
  }, [navigation, cardId])

  if (isLoading) {
    return (
      <View className="flex-1 bg-primary-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F0F7FF" />
        <SafeAreaView className="flex-1">
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#1570DA" />
            <Text className="mt-4 text-primary-600 font-medium">
              Loading your game...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-primary-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F0F7FF" />
        <SafeAreaView className="flex-1">
          <View className="p-6">
            <View className="bg-error-100 p-4 rounded-xl">
              <Text className="text-error-700 font-medium">{error}</Text>
            </View>
            <TouchableOpacity
              onPress={navigateBack}
              className="mt-6 flex-row items-center justify-center"
            >
              <Feather name="arrow-left" size={20} color="#1570DA" />
              <Text className="ml-2 text-primary-400 font-medium">
                Return to Games
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  if (!isInitialized || words.left.length === 0) {
    return (
      <View className="flex-1 bg-primary-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F0F7FF" />
        <SafeAreaView className="flex-1">
          <View className="flex-1 justify-center items-center">
            <Text className="text-primary-600 font-medium">
              No word pairs available
            </Text>
            <TouchableOpacity
              onPress={navigateBack}
              className="mt-6 flex-row items-center"
            >
              <Feather name="arrow-left" size={20} color="#1570DA" />
              <Text className="ml-2 text-primary-400 font-medium">
                Return to Games
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  const isGameComplete =
    matchedPairs.length === wordPairs.length && wordPairs.length > 0

  return (
    <View className="flex-1 bg-primary-50 pt-10">
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7FF" />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 py-4">
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity
              onPress={navigateBack}
              className="flex-row items-center"
            >
              <Feather name="arrow-left" size={24} color="#56A7F5" />
              <Text className="ml-2 text-primary-400 font-medium text-base">
                Back to Games
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center">
              {gameStarted && (
                <TouchableOpacity
                  onPress={resetGame}
                  className="flex-row items-center bg-primary-100 px-4 py-2 rounded-lg mr-2"
                >
                  <Feather name="refresh-cw" size={20} color="#1570DA" />
                  <Text className="ml-2 text-primary-600 font-medium">
                    Reset
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setShowInstructions(!showInstructions)}
                className="p-2"
              >
                <Feather name="help-circle" color="#1570DA" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {showInstructions && gameStarted && (
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut}
              className="bg-primary-50 p-4 rounded-lg mb-4"
            >
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <Feather name="info" size={20} color="#1570DA" />
                  <Text className="ml-2 font-semibold text-primary-800">
                    How to Play:
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowInstructions(false)}
                  className="p-2"
                >
                  <Text className="text-primary-400 text-lg">×</Text>
                </TouchableOpacity>
              </View>

              <View className="space-y-2">
                <Text className="text-primary-800">
                  1. Cocokkan kata bahasa Inggris dengan terjemahan bahasa
                  Indonesianya
                </Text>
                <Text className="text-primary-800">
                  2. Ketuk sebuah kata untuk memilihnya, lalu ketuk pasangannya
                  yang cocok
                </Text>
                <Text className="text-primary-800">
                  3. Sorotan hijau menunjukkan pasangan yang benar
                </Text>
                <Text className="text-primary-800">
                  4. Sorotan merah menunjukkan pasangan yang salah
                </Text>
                <Text className="text-primary-800">
                  5. Cobalah mencocokkan semua pasangan dengan akurasi
                  tertinggi!
                </Text>
              </View>
            </Animated.View>
          )}

          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: height * 0.1,
            }}
          >
            {!gameStarted ? (
              <Animated.View
                entering={FadeIn}
                className="flex-1 justify-center items-center py-8"
              >
                <View className="bg-primary-500 p-8 rounded-2xl w-full mb-8">
                  <Text className="text-3xl text-white font-bold mb-4 text-center">
                    Kata Makna
                  </Text>
                  <Text className="text-lg text-white opacity-90 text-center mb-6">
                    Cocokkan 5 pasangan kata bahasa Inggris secara acak dengan
                    terjemahan bahasa Indonesianya.
                  </Text>

                  <TouchableOpacity
                    onPress={() => setGameStarted(true)}
                    className="bg-white py-4 rounded-xl flex-row justify-center items-center"
                  >
                    <Feather name="award" size={24} color="#1570DA" />
                    <Text className="ml-2 text-primary-600 font-bold text-lg">
                      Start Game
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ) : (
              <View className="flex-1 space-y-6">
                <View className="flex-row justify-between mb-4">
                  <View className="bg-primary-100 px-4 py-2 rounded-lg">
                    <Text className="text-primary-700 font-medium">
                      {matchedPairs.length}/{wordPairs.length} Matches
                    </Text>
                  </View>
                  <View className="bg-success-100 px-4 py-2 rounded-lg">
                    <Text className="text-success-700 font-medium">
                      {(
                        (gameStats.correctMatches /
                          Math.max(gameStats.attempts, 1)) *
                        100
                      ).toFixed(1)}
                      % Accuracy
                    </Text>
                  </View>
                </View>

                <View className="flex-row space-x-4">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-primary-600 mb-2">
                      English Words
                    </Text>
                    <View className="space-y-3">
                      {words.left.map((word) => (
                        <Animated.View
                          key={word.id}
                          entering={SlideInLeft}
                          className="w-full"
                        >
                          <TouchableOpacity
                            onPress={() => handleWordClick(word)}
                            className={`
                              p-4 rounded-xl
                              ${
                                matchedPairs.includes(word.pairId)
                                  ? 'bg-success-100 border-2 border-success-300'
                                  : incorrectPairs.includes(word.pairId)
                                  ? 'bg-error-100 border-2 border-error-300'
                                  : selectedWord?.id === word.id
                                  ? 'bg-primary-100 border-2 border-primary-300'
                                  : 'bg-white border border-primary-200'
                              }
                            `}
                          >
                            <View className="flex-row items-center">
                              {matchedPairs.includes(word.pairId) && (
                                <Feather
                                  name="check-circle"
                                  size={20}
                                  color="#12B76A"
                                />
                              )}
                              {incorrectPairs.includes(word.pairId) && (
                                <Feather
                                  name="x-circle"
                                  size={20}
                                  color="#F04438"
                                />
                              )}
                              <Text
                                className={`
                                  flex-1 text-center text-base font-medium
                                  ${
                                    matchedPairs.includes(word.pairId)
                                      ? 'text-success-700'
                                      : incorrectPairs.includes(word.pairId)
                                      ? 'text-error-700'
                                      : 'text-primary-800'
                                  }
                                `}
                              >
                                {word.text}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </Animated.View>
                      ))}
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-secondary-600 mb-2">
                      Indonesian Words
                    </Text>
                    <View className="space-y-3">
                      {words.right.map((word) => (
                        <Animated.View
                          key={word.id}
                          entering={SlideInRight}
                          className="w-full"
                        >
                          <TouchableOpacity
                            onPress={() => handleWordClick(word)}
                            className={`
                              p-4 rounded-xl
                              ${
                                matchedPairs.includes(word.pairId)
                                  ? 'bg-success-100 border-2 border-success-300'
                                  : incorrectPairs.includes(word.pairId)
                                  ? 'bg-error-100 border-2 border-error-300'
                                  : selectedWord?.id === word.id
                                  ? 'bg-secondary-100 border-2 border-secondary-300'
                                  : 'bg-white border border-secondary-200'
                              }
                            `}
                          >
                            <View className="flex-row items-center">
                              {matchedPairs.includes(word.pairId) && (
                                <Feather
                                  name="check-circle"
                                  size={20}
                                  color="#12B76A"
                                />
                              )}
                              {incorrectPairs.includes(word.pairId) && (
                                <Feather
                                  name="x-circle"
                                  size={20}
                                  color="#F04438"
                                />
                              )}
                              <Text
                                className={`
                                  flex-1 text-center text-base font-medium
                                  ${
                                    matchedPairs.includes(word.pairId)
                                      ? 'text-success-700'
                                      : incorrectPairs.includes(word.pairId)
                                      ? 'text-error-700'
                                      : 'text-secondary-800'
                                  }
                                `}
                              >
                                {word.text}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </Animated.View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {isGameComplete && (
            <View
              className="absolute inset-0 bg-black/70 items-center justify-center"
              style={{
                height: height,
                width: width,
                left: 0,
                right: 0,
              }}
            >
              <Animated.View
                entering={FadeIn.delay(200)}
                className="bg-white rounded-2xl mx-5"
                style={{
                  maxHeight: height * 0.8,
                  width: width - 40,
                }}
              >
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    padding: 24,
                  }}
                >
                  <View className="items-center">
                    <View className="items-center justify-center h-24 mb-6">
                      <Animated.View
                        style={[trophyAnimatedStyle]}
                        className="items-center justify-center"
                      >
                        <View className="bg-success-50 p-4 rounded-full">
                          <Feather name="award" size={48} color="#12B76A" />
                        </View>
                      </Animated.View>
                    </View>

                    <View className="items-center mb-8">
                      <Text className="text-2xl font-bold text-gray-800 mb-2">
                        Congratulations! 🎉
                      </Text>
                      <Text className="text-base text-gray-600 text-center">
                        You've matched all the words
                      </Text>
                    </View>

                    <View className="flex-row w-full mb-8">
                      <View className="flex-1 bg-success-50 p-4 rounded-xl mr-2">
                        <Text className="text-xl font-bold text-success-700 text-center">
                          {(
                            (gameStats.correctMatches / gameStats.attempts) *
                            100
                          ).toFixed(1)}
                          %
                        </Text>
                        <Text className="text-sm text-success-600 text-center mt-1">
                          Akurasi
                        </Text>
                      </View>
                      <View className="flex-1 bg-success-50 p-4 rounded-xl ml-2">
                        <Text className="text-xl font-bold text-success-700 text-center">
                          {(
                            (gameStats.endTime - gameStats.startTime) /
                            1000
                          ).toFixed(1)}
                          s
                        </Text>
                        <Text className="text-sm text-success-600 text-center mt-1">
                          Time
                        </Text>
                      </View>
                    </View>

                    <View className="w-full space-y-4">
                      <TouchableOpacity
                        onPress={resetGame}
                        className="bg-success-500 py-4 rounded-xl items-center"
                        style={{
                          elevation: 2,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                        }}
                      >
                        <Text className="text-white font-semibold text-lg">
                          Play Again
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={navigateBack}
                        className="flex-row items-center justify-center mb-6"
                      >
                        <Feather name="arrow-left" color="#56A7F5" size={24} />
                        <Text className="ml-2 text-primary-400 font-medium text-base">
                          Back to Games
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </Animated.View>
            </View>
          )}
        </View>
      </SafeAreaView>
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut={true}
        explosionSpeed={350}
        fallSpeed={3000}
      />
    </View>
  )
}

export default BubbleBathGame
