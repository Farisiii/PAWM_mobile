import { Animated } from 'react-native'

export const motion = {
  flip: (flipAnim, scaleAnim, toValue, callback) => {
    Animated.parallel([
      Animated.spring(flipAnim, {
        toValue,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start(callback)
  },

  bounce: (animation) => {
    Animated.sequence([
      Animated.spring(animation, {
        toValue: 1.2,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(animation, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()
  },

  slideOut: (callback) => {
    Animated.sequence([
      Animated.timing(new Animated.Value(0), {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(callback)
  },
}
