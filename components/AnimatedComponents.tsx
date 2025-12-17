import React, { useEffect, ReactNode } from "react";
import { ViewStyle, StyleProp } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideInLeft,
  SlideOutRight,
  SlideOutLeft,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  ZoomOut,
  Layout,
  runOnJS,
} from "react-native-reanimated";

// Spring configs
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

const SPRING_BOUNCY = {
  damping: 10,
  stiffness: 100,
  mass: 0.8,
};

// Animated card that fades and slides in
interface AnimatedCardProps {
  children: ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}

export function AnimatedCard({
  children,
  index = 0,
  style,
  delay = 0,
}: AnimatedCardProps) {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    const baseDelay = delay + index * 50;
    translateY.value = withDelay(baseDelay, withSpring(0, SPRING_CONFIG));
    opacity.value = withDelay(baseDelay, withTiming(1, { duration: 300 }));
    scale.value = withDelay(baseDelay, withSpring(1, SPRING_CONFIG));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}

// Pressable component with scale animation
interface AnimatedPressableProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
}

export function AnimatedPressable({
  children,
  style,
  onPress,
  disabled,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, SPRING_BOUNCY);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_BOUNCY);
  };

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Animated.View
        onTouchStart={disabled ? undefined : handlePressIn}
        onTouchEnd={
          disabled
            ? undefined
            : () => {
                handlePressOut();
                onPress?.();
              }
        }
        onTouchCancel={disabled ? undefined : handlePressOut}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

// Fade in component
interface FadeInViewProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  duration?: number;
}

export function FadeInView({
  children,
  style,
  delay = 0,
  duration = 400,
}: FadeInViewProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIG));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}

// Stagger children animation
interface StaggeredListProps {
  children: ReactNode[];
  staggerDelay?: number;
  style?: StyleProp<ViewStyle>;
}

export function StaggeredList({
  children,
  staggerDelay = 100,
  style,
}: StaggeredListProps) {
  return (
    <Animated.View style={style}>
      {React.Children.map(children, (child, index) => (
        <FadeInView delay={index * staggerDelay}>{child}</FadeInView>
      ))}
    </Animated.View>
  );
}

// Animated counter for numbers
interface AnimatedNumberProps {
  value: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: any;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export function AnimatedNumber({
  value,
  style,
  textStyle,
  prefix = "",
  suffix = "",
  duration = 800,
}: AnimatedNumberProps) {
  const animatedValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration }, () => {
      runOnJS(setDisplayValue)(value);
    });
  }, [value]);

  useEffect(() => {
    // Update display value during animation
    const interval = setInterval(() => {
      const progress = animatedValue.value;
      setDisplayValue(Math.round(progress));
    }, 16);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <Animated.View style={style}>
      <Animated.Text style={textStyle}>
        {prefix}
        {displayValue}
        {suffix}
      </Animated.Text>
    </Animated.View>
  );
}

// Expand/collapse animation
interface CollapsibleViewProps {
  children: ReactNode;
  expanded: boolean;
  style?: StyleProp<ViewStyle>;
}

export function CollapsibleView({
  children,
  expanded,
  style,
}: CollapsibleViewProps) {
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (expanded) {
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [expanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    overflow: "hidden",
  }));

  if (!expanded) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(250).springify()}
      exiting={FadeOut.duration(150)}
      style={[style, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
}

// Slide in from side
interface SlideInViewProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  direction?: "left" | "right";
  delay?: number;
}

export function SlideInView({
  children,
  style,
  direction = "right",
  delay = 0,
}: SlideInViewProps) {
  const translateX = useSharedValue(direction === "right" ? 50 : -50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(delay, withSpring(0, SPRING_CONFIG));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}

// Pulse animation for buttons
interface PulseViewProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
}

export function PulseView({ children, style, active = false }: PulseViewProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withSequence(
        withSpring(1.05, SPRING_BOUNCY),
        withSpring(1, SPRING_BOUNCY)
      );
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}

// Pop in animation
interface PopInViewProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}

export function PopInView({ children, style, delay = 0 }: PopInViewProps) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, SPRING_BOUNCY));
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}

// Export reanimated presets for easy use
export const AnimatedPresets = {
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideInLeft,
  SlideOutRight,
  SlideOutLeft,
  ZoomIn,
  ZoomOut,
  Layout,
};

export { default as Animated } from "react-native-reanimated";
