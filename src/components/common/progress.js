import React from 'react'
import { View } from 'react-native'
import { styled } from 'nativewind'

const StyledView = styled(View)

export const Progress = React.forwardRef(
  ({ className, value = 0, ...props }, ref) => (
    <StyledView
      ref={ref}
      className={`h-4 w-full overflow-hidden rounded-full bg-secondary-100 ${className}`}
      {...props}
    >
      <StyledView
        className="h-full bg-primary-500"
        style={{ width: `${value}%` }}
      />
    </StyledView>
  )
)

Progress.displayName = 'Progress'
