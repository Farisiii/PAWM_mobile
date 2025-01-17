import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useToast } from '@/hooks/use-toast'

const BASE_URL = 'https://web-production-a314.up.railway.app'

const ProgressBar = ({ value }) => (
  <View className="h-2 bg-primary-100 rounded-full overflow-hidden">
    <View
      className="h-full bg-primary-600 rounded-full"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </View>
)

const StatBadge = ({ label, value }) => (
  <View className="bg-primary-50 px-4 py-2 rounded-full">
    <Text className="text-primary-400">
      <Text className="font-medium">{label}: </Text>
      {value}
    </Text>
  </View>
)

const CardDetailScreen = ({ route, navigation }) => {
  const [card, setCard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()
  const cardId = route?.params?.cardId

  useEffect(() => {
    if (!cardId) {
      setError('Invalid card ID')
      setIsLoading(false)
      return
    }
    fetchCardData()
  }, [cardId])

  const fetchCardData = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) throw new Error('Authentication required')

      const response = await fetch(`${BASE_URL}/api/cards/${cardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'Card not found'
            : response.status === 401
            ? 'Session expired - Please login again'
            : 'Failed to load card data'
        )
      }

      const data = await response.json()
      if (!data) throw new Error('No data received')

      setCard(data)
    } catch (error) {
      console.error('Error:', error)
      setError(error.message)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderLoadingState = () => (
    <View className="flex-1 bg-primary-50 items-center justify-center">
      <ActivityIndicator size="large" color="#6366F1" />
      <Text className="mt-4 text-primary-600 font-medium">
        Loading card details...
      </Text>
    </View>
  )

  const renderErrorState = () => (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6">
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="mt-4 text-error-600 font-semibold text-xl text-center">
          {error || 'Failed to load card'}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('LearningCards')}
          className="mt-6 bg-primary-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )

  if (isLoading) return renderLoadingState()
  if (error || !card) return renderErrorState()

  const learnedWords = card.wordPairs.filter((pair) => pair.isLearned).length
  const progress = (learnedWords / card.wordPairs.length) * 100

  return (
    <SafeAreaView
      className="flex-1 bg-primary-50"
      style={{
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <View className="px-4 pt-6 pb-4">
        <TouchableOpacity
          onPress={() => navigation.navigate('LearningCards')}
          className="flex-row items-center mb-6"
        >
          <Ionicons name="arrow-back" size={24} color="#56A7F5" />
          <Text className="ml-2 text-primary-400 font-medium text-base">
            Back to Learning Cards
          </Text>
        </TouchableOpacity>

        <View className="items-center space-y-4 mb-6">
          <Text className="text-3xl font-bold text-primary-600 text-center">
            {card.title}
          </Text>

          <View className="flex-row flex-wrap justify-center gap-2">
            <StatBadge label="Target Days" value={card.targetDays} />
            <StatBadge label="Progress" value={`${progress.toFixed(1)}%`} />
            <StatBadge label="Words" value={card.wordPairs.length} />
          </View>
        </View>

        <View className="mb-6">
          <ProgressBar value={progress} />
        </View>

        <View className="flex-row gap-4 mb-8">
          <TouchableOpacity
            className="flex-1 bg-secondary-600 p-6 rounded-xl flex-row items-center justify-center"
            onPress={() =>
              navigation.navigate('FlashCard', { cardId: card.id })
            }
          >
            <Text className="text-lg font-medium text-white">Flashcard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-primary-500 p-6 rounded-xl flex-row items-center justify-center"
            onPress={() => navigation.navigate('Games', { cardId: card.id })}
          >
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
    </SafeAreaView>
  )
}

export default CardDetailScreen
