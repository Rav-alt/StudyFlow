import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTasks } from "../context/TaskContext";
import Navigations from "../route/Navigation";

const HomeScreen = () => {
  const { tasks, completeTask, removeTask } = useTasks();
  const insets = useSafeAreaInsets();

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const priorityColor: Record<string, string> = {
    High: "bg-red-100 text-red-500",
    Medium: "bg-yellow-100 text-yellow-600",
    Low: "bg-green-100 text-green-600",
  };

  const handleComplete = (id: number) => {
    completeTask(id);
    setSelectedTaskId(id);
    setModalVisible(true);
  };

  const handleKeep = () => {
    setModalVisible(false);
    setSelectedTaskId(null);
  };

  const handleRemove = () => {
    if (selectedTaskId !== null) removeTask(selectedTaskId);
    setModalVisible(false);
    setSelectedTaskId(null);
  };

  const toggleSelectMode = () => setIsSelectMode((prev) => !prev);

  return (
    <>
      <View className="flex-1 bg-[#FFF8EC]">
        {/* Header — paddingTop respects status bar */}
        <View
          className="bg-[#546B41] px-5 pb-6"
          style={{ paddingTop: insets.top + 16 }}
        >
          <Text className="text-5xl font-cantata text-[#DCCCAC] tracking-wide">
            StudyFlow 📚
          </Text>
          <Text className="text-[#DCCCAC]/70 text-lg font-poppins mt-1">
            Stay on top of your studies
          </Text>
        </View>

        {/* Greeting Card */}
        <View className="mx-5 -mt-4 bg-white rounded-2xl p-5 shadow-sm border border-[#E0D9CE]">
          <Text className="text-3xl font-poppinsBold text-[#546B41]">
            Hello, User! 👋
          </Text>
          <Text className="text-sm text-[#8A8A8A] font-poppins mt-1">
            You have{" "}
            <Text className="font-poppinsBold text-[#546B41]">
              {tasks.length} tasks
            </Text>{" "}
            for today
          </Text>
          <TouchableOpacity
            onPress={() => Navigations("addTask")}
            className="bg-[#546B41] mt-4 py-3 rounded-xl items-center"
          >
            <Text className="text-[#DCCCAC] font-poppinsBold text-base">
              + Add Task
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task List */}
        <View className="flex-1 px-5 mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-poppinsBold text-[#546B41] uppercase tracking-widest">
              Upcoming Tasks
            </Text>
            {isSelectMode && (
              <Text className="text-xs font-poppinsBold text-[#8A8A8A]">
                Tap a task to mark complete
              </Text>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="gap-3 pb-36">
              {tasks.length === 0 ? (
                <View className="items-center mt-10 gap-2">
                  <Text className="text-4xl">📭</Text>
                  <Text className="text-[#8A8A8A] text-lg font-poppins">
                    No tasks yet. Add one!
                  </Text>
                </View>
              ) : (
                tasks.map((task) => (
                  <View
                    key={task.id}
                    className="bg-white rounded-2xl p-4 border border-[#E0D9CE] flex-row items-center gap-4"
                  >
                    {isSelectMode || task.completed ? (
                      <TouchableOpacity
                        onPress={() => handleComplete(task.id)}
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          task.completed
                            ? "bg-[#546B41] border-[#546B41]"
                            : "border-[#546B41]"
                        }`}
                      >
                        {task.completed && (
                          <Text className="text-white text-xs font-bold">
                            ✓
                          </Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View className="w-6 h-6" />
                    )}

                    <View className="flex-1">
                      <Text
                        className={`text-base font-poppinsBold ${
                          task.completed
                            ? "line-through text-[#8A8A8A]"
                            : "text-[#3D3D3D]"
                        }`}
                      >
                        {task.title}
                      </Text>
                      <Text className="text-xs text-[#8A8A8A] font-poppins mt-0.5">
                        📅{" "}
                        {task.deadline
                          ? task.deadline.toDateString()
                          : "No deadline"}
                      </Text>
                    </View>

                    <View
                      className={`px-3 py-1 rounded-full ${priorityColor[task.priority ?? "Low"].split(" ")[0]}`}
                    >
                      <Text
                        className={`text-xs font-poppins ${priorityColor[task.priority ?? "Low"].split(" ")[1]}`}
                      >
                        {task.priority ?? "None"}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>

        {/* Bottom Bar — paddingBottom respects home indicator */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E0D9CE] px-5 pt-4 flex-row gap-3"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <TouchableOpacity
            onPress={toggleSelectMode}
            className={`flex-1 py-3 rounded-xl items-center ${
              isSelectMode ? "bg-[#546B41]" : "bg-[#E5BA41]"
            }`}
          >
            <Text
              className={`font-poppinsBold text-lg ${
                isSelectMode ? "text-[#DCCCAC]" : "text-[#546B41]"
              }`}
            >
              {isSelectMode ? "✅ Done Selecting" : "✅ Complete Task"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Navigations("focusScreen")}
            className="flex-1 bg-[#546B41] py-3 rounded-xl items-center"
          >
            <Text className="text-[#DCCCAC] font-poppinsBold text-lg">
              🎯 Focus Session
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Completion Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleKeep}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-8">
          <View className="bg-white w-full rounded-3xl p-6 items-center gap-4">
            <View className="w-16 h-16 bg-[#E9F2E4] rounded-full items-center justify-center">
              <Text className="text-3xl">🎉</Text>
            </View>
            <View className="items-center gap-1">
              <Text className="text-xl font-poppinsBold text-[#546B41]">
                Task Completed!
              </Text>
              <Text className="text-sm font-poppins text-[#8A8A8A] text-center">
                Great work! Do you want to remove this task from the list?
              </Text>
            </View>
            <View className="w-full h-px bg-[#E0D9CE]" />
            <View className="w-full gap-3">
              <TouchableOpacity
                onPress={handleRemove}
                className="w-full bg-[#546B41] py-3 rounded-xl items-center"
              >
                <Text className="text-[#DCCCAC] font-poppinsBold text-base">
                  Remove Task
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleKeep}
                className="w-full bg-[#F5F0E8] py-3 rounded-xl items-center"
              >
                <Text className="text-[#546B41] font-poppins text-base">
                  Keep It
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default HomeScreen;
