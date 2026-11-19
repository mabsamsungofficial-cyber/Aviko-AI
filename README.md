# ScriptVoice – Android App

Same app (Story ideas + Script + Gemini TTS Voiceover), packaged with Capacitor.

## APK banane ka sabse easy tareeka (laptop/Android Studio ki zarurat nahi)
1. github.com par naya (private) repo banao, is poori folder ko upload/push karo.
2. Repo > Actions > "Build Android App" > Run workflow.
3. 5-8 min baad run ke Artifacts se `ScriptVoice-android` download karo, andar APK milega. Phone me install karo.

## Play Store ke liye (signed release)
Keystore banao: `keytool -genkey -v -keystore release.keystore -alias scriptvoice -keyalg RSA -keysize 2048 -validity 10000`
`base64 -w0 release.keystore` ka output GitHub Secrets me daalo:
KEYSTORE_BASE64, KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD.
Workflow phir signed APK + AAB (Play Store upload ke liye) bhi banayega. Keystore ko safe rakho, dobara nahi ban sakta.

## Local build
`npm install && npm run sync && cd android && ./gradlew assembleDebug`
(APK: android/app/build/outputs/apk/debug/)
