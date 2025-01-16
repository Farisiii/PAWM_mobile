import React from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Keyboard,
  Modal,
  Pressable,
} from 'react-native'
import { Check, Trash2, Plus, AlertCircle, X } from 'lucide-react-native'
import { Button } from '@/components/common/button'
import { BlurView } from 'expo-blur'
import { styled } from 'nativewind'

const StyledView = styled(View)
const StyledText = styled(Text)
const StyledPressable = styled(Pressable)

const Dialog = ({ isOpen, onClose, children }) => {
  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={50}
        tint="dark"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      >
        <StyledView className="absolute inset-0 bg-black/1" />
      </BlurView>
      {children}
    </Modal>
  )
}

const DialogContent = ({ className, children, ...props }) => (
  <StyledView className="flex-1 justify-center items-center px-4">
    <StyledView
      className={`w-full max-w-lg bg-white rounded-lg shadow-lg z-50 ${className}`}
      {...props}
    >
      {children}
    </StyledView>
  </StyledView>
)

const DialogHeader = ({ className, onClose, ...props }) => (
  <StyledView className={`px-6 space-y-1.5 relative ${className}`} {...props}>
    {props.children}
    <StyledPressable
      className="absolute right-0 -top-3 p-2 rounded-full active:bg-gray-100"
      onPress={onClose}
    >
      <X size={24} className="text-gray-500" />
    </StyledPressable>
  </StyledView>
)

const DialogFooter = ({ className, ...props }) => (
  <StyledView
    className={`flex-row justify-end space-x-2 p-6 ${className}`}
    {...props}
  />
)

const DialogTitle = ({ className, ...props }) => (
  <StyledText className={`text-lg font-semibold ${className}`} {...props} />
)

const MAX_WORD_LENGTH = 10
const MAX_TITLE_LENGTH = 12
const MIN_WORD_PAIRS = 3

