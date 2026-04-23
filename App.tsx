import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppProvider, useApp } from './src/context/AppContext';
import { Icons } from './src/components/Icons';
import { C } from './src/theme/colors';

import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { MealPlannerScreen } from './src/screens/MealPlannerScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MealDetailScreen } from './src/screens/MealDetailScreen';
import { AddFoodScreen } from './src/screens/AddFoodScreen';
import { WaterScreen } from './src/screens/WaterScreen';
import { ExerciseScreen } from './src/screens/ExerciseScreen';
import { WeightScreen } from './src/screens/WeightScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import {
  RootStackParamList,
  DashboardStackParamList,
  MainTabParamList,
} from './src/types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <DashboardStack.Screen name="Dashboard" component={DashboardScreen} />
      <DashboardStack.Screen name="MealDetail" component={MealDetailScreen} />
      <DashboardStack.Screen name="AddFood" component={AddFoodScreen} />
      <DashboardStack.Screen name="Water" component={WaterScreen} />
      <DashboardStack.Screen name="Exercise" component={ExerciseScreen} />
      <DashboardStack.Screen name="MealPlanner" component={MealPlannerScreen} />
    </DashboardStack.Navigator>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const tabs = [
    { name: 'DashboardTab', label: 'Bugün', icon: 'home' },
    { name: 'Report', label: 'Trendler', icon: 'chart' },
    { name: 'FAB', label: '', icon: 'plus', primary: true },
    { name: 'Weight', label: 'Kilo', icon: 'scale' },
    { name: 'Profile', label: 'Profil', icon: 'user' },
  ];

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map(tab => {
        if (tab.primary) {
          return (
            <TouchableOpacity
              key="FAB"
              style={styles.fab}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('DashboardTab', { screen: 'AddFood', params: { mealKey: 'snack', fromMeal: false } })}
            >
              <Icons.plus size={24} color={C.accent} sw={2} />
            </TouchableOpacity>
          );
        }
        const focused = state.routes[state.index]?.name === tab.name ||
          (tab.name === 'DashboardTab' && state.routes[state.index]?.name === 'DashboardTab');
        const Icon = Icons[tab.icon as keyof typeof Icons];
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(tab.name)}
          >
            <Icon size={22} color={focused ? C.ink : C.ink4} sw={focused ? 2 : 1.6} />
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="DashboardTab" component={DashboardStackNavigator} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="FAB" component={DashboardStackNavigator} />
      <Tab.Screen name="Weight" component={WeightScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Navigation() {
  const { hasOnboarded } = useApp();
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!hasOnboarded ? (
        <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <RootStack.Screen name="Main" component={MainTabs} />
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer>
            <Navigation />
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250,250,247,0.96)',
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: C.ink4,
  },
  tabLabelActive: {
    color: C.ink,
    fontWeight: '600',
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 10,
  },
});
