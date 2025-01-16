import React from 'react'
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const getAlertStyle = (variant) => {
  switch (variant) {
    case 'success':
      return {
        icon: 'checkmark-circle',
        iconColor: '#12B76A',
        backgroundColor: '#ECFDF3',
        borderColor: '#ABEFC6',
        textColor: '#027A48',
      }
    case 'destructive':
    case 'error':
      return {
        icon: 'close-circle',
        iconColor: '#F04438',
        backgroundColor: '#FEF3F2',
        borderColor: '#FEE4E2',
        textColor: '#B42318',
      }
    case 'warning':
      return {
        icon: 'warning',
        iconColor: '#F99A3D',
        backgroundColor: '#FFFAEB',
        borderColor: '#FEDF89',
        textColor: '#B54708',
      }
    default:
      return {
        icon: 'information-circle',
        iconColor: '#2E90FA',
        backgroundColor: '#F5FAFF',
        borderColor: '#B2DDFF',
        textColor: '#026AA2',
      }
  }
}

export const Alert = React.forwardRef(
  (
    {
      isVisible,
      onClose,
      variant = 'default',
      title,
      description,
      style,
      ...props
    },
    ref
  ) => {
    if (!isVisible) return null

    const alertStyle = getAlertStyle(variant)

    return (
      <Modal
        transparent
        visible={isVisible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View
            ref={ref}
            style={[
              styles.alert,
              {
                backgroundColor: alertStyle.backgroundColor,
                borderColor: alertStyle.borderColor,
              },
              style,
            ]}
            {...props}
          >
            <View style={styles.content}>
              <Ionicons
                name={alertStyle.icon}
                size={24}
                color={alertStyle.iconColor}
                style={styles.icon}
              />
              <View style={styles.textContainer}>
                {title && (
                  <Text style={[styles.title, { color: alertStyle.textColor }]}>
                    {title}
                  </Text>
                )}
                {description && (
                  <Text style={styles.description}>{description}</Text>
                )}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
)

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    margin: 16,
  },
  alert: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
  },
  closeButton: {
    marginLeft: 8,
  },
})

Alert.displayName = 'Alert'
