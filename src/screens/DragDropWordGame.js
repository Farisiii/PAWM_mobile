import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated'

const DragDropWordGame = () => {
  const navigation = useNavigation()
  const [inputText, setInputText] = useState('')
  const [puzzleStructure, setPuzzleStructure] = useState([])
  const [availableWords, setAvailableWords] = useState([])
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [error, setError] = useState('')
  const [showTutorial, setShowTutorial] = useState(false)
  const [activeWord, setActiveWord] = useState(null)
  const [dropZoneLayout, setDropZoneLayout] = useState({})

  const scale = useSharedValue(1)

  const getUniqueWordCount = (text) => {
    const words = text
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    return new Set(words).size
  }

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const createPuzzle = (text) => {
    const wordsArray = text.trim().split(/\s+/)
    const uniqueWordsMap = new Map()

    wordsArray.forEach((word) => {
      const lowerWord = word.toLowerCase()
      if (!uniqueWordsMap.has(lowerWord)) {
        uniqueWordsMap.set(lowerWord, word)
      }
    })

    const uniqueWords = Array.from(uniqueWordsMap.values())

    if (uniqueWords.length < 10) {
      setError('Please enter at least 10 unique words to start the game.')
      return
    }

    const eligibleWords = uniqueWords.filter((word) => word.length > 2)

    const minWordsToHide = Math.max(3, Math.floor(eligibleWords.length * 0.2))
    const maxWordsToHide = Math.floor(eligibleWords.length * 0.3)
    const numWordsToHide = Math.floor(
      Math.random() * (maxWordsToHide - minWordsToHide + 1) + minWordsToHide
    )

    const hiddenIndices = new Set()
    const blacklistedIndices = new Set()

    while (hiddenIndices.size < numWordsToHide) {
      const validIndices = eligibleWords
        .map((_, idx) => idx)
        .filter((idx) => !blacklistedIndices.has(idx))

      if (validIndices.length === 0) break

      const randomIndex =
        validIndices[Math.floor(Math.random() * validIndices.length)]
      hiddenIndices.add(randomIndex)
      blacklistedIndices.add(randomIndex - 1)
      blacklistedIndices.add(randomIndex)
      blacklistedIndices.add(randomIndex + 1)
    }

    const structure = eligibleWords.map((word, idx) => ({
      id: `slot-${idx}`,
      originalWord: word,
      isHidden: hiddenIndices.has(idx),
      currentWord: hiddenIndices.has(idx) ? null : word,
    }))

    const hidden = shuffleArray(
      eligibleWords
        .filter((_, idx) => hiddenIndices.has(idx))
        .map((word, idx) => ({
          id: `word-${idx}`,
          word,
        }))
    )

    setPuzzleStructure(structure)
    setAvailableWords(hidden)
    setGameStarted(true)
    setError('')
  }

  const handleWordPress = (word) => {
    setActiveWord(word)
    scale.value = withSpring(1.1)
  }

  const handleWordRelease = (word, slotId) => {
    scale.value = withSpring(1)
    setActiveWord(null)

    if (!slotId) return

    const slot = puzzleStructure.find((s) => s.id === slotId)
    if (!slot) return

    setPuzzleStructure((prev) =>
      prev.map((s) => {
        if (s.id === slotId) {
          if (s.currentWord) {
            setAvailableWords((prev) => [
              ...prev,
              { id: `word-${Date.now()}`, word: s.currentWord },
            ])
          }
          return { ...s, currentWord: word.word }
        }
        return s
      })
    )

    setAvailableWords((prev) => prev.filter((w) => w.id !== word.id))
  }

  const checkAnswers = () => {
    let correct = 0
    const incorrectWords = []

    puzzleStructure.forEach((slot) => {
      if (slot.isHidden) {
        if (slot.currentWord === slot.originalWord) {
          correct++
        } else if (slot.currentWord) {
          incorrectWords.push(slot.currentWord)
        }
      }
    })

    setPuzzleStructure((prev) =>
      prev.map((slot) => ({
        ...slot,
        currentWord:
          slot.isHidden && incorrectWords.includes(slot.currentWord)
            ? null
            : slot.currentWord,
      }))
    )

    setAvailableWords((prev) => [
      ...prev,
      ...shuffleArray(
        incorrectWords.map((word, idx) => ({
          id: `word-${Date.now()}-${idx}`,
          word,
        }))
      ),
    ])

    setScore(correct)
  }

  const resetGame = () => {
    setGameStarted(false)
    setInputText('')
    setScore(0)
    setError('')
    setAvailableWords([])
    setPuzzleStructure([])
  }

  const animatedWordStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <SafeAreaView className="flex-1 bg-primary-50 pt-7">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-6 pt-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-row items-center justify-center"
          >
            <Feather name="arrow-left" size={20} color="#1570DA" />
            <Text className="ml-2 text-primary-400 font-medium text-base">
              Back to Games
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowTutorial(!showTutorial)}
            className="p-2"
          >
            <Feather name="help-circle" color="#1570DA" size={24} />
          </TouchableOpacity>
        </View>

        {showTutorial && (
          <View className="bg-primary-50 p-4 rounded-lg mb-4">
            <Text className="font-semibold text-primary-800 mb-2">
              How to Play:
            </Text>
            <View className="space-y-1">
              <Text className="text-primary-800">
                1. Masukkan teks dengan setidaknya 10 kata unik
              </Text>
              <Text className="text-primary-800">
                2. Beberapa kata akan dihapus dan ditampilkan di bawah secara
                acak
              </Text>
              <Text className="text-primary-800">
                3. Ketuk sebuah kata lalu ketuk ruang kosong untuk
                menempatkannya
              </Text>
              <Text className="text-primary-800">
                4. Ketuk "Check Answers" untuk melihat skor Anda
              </Text>
            </View>
          </View>
        )}

        {!gameStarted ? (
          <View className="space-y-4">
            <Text className="text-lg font-medium text-primary-700">
              Enter your text (minimum 10 unique words):
            </Text>
            <TextInput
              multiline
              placeholder="Type or paste your text here..."
              value={inputText}
              onChangeText={setInputText}
              className="min-h-[200px] p-4 rounded-lg border-2 border-primary-200 bg-white"
              textAlignVertical="top"
            />
            {error ? (
              <View className="bg-error-50 border border-error-200 p-4 rounded-lg">
                <Text className="text-error-700">{error}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              onPress={() => createPuzzle(inputText)}
              disabled={getUniqueWordCount(inputText) < 10}
              className={`p-4 rounded-lg ${
                getUniqueWordCount(inputText) < 10
                  ? 'bg-primary-300'
                  : 'bg-primary-600'
              }`}
            >
              <Text className="text-white text-center text-lg">
                Start Challenge
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-2xl font-bold text-primary-700">
                Complete the Text
              </Text>
              <Text className="text-xl font-semibold text-primary-600">
                Score: {score}/
                {puzzleStructure.filter((item) => item.isHidden).length}
              </Text>
            </View>

            <View className="bg-white p-4 rounded-xl">
              <View className="flex-row flex-wrap">
                {puzzleStructure.map((item, idx) => (
                  <View key={item.id} className="mr-2 mb-2">
                    {item.isHidden ? (
                      <TouchableOpacity
                        onPress={() =>
                          activeWord && handleWordRelease(activeWord, item.id)
                        }
                        className={`min-w-[80px] h-10 items-center justify-center border-2 border-dashed rounded-lg px-3
                          ${
                            item.currentWord
                              ? 'border-success-400 bg-success-50'
                              : 'border-primary-300'
                          }`}
                      >
                        <Text>{item.currentWord || ''}</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text className="text-primary-800">
                        {item.originalWord}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

            <View className="space-y-4">
              <Text className="text-xl font-semibold text-primary-700">
                Available Words:
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {availableWords.map((word) => (
                  <Animated.View key={word.id} style={animatedWordStyle}>
                    <TouchableOpacity
                      onPress={() => handleWordPress(word)}
                      className={`bg-primary-100 px-4 py-2 rounded-lg ${
                        activeWord?.id === word.id ? 'bg-primary-200' : ''
                      }`}
                    >
                      <Text className="text-primary-800 font-medium">
                        {word.word}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>

            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={checkAnswers}
                className="flex-1 py-4 bg-success-500 rounded-lg"
              >
                <Text className="text-white text-center text-lg">
                  Check Answers
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetGame}
                className="flex-1 py-4 bg-primary-500 rounded-lg flex-row justify-center items-center"
              >
                <Text className="text-white text-center text-lg">New Game</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default DragDropWordGame
