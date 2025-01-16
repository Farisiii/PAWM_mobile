import React from 'react'
import { View, Text } from 'react-native'
import { styled } from 'nativewind'

const StyledView = styled(View)
const StyledText = styled(Text)

export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <StyledView
    ref={ref}
    className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    {...props}
  />
))

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <StyledView ref={ref} className={`p-6 space-y-1.5 ${className}`} {...props} />
))

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <StyledText
    ref={ref}
    className={`text-2xl font-semibold ${className}`}
    {...props}
  />
))

export const CardDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <StyledText
      ref={ref}
      className={`text-sm text-gray-500 ${className}`}
      {...props}
    />
  )
)

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <StyledView ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
))

export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <StyledView
    ref={ref}
    className={`flex-row items-center p-6 pt-0 ${className}`}
    {...props}
  />
))

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardTitle.displayName = 'CardTitle'
CardDescription.displayName = 'CardDescription'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'
