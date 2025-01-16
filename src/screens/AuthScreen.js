import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { Alert } from '../components/common/Alert'
import { useAuth } from '../context/AuthContext'
import { colors } from '../utils/theme'

const FormInput = ({
  IconComponent,
  iconName,
  type = 'default',
  name,
  placeholder,
  value,
  onChange,
  error,
  isPassword,
  showPassword,
  onTogglePassword,
}) => (
  <View className="space-y-1">
    <View className="relative">
      <View className="absolute left-3 h-full justify-center">
        <IconComponent name={iconName} size={20} color={colors.black} />
      </View>
      <TextInput
        secureTextEntry={isPassword && !showPassword}
        placeholder={placeholder}
        value={value}
        onChangeText={(text) => onChange(name, text)}
        keyboardType={type}
        className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 
          ${
            error
              ? 'border-error-300 bg-error-50'
              : 'border-gray-200 bg-white/90'
          }
          focus:border-primary-400`}
      />
      {isPassword && (
        <TouchableOpacity
          onPress={onTogglePassword}
          className="absolute right-3 h-full justify-center"
        >
          <IconComponent
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={colors.black}
          />
        </TouchableOpacity>
      )}
    </View>
    {error && <Text className="text-error-500 text-sm pl-3">{error}</Text>}
  </View>
)

const AuthScreen = () => {
  const navigation = useNavigation()
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (!formData.email) {
      newErrors.email = 'Email harus diisi'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }

    if (!formData.password) {
      newErrors.password = 'Password harus diisi'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter'
    }

    if (!isLogin && !formData.fullName) {
      newErrors.fullName = 'Nama lengkap harus diisi'
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak sama'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validate()) {
      setIsLoading(true)
      try {
        if (isLogin) {
          await signIn(formData.email, formData.password)
          navigation.replace('LearningCards')
        } else {
          await signUp(formData.email, formData.password, formData.fullName)
          setShowSuccessAlert(true)
          setTimeout(() => {
            setShowSuccessAlert(false)
            setIsLogin(true)
            setFormData({
              email: '',
              fullName: '',
              password: '',
              confirmPassword: '',
            })
          }, 3000)
        }
      } catch (error) {
        setErrors({
          submit: error.message || 'Authentication failed. Please try again.',
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-primary-50"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <StatusBar style="auto" />
      <View className="flex-1 px-4 py-8 justify-center">
        <View className="max-w-md w-full mx-auto space-y-8">
          <View className="items-center">
            <Text className="text-4xl font-bold tracking-tight">
              <Text className="text-primary-600">PowerVocab</Text>
            </Text>
            <Text className="text-base text-gray-700 font-medium mt-2">
              Virtual Lab Bahasa Inggris
            </Text>
            <Text className="text-sm text-primary-500 font-medium mt-1">
              "Build Your English Word Power"
            </Text>
          </View>

          <View className="bg-white/80 rounded-2xl shadow-lg p-6">
            <Text className="text-2xl font-bold text-center mb-6 text-gray-800">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>

            {errors.submit && (
              <View className="bg-error-50 p-3 rounded-lg mb-4">
                <Text className="text-error-500 text-sm text-center">
                  {errors.submit}
                </Text>
              </View>
            )}

            <View className="space-y-4">
              <FormInput
                IconComponent={Feather}
                iconName="mail"
                type="email-address"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              {!isLogin && (
                <FormInput
                  IconComponent={Feather}
                  iconName="user"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                />
              )}

              <FormInput
                IconComponent={Feather}
                iconName="lock"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                isPassword
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />

              {!isLogin && (
                <FormInput
                  IconComponent={Feather}
                  iconName="lock"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  isPassword
                  showPassword={showConfirmPassword}
                  onTogglePassword={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                />
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className={`w-full bg-primary-500 py-3 rounded-xl items-center
                  ${isLoading ? 'opacity-70' : ''}`}
              >
                <Text className="text-white font-medium">
                  {isLoading
                    ? 'Please wait...'
                    : isLogin
                    ? 'Sign In'
                    : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsLogin(!isLogin)}
                className="mt-4"
              >
                <Text className="text-primary-600 text-sm font-medium text-center">
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : 'Already have an account? Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <Alert
        isVisible={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        type="success"
        title="Registration successful!"
        message="Please sign in with your new account."
      />
    </ScrollView>
  )
}

export default AuthScreen
