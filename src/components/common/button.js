import React from 'react'
import { Pressable, Text } from 'react-native'
import { styled } from 'nativewind'

// Updated styling dengan native wind
const StyledPressable = styled(Pressable)
const StyledText = styled(Text)

const variantStyles = {
  default: 'bg-blue-500 active:bg-blue-600',
  destructive: 'bg-red-500 active:bg-red-600',
  outline: 'border border-gray-200 bg-white active:bg-gray-100',
  secondary: 'bg-gray-500 active:bg-gray-600',
  ghost: 'bg-transparent active:bg-gray-100',
  link: 'bg-transparent active:opacity-70',
}

const sizeStyles = {
  default: 'px-4 py-2',
  sm: 'px-3 py-1.5 text-xs',
  lg: 'px-8 py-3 text-lg',
  icon: 'p-2',
}

const textStyles = {
  default: 'text-white',
  outline: 'text-gray-900',
  ghost: 'text-gray-900',
  link: 'text-blue-500 underline',
}

export const Button = React.forwardRef(
  (
    {
      className = '',
      variant = 'default',
      size = 'default',
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <StyledPressable
        ref={ref}
        disabled={disabled}
        className={`
          rounded-md flex-row items-center justify-center
          ${disabled ? 'opacity-50' : ''}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        <StyledText
          className={`
            font-medium
            ${textStyles[variant] || textStyles.default}
            ${disabled ? 'opacity-50' : ''}
          `}
        >
          {children}
        </StyledText>
      </StyledPressable>
    )
  }
)

Button.displayName = 'Button'
