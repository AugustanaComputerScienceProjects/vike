fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios alpha

```sh
[bundle exec] fastlane ios alpha
```

Submit a new Build to Apple TestFlight

This will also make sure the profile is up to date

----


## Android

### android beta

```sh
[bundle exec] fastlane android beta
```

Submit a new Beta Build to Play Store

### android release

```sh
[bundle exec] fastlane android release
```

Release for the Android production

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
