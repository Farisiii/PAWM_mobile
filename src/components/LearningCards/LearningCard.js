import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { Button } from '@/components/common/Button'
import { Progress } from '@/components/common/progress'
import { styled } from 'nativewind'

const StyledView = styled(View)
const StyledText = styled(Text)

const LearningCard = ({ card, onDelete, onEdit, onToggleMemorized }) => {
  const navigation = useNavigation()
  const learnedWords = card.wordPairs.filter((pair) => pair.is_learned).length
  const progress = (learnedWords / card.wordPairs.length) * 100

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('CardDetail', { cardId: card.id })}
      className="w-full mb-2"
      activeOpacity={0.7}
    >
      <StyledView className="bg-white rounded-xl shadow-sm border border-primary-100 overflow-hidden">
        <StyledView className="p-4">
          <StyledView className="flex-row justify-between items-start mb-3">
            <StyledView className="flex-1">
              <StyledText className="text-base font-semibold text-primary-700 mb-1">
                {card.title}
              </StyledText>
              <StyledText className="text-xs text-primary-500">
                Target: {card.targetDays} hari
              </StyledText>
            </StyledView>
            <StyledView className="flex-row gap-2 items-center">
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation()
                  onEdit(card)
                }}
                className="bg-secondary-50 p-2 rounded-lg"
                activeOpacity={0.7}
              >
                <Feather name="edit-2" size={14} color="#4F46E5" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation()
                  onDelete(card.id)
                }}
                className="bg-error-50 p-2 rounded-lg"
                activeOpacity={0.7}
              >
                <Feather name="trash-2" size={14} color="#DC2626" />
              </TouchableOpacity>

              <Feather
                name="chevron-right"
                size={20}
                color="#9CA3AF"
                style={{ marginLeft: 4 }}
              />
            </StyledView>
          </StyledView>

          <StyledView>
            <StyledView className="flex-row justify-between mb-1.5">
              <StyledText className="text-xs text-primary-600">
                Progress
              </StyledText>
              <StyledText className="text-xs text-primary-600">
                {learnedWords}/{card.wordPairs.length} kata
              </StyledText>
            </StyledView>
            <Progress value={progress} className="h-1.5" />
          </StyledView>
        </StyledView>
      </StyledView>
    </TouchableOpacity>
  )
}

export default LearningCard
