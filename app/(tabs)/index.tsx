import { View } from 'react-native'
import { Text } from '~/components/nativewindui/Text'
import React, { useState } from 'react'
import { getOrCreateGuestId } from '~/utils/device-info'
import { notificationListener } from '~/firebase/notificationService'

export default function Home() {
  const [id, setId] = useState("Loading...");
  getOrCreateGuestId()
    .then(id => setId(id))
    .catch(err => setId(err));

  return (
    <View className='items-center p-4'>
      <Text variant={'title1'}>Home</Text>
      <Text variant={'body'}>8-char Guest ID: {id}</Text>
    </View>
  )
}