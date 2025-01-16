import React from 'react'
import { TextInput } from 'react-native'
import { styled } from 'nativewind'

const StyledTextInput = styled(TextInput)

export const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <StyledTextInput
      ref={ref}
      className={`
        h-10 w-full rounded-md border border-gray-200 
        bg-white px-3 py-2 text-base
        placeholder:text-gray-500
        focus:border-primary-500
        disabled:opacity-50
        ${className}
      `}
      placeholderTextColor="#6b7280"
      {...props}
    />
  )
})

Input.displayName = 'Input'
