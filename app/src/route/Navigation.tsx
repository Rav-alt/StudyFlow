import { router } from "expo-router";

type NavigationAction = "home" | "addTask" | "focusScreen";

const ROUTES: Record<NavigationAction, Parameters<typeof router.push>[0]> = {
  home: "/src/screen/HomeScreen",
  addTask: "/src/screen/AddTaskScreen",
  focusScreen: "/src/screen/FocusScreen",
};

const REPLACE_ACTIONS = new Set<NavigationAction>([
  "home",
  "addTask",
  "focusScreen",
]);

export default function Navigations(action: NavigationAction) {
  const route = ROUTES[action];
  if (REPLACE_ACTIONS.has(action)) {
    router.replace(route);
  } else {
    router.push(route);
  }
}
