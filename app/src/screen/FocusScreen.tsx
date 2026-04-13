import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Navigations from "../route/Navigation";

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const FocusScreen = () => {
  const insets = useSafeAreaInsets();

  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const total = isBreak ? BREAK_TIME : FOCUS_TIME;
  const progress = Math.round(((total - timeLeft) / total) * 100);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setIsBreak((b) => !b);
            return isBreak ? FOCUS_TIME : BREAK_TIME;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [isRunning]);

  const handleSkip = () => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
    setIsBreak((b) => !b);
    setTimeLeft(isBreak ? FOCUS_TIME : BREAK_TIME);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(FOCUS_TIME);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-[#FFF8EC]">
        {/* Header — paddingTop respects status bar */}
        <View
          className="flex-row justify-between bg-[#546B41] px-5 pb-6"
          style={{ paddingTop: insets.top + 16 }}
        >
          <View>
            <Text className="text-3xl font-bold text-[#DCCCAC] tracking-wide">
              Focus Session 🎯
            </Text>
            <Text className="text-[#DCCCAC]/70 text-sm mt-1">
              {isBreak ? "Take a breather!" : "Stay locked in!"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => Navigations("home")}
            className="w-16"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-base font-semibold text-[#DCCCAC]">Back</Text>
          </TouchableOpacity>
        </View>

        {/* Timer Card */}
        <View className="mx-5 -mt-4 bg-white rounded-2xl p-6 shadow-sm border border-[#E0D9CE] items-center gap-2">
          <Text className="text-xs font-bold text-[#546B41] uppercase tracking-widest">
            {isBreak ? "☕ Break Time" : "📖 Focus Time"}
          </Text>
          <Text className="text-7xl font-bold text-[#546B41] mt-2">
            {formatTime(timeLeft)}
          </Text>
          <Text className="text-sm text-[#8A8A8A]">
            {isBreak ? "Relax and recharge" : "Time to study!"}
          </Text>
        </View>

        {/* Progress Section */}
        <View className="mx-5 mt-5 gap-4">
          <View className="bg-white rounded-2xl p-4 border border-[#E0D9CE] gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs font-bold text-[#546B41] uppercase tracking-widest">
                Focus Time
              </Text>
              <Text className="text-xs font-bold text-[#546B41]">
                {isBreak ? "100" : progress}%
              </Text>
            </View>
            <View className="bg-[#E8F0E1] rounded-full h-3">
              <View
                className="bg-[#546B41] h-3 rounded-full"
                style={{ width: `${isBreak ? 100 : progress}%` }}
              />
            </View>
            <Text className="text-xs text-[#8A8A8A]">
              {formatTime(isBreak ? 0 : timeLeft)} remaining
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-4 border border-[#E0D9CE] gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs font-bold text-[#E5BA41] uppercase tracking-widest">
                Break Time
              </Text>
              <Text className="text-xs font-bold text-[#E5BA41]">
                {isBreak ? progress : 0}%
              </Text>
            </View>
            <View className="bg-[#FAF3DC] rounded-full h-3">
              <View
                className="bg-[#E5BA41] h-3 rounded-full"
                style={{ width: `${isBreak ? progress : 0}%` }}
              />
            </View>
            <Text className="text-xs text-[#8A8A8A]">
              {formatTime(isBreak ? timeLeft : BREAK_TIME)} remaining
            </Text>
          </View>
        </View>

        {/* Controls — paddingBottom respects home indicator */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E0D9CE] px-5 pt-4 gap-3"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <TouchableOpacity
            onPress={() => setIsRunning((r) => !r)}
            className={`py-4 rounded-2xl items-center ${
              isRunning ? "bg-[#C0392B]" : "bg-[#546B41]"
            }`}
          >
            <Text className="text-white font-bold text-lg">
              {isRunning ? "⏸ Pause" : "▶️ Start"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleSkip}
              className="flex-1 bg-[#E5BA41] py-3 rounded-xl items-center"
            >
              <Text className="text-[#546B41] font-bold text-sm">
                ⏭ {isBreak ? "Skip Break" : "Skip to Break"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReset}
              className="flex-1 bg-[#E8F0E1] py-3 rounded-xl items-center"
            >
              <Text className="text-[#546B41] font-bold text-sm">🔄 Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

export default FocusScreen;
