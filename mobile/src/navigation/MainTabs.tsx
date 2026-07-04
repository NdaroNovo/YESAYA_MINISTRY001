import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DashboardScreen from "../screens/main/DashboardScreen";
import ChurchesScreen from "../screens/main/ChurchesScreen";
import RecordsScreen from "../screens/main/RecordsScreen";
import ReportsScreen from "../screens/main/ReportsScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Dashboard: "view-dashboard",
            Churches: "church",
            Records: "book-edit",
            Reports: "file-chart",
            Profile: "account-circle",
          };
          return <Icon name={icons[route.name] || "help-circle"} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 4,
          paddingTop: 4,
        },
        headerShown: true,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.surface,
        headerTitleStyle: { fontWeight: "700" },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Dashboard" }} />
      <Tab.Screen name="Churches" component={ChurchesScreen} options={{ title: "Makanisa" }} />
      <Tab.Screen name="Records" component={RecordsScreen} options={{ title: "Taarifa" }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: "Ripoti" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Wasifu" }} />
    </Tab.Navigator>
  );
}