const AddCardDialog = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
}) => {
  const [step, setStep] = React.useState(1)
  const [formData, setFormData] = React.useState({
    title: '',
    targetDays: '',
    wordPairs: [],
    currentEnglish: '',
    currentIndonesian: '',
  })

  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title || '',
        targetDays: initialData.targetDays?.toString() || '',
        wordPairs:
          initialData.wordPairs?.map((pair) => ({
            english: pair.english,
            indonesian: pair.indonesian,
            is_learned: Boolean(pair.is_learned),
          })) || [],
        currentEnglish: '',
        currentIndonesian: '',
      })
    }
  }, [isOpen, initialData])

  const [error, setError] = React.useState('')

  const resetForm = () => {
    setFormData({
      title: '',
      targetDays: '',
      wordPairs: [],
      currentEnglish: '',
      currentIndonesian: '',
    })
    setError('')
    setStep(1)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const validateWordPair = (english, indonesian) => {
    if (
      english.length > MAX_WORD_LENGTH ||
      indonesian.length > MAX_WORD_LENGTH
    ) {
      setError(`Kata tidak boleh lebih dari ${MAX_WORD_LENGTH} karakter`)
      return false
    }

    const isDuplicate = formData.wordPairs.some(
      (pair) =>
        pair.english.toLowerCase() === english.toLowerCase() ||
        pair.indonesian.toLowerCase() === indonesian.toLowerCase()
    )

    if (isDuplicate) {
      setError('Kata ini sudah ada dalam daftar')
      return false
    }

    return true
  }

  const addWordPair = () => {
    const english = formData.currentEnglish.trim()
    const indonesian = formData.currentIndonesian.trim()

    if (english && indonesian) {
      if (validateWordPair(english, indonesian)) {
        setFormData((prev) => ({
          ...prev,
          wordPairs: [
            ...prev.wordPairs,
            {
              english,
              indonesian,
              learned: false,
            },
          ],
          currentEnglish: '',
          currentIndonesian: '',
        }))
        setError('')
        Keyboard.dismiss()
      }
    }
  }

  const removeWordPair = (index) => {
    setFormData((prev) => ({
      ...prev,
      wordPairs: prev.wordPairs.filter((_, i) => i !== index),
    }))
  }

  const toggleWordLearned = (index) => {
    setFormData((prev) => ({
      ...prev,
      wordPairs: prev.wordPairs.map((pair, i) =>
        i === index ? { ...pair, is_learned: !pair.is_learned } : pair
      ),
    }))
  }

  const handleNextStep = () => {
    if (formData.wordPairs.length >= MIN_WORD_PAIRS) {
      setError('')
      setStep(2)
    } else {
      setError(`Minimal ${MIN_WORD_PAIRS} pasangan kata diperlukan`)
    }
  }

  const handleSubmit = () => {
    if (
      formData.title.trim() &&
      formData.targetDays &&
      Number(formData.targetDays) > 0 &&
      formData.wordPairs.length >= MIN_WORD_PAIRS
    ) {
      onSubmit({
        title: formData.title.trim(),
        targetDays: Number(formData.targetDays),
        wordPairs: formData.wordPairs.map((pair) => ({
          english: pair.english,
          indonesian: pair.indonesian,
          learned: pair.learned,
        })),
      })
      handleClose()
    }
  }

  const renderWordPairInput = () => (
    <View className="space-y-3">
      <Text className="text-sm font-medium text-primary-700">
        Tambah Kata Baru
      </Text>
      <View className="space-y-2">
        <View>
          <TextInput
            className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 text-base"
            placeholder="English word"
            value={formData.currentEnglish}
            onChangeText={(text) =>
              setFormData((prev) => ({
                ...prev,
                currentEnglish: text.slice(0, MAX_WORD_LENGTH),
              }))
            }
            maxLength={MAX_WORD_LENGTH}
            onSubmitEditing={() => addWordPair()}
            returnKeyType="next"
          />
          <Text className="text-xs text-gray-500 mt-1">
            {`${formData.currentEnglish.length}/${MAX_WORD_LENGTH}`}
          </Text>
        </View>

        <View>
          <TextInput
            className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 text-base"
            placeholder="Kata Indonesia"
            value={formData.currentIndonesian}
            onChangeText={(text) =>
              setFormData((prev) => ({
                ...prev,
                currentIndonesian: text.slice(0, MAX_WORD_LENGTH),
              }))
            }
            maxLength={MAX_WORD_LENGTH}
            onSubmitEditing={() => addWordPair()}
            returnKeyType="done"
          />
          <Text className="text-xs text-gray-500 mt-1">
            {`${formData.currentIndonesian.length}/${MAX_WORD_LENGTH}`}
          </Text>
        </View>

        {error && (
          <View className="flex-row items-center space-x-2 p-3 bg-error-50 rounded-lg">
            <AlertCircle size={18} className="text-error-500" />
            <Text className="text-error-500 text-sm flex-1">{error}</Text>
          </View>
        )}

        <Button
          onPress={addWordPair}
          className="bg-primary-600 py-3"
          disabled={!formData.currentEnglish || !formData.currentIndonesian}
        >
          <Plus size={18} className="mr-2" />
          <Text className="text-white font-medium">Tambah Kata</Text>
        </Button>
      </View>
    </View>
  )

  const renderWordList = () => (
    <View className="mt-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">
        Daftar Kata ({formData.wordPairs.length}/{MIN_WORD_PAIRS} minimal)
      </Text>
      <ScrollView className="max-h-40">
        <View className="space-y-2">
          {formData.wordPairs.map((pair, index) => (
            <View
              key={index}
              className="flex-row items-center p-3 bg-secondary-50 rounded-lg border border-secondary-100"
            >
              <View className="flex-1">
                <Text className="text-base text-gray-900">{pair.english}</Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {pair.indonesian}
                </Text>
              </View>
              <View className="flex-row items-center space-x-2">
                <Button
                  onPress={() => removeWordPair(index)}
                  className="p-2 bg-transparent"
                >
                  <Trash2 size={18} className="text-error-500" />
                </Button>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <DialogContent>
        <View className="p-6">
          <DialogHeader className="mb-6" onClose={handleClose}>
            <DialogTitle className="text-xl font-semibold text-gray-900 pr-8">
              {step === 1
                ? isEditing
                  ? 'Edit Kata'
                  : 'Tambah Kata Baru'
                : 'Informasi Kartu'}
            </DialogTitle>
          </DialogHeader>

          {step === 1 ? (
            <View className="space-y-6">
              {renderWordPairInput()}
              {formData.wordPairs.length > 0 && renderWordList()}
            </View>
          ) : (
            <View className="space-y-6">
              <View className="space-y-2">
                <Text className="text-sm font-medium text-gray-700">
                  Judul Kartu
                </Text>
                <View>
                  <TextInput
                    className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 text-base"
                    placeholder="Masukkan judul kartu"
                    value={formData.title}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: text.slice(0, MAX_TITLE_LENGTH),
                      }))
                    }
                    maxLength={MAX_TITLE_LENGTH}
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    {`${formData.title.length}/${MAX_TITLE_LENGTH}`}
                  </Text>
                </View>
              </View>
              <View className="space-y-2">
                <Text className="text-sm font-medium text-gray-700">
                  Target Hari
                </Text>
                <TextInput
                  className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 text-base"
                  placeholder="Masukkan target hari"
                  value={formData.targetDays.toString()}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      targetDays: text.replace(/[^0-9]/g, ''),
                    }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          <DialogFooter className="mt-6 border-t border-gray-200 pt-6">
            <View className="flex-row space-x-3 w-full">
              <Button
                onPress={handleClose}
                className="flex-1 bg-gray-100"
                variant="ghost"
              >
                <Text className="text-gray-700 font-medium">Batal</Text>
              </Button>
              <Button
                onPress={step === 1 ? handleNextStep : handleSubmit}
                className="flex-1 bg-primary-600"
                disabled={
                  step === 1
                    ? formData.wordPairs.length < MIN_WORD_PAIRS
                    : !formData.title || !formData.targetDays
                }
              >
                <Text className="text-white font-medium">
                  {step === 1 ? 'Lanjut' : isEditing ? 'Simpan' : 'Buat Kartu'}
                </Text>
              </Button>
            </View>
          </DialogFooter>
        </View>
      </DialogContent>
    </Dialog>
  )
}

export default AddCardDialog
