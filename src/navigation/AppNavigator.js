import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AuthScreen from '../screens/AuthScreen'
import LearningCardsScreen from '../screens/LearningCardsScreen'
import CardDetailScreen from '../screens/CardDetailScreen'
import FlashCardScreen from '../screens/FlashCardScreen'
import GameModeScreen from '../screens/GameModeScreen'
import BubbleBathGame from '../screens/BubbleBathGame'
import { useAuth } from '../context/AuthContext'
import TranslationGame from '../screens/TranslationGame'
import DragDropWordGame from '../screens/DragDropWordGame'

const Stack = createNativeStackNavigator()

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Auth" component={AuthScreen} />
  </Stack.Navigator>
)

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="LearningCards" component={LearningCardsScreen} />
    <Stack.Screen
      name="CardDetail"
      component={CardDetailScreen}
      options={{
        headerShown: false,
        presentation: 'card',
        animationTypeForReplace: 'push',
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="FlashCard"
      component={FlashCardScreen}
      options={{
        headerShown: false,
        presentation: 'card',
        animationTypeForReplace: 'push',
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    />
    <Stack.Screen
      name="Games"
      component={GameModeScreen}
      options={{
        headerShown: false,
        presentation: 'card',
        animationTypeForReplace: 'push',
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    />
    <Stack.Screen
      name="BubbleBath"
      component={BubbleBathGame}
      options={{
        headerShown: false,
        presentation: 'card',
        animationTypeForReplace: 'push',
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    />
    <Stack.Screen
      name="TranslationGame"
      component={TranslationGame}
      options={{
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    />
    <Stack.Screen
      name="WordGame"
      component={DragDropWordGame}
      options={{
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    />
  </Stack.Navigator>
)

export const AppNavigator = () => {
  const { user } = useAuth()

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  )
}
