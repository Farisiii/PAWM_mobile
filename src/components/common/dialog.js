import React from 'react'
import { Modal, View, Text, Pressable } from 'react-native'
import { styled } from 'nativewind'
import { X } from 'lucide-react-native'

const StyledView = styled(View)
const StyledText = styled(Text)
const StyledPressable = styled(Pressable)

export const Dialog = ({ isOpen, onClose, children }) => {
  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      {children}
    </Modal>
  )
}

export const DialogOverlay = React.forwardRef(
  ({ className, ...props }, ref) => (
    <StyledView
      ref={ref}
      className={`absolute inset-0 bg-black/80 z-50 ${className}`}
      {...props}
    />
  )
)

export const DialogContent = React.forwardRef(
  ({ className, children, onClose, ...props }, ref) => (
    <StyledView className="flex-1 justify-center items-center px-4">
      <DialogOverlay />
      <StyledView
        ref={ref}
        className={`w-full max-w-lg bg-white rounded-lg shadow-lg z-50 ${className}`}
        {...props}
      >
        {children}
      </StyledView>
    </StyledView>
  )
)

export const DialogHeader = ({ className, ...props }) => (
  <StyledView className={`p-6 space-y-1.5 ${className}`} {...props} />
)

export const DialogFooter = ({ className, ...props }) => (
  <StyledView
    className={`flex-row justify-end space-x-2 p-6 ${className}`}
    {...props}
  />
)

export const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <StyledText
    ref={ref}
    className={`text-lg font-semibold ${className}`}
    {...props}
  />
))

export const DialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <StyledText
      ref={ref}
      className={`text-sm text-gray-500 ${className}`}
      {...props}
    />
  )
)

DialogOverlay.displayName = 'DialogOverlay'
DialogContent.displayName = 'DialogContent'
DialogHeader.displayName = 'DialogHeader'
DialogFooter.displayName = 'DialogFooter'
DialogTitle.displayName = 'DialogTitle'
DialogDescription.displayName = 'DialogDescription'
