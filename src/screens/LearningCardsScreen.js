import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
  Pressable,
} from 'react-native'
import { Feather } from '@expo/vector-icons' // Changed to Feather icons which are commonly available
import { useToast } from '../hooks/use-toast'
import { Button } from '../components/common/Button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/common/alert-dialog'
import AddCardDialog from '../components/LearningCards/AddCardDialog'
import LearningCard from '../components/LearningCards/LearningCard'
import { fetchCards, createCard, updateCard, deleteCard } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useFocusEffect } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')

const LearningCardsScreen = () => {
  const { signOut } = useAuth()
  const { toast } = useToast()

  const [cards, setCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadCards = useCallback(async () => {
    try {
      setIsLoading(true)
      const loadedCards = await fetchCards()
      setCards(
        loadedCards.sort(
          (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
        )
      )
    } catch (error) {
      console.error('Error loading cards:', error)
      toast({
        title: 'Error',
        description: 'Failed to load cards. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [toast])

  useFocusEffect(
    useCallback(() => {
      loadCards()
    }, [loadCards])
  )

  const handleCardSubmit = async (cardData) => {
    try {
      const formattedWordPairs = cardData.wordPairs.map((pair) => ({
        english: pair.english.trim(),
        indonesian: pair.indonesian.trim(),
        is_learned: pair.is_learned || false,
      }))

      if (selectedCard) {
        const updatedCard = await updateCard(selectedCard.id, {
          ...cardData,
          wordPairs: formattedWordPairs,
          lastUpdated: new Date().toISOString(),
        })
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === updatedCard.id ? updatedCard : card
          )
        )
        toast({
          title: 'Success',
          description: 'Card updated successfully',
          className: 'bg-success-50 border-success-200',
        })
      } else {
        const newCard = await createCard({
          ...cardData,
          wordPairs: formattedWordPairs,
          isMemorized: false,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        })
        setCards((prevCards) => [newCard, ...prevCards])
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

      const updatedCard = {
        ...cardToUpdate,
        isMemorized: !cardToUpdate.isMemorized,
        lastUpdated: new Date().toISOString(),
      }

      const response = await updateCard(cardId, updatedCard)
      setCards((prevCards) =>
        prevCards.map((card) => (card.id === cardId ? response : card))
      )

      toast({
        title: 'Success',
        description: `Card marked as ${
          response.isMemorized ? 'memorized' : 'not memorized'
        }`,
        className: 'bg-success-50 border-success-200',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update card status',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteCard = async () => {
    if (!selectedCard) return

    try {
      await deleteCard(selectedCard.id)
      setCards((prevCards) =>
        prevCards.filter((card) => card.id !== selectedCard.id)
      )
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

  const getGridColumns = () => {
    if (width >= 1024) return 3 // lg
    if (width >= 768) return 2 // md
    return 1 // default
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F7FF' }}>
        <StatusBar style="dark" />
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator size="large" color="#1570DA" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#1570DA' }}>
            Loading cards...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F7FF' }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#1570DA',
                  fontFamily: Platform.select({
                    ios: 'System',
                    android: 'Roboto',
                  }),
                }}
              >
                PowerVocab
              </Text>
              <Text style={{ fontSize: 14, color: '#1570DA', marginTop: 4 }}>
                {cards.length} {cards.length === 1 ? 'card' : 'cards'} available
              </Text>
            </View>

            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <Button
                onPress={() => handleOpenDialog()}
                style={{
                  backgroundColor: '#1570DA',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <Feather
                  name="plus"
                  size={18}
                  color="white"
                  style={{ marginRight: 8 }}
                />
              </Button>

              <Button
                onPress={handleLogout}
                style={{
                  backgroundColor: '#F04438',
                  borderWidth: 1,
                  borderColor: '#ffffff',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <Feather
                  name="log-out"
                  size={18}
                  color="#ffffff"
                  style={{ marginRight: 8 }}
                />
              </Button>
            </View>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingTop: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {cards.length === 0 ? (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 48,
              }}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  padding: 24,
                  width: '100%',
                  maxWidth: 400,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '500',
                    color: '#1570DA',
                    textAlign: 'center',
                    marginBottom: 16,
                  }}
                >
                  No Learning Cards Yet
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#6B7280',
                    textAlign: 'center',
                    marginBottom: 24,
                  }}
                >
                  Create your first learning card to start improving your
                  vocabulary
                </Text>
                <Button
                  onPress={() => handleOpenDialog()}
                  style={{
                    backgroundColor: '#1570DA',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <Feather
                    name="plus"
                    size={18}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: 'white', fontWeight: '500' }}>
                    Create First Card
                  </Text>
                </Button>
              </View>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginHorizontal: -8,
              }}
            >
              {cards.map((card) => (
                <View
                  key={card.id}
                  style={{
                    width: `${100 / getGridColumns()}%`,
                    paddingHorizontal: 8,
                    marginBottom: 16,
                  }}
                >
                  <LearningCard
                    card={card}
                    onEdit={() => handleOpenDialog(card)}
                    onDelete={() => handleOpenDeleteDialog(card)}
                    onToggleMemorized={() => handleToggleMemorized(card.id)}
                  />
                </View>
              ))}
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Learning Card?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This card and all its contents
                will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onPress={() => {
                  setIsDeleteDialogOpen(false)
                  setSelectedCard(null)
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onPress={handleDeleteCard}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </View>
    </SafeAreaView>
  )
}

export default LearningCardsScreen
