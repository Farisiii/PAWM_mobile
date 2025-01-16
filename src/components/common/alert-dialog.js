import React from 'react'
import { Modal, View, Text, Pressable } from 'react-native'
import { styled } from 'nativewind'
import { BlurView } from 'expo-blur'

const StyledView = styled(View)
const StyledText = styled(Text)
const StyledPressable = styled(Pressable)
const StyledBlurView = styled(BlurView)

export const AlertDialog = ({ isOpen, onClose, children }) => {
  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StyledBlurView intensity={50} tint="dark" style={{ flex: 1 }}>
        <StyledView className="flex-1 items-center justify-center bg-black/50">
          {children}
        </StyledView>
      </StyledBlurView>
    </Modal>
  )
}

export const AlertDialogContent = ({ className, children, ...props }) => (
  <StyledView
    className={`z-50 mx-4 w-75% max-w-lg bg-white rounded-lg shadow-lg ${className}`}
    {...props}
  >
    {children}
  </StyledView>
)

export const AlertDialogHeader = ({ className, ...props }) => (
  <StyledView
    className={`flex flex-col space-y-2 p-4 ${className}`}
    {...props}
  />
)

export const AlertDialogFooter = ({ className, ...props }) => (
  <StyledView
    className={`flex flex-row justify-end space-x-2 p-4 ${className}`}
    {...props}
  />
)

export const AlertDialogTitle = ({ className, ...props }) => (
  <StyledText className={`text-lg font-semibold ${className}`} {...props} />
)

export const AlertDialogDescription = ({ className, ...props }) => (
  <StyledText className={`text-sm text-gray-500 ${className}`} {...props} />
)

export const AlertDialogAction = ({ className, children, ...props }) => (
  <StyledPressable
    className={`bg-primary-500 px-4 py-2 rounded-md ${className}`}
    {...props}
  >
    {typeof children === 'string' ? (
      <StyledText className="text-white font-medium">{children}</StyledText>
    ) : (
      children
    )}
  </StyledPressable>
)

export const AlertDialogCancel = ({
  className,
  children,
  onPress,
  ...props
}) => (
  <StyledPressable
    className={`border border-gray-200 px-4 py-2 rounded-md ${className}`}
    onPress={onPress}
    {...props}
  >
    {typeof children === 'string' ? (
      <StyledText className="text-gray-700 font-medium">{children}</StyledText>
    ) : (
      children
    )}
  </StyledPressable>
)
