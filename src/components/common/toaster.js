import React from 'react'
import { View } from 'react-native'
import { useToast } from '@/hooks/use-toast'
import { Toast } from './toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <View className="absolute top-0 z-50 w-full px-4 pt-4">
      {toasts.map(({ id, title, description, action, ...props }) => (
        <View key={id} className="mb-2">
          <Toast
            {...props}
            title={title}
            description={description}
            action={action}
          />
        </View>
      ))}
    </View>
  )
}
