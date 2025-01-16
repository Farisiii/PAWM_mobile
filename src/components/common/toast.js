import * as React from 'react'
import { Animated, View, Text, Pressable } from 'react-native'
import { X } from 'lucide-react-native'
import { cn } from '@/lib/utils'

const ToastContext = React.createContext({})

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([])

  return (
    <ToastContext.Provider value={{ toasts, setToasts }}>
      {children}
    </ToastContext.Provider>
  )
}

export const Toast = React.forwardRef(
  (
    {
      className,
      variant = 'default',
      title,
      description,
      action,
      onClose,
      ...props
    },
    ref
  ) => {
    const slideAnim = React.useRef(new Animated.Value(100)).current
    const fadeAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }, [])

    const baseStyle = 'rounded-lg border p-4 shadow-lg'
    const variantStyles = {
      default: 'bg-white border-gray-200',
      destructive: 'bg-red-600 border-red-600',
    }

    return (
      <Animated.View
        ref={ref}
        className={cn(baseStyle, variantStyles[variant], className)}
        style={{
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }}
        {...props}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            {title && (
              <Text
                className={cn(
                  'font-semibold',
                  variant === 'destructive' ? 'text-white' : 'text-gray-900'
                )}
              >
                {title}
              </Text>
            )}
            {description && (
              <Text
                className={cn(
                  'mt-1',
                  variant === 'destructive' ? 'text-white' : 'text-gray-500'
                )}
              >
                {description}
              </Text>
            )}
          </View>
          <Pressable onPress={onClose} className="ml-4">
            <X
              size={20}
              color={variant === 'destructive' ? 'white' : '#6B7280'}
            />
          </Pressable>
        </View>
        {action}
      </Animated.View>
    )
  }
)
Toast.displayName = 'Toast'
