FROM node:22

# Install basic development tools
RUN apt update && apt install -y less man-db sudo

# Ensure default `node` user has access to `sudo`
ARG USERNAME=node
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME


# Install system dependencies
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget \
    unzip \
    git \
    curl \
    adb \
    && rm -rf /var/lib/apt/lists/*

# Android SDK configuration
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools

RUN mkdir -p $ANDROID_SDK_ROOT/cmdline-tools

RUN wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip \
    && unzip commandlinetools-linux-*.zip \
    && mv cmdline-tools $ANDROID_SDK_ROOT/cmdline-tools/latest \
    && rm *.zip

# Accept licenses
RUN yes | sdkmanager --licenses

# Install required SDK components
RUN sdkmanager \
    "platform-tools" \
    "platforms;android-35" \
    "build-tools;35.0.0"

RUN sdkmanager "ndk;26.1.10909125"
# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true
