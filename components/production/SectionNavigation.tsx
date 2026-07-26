import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { FONTS, SIZES } from "@/constants/theme";
import { SECTIONS } from "./sectionNavigation";

interface SectionNavigationProps {
  activeSectionId: string;
  onSectionPress: (sectionId: string) => void;
  colors: {
    background: string;
    primary: string;
    text: string;
    white: string;
  };
}

export function SectionNavigation({
  activeSectionId,
  onSectionPress,
  colors,
}: SectionNavigationProps) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SECTIONS.map((section) => {
          const isActive = activeSectionId === section.id;
          return (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.sectionButton,
                {
                  backgroundColor: isActive
                    ? colors.primary
                    : colors.background,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => onSectionPress(section.id)}
            >
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: isActive ? colors.white : colors.primary,
                  },
                ]}
              >
                {section.label}
              </Text>
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.white }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 8,
  },
  sectionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  sectionLabel: {
    ...FONTS.body3,
    fontWeight: "600",
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
