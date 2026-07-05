import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DashboardScreen from "../screens/main/DashboardScreen";
import MitaaStack from "./MitaaStack";
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
            Mitaa: "map-marker-multiple",
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
      <Tab.Screen name="Mitaa" component={MitaaStack} options={{ title: "Mitaa", headerShown: false }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: "Ripoti" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Wasifu" }} />
    </Tab.Navigator>
  );
}
