import { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { cn } from '~/lib/cn';
import SettingIcon from '~/assets/svgs/setting';
import { useColorScheme } from '~/lib/useColorScheme';

export const HeaderButton = forwardRef<typeof Pressable, { onPress?: () => void }>(
  ({ onPress }, ref) => {
    const { colors } = useColorScheme();

    return (
      <View className="flex flex-row items-center gap-2 space-x-3 pr-3">
        <Pressable className="opacity-80">
          {({ pressed }) => (
            <View className={cn(pressed ? 'opacity-50' : 'opacity-90')}>
              <SettingIcon width={26} height={26} color={'white'} />
              {/* <Icon name="cog-outline" size={26} color={colors.foreground} /> */}
            </View>
          )}
        </Pressable>
      </View>
    );
  }
);

HeaderButton.displayName = 'HeaderButton';

export const styles = StyleSheet.create({
  headerRight: {
    marginRight: 15,
  },
});
