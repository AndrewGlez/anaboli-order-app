import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, useColorScheme as useRNColorScheme } from "react-native";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import {
	useFonts,
	Montserrat_400Regular,
	Montserrat_500Medium,
	Montserrat_600SemiBold,
	Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { SplashScreen } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeStore } from "@/store/themeStore";
import { InstallPrompt } from "@/components/InstallPrompt";
import { UpdateToast } from "@/components/UpdateToast";
import { Toaster } from "sonner";

if (Platform.OS === "web") {
	require("@/web/styles.css");
}

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Register service worker only after first successful online visit
function useServiceWorkerRegistration() {
	useEffect(() => {
		if (Platform.OS !== "web") return;
		if (typeof navigator === "undefined" || !("serviceWorker" in navigator))
			return;

		const registerSW = () => {
			navigator.serviceWorker.register("/sw.js").catch((err) => {
				console.log("SW registration failed:", err);
			});
		};

		// Only register when online — gate on navigator.onLine
		if (navigator.onLine) {
			// Defer until after the page fully loads
			if (document.readyState === "complete") {
				registerSW();
			} else {
				window.addEventListener("load", registerSW, { once: true });
			}
		}

		// Also register when coming back online (deferred visit pattern)
		const handleOnline = () => {
			registerSW();
			window.removeEventListener("online", handleOnline);
		};
		window.addEventListener("online", handleOnline);

		return () => {
			window.removeEventListener("online", handleOnline);
		};
	}, []);
}

function useWebAppManifest() {
	useEffect(() => {
		if (Platform.OS !== "web") return;

		let manifestLink = document.querySelector<HTMLLinkElement>(
			'link[rel="manifest"]',
		);
		if (!manifestLink) {
			manifestLink = document.createElement("link");
			manifestLink.rel = "manifest";
			document.head.appendChild(manifestLink);
		}
		manifestLink.href = "/manifest.json";
	}, []);
}

export default function RootLayout() {
	useFrameworkReady();
	useServiceWorkerRegistration();
	useWebAppManifest();
	const colorScheme = useColorScheme();
	const setSystemTheme = useThemeStore((s) => s.setSystemTheme);
	const rnSystemScheme = useRNColorScheme();

	// Feed the host OS preference into the theme store so `mode === "system"`
	// resolves reactively. `useRNColorScheme` returns "light" | "dark" | null
	// (web); null is treated as the existing systemTheme, not as an override.
	useEffect(() => {
		if (rnSystemScheme === "light" || rnSystemScheme === "dark") {
			setSystemTheme(rnSystemScheme);
		}
	}, [rnSystemScheme, setSystemTheme]);

	const [fontsLoaded, fontError] = useFonts({
		Montserrat_400Regular,
		Montserrat_500Medium,
		Montserrat_600SemiBold,
		Montserrat_700Bold,
	});

	// Safety timeout: if fonts hang (offline CDN, blocked request), don't keep the
	// screen blank forever — render with system fonts after 5s.
	const [fontTimedOut, setFontTimedOut] = useState(false);
	useEffect(() => {
		if (fontsLoaded || fontError) return;
		const timer = setTimeout(() => setFontTimedOut(true), 5000);
		return () => clearTimeout(timer);
	}, [fontsLoaded, fontError]);

	// Hide splash screen once fonts are loaded (or fail/timeout)
	useEffect(() => {
		if (fontsLoaded || fontError || fontTimedOut) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded, fontError, fontTimedOut]);

	// Keep splash visible while fonts are loading, but bail out on timeout
	// so the app is never stuck on a blank screen if the font CDN is unreachable.
	if (!fontsLoaded && !fontError && !fontTimedOut) {
		return null;
	}

	return (
		<>
			{Platform.OS === "web" && <UpdateToast />}
			{Platform.OS === "web" && <InstallPrompt />}
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="+not-found" options={{ title: "Oops!" }} />
			</Stack>
			<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
			{Platform.OS === "web" && <Toaster position="top-right" richColors />}
		</>
	);
}
