import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native'
import {
  ArrowLeft,
  RotateCcw,
  ArrowLeftRight,
  Globe,
  Trophy,
} from 'lucide-react-native'
import { useToast } from '@/hooks/use-toast'
import { useNavigation, useRoute } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const baseUrl = 'https://web-production-a314.up.railway.app'

const TranslationGame = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { cardId } = route.params
  const { toast } = useToast()
  const [allWordPairs, setAllWordPairs] = useState([])
  const [gameWordPairs, setGameWordPairs] = useState([])
  const [currentPairIndex, setCurrentPairIndex] = useState(0)
  const [options, setOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [score, setScore] = useState(0)
  const [gameMode, setGameMode] = useState('en-to-id')
  const [selectedOption, setSelectedOption] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [gameComplete, setGameComplete] = useState(false)
  const [buttonScale] = useState(new Animated.Value(1))
  const [hasStarted, setHasStarted] = useState(false)

  const handleBack = () => {
    navigation.navigate('Games', { cardId })
  }

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const selectGameWordPairs = (pairs) => {
    if (pairs.length <= 5) {
      return shuffleArray(pairs)
    }
    return shuffleArray(pairs).slice(0, 5)
  }

  const generateOptions = (currentPair, allPairs, mode) => {
    const correctAnswer =
      mode === 'en-to-id' ? currentPair.indonesian : currentPair.english

    const wrongAnswers = allPairs
      .filter((pair) => pair !== currentPair)
      .map((pair) => (mode === 'en-to-id' ? pair.indonesian : pair.english))

    const selectedWrongAnswers = shuffleArray(wrongAnswers).slice(0, 3)

    const allOptions = shuffleArray([
      { text: correctAnswer, isCorrect: true },
      ...selectedWrongAnswers.map((answer) => ({
        text: answer,
        isCorrect: false,
      })),
    ])

    setOptions(allOptions)
  }

  const fetchWordPairs = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = await AsyncStorage.getItem('token')

      if (!token) {
        navigation.navigate('Auth')
        return
      }

      const response = await fetch(`${baseUrl}/api/cards/${cardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()
      if (!data.wordPairs || !Array.isArray(data.wordPairs)) {
        throw new Error('Invalid data format received')
      }

      setAllWordPairs(data.wordPairs)
      const selectedPairs = selectGameWordPairs(data.wordPairs)
      setGameWordPairs(selectedPairs)
      generateOptions(selectedPairs[0], data.wordPairs, gameMode)
    } catch (error) {
      console.error('Fetch error:', error)
      setError(error.message || 'Failed to load word pairs')
      toast({
        title: 'Error',
        message: 'Failed to load word pairs. Please try again later.',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [cardId, navigation, toast, gameMode])

  useEffect(() => {
    if (cardId) {
      fetchWordPairs()
    }
  }, [cardId, fetchWordPairs])

  const handleOptionSelect = (option, index) => {
    setHasStarted(true)
    setSelectedOption(index)
    const isCorrectAnswer = option.isCorrect
    setIsCorrect(isCorrectAnswer)

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    if (isCorrectAnswer) {
      setScore((prev) => prev + 1)
      toast({
        title: 'Correct! 🎉',
        message: 'Great job!',
        type: 'success',
      })
    } else {
      toast({
        title: 'Not quite right',
        message: 'Try again!',
        type: 'warning',
      })
    }

    setTimeout(() => {
      if (currentPairIndex < gameWordPairs.length - 1) {
        setCurrentPairIndex((prev) => prev + 1)
        setSelectedOption(null)
        setIsCorrect(null)
        generateOptions(
          gameWordPairs[currentPairIndex + 1],
          allWordPairs,
          gameMode
        )
      } else {
        setGameComplete(true)
      }
    }, 1500)
  }

  const toggleGameMode = () => {
    if (!hasStarted) {
      const newMode = gameMode === 'en-to-id' ? 'id-to-en' : 'en-to-id'
      setGameMode(newMode)
      generateOptions(gameWordPairs[currentPairIndex], allWordPairs, newMode)
      setSelectedOption(null)
      setIsCorrect(null)
    } else {
      toast({
        title: 'Cannot change mode',
        message: 'Game has already started!',
        type: 'warning',
      })
    }
  }

  const resetGame = () => {
    const newGamePairs = selectGameWordPairs(allWordPairs)
    setGameWordPairs(newGamePairs)
    setCurrentPairIndex(0)
    setScore(0)
    setSelectedOption(null)
    setIsCorrect(null)
    setGameComplete(false)
    setHasStarted(false)
    generateOptions(newGamePairs[0], allWordPairs, gameMode)
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-50">
        <ActivityIndicator size="large" color="#2E90FA" />
        <Text className="mt-4 text-lg text-primary-600 font-medium">
          Loading game...
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50">
        <View className="p-4">
          <View className="bg-error-50 p-4 rounded-lg">
            <Text className="text-error-800 text-lg font-bold">
              Error Loading Game
            </Text>
            <Text className="text-error-600 mt-2">{error}</Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <ScrollView className="flex-1">
        <View className="p-4 pt-8">
          <TouchableOpacity
            onPress={handleBack}
            className="flex-row items-center mb-6"
          >
            <ArrowLeft color="#56A7F5" size={24} />
            <Text className="ml-2 text-primary-400 font-medium text-base">
              Back to games
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <Globe size={24} color="#56A7F5" />
              <Text className="text-2xl font-bold text-primary-600 ml-2">
                Translation Game
              </Text>
            </View>
            <Text className="text-lg font-semibold text-primary-500">
              {score}/{gameWordPairs.length}
            </Text>
          </View>

          <View className="flex-row justify-end space-x-3 mb-6">
            <TouchableOpacity
              onPress={toggleGameMode}
              className={`flex-row items-center bg-white px-4 py-2 rounded-lg border ${
                hasStarted ? 'border-gray-200' : 'border-primary-200'
              }`}
              disabled={hasStarted}
            >
              <ArrowLeftRight
                size={20}
                color={hasStarted ? '#9CA3AF' : '#1570DA'}
              />
              <Text
                className={`ml-2 ${
                  hasStarted ? 'text-gray-400' : 'text-primary-600'
                }`}
              >
                {gameMode === 'en-to-id' ? 'To ID' : 'To EN'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={resetGame}
              className="flex-row items-center bg-white px-4 py-2 rounded-lg border border-secondary-200"
            >
              <RotateCcw size={20} color="#6172F3" />
              <Text className="ml-2 text-secondary-600">Reset</Text>
            </TouchableOpacity>
          </View>

          {!gameComplete ? (
            <View>
              <View className="bg-white p-6 rounded-xl shadow mb-6">
                <Text className="text-base text-primary-600 mb-2">
                  {gameMode === 'en-to-id'
                    ? 'Translate to Indonesian:'
                    : 'Translate to English:'}
                </Text>
                <Text className="text-3xl font-bold text-primary-700 text-center">
                  {gameMode === 'en-to-id'
                    ? gameWordPairs[currentPairIndex]?.english
                    : gameWordPairs[currentPairIndex]?.indonesian}
                </Text>
              </View>

              <View className="space-y-4">
                {options.map((option, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      {
                        transform: [
                          { scale: selectedOption === index ? buttonScale : 1 },
                        ],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => handleOptionSelect(option, index)}
                      disabled={selectedOption !== null}
                      className={`p-4 rounded-xl ${
                        selectedOption === index
                          ? option.isCorrect
                            ? 'bg-success-500'
                            : 'bg-error-500'
                          : 'bg-white'
                      }`}
                    >
                      <Text
                        className={`text-xl text-center ${
                          selectedOption === index
                            ? 'text-white'
                            : 'text-primary-700'
                        }`}
                      >
                        {option.text}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>
          ) : (
            <View className="items-center justify-center py-8">
              <Trophy size={80} color="#F99A3D" />
              <Text className="text-3xl font-bold text-primary-600 mt-6">
                Game Complete!
              </Text>
              <Text className="text-xl text-primary-500 mt-2">
                Final Score: {score}/{gameWordPairs.length}
              </Text>
              <TouchableOpacity
                onPress={resetGame}
                className="mt-8 bg-primary-500 px-8 py-4 rounded-xl"
              >
                <Text className="text-lg text-white font-semibold">
                  Play Again
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default TranslationGame
