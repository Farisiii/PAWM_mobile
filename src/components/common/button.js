import React from 'react'
import { Pressable, Text } from 'react-native'
import { styled } from 'nativewind'

const StyledPressable = styled(Pressable)
const StyledText = styled(Text)

const variantStyles = {
  default: 'bg-primary-500 ',
  destructive: 'bg-error-500',
  outline: 'border border-gray-200 bg-white',
  secondary: 'bg-secondary-500',
  ghost: 'bg-transparent',
  link: 'bg-transparent',
}

const sizeStyles = {
  default: 'px-4 py-2',
  sm: 'px-3 py-1.5',
  lg: 'px-8 py-3',
  icon: 'p-2',
}

export const Button = React.forwardRef(
  (
    { className, variant = 'default', size = 'default', children, ...props },
    ref
  ) => {
    return (
      <StyledPressable
        ref={ref}
        className={`
        rounded-md flex-row items-center justify-center
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
        {...props}
      >
        <StyledText
          className={`
          text-sm font-medium
          ${
            variant === 'outline' || variant === 'ghost' || variant === 'link'
              ? 'text-gray-900'
              : 'text-white'
          }
        `}
        >
          {children}
        </StyledText>
      </StyledPressable>
    )
  }
)

Button.displayName = 'Button'
