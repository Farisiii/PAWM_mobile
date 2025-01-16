import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import {
  PlayCircle,
  Library,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react-native'
import { Progress } from '@/components/common/progress'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useToast } from '@/hooks/use-toast'

const baseUrl = 'https://web-production-a314.up.railway.app'

const CardDetailScreen = ({ route, navigation }) => {
  if (!route?.params?.cardId) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <AlertCircle className="w-16 h-16 text-error-500" />
        <Text className="mt-4 text-error-600 font-semibold text-xl text-center">
          Invalid card ID
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-6 bg-primary-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const { cardId } = route.params
  const [card, setCard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    if (cardId) {
      fetchCardData()
    }
  }, [cardId])

  const handleBackPress = () => {
    navigation.navigate('LearningCards')
  }

  const fetchCardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = await AsyncStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${baseUrl}/api/cards/${cardId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Card not found')
        }
        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again')
        }
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      if (!data) {
        throw new Error('No data received from server')
      }

      setCard(data)
    } catch (error) {
      console.error('Error fetching card:', error.message)
      setError(error.message)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load card data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-primary-50 items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-primary-600 font-medium">
          Loading card details...
        </Text>
      </View>
    )
  }

  if (error || !card) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <AlertCircle className="w-16 h-16 text-error-500" />
        <Text className="mt-4 text-error-600 font-semibold text-xl text-center">
          {error || 'Failed to load card'}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-6 bg-primary-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const learnedWords = card.wordPairs.filter((pair) => pair.isLearned).length
  const progress = (learnedWords / card.wordPairs.length) * 100

  return (
    <View className="flex-1 bg-primary-50">
      <View className="px-4 pt-6 pb-4">
        <TouchableOpacity
          onPress={handleBackPress}
          className="flex-row items-center mb-6"
        >
          <ArrowLeft color="#56A7F5" size={24} />
          <Text className="ml-2 text-primary-400 font-medium text-base">
            Back to Learning Cards
          </Text>
        </TouchableOpacity>

        <View className="items-center space-y-4 mb-6">
          <Text className="text-3xl font-bold text-primary-600 text-center">
            {card.title}
          </Text>

          <View className="flex-row flex-wrap justify-center gap-2">
            <View className="bg-primary-50 px-4 py-2 rounded-full">
              <Text className="text-primary-400">
                <Text className="font-medium">Target Days: </Text>
                {card.targetDays}
              </Text>
            </View>
            <View className="bg-primary-50 px-4 py-2 rounded-full">
              <Text className="text-primary-400">
                <Text className="font-medium">Progress: </Text>
                {progress.toFixed(1)}%
              </Text>
            </View>
            <View className="bg-primary-50 px-4 py-2 rounded-full">
              <Text className="text-primary-400">
                <Text className="font-medium">Words: </Text>
                {card.wordPairs.length}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Progress value={progress} className="h-2 bg-primary-100" />
        </View>

        <View className="flex-row gap-4 mb-8">
          <TouchableOpacity
            className="flex-1 bg-secondary-600 p-6 rounded-xl flex-row items-center justify-center"
            onPress={() =>
              navigation.navigate('FlashCard', { cardId: card.id })
            }
          >
            <PlayCircle size={24} className="text-white mr-3" />
            <Text className="text-lg font-medium text-white">
              Flashcard Mode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-primary-500 p-6 rounded-xl flex-row items-center justify-center"
            onPress={() => navigation.navigate('Games', { cardId: card.id })}
          >
            <Library size={24} className="text-white mr-3" />
            <Text className="text-lg font-medium text-white">Game Mode</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 bg-white rounded-t-xl shadow-lg border border-accent-200">
        <View className="flex-row py-4 px-6 bg-accent-50 border-b border-accent-200">
          <Text className="w-16 text-primary-600 font-semibold">#</Text>
          <Text className="flex-1 text-primary-600 font-semibold">English</Text>
          <Text className="flex-1 text-primary-600 font-semibold">
            Indonesian
          </Text>
        </View>

        <ScrollView className="flex-1">
          {card.wordPairs.map((pair, index) => (
            <View
              key={index}
              className="flex-row py-4 px-6 border-b border-accent-100"
            >
              <Text className="w-16 font-medium text-primary-400">
                {index + 1}
              </Text>
              <Text className="flex-1 text-primary-600 font-medium">
                {pair.english}
              </Text>
              <Text className="flex-1 text-primary-600 font-medium">
                {pair.indonesian}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

export default CardDetailScreen
