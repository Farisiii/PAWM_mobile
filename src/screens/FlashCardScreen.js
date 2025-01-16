import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  Animated,
  Pressable,
  Dimensions,
  StatusBar,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  ArrowLeft,
  Check,
  X,
  Loader2,
  BookOpen,
  AlertCircle,
} from 'lucide-react-native'
import { Button } from '@/components/common/button'
import { Progress } from '@/components/common/progress'
import { useToast } from '@/hooks/use-toast'

const baseUrl = 'https://web-production-a314.up.railway.app'
const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_MARGIN = 24
const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2

const FlashCardPage = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { cardId } = route.params
  const [wordPairs, setWordPairs] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cardDetails, setCardDetails] = useState({
    title: '',
    totalWords: 0,
    progress: 0,
  })
  const { toast } = useToast()
  const [learnedWords, setLearnedWords] = useState([])

  const flipAnimation = new Animated.Value(0)
  const scaleAnimation = new Animated.Value(1)
  const slideAnimation = new Animated.Value(0)
  const headerOpacity = new Animated.Value(1)

  const fetchCardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = await AsyncStorage.getItem('token')

      if (!token) {
        throw new Error('No authentication token found')
      }

      const cardResponse = await fetch(`${baseUrl}/api/cards/${cardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!cardResponse.ok) {
        const errorData = await cardResponse.json()
        throw new Error(errorData.message || 'Failed to fetch card data')
      }

      const cardData = await cardResponse.json()

      if (!cardData?.wordPairs?.length) {
        throw new Error('No word pairs found in response')
      }

      await fetch(`${baseUrl}/api/cards/${cardId}/reset-progress`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      setWordPairs(
        cardData.wordPairs.map((pair) => ({ ...pair, isLearned: false }))
      )
      setCardDetails({
        title: cardData.title,
        totalWords: cardData.wordPairs.length,
        progress: 0,
      })

      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error.message)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load card data',
        variant: 'destructive',
      })
      navigation.navigate('CardDetail', { cardId })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!cardId) {
      toast({
        title: 'Error',
        description: 'No card ID provided',
        variant: 'destructive',
      })
      navigation.goBack()
      return
    }

    fetchCardData()
  }, [cardId])

  const handleCardFlip = useCallback(() => {
    if (!isFlipped) {
      Animated.parallel([
        Animated.spring(flipAnimation, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 10,
        }),
        Animated.spring(scaleAnimation, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsFlipped(true)
        Animated.spring(scaleAnimation, {
          toValue: 1,
          useNativeDriver: true,
        }).start()
      })
    }
  }, [isFlipped])

  const handleCardUnflip = useCallback(() => {
    if (isFlipped) {
      Animated.parallel([
        Animated.spring(flipAnimation, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 10,
        }),
        Animated.spring(scaleAnimation, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsFlipped(false)
        Animated.spring(scaleAnimation, {
          toValue: 1,
          useNativeDriver: true,
        }).start()
      })
    }
  }, [isFlipped])

  const handleBackPress = useCallback(() => {
    if (cardDetails.progress > 0) {
      toast({
        title: 'Progress will be lost',
        description: 'Are you sure you want to exit?',
        action: (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => navigation.navigate('CardDetail', { cardId })}
          >
            Exit
          </Button>
        ),
      })
    } else {
      navigation.navigate('CardDetail', { cardId })
    }
  }, [cardDetails.progress, cardId, navigation])

  const handleCardTransition = (direction) => {
    Animated.sequence([
      Animated.spring(slideAnimation, {
        toValue: direction === 'right' ? CARD_WIDTH : -CARD_WIDTH,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleKnown = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')

      const updatedLearnedWords = [...learnedWords]
      if (!updatedLearnedWords.includes(currentIndex)) {
        updatedLearnedWords.push(currentIndex)
      }
      setLearnedWords(updatedLearnedWords)

      const updatedWordPairs = wordPairs.map((pair, index) => ({
        ...pair,
        isLearned:
          index === currentIndex ? true : updatedLearnedWords.includes(index),
      }))

      const response = await fetch(`${baseUrl}/api/cards/${cardId}/progress`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wordPairs: updatedWordPairs }),
      })

      if (!response.ok) throw new Error('Failed to update progress')

      const data = await response.json()
      setCardDetails((prev) => ({ ...prev, progress: data.progress }))

      if (currentIndex === wordPairs.length - 1) {
        toast({
          title: 'Congratulations! 🎉',
          description: `You've completed all ${cardDetails.totalWords} words!`,
        })
        setTimeout(() => navigation.navigate('CardDetail', { cardId }), 1500)
      } else {
        handleCardTransition('right')
        setIsFlipped(false)
        setCurrentIndex(currentIndex + 1)
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update progress',
        variant: 'destructive',
      })
    }
  }

  const handleUnknown = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')

      const updatedLearnedWords = learnedWords.filter(
        (index) => index !== currentIndex
      )
      setLearnedWords(updatedLearnedWords)

      const updatedWordPairs = wordPairs.map((pair, index) => ({
        ...pair,
        isLearned: updatedLearnedWords.includes(index),
      }))

      const response = await fetch(`${baseUrl}/api/cards/${cardId}/progress`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wordPairs: updatedWordPairs }),
      })

      if (!response.ok) throw new Error('Failed to update progress')

      const data = await response.json()
      setCardDetails((prev) => ({ ...prev, progress: data.progress }))

      if (currentIndex === wordPairs.length - 1) {
        toast({
          title: 'Session Complete',
          description: `You've reviewed all ${cardDetails.totalWords} words!`,
        })
        setTimeout(() => navigation.navigate('CardDetail', { cardId }), 1500)
      } else {
        handleCardTransition('left')
        setIsFlipped(false)
        setCurrentIndex(currentIndex + 1)
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update progress',
        variant: 'destructive',
      })
    }
  }

  const cardAnimatedStyle = {
    transform: [
      { scale: scaleAnimation },
      { translateX: slideAnimation },
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  }

  const frontCardAnimatedStyle = {
    transform: [
      { scale: scaleAnimation },
      { translateX: slideAnimation },
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
    opacity: flipAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0, 0],
    }),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }

  const backCardAnimatedStyle = {
    transform: [
      { scale: scaleAnimation },
      { translateX: slideAnimation },
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
    opacity: flipAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    }),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }

  const LoadingState = () => (
    <View className="flex-1 items-center justify-center bg-primary-50">
      <StatusBar barStyle="dark-content" />
      <View className="bg-white p-8 rounded-3xl shadow-lg items-center">
        <Loader2 className="w-16 h-16 text-primary-600 animate-spin" />
        <Text className="mt-6 text-primary-600 font-semibold text-xl text-center">
          Preparing your flashcards
        </Text>
        <Text className="mt-2 text-primary-400 text-center">
          This may take a moment...
        </Text>
      </View>
    </View>
  )

  const ErrorState = () => (
    <View className="flex-1 items-center justify-center bg-primary-50 p-6">
      <StatusBar barStyle="dark-content" />
      <View className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-sm">
        <AlertCircle className="w-16 h-16 text-error-500 mx-auto" />
        <Text className="mt-6 text-error-600 font-semibold text-xl text-center">
          Oops! Something went wrong
        </Text>
        <Text className="mt-2 text-error-400 text-center mb-6">{error}</Text>
        <Button
          onPress={() => navigation.goBack()}
          className="bg-primary-600 py-4 rounded-2xl w-full"
        >
          <Text className="text-white font-semibold text-lg">
            Return to Deck
          </Text>
        </Button>
      </View>
    </View>
  )

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState />
  if (!wordPairs?.length) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-50 p-6">
        <View className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-sm">
          <BookOpen className="w-16 h-16 text-primary-500 mx-auto" />
          <Text className="mt-6 text-primary-600 font-semibold text-xl text-center">
            No flashcards available
          </Text>
          <Button
            onPress={() => navigation.goBack()}
            className="mt-6 bg-primary-600 py-4 rounded-2xl w-full"
          >
            <Text className="text-white font-semibold text-lg">
              Return to Deck
            </Text>
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-primary-50">
      <StatusBar barStyle="dark-content" />

      <Animated.View
        style={{ opacity: headerOpacity }}
        className="px-6 pt-14 pb-6 bg-white shadow-sm"
      >
        <View className="flex-row items-center justify-between mb-6">
          <Button
            onPress={handleBackPress}
            className="flex-row items-center p-2 bg-primary-50 rounded-full shadow-sm"
            variant="ghost"
          >
            <ArrowLeft size={24} className="text-primary-600" />
          </Button>
          <View className="bg-primary-50 px-6 py-3 rounded-full shadow-sm">
            <Text className="text-base text-primary-600 font-semibold">
              {currentIndex + 1} / {cardDetails.totalWords}
            </Text>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-primary-800 font-bold text-2xl mb-4">
            {cardDetails.title}
          </Text>
          <Progress
            value={cardDetails.progress}
            className="h-3 bg-primary-100 rounded-full"
          />
          <Text className="mt-3 text-sm text-primary-600 font-medium">
            {cardDetails.progress}% Mastered
          </Text>
        </View>
      </Animated.View>

      <View className="flex-1 px-6 justify-center">
        <Pressable
          onPress={isFlipped ? handleCardUnflip : handleCardFlip}
          className="aspect-[3/2] w-full mb-8"
        >
          <View className="flex-1 relative">
            <Animated.View
              style={[frontCardAnimatedStyle, { backfaceVisibility: 'hidden' }]}
              className="absolute inset-0"
            >
              <View className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
                <View className="w-full bg-primary-100 py-4 px-6">
                  <Text className="text-primary-600 font-medium text-lg">
                    English
                  </Text>
                </View>

                <View className="flex-1 items-center justify-center p-8">
                  <Text className="text-5xl font-bold text-primary-600 text-center mb-4">
                    {wordPairs[currentIndex]?.english}
                  </Text>
                  <View className="absolute bottom-6 bg-primary-50 px-4 py-2 rounded-full">
                    <Text className="text-sm text-primary-400">
                      Tap to see translation
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            <Animated.View
              style={[backCardAnimatedStyle, { backfaceVisibility: 'hidden' }]}
              className="absolute inset-0"
            >
              <View className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
                <View className="w-full bg-secondary-100 py-4 px-6">
                  <Text className="text-secondary-600 font-medium text-lg">
                    Indonesian
                  </Text>
                </View>

                <View className="flex-1 items-center justify-center p-8">
                  <Text className="text-5xl font-bold text-secondary-600 text-center mb-4">
                    {wordPairs[currentIndex]?.indonesian}
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </Pressable>

        <View className="flex-row gap-4 px-6 pb-6">
          <Button
            onPress={handleUnknown}
            className="flex-1 bg-white border-2 border-error-100 h-16 rounded-2xl shadow-sm"
          >
            <Text className="ml-2 text-error-600 font-semibold text-lg">
              Need Review
            </Text>
          </Button>
          <Button
            onPress={handleKnown}
            className="flex-1 bg-success-500 h-16 rounded-2xl shadow-sm"
          >
            <Text className="ml-2 text-white font-semibold text-lg">
              Mastered!
            </Text>
          </Button>
        </View>
      </View>
    </View>
  )
}

export default FlashCardPage
