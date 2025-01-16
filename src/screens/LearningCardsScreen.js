import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Plus, LogOut, Loader2 } from 'lucide-react-native'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/common/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/common/alert-dialog'
import AddCardDialog from '../components/LearningCards/AddCardDialog'
import LearningCard from '../components/LearningCards/LearningCard'
import { fetchCards, createCard, updateCard, deleteCard } from '@/services/api'
import { useAuth } from '../context/AuthContext'
import { useFocusEffect } from '@react-navigation/native'

const LearningCardsScreen = () => {
  const { signOut } = useAuth()
  const { toast } = useToast()

  const [cards, setCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)

  useFocusEffect(
    useCallback(() => {
      loadCards()
    }, [])
  )

  const loadCards = async () => {
    try {
      setIsLoading(true)
      const loadedCards = await fetchCards()
      setCards(loadedCards)
    } catch (error) {
      console.error('Error loading cards:', error)
      toast({
        title: 'Error',
        description: 'Failed to load cards. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const memorizedCount = cards.filter((card) => card.isMemorized).length

  const handleCardSubmit = async (cardData) => {
    try {
      if (selectedCard) {
        const updatedCard = await updateCard(selectedCard.id, {
          ...cardData,
          wordPairs: cardData.wordPairs.map((pair, index) => ({
            english: pair.english,
            indonesian: pair.indonesian,
            is_learned: pair.is_learned,
          })),
          lastUpdated: new Date().toISOString(),
        })
        setCards(
          cards.map((card) => (card.id === updatedCard.id ? updatedCard : card))
        )
        toast({
          title: 'Success',
          description: 'Card updated successfully',
          className: 'bg-success-50 border-success-200',
        })
      } else {
        const newCard = await createCard({
          ...cardData,
          wordPairs: cardData.wordPairs.map((pair) => ({
            english: pair.english,
            indonesian: pair.indonesian,
            is_learned: false,
          })),
          isMemorized: false,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        })
        setCards([...cards, newCard])
        toast({
          title: 'Success',
          description: 'New card created successfully',
          className: 'bg-success-50 border-success-200',
        })
      }
      handleCloseDialog()
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${selectedCard ? 'update' : 'create'} card`,
        variant: 'destructive',
      })
    }
  }

  const handleToggleMemorized = async (cardId) => {
    try {
      const cardToUpdate = cards.find((card) => card.id === cardId)
      if (!cardToUpdate) return

      const response = await updateCard(cardId, {
        ...cardToUpdate,
        wordPairs: cardToUpdate.wordPairs.map((pair) => ({
          ...pair,
          is_learned: pair.is_learned,
        })),
        lastUpdated: new Date().toISOString(),
      })

      setCards(cards.map((card) => (card.id === cardId ? response : card)))

      toast({
        title: 'Success',
        description: 'Progress updated successfully',
        className: 'bg-success-50 border-success-200',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteCard = async () => {
    if (!selectedCard) return

    try {
      await deleteCard(selectedCard.id)
      setCards(cards.filter((card) => card.id !== selectedCard.id))
      toast({
        title: 'Success',
        description: 'Card deleted successfully',
        className: 'bg-success-50 border-success-200',
      })
      setIsDeleteDialogOpen(false)
      setSelectedCard(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete card',
        variant: 'destructive',
      })
    }
  }

  const handleOpenDialog = (card = null) => {
    setSelectedCard(card)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedCard(null)
  }

  const handleOpenDeleteDialog = (card) => {
    setSelectedCard(card)
    setIsDeleteDialogOpen(true)
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-50">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <Text className="mt-4 text-base text-primary-600">
          Loading cards...
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-primary-50">
      <View className="bg-white shadow-sm px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#1570DA',
              }}
            >
              PowerVocab
            </Text>
            <Text className="text-sm text-primary-500 mt-1">
              There {cards.length < 2 ? 'is' : 'are'} {cards.length}{' '}
              {cards.length < 2 ? 'card' : 'cards'}
            </Text>
          </View>

          <View className="flex-row items-center space-x-3">
            <Button
              onPress={() => handleOpenDialog()}
              className="bg-gradient-to-r from-primary-600 to-secondary-600"
            >
              <Text className="text-white font-medium">New Card</Text>
            </Button>

            <Button
              onPress={handleLogout}
              variant="outline"
              className="border-error-200"
            >
              <Text className="text-error-500 font-medium">Logout</Text>
            </Button>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 32 }}
      >
        {cards.length === 0 ? (
          <View className="items-center justify-center py-12">
            <View className="bg-white rounded-xl shadow-sm border border-primary-100 p-6 max-w-md w-full">
              <Text className="text-lg font-medium text-primary-700 text-center mb-4">
                No Learning Cards Yet
              </Text>
              <Text className="text-base text-primary-500 text-center mb-6">
                Create your first learning card to start improving your
                vocabulary
              </Text>
              <Button
                onPress={() => handleOpenDialog()}
                className="bg-gradient-to-r from-primary-600 to-secondary-600"
              >
                <Plus size={18} className="mr-2" />
                <Text className="text-white font-medium">
                  Create First Card
                </Text>
              </Button>
            </View>
          </View>
        ) : (
          <View className="flex-1 items-center -mt-2 -mb-4">
            <View className="w-full max-w-7xl">
              <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                  <LearningCard
                    key={card.id}
                    card={card}
                    onEdit={() => handleOpenDialog(card)}
                    onDelete={() => handleOpenDeleteDialog(card)}
                    onToggleMemorized={() => handleToggleMemorized(card.id)}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <AddCardDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleCardSubmit}
        initialData={selectedCard}
        isEditing={!!selectedCard}
      />

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedCard(null)
        }}
      >
        <AlertDialogContent className="fixed inset-0 m-auto max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              Delete Learning Card?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-500 mt-2">
              This action cannot be undone. This card and all its contents will
              be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <View className="flex-row space-x-3 w-full">
              <AlertDialogCancel
                className="flex-1"
                onPress={() => {
                  setIsDeleteDialogOpen(false)
                  setSelectedCard(null)
                }}
              >
                <Text className="text-gray-700 font-medium">Cancel</Text>
              </AlertDialogCancel>
              <AlertDialogAction
                className="flex-1 bg-error-600"
                onPress={handleDeleteCard}
              >
                <Text className="text-white font-medium">Delete</Text>
              </AlertDialogAction>
            </View>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  )
}

export default LearningCardsScreen
