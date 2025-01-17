import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import Animated, {
  FadeInUp,
  FadeInDown,
  withSpring,
} from 'react-native-reanimated'

const GameModeScreen = ({ route, navigation }) => {
  const { cardId } = route.params

  const games = [
    {
      id: 'word-match',
      path: 'BubbleBath',
      title: 'Kata & Makna',
      description:
        'Temukan pasangan kata bahasa Inggris dengan artinya dalam bahasa Indonesia. Cocokkan dengan tepat untuk mendapatkan skor!',
      icon: 'water-outline',
      iconColor: '#3B82F6',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      difficulty: 'Mudah',
      stars: 1,
    },
    {
      id: 'translation-game',
      path: 'TranslationGame',
      title: 'Permainan Terjemahan',
      description:
        'Pilih terjemahan yang tepat dari beberapa pilihan yang tersedia. Tersedia dalam dua mode: Indonesia ke Inggris atau sebaliknya!',
      icon: 'school',
      iconColor: '#8B5CF6',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      difficulty: 'Sedang',
      stars: 2,
    },
    {
      id: 'drag-drop-word-game',
      path: 'WordGame',
      title: 'Seret & Letakkan Kata',
      description:
        'Lengkapi kalimat dengan menyeret kata yang tepat ke bagian yang kosong. Gunakan kata-kata yang tersedia untuk melengkapi konteks!',
      icon: 'book-outline',
      iconColor: '#10B981',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      difficulty: 'Sulit',
      stars: 3,
    },
  ]

  const renderStars = (count) => {
    return [...Array(count)].map((_, index) => (
      <Ionicons
        key={index}
        name="star"
        size={16}
        color="#FBBF24"
        style={{ marginHorizontal: 2 }}
      />
    ))
  }

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case 'Mudah':
        return {
          container: 'bg-success-100',
          text: 'text-success-700',
        }
      case 'Sedang':
        return {
          container: 'bg-warning-100',
          text: 'text-warning-700',
        }
      case 'Sulit':
        return {
          container: 'bg-error-100',
          text: 'text-error-700',
        }
      default:
        return {
          container: 'bg-gray-100',
          text: 'text-gray-700',
        }
    }
  }

  const GameCard = ({ game, index }) => {
    const difficultyStyle = getDifficultyStyle(game.difficulty)

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 200).springify()}
        className={`${game.bgColor} ${game.borderColor} border-2 rounded-xl p-4 shadow-sm mb-4`}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate(game.path, { cardId })}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center space-x-4 mb-4">
            <View className="bg-white p-3 rounded-xl shadow-sm">
              <Ionicons name={game.icon} size={24} color={game.iconColor} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-800 mb-1">
                {game.title}
              </Text>
              <View className="flex-row">{renderStars(game.stars)}</View>
            </View>
          </View>

          <Text className="text-base text-gray-600 mb-4 leading-6">
            {game.description}
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="font-medium text-gray-700">
                Tingkat Kesulitan:
              </Text>
              <View
                className={`px-3 py-1 rounded-full ${difficultyStyle.container}`}
              >
                <Text className={`text-sm font-medium ${difficultyStyle.text}`}>
                  {game.difficulty}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center bg-white py-3 rounded-lg border border-gray-200 active:bg-gray-50"
              onPress={() => navigation.navigate(game.path, { cardId })}
            >
              <Ionicons
                name="trophy-outline"
                size={20}
                color="#1F2937"
                style={{ marginRight: 8 }}
              />
              <Text className="text-gray-800 font-medium">Mulai Bermain</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50 pt-4">
      <StatusBar style="dark" />
      <ScrollView className="flex-1 px-4 pt-7">
        <Animated.View entering={FadeInDown.springify()}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CardDetail', { cardId })}
            className="flex-row items-center mb-6 pt-4"
          >
            <Ionicons name="arrow-back" size={24} color="#56A7F5" />
            <Text className="ml-2 text-primary-400 font-medium text-base">
              Back to Card Detail
            </Text>
          </TouchableOpacity>

          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Pilih Petualanganmu
            </Text>
            <Text className="text-base text-gray-600 text-center px-4">
              Temukan mode permainan yang sesuai dengan gaya belajarmu!
            </Text>
          </View>
        </Animated.View>

        <View className="space-y-4 pb-14">
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default GameModeScreen
