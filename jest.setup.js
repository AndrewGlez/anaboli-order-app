// Jest Setup for anaboli-order-app

// Mock react-native (avoid transform issues with import typeof syntax)
jest.mock("react-native", () => {
	const RN = {
		Platform: { OS: "web", select: (obj) => obj.web || obj.default },
		StyleSheet: {
			create: (styles) => styles,
			flatten: (style) => style,
			compose: (...styles) => Object.assign({}, ...styles.filter(Boolean)),
		},
		View: "View",
		Text: "Text",
		ScrollView: "ScrollView",
		TextInput: "TextInput",
		Pressable: "Pressable",
		TouchableOpacity: "TouchableOpacity",
		ActivityIndicator: "ActivityIndicator",
		Modal: "Modal",
		Alert: { alert: jest.fn() },
		Linking: { openURL: jest.fn() },
		Dimensions: {
			get: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
		},
		Animated: {
			Value: jest.fn(() => ({
				setValue: jest.fn(),
				addListener: jest.fn(),
				removeAllListeners: jest.fn(),
			})),
			timing: jest.fn(() => ({ start: jest.fn() })),
			spring: jest.fn(() => ({ start: jest.fn() })),
			decay: jest.fn(() => ({ start: jest.fn() })),
			View: "Animated.View",
			Text: "Animated.Text",
		},
	};
	return { __esModule: true, ...RN, default: RN };
});

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
	__esModule: true,
	default: {
		getItem: jest.fn(() => Promise.resolve(null)),
		setItem: jest.fn(() => Promise.resolve()),
		removeItem: jest.fn(() => Promise.resolve()),
		clear: jest.fn(() => Promise.resolve()),
	},
}));

// Mock react-native-svg
jest.mock("react-native-svg", () => ({
	__esModule: true,
	default: "Svg",
	Svg: "Svg",
	Circle: "Circle",
	Rect: "Rect",
	Path: "Path",
	G: "G",
	SvgXml: "SvgXml",
}));

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
	const Reanimated = {
		default: {
			View: "Animated.View",
			Text: "Animated.Text",
			Image: "Animated.Image",
			ScrollView: "Animated.ScrollView",
			createAnimatedComponent: (comp) => comp,
		},
		useSharedValue: jest.fn(() => ({ value: 0 })),
		useAnimatedStyle: jest.fn((fn) => fn()),
		useAnimatedGestureHandler: jest.fn(() => ({})),
		useDerivedValue: jest.fn((fn) => ({ value: fn() })),
		useAnimatedRef: jest.fn(() => ({ current: null })),
		useAnimatedScrollHandler: jest.fn(() => ({})),
		withSpring: jest.fn((val) => val),
		withTiming: jest.fn((val) => val),
		withDelay: jest.fn((_, val) => val),
		withSequence: jest.fn((...vals) => vals[vals.length - 1]),
		withRepeat: jest.fn((val) => val),
		runOnJS: jest.fn((fn) => fn),
		runOnUI: jest.fn((fn) => fn),
		interpolate: jest.fn((val) => val),
		Extrapolate: { CLAMP: "clamp", EXTEND: "extend", IDENTITY: "identity" },
		FadeIn: {
			delay: jest.fn().mockReturnThis(),
			springify: jest.fn().mockReturnThis(),
			damping: jest.fn().mockReturnThis(),
		},
		FadeOut: {
			delay: jest.fn().mockReturnThis(),
			springify: jest.fn().mockReturnThis(),
			damping: jest.fn().mockReturnThis(),
		},
		FadeInDown: {
			delay: jest.fn().mockReturnThis(),
			springify: jest.fn().mockReturnThis(),
			damping: jest.fn().mockReturnThis(),
		},
		SlideInRight: {
			delay: jest.fn().mockReturnThis(),
			springify: jest.fn().mockReturnThis(),
			damping: jest.fn().mockReturnThis(),
		},
		SlideOutRight: {
			delay: jest.fn().mockReturnThis(),
			springify: jest.fn().mockReturnThis(),
			damping: jest.fn().mockReturnThis(),
		},
		Layout: {
			springify: jest.fn().mockReturnThis(),
			damping: jest.fn().mockReturnThis(),
		},
	};
	return { __esModule: true, ...Reanimated, default: Reanimated.default };
});

// Mock lucide-react-native
jest.mock("lucide-react-native", () => {
	const handler = () => "Icon";
	return new Proxy({}, { get: () => handler });
});

// Mock expo-file-system
jest.mock("expo-file-system", () => ({
	writeAsStringAsync: jest.fn(),
	readAsStringAsync: jest.fn(),
	documentDirectory: "file:///test/",
	cacheDirectory: "file:///cache/",
	EncodingType: { UTF8: "utf8", Base64: "base64" },
}));

// Mock expo-sharing
jest.mock("expo-sharing", () => ({
	isAvailableAsync: jest.fn(() => Promise.resolve(true)),
	shareAsync: jest.fn(),
}));

// Mock URL.createObjectURL/revokeObjectURL (not available in Node)
if (typeof global.URL.createObjectURL === "undefined") {
	global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
	global.URL.revokeObjectURL = jest.fn();
}

// Silence console warnings during tests
global.console = {
	...console,
	warn: jest.fn(),
	error: jest.fn(),
};
