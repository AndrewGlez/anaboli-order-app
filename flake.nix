{
  description = "Anaboli Order App — Expo / React Native devShell";

  inputs = {
    # Pin a known-good nixpkgs revision (nixpkgs-unstable as of 2025-05)
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";

    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = false;
        };

        # expo-cli is deprecated; use @expo/cli via npx instead.
        # The devShell provides everything else needed for local dev.

      in
      {
        devShells.default = pkgs.mkShell {
          name = "anaboli-order-app-dev";

          packages = with pkgs; [
            # ---- Runtime ----
            nodejs_22 # JS runtime (v22.x, LTS)
            bun # fast package-manager & script-runner

            # ---- Tooling ----
            watchman # file watcher – required by Metro bundler
            jdk_headless # JDK – needed for Android builds (./gradlew)
            android-tools # adb, fastboot, etc.

            # ---- Quality-of-life ----
            coreutils # modern GNU utils
            gnused
            gnutar
            findutils
            gnugrep
            file
            curl
            wget
            git
          ];

          # ── Shell hook ────────────────────────────────────────────────────
          shellHook = ''
            echo ""
            echo "╔══════════════════════════════════════════════════╗"
            echo "║  🧪 Anaboli Order App — dev environment         ║"
            echo "╠══════════════════════════════════════════════════╣"
            echo "║  node  $(node --version)                           ║"
            echo "║  bun   $(bun --version)                              ║"
            echo "║  java  $(java -version 2>&1 | head -1)            ║"
            echo "╚══════════════════════════════════════════════════╝"
            echo ""

            # Increase watchman inotify limit (Metro can trip on large trees)
            if [ -f /proc/sys/fs/inotify/max_user_watches ]; then
              current=$(cat /proc/sys/fs/inotify/max_user_watches 2>/dev/null)
              if [ "$current" -lt 1048576 ] 2>/dev/null; then
                echo "  ⚠️   inotify max_user_watches = $current — Metro may fail."
                echo "  🔧  sudo sysctl fs.inotify.max_user_watches=1048576"
                echo ""
              fi
            fi

            # Remind about first steps
            if [ ! -d node_modules ]; then
              echo "  👣  Run  npm install   or   bun install   to install dependencies."
              echo "  🚀  Run  npx expo start    to launch the dev server."
            else
              echo "  ✅  node_modules found — you are ready to go!"
              echo "  🚀  Run  npx expo start    to launch the dev server."
            fi
            echo ""
          '';
        };
      }
    );
}
