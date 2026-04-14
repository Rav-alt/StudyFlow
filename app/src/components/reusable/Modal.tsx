import { Pressable, Modal as RNModal, Text, View } from "react-native";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center"
        onPress={onClose}
      >
        <Pressable
          className="bg-[#E0D9CE] dark:bg-zinc-900 rounded-2xl m-4 px-6 pt-4 pb-8"
          onPress={(e) => e.stopPropagation()}
        >
          {title && (
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-poppinsBold text-[#546B41] dark:text-white">
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                className="p-1 rounded-full  dark:bg-zinc-800"
              >
                <Text className=" text-zinc-500 text-base leading-none px-1">
                  X
                </Text>
              </Pressable>
            </View>
          )}
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
