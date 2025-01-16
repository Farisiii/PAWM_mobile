import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Edit2, Trash2, ChevronRight } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { Button } from '@/components/common/button'
import { Progress } from '@/components/common/progress'

const LearningCard = ({ card, onDelete, onEdit, onToggleMemorized }) => {
  const navigation = useNavigation()
  const learnedWords = card.wordPairs.filter((pair) => pair.is_learned).length
  const progress = (learnedWords / card.wordPairs.length) * 100

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('CardDetail', { cardId: card.id })}
      className="w-full mb-2"
    >
      <View className="bg-white rounded-xl shadow-sm border border-primary-100 overflow-hidden">
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="text-base font-semibold text-primary-700 mb-1">
                {card.title}
              </Text>
              <Text className="text-xs text-primary-500">
                Target: {card.targetDays} hari
              </Text>
            </View>
            <View className="flex-row gap-2 items-center">
              <Button
                onPress={(e) => {
                  e.stopPropagation()
                  onEdit(card)
                }}
                className="bg-secondary-50 p-2 rounded-lg"
              >
                <Edit2 size={14} className="text-secondary-600" />
              </Button>
              <Button
                onPress={(e) => {
                  e.stopPropagation()
                  onDelete(card.id)
                }}
                className="bg-error-50 p-2 rounded-lg"
              >
                <Trash2 size={14} className="text-error-600" />
              </Button>
              <ChevronRight size={20} className="text-primary-400 ml-1" />
            </View>
          </View>

          <View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs text-primary-600">Progress</Text>
              <Text className="text-xs text-primary-600">
                {learnedWords}/{card.wordPairs.length} kata
              </Text>
            </View>
            <Progress value={progress} className="h-1.5" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default LearningCard
