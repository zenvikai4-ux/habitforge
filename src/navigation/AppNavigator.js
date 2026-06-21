import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Colors, Typography, Radius, Spacing, Shadows } from "../theme";

import HomeScreen from "../screens/HomeScreen";
import AddHabitScreen from "../screens/AddHabitScreen";
import ProgressScreen from "../screens/ProgressScreen";
import StatsScreen from "../screens/StatsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { WeeklyReviewScreen, BadgesScreen } from "../screens/ExtraScreens";

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const StatsStack = createStackNavigator();
const SettingsStack = createStackNavigator();

const ICONS = { Home: "🏠", Progress: "📅", Stats: "📊", Settings: "⚙️" };

function TabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const onPress = () => {
          const e = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
            <View style={[styles.tabIconWrap, focused && styles.tabIconActive]}>
              <Text style={styles.tabIcon}>{ICONS[route.name]}</Text>
            </View>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{route.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="AddHabit" component={AddHabitScreen} options={{ presentation: "modal" }} />
    </HomeStack.Navigator>
  );
}

function StatsStackNav() {
  return (
    <StatsStack.Navigator screenOptions={{ headerShown: false }}>
      <StatsStack.Screen name="StatsMain" component={StatsScreen} />
      <StatsStack.Screen name="WeeklyReview" component={WeeklyReviewScreen} />
      <StatsStack.Screen name="Badges" component={BadgesScreen} />
    </StatsStack.Navigator>
  );
}

function SettingsStackNav() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStack.Screen name="WeeklyReview" component={WeeklyReviewScreen} />
      <SettingsStack.Screen name="Badges" component={BadgesScreen} />
    </SettingsStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        colors: {
          background: Colors.bg,
          card: Colors.bgCard,
          text: Colors.text,
          border: Colors.border,
          primary: Colors.accent,
          notification: Colors.accent,
        },
        dark: true,
      }}
    >
      <Tab.Navigator tabBar={props => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home"     component={HomeStackNav} />
        <Tab.Screen name="Progress" component={ProgressScreen} />
        <Tab.Screen name="Stats"    component={StatsStackNav} />
        <Tab.Screen name="Settings" component={SettingsStackNav} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 20,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    ...Shadows.card,
  },
  tabItem:       { flex: 1, alignItems: "center", paddingVertical: 4 },
  tabIconWrap:   { width: 36, height: 36, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  tabIconActive: { backgroundColor: Colors.accentSoft },
  tabIcon:       { fontSize: 18 },
  tabLabel:      { fontSize: Typography.size.xs, fontFamily: "DMSans_400Regular", color: Colors.textMuted },
  tabLabelActive:{ color: Colors.accent, fontFamily: "DMSans_600SemiBold" },
});
