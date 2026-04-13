import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTasks } from "../context/TaskContext";
import Navigations from "../route/Navigation";

const MAX_TITLE_LENGTH = 80;

const priorityConfig = {
  Low: {
    active: "bg-[#99AD7A]",
    inactive: "bg-[#E8F0E1]",
    activeText: "text-white",
    inactiveText: "text-[#546B41]",
    border: "border-transparent",
    inactiveBorder: "border-[#E0D9CE]",
  },
  Medium: {
    active: "bg-[#E5BA41]",
    inactive: "bg-[#FAF3DC]",
    activeText: "text-white",
    inactiveText: "text-[#9A7E2A]",
    border: "border-transparent",
    inactiveBorder: "border-[#E0D9CE]",
  },
  High: {
    active: "bg-[#C0392B]",
    inactive: "bg-[#FAE5E3]",
    activeText: "text-white",
    inactiveText: "text-[#C0392B]",
    border: "border-transparent",
    inactiveBorder: "border-[#E0D9CE]",
  },
};

const AddTaskScreen = () => {
  const { addTask } = useTasks();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [show, setShow] = useState(false);
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | null>(
    null,
  );

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (text.trim()) setTitleError(false);
  };

  const handleDateChange = (event: { type: string }, selectedDate?: Date) => {
    if (Platform.OS !== "ios") setShow(false);
    if (event.type === "set" && selectedDate) setDate(selectedDate);
    if (event.type === "dismissed") setShow(false);
  };

  const clearDate = () => {
    setDate(null);
    setShow(false);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    addTask({ title: title.trim(), deadline: date, priority });
    Navigations("home");
  };

  const handleCancel = () => Navigations("home");

  const canSave = title.trim().length > 0;
  const remaining = MAX_TITLE_LENGTH - title.length;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-[#FFF8EC]">
        {/* Header — paddingTop respects status bar */}
        <View
          className="flex-row px-5 pb-4 bg-[#546B41] items-center"
          style={{ paddingTop: insets.top + 12 }}
        >
          <TouchableOpacity
            onPress={handleCancel}
            className="w-16"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="font-poppins text-[#DCCCAC] text-base">
              Cancel
            </Text>
          </TouchableOpacity>

          <Text className="flex-1 text-2xl font-poppinsBold text-[#DCCCAC] text-center">
            New Task
          </Text>

          <View className="w-16" />
        </View>

        {/* Content */}
        <View className="flex-1 px-5 pt-6 gap-7">
          {/* Task Title */}
          <View className="gap-2">
            <Text className="text-xs font-poppinsBold text-[#546B41] uppercase tracking-widest">
              Task Title
            </Text>
            <TextInput
              value={title}
              onChangeText={handleTitleChange}
              placeholder="What do you need to do?"
              placeholderTextColor="#B0A898"
              maxLength={MAX_TITLE_LENGTH}
              returnKeyType="done"
              className={`bg-white rounded-xl px-4 py-3 font-poppins text-[#3D3D3D] border ${
                titleError ? "border-[#C0392B]" : "border-[#E0D9CE]"
              }`}
            />
            <View className="flex-row justify-between items-center">
              {titleError ? (
                <Text className="font-poppins text-xs text-[#C0392B]">
                  Please enter a task title.
                </Text>
              ) : (
                <View />
              )}
              <Text
                className={`font-poppins text-xs ${
                  remaining <= 10 ? "text-[#C0392B]" : "text-[#B0A898]"
                }`}
              >
                {remaining} left
              </Text>
            </View>
          </View>

          {/* Deadline */}
          <View className="gap-2">
            <Text className="text-xs font-poppinsBold text-[#546B41] uppercase tracking-widest">
              Deadline
            </Text>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => setShow(true)}
                className={`flex-1 bg-white border rounded-xl px-4 py-3 flex-row items-center justify-between ${
                  date ? "border-[#546B41]" : "border-[#E0D9CE]"
                }`}
              >
                <Text
                  className={`font-poppins ${
                    date ? "text-[#3D3D3D]" : "text-[#B0A898]"
                  }`}
                >
                  {date ? date.toDateString() : "Select a date"}
                </Text>
                <Text className="text-base">📅</Text>
              </TouchableOpacity>

              {date && (
                <TouchableOpacity
                  onPress={clearDate}
                  className="bg-[#FAE5E3] rounded-xl px-3 py-3"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text className="text-[#C0392B] font-poppinsBold text-sm">
                    ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {show && (
              <DateTimePicker
                value={date ?? new Date()}
                mode="date"
                minimumDate={new Date()}
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={handleDateChange}
              />
            )}

            {show && Platform.OS === "ios" && (
              <TouchableOpacity
                onPress={() => setShow(false)}
                className="self-end mt-1"
              >
                <Text className="font-poppinsBold text-[#546B41]">Done</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Priority */}
          <View className="gap-3">
            <Text className="text-xs font-poppinsBold text-[#546B41] uppercase tracking-widest">
              Priority
            </Text>
            <View className="flex-row gap-3">
              {(["Low", "Medium", "High"] as const).map((level) => {
                const isSelected = priority === level;
                const cfg = priorityConfig[level];
                return (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setPriority(isSelected ? null : level)}
                    className={`flex-1 py-4 rounded-xl items-center border-2 ${
                      isSelected
                        ? `${cfg.active} ${cfg.border}`
                        : `${cfg.inactive} ${cfg.inactiveBorder}`
                    }`}
                  >
                    <Text
                      className={`font-poppins text-base ${
                        isSelected ? cfg.activeText : cfg.inactiveText
                      }`}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Bottom Button — paddingBottom respects home indicator */}
        <View
          className="px-5 pt-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            className={`py-4 rounded-2xl items-center ${
              canSave ? "bg-[#546B41]" : "bg-[#C5D4B8]"
            }`}
          >
            <Text className="text-white font-poppinsBold text-lg tracking-wide">
              + Create Task
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default AddTaskScreen;
