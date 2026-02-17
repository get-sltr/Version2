#!/bin/sh

# Xcode Cloud post-clone script
# Installs Node.js dependencies and CocoaPods for Capacitor build

set -e

echo "=== Post-Clone: Installing dependencies ==="

# Navigate to project root (2 levels up from ios/App/ci_scripts)
cd "$CI_PRIMARY_REPOSITORY_PATH"

# Install Node.js (Xcode Cloud has homebrew)
echo "--- Installing Node.js ---"
brew install node

# Install npm dependencies (needed for Capacitor pods)
echo "--- Installing npm packages ---"
npm ci

# Navigate to iOS app directory
cd ios/App

# Install CocoaPods
echo "--- Installing CocoaPods ---"
gem install cocoapods

echo "--- Running pod install ---"
pod install

echo "=== Post-Clone: Done ==="
