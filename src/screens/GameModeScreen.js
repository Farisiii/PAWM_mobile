import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import {
  ArrowLeft,
  Droplets,
  BookText,
  Brain,
  Trophy,
  Star,
} from 'lucide-react-native'

const GameModeScreen = ({ route, navigation }) => {
  const { cardId } = route.params

  const games = [
    {
      id: 'word-match',
      path: 'BubbleBath',
      title: 'Kata & Makna',
      description:
        'Temukan pasangan kata bahasa Inggris dengan artinya dalam bahasa Indonesia. Cocokkan dengan tepat untuk mendapatkan skor!',
      icon: Droplets,
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
      icon: Brain,
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
      icon: BookText,
      iconColor: '#10B981',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      difficulty: 'Sulit',
      stars: 3,
    },
  ]

  const renderStars = (count) => {
    return [...Array(count)].map((_, index) => (
      <Star
        key={index}
        size={16}
        color="#FBBF24"
        fill="#FBBF24"
        className="mx-0.5"
      />
    ))
  }

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case 'Mudah':
        return 'bg-success-100 text-success-700'
      case 'Sedang':
        return 'bg-warning-100 text-warning-700'
      case 'Sulit':
        return 'bg-error-100 text-error-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <ScrollView className="flex-1 p-4 pt-7">
        <TouchableOpacity
          onPress={() => navigation.navigate('CardDetail', { cardId })}
          className="flex-row items-center mb-6"
        >
          <ArrowLeft color="#56A7F5" size={24} />
          <Text className="ml-2 text-primary-400 font-medium text-base">
            Back to Card Detail
          </Text>
        </TouchableOpacity>

        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Pilih Petualanganmu
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Temukan mode permainan yang sesuai dengan gaya belajarmu!
          </Text>
        </View>

        <View className="space-y-4 pb-14">
          {games.map((game) => {
            const IconComponent = game.icon
            return (
              <TouchableOpacity
                key={game.id}
                onPress={() => navigation.navigate(game.path, { cardId })}
                className={`${game.bgColor} ${game.borderColor} border-2 rounded-xl p-4`}
              >
                <View className="flex-row items-center space-x-4 mb-4">
                  <View className="bg-white p-3 rounded-xl shadow">
                    <IconComponent size={24} color={game.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-semibold text-gray-800 mb-1">
                      {game.title}
                    </Text>
                    <View className="flex-row">{renderStars(game.stars)}</View>
                  </View>
                </View>

                <Text className="text-base text-gray-600 mb-4">
                  {game.description}
                </Text>

                <View className="space-y-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="font-medium text-gray-700">
                      Tingkat Kesulitan:
                    </Text>
                    <View
                      className={`px-3 py-1 rounded-full ${getDifficultyStyle(
                        game.difficulty
                      )}`}
                    >
                      <Text className="text-sm font-medium">
                        {game.difficulty}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    className="flex-row items-center justify-center bg-white py-3 rounded-lg border border-gray-200"
                    onPress={() => navigation.navigate(game.path, { cardId })}
                  >
                    <Trophy size={20} className="text-gray-800 mr-2" />
                    <Text className="text-gray-800 font-medium">
                      Mulai Bermain
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default GameModeScreen
