import React, { createContext, useContext, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  const signIn = async (email, password) => {
    const response = await authService.login(email, password)
    setUser(response.user)
    setToken(response.token)
    await AsyncStorage.setItem('token', response.token)
    await AsyncStorage.setItem('user', JSON.stringify(response.user))
  }

  const signUp = async (email, password, fullName) => {
    await authService.register(email, password, fullName)
  }

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('token')
      await AsyncStorage.removeItem('user')
      setUser(null)
      setToken(null)
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
