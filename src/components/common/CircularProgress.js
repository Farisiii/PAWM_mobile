import React from 'react'
import { View, Animated } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

export const CircularProgress = ({
  value,
  size = 48,
  strokeWidth = 4,
  color = '#1570DA',
  bgColor = '#E0F0FF',
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const halfCircle = size / 2

  const animatedValue = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [value])

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  })

  return (
    <View>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={halfCircle}
          cy={halfCircle}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={halfCircle}
          cy={halfCircle}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${halfCircle} ${halfCircle})`}
        />
      </Svg>
    </View>
  )
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
