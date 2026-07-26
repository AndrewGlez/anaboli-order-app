import React from "react";
import renderer from "react-test-renderer";
import { Platform } from "react-native";
import { InstallPrompt } from "@/components/InstallPrompt";

// Mock the useInstallPrompt hook
jest.mock("@/hooks/useInstallPrompt", () => ({
	useInstallPrompt: jest.fn(() => ({
		canInstall: false,
		isStandalone: false,
		prompt: jest.fn(),
	})),
}));

// Mock theme store
jest.mock("@/store/themeStore", () => ({
	useThemeStore: jest.fn(() => ({
		theme: "light",
	})),
}));

describe("InstallPrompt component", () => {
	// REQ-001: Suppress on non-web
	test("suppresses on non-web Platform.OS", () => {
		// Mock Platform.OS to 'ios'
		const originalPlatformOS = Platform.OS;
		Object.defineProperty(Platform, "OS", {
			value: "ios",
			configurable: true,
		});

		const tree = renderer.create(<InstallPrompt />).toJSON();
		expect(tree).toBeNull();

		// Restore
		Object.defineProperty(Platform, "OS", {
			value: originalPlatformOS,
			configurable: true,
		});
	});
});
