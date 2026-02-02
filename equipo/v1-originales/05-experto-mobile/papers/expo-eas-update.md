# EAS Update
Source: https://docs.expo.dev/eas-update/introduction/

EAS Update is a hosted service that serves updates for projects using the expo-updates library.

EAS Update makes fixing small bugs and pushing quick fixes a snap in between app store submissions. It accomplishes this by enabling an app to update its own non-native pieces (such as JS, styling, and images) over-the-air.

All apps that include the expo-updates library have the ability to receive updates.

## JS API for Update Management

The updates JavaScript API includes a React hook called `useUpdates()`. This hook provides:
- Detailed information about the currently running update
- Any new updates available or downloaded
- Errors encountered during the update process

Methods available:
- `checkForUpdateAsync()` — control when your app checks for updates
- `fetchUpdateAsync()` — control when your app downloads updates

## Insight Tracking

You'll get a deployments dashboard that helps visualize which updates are being sent to builds. Updates work in concert with insights to provide data on adoption rates.

## Republish for Reverting Mistakes

If an update isn't performing as expected, you can republish a previous, stable version on top of the problematic one, much like a new "commit" in version control systems.

## Get Started

- Get started with EAS Update setup
- Publish an update to a specific branch
- Preview updates — view teammate's changes
- Use GitHub Actions — publish an update and preview with QR code after a commit
- Migrate from CodePush to EAS Update
