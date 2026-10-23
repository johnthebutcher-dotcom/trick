# Permission wording

Apple rejects vague purpose strings. Each must say what the app does with the permission and what the user gets. Put these in the Capacitor iOS project's `Info.plist` (and, for Android, request permissions at the moment of use with the same explanation shown in-app first).

| Key                                   | When needed                                          | Wording (edit `{{…}}`)                                                                                      |
| ------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `NSCameraUsageDescription`            | `<input capture>` or Capacitor Camera                | "{{APP_NAME}} uses the camera to scan {{THING, e.g. bottle labels}} so you don't have to type the details." |
| `NSPhotoLibraryUsageDescription`      | picking an existing photo                            | "{{APP_NAME}} needs photo access so you can scan a {{THING}} from a picture you already took."              |
| `NSPhotoLibraryAddUsageDescription`   | saving images to the library                         | "{{APP_NAME}} saves the images you export to your photo library."                                           |
| `NSUserNotificationsUsageDescription` | web push / local notifications (shown by iOS prompt) | In-app pre-prompt: "Get a reminder when {{EVENT}}. You can turn this off any time in Settings."             |
| `NSLocationWhenInUseUsageDescription` | only if a feature uses location                      | "{{APP_NAME}} uses your location to {{BENEFIT}}. Location is not stored."                                   |
| `NSFaceIDUsageDescription`            | only if biometric unlock is added                    | "Unlock {{APP_NAME}} with Face ID instead of signing in again."                                             |

## In-app pre-prompts

Before the OS dialog, show a screen or sheet with the same sentence and two buttons ("Allow camera" / "Not now"). Users who tap "Not now" must still be able to use the rest of the app, and the feature must explain how to enable the permission later (Settings → {{APP_NAME}}).

## Age-restricted content

If the app concerns alcohol (a rum scanner does), set the App Store age rating accordingly (alcohol reference → 17+ in Apple's questionnaire) and add an age confirmation step to onboarding.
