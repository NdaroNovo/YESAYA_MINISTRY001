import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MitaaScreen from "../screens/main/MitaaScreen";
import MtaaChurchesScreen from "../screens/main/MtaaChurchesScreen";
import ChurchDetailScreen from "../screens/main/ChurchDetailScreen";
import { colors } from "../theme/colors";
import type { Mtaa, Church } from "../types";

export type MitaaStackParamList = {
  MitaaList: undefined;
  MtaaChurches: { mtaa: Mtaa };
  ChurchDetail: { church: Church; mtaa: Mtaa };
};

const Stack = createNativeStackNavigator<MitaaStackParamList>();

export default function MitaaStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.surface,
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name="MitaaList"
        component={MitaaScreen}
        options={{ title: "Mitaa" }}
      />
      <Stack.Screen
        name="MtaaChurches"
        component={MtaaChurchesScreen}
        options={{ title: "Makanisa" }}
      />
      <Stack.Screen
        name="ChurchDetail"
        component={ChurchDetailScreen}
        options={{ title: "Kanisa" }}
      />
    </Stack.Navigator>
  );
}
