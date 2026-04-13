import { TaskProvider } from "@/app/src/context/TaskContext";
import { CantataOne_400Regular } from "@expo-google-fonts/cantata-one";
import {
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    PoppinsBold: Poppins_700Bold,
    CantataOne: CantataOne_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <TaskProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </TaskProvider>
    </SafeAreaProvider>
  );
}
