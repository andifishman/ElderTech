import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSizes, Spacing } from '@/constants/theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightIcon?: React.ReactNode;
}

export default function AppHeader({ title, subtitle, showBack = false, rightIcon }: AppHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.headerBg} barStyle="light-content" />
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>ElderTech</Text>
          </View>
        )}
        <View style={styles.titleBox}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightIcon ? rightIcon : <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.headerBg,
    paddingTop: 44,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  backArrow: {
    color: Colors.white,
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
  },
  logoBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginRight: Spacing.sm,
  },
  logoText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: FontSizes.sm,
  },
  titleBox: {
    flex: 1,
  },
  title: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#CCFFCC',
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  placeholder: {
    width: 36,
  },
});
