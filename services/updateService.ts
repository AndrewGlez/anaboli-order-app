import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import Constants from "expo-constants";

type GithubRelease = {
  tag_name: string;
  assets: {
    name: string;
    browser_download_url: string;
  }[];
};

export const checkForUpdates = async () => {
  try {
    // Replace with your GitHub repository owner and name
    const repoOwner = "AndrewGlez";
    const repoName = "anaboli-order-app";

    // Get latest release from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch updates");
    }

    const latestRelease = (await response.json()) as GithubRelease;
    const currentVersion = Constants.expoConfig?.version ?? "1.0.0";

    // Simple version comparison (you might want a more robust solution)
    const isUpdateAvailable =
      latestRelease.tag_name.replace("v", "") > currentVersion;

    return {
      isUpdateAvailable,
      latestVersion: latestRelease.tag_name,
      currentVersion,
      releaseData: latestRelease,
    };
  } catch (error) {
    console.error("Error checking for updates:", error);
    return {
      isUpdateAvailable: false,
      error,
    };
  }
};

export const downloadUpdate = async (downloadUrl: string) => {
  // For Android, we can directly open the download URL
  Linking.openURL(downloadUrl);
};
