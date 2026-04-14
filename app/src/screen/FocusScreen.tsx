import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Modal } from "../components/reusable/Modal";
import Navigations from "../route/Navigation";

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;
const STORAGE_KEY = "studyflow_focus_session";

type SessionState = {
  isBreak: boolean;
  startedAt: number; // timestamp when current session started
  pausedAt: number | null; // timestamp when paused, null if running
  totalDuration: number; // total seconds for current phase
};

const FocusScreen = () => {
  const insets = useSafeAreaInsets();

  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<SessionState | null>(null);
  const [open, setOpen] = useState(false);
  const [breakOpen, setBreakOpen] = useState(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const total = isBreak ? BREAK_TIME : FOCUS_TIME;
  const progress = Math.round(((total - timeLeft) / total) * 100);

  // Calculate timeLeft from a saved session
  const calcTimeLeft = (session: SessionState): number => {
    const elapsed = session.pausedAt
      ? Math.floor((session.pausedAt - session.startedAt) / 1000)
      : Math.floor((Date.now() - session.startedAt) / 1000);
    return Math.max(0, session.totalDuration - elapsed);
  };

  // Load saved session on mount
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const session: SessionState = JSON.parse(stored);
        const remaining = calcTimeLeft(session);

        sessionRef.current = session;
        setIsBreak(session.isBreak);

        if (remaining <= 0) {
          // Session ended while app was closed — flip to next phase
          const nextIsBreak = !session.isBreak;
          setIsBreak(nextIsBreak);
          setTimeLeft(nextIsBreak ? BREAK_TIME : FOCUS_TIME);
          setIsRunning(false);
        } else {
          setTimeLeft(remaining);
          // Resume only if it was running (pausedAt is null)
          if (!session.pausedAt) {
            setIsRunning(true);
          }
        }
      } catch (e) {
        console.error("Failed to load focus session:", e);
      }
    };

    load();
  }, []);

  // Save session state whenever it changes
  const saveSession = async (
    running: boolean,
    break_: boolean,
    currentTimeLeft: number,
  ) => {
    try {
      const now = Date.now();
      const duration = break_ ? BREAK_TIME : FOCUS_TIME;
      const elapsed = duration - currentTimeLeft;

      const session: SessionState = {
        isBreak: break_,
        startedAt: now - elapsed * 1000,
        pausedAt: running ? null : now - elapsed * 1000 + elapsed * 1000,
        totalDuration: duration,
      };

      // Cleaner: just store enough to recompute
      const toSave: SessionState = {
        isBreak: break_,
        totalDuration: duration,
        startedAt: running
          ? now - elapsed * 1000 // back-calculate start
          : session.startedAt,
        pausedAt: running ? null : now, // freeze the clock at now
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error("Failed to save focus session:", e);
    }
  };

  // Ticker
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            const nextIsBreak = !isBreak;
            setIsBreak(nextIsBreak);
            const nextTime = nextIsBreak ? BREAK_TIME : FOCUS_TIME;
            saveSession(false, nextIsBreak, nextTime);

            if (!isBreak) {
              setOpen(true);
            } else {
              setBreakOpen(true);
            }

            return nextTime;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [isRunning, isBreak]);

  // Save whenever running/break/timeLeft changes
  useEffect(() => {
    saveSession(isRunning, isBreak, timeLeft);
  }, [isRunning, isBreak, timeLeft]);

  const handleSkip = () => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
    const nextIsBreak = !isBreak;
    setIsBreak(nextIsBreak);
    const nextTime = nextIsBreak ? BREAK_TIME : FOCUS_TIME;
    setTimeLeft(nextTime);
    saveSession(false, nextIsBreak, nextTime);
  };

  const handleReset = async () => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(FOCUS_TIME);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-[#FFF8EC]">
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
            className="w-16 items-center justify-center"
          >
            <Text className="text-base font-semibold text-[#DCCCAC]">Back</Text>
          </TouchableOpacity>
        </View>

        <View className="mx-5 -mt-4 bg-white rounded-2xl p-6 shadow-sm border border-[#E0D9CE] items-center gap-2">
          <Text className="text-xs font-bold text-[#546B41] uppercase tracking-widest">
            {isBreak ? "☕ Break Time" : "📖 Focus Time"}
          </Text>
          <Text className="text-7xl font-bold text-[#546B41] mt-2">
            {formatTime(timeLeft)}
          </Text>
          <Text className="text-sm text-[#8A8A8A]">
            {isBreak ? "Relax and recharge" : "Time to Locked in!"}
          </Text>
        </View>

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

      <Modal
        visible={open}
        onClose={() => setOpen(false)}
        title="Focus Session Ended!"
      >
        <Text className="font-poppins mb-6">
          You Locked in for 25 mins straight!
        </Text>
      </Modal>

      <Modal
        visible={breakOpen}
        onClose={() => setBreakOpen(false)}
        title="Break Session Ended!"
      >
        <Text className="font-poppins text-lg text-[#546B41] mb-6">
          You're Break is now over,{" "}
          <Text className="font-poppinsBold">Locked in NOW!</Text>
        </Text>
      </Modal>
    </>
  );
};

export default FocusScreen;
