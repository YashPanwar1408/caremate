import * as Speech from 'expo-speech';

export function speak(text: string) {
  Speech.speak(text);
}

export function stopSpeaking() {
  Speech.stop();
}
