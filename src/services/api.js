import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const baseUrl = 'https://web-production-a314.up.railway.app'

const getHeaders = async () => {
  const token = await AsyncStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

const fetchOptions = {
  credentials: Platform.select({
    web: 'include',
    default: 'omit',
  }),
}

export const fetchCards = async () => {
  const response = await fetch(`${baseUrl}/api/cards`, {
    method: 'GET',
    headers: await getHeaders(),
    ...fetchOptions,
  })
  if (!response.ok) throw new Error('Failed to fetch cards')

  const cards = await response.json()

  return cards.map((card) => ({
    ...card,
    wordPairs: card.wordPairs.map((pair, index) => ({
      ...pair,
      is_learned:
        index < Math.round((card.progress * card.wordPairs.length) / 100),
    })),
  }))
}

export const createCard = async (cardData) => {
  const response = await fetch(`${baseUrl}/api/cards`, {
    method: 'POST',
    headers: await getHeaders(),
    ...fetchOptions,
    body: JSON.stringify(cardData),
  })
  if (!response.ok) throw new Error('Failed to create card')
  return response.json()
}

export const updateCard = async (cardId, cardData) => {
  const response = await fetch(`${baseUrl}/api/cards/${cardId}`, {
    method: 'PUT',
    headers: await getHeaders(),
    ...fetchOptions,
    body: JSON.stringify(cardData),
  })
  if (!response.ok) throw new Error('Failed to update card')
  return response.json()
}

export const deleteCard = async (cardId) => {
  const response = await fetch(`${baseUrl}/api/cards/${cardId}`, {
    method: 'DELETE',
    headers: await getHeaders(),
    ...fetchOptions,
  })
  if (!response.ok) throw new Error('Failed to delete card')
  return response.json()
}
