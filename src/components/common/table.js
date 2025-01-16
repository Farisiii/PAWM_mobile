import * as React from 'react'
import { View, ScrollView, Text } from 'react-native'
import { cn } from '@/lib/utils'

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <View className="relative w-full" ref={ref}>
    <ScrollView horizontal className="w-full">
      <View className={cn('w-full', className)} {...props} />
    </ScrollView>
  </View>
))
Table.displayName = 'Table'

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn('border-b border-gray-200', className)}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('', className)} {...props} />
))
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn('border-t bg-gray-100/50', className)}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn('flex flex-row border-b border-gray-200', className)}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn('h-12 px-4 justify-center', className)}
    {...props}
  >
    <Text className="font-medium text-gray-500" {...props} />
  </View>
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('p-4 justify-center', className)} {...props}>
    <Text {...props} />
  </View>
))
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('mt-4', className)}>
    <Text className="text-sm text-gray-500" {...props} />
  </View>
))
TableCaption.displayName = 'TableCaption'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
