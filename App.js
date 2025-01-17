import { useEffect, useState } from 'react'
import { View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import AuthScreen from './src/screens/AuthScreen'
import LearningCardsScreen from './src/screens/LearningCardsScreen'
import CardDetailScreen from './src/screens/CardDetailScreen'
import FlashCardScreen from './src/screens/FlashCardScreen'
import GameModeScreen from './src/screens/GameModeScreen'
import BubbleBathGame from './src/screens/BubbleBathGame'
import TranslationGame from './src/screens/TranslationGame'
import DragDropWordGame from './src/screens/DragDropWordGame'

SplashScreen.preventAutoHideAsync()

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

const AppNavigator = () => {
  const { user } = useAuth()

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  )
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    setAppIsReady(true)
  }, [])

  const onLayoutRootView = async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync()
    }
  }

  if (!appIsReady) {
    return null
  }

  return (
    <AuthProvider>
      <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
        <AppNavigator />
      </View>
    </AuthProvider>
  )
}
