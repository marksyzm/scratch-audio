import { Image } from "expo-image"
import { Button, Platform, StyleSheet } from "react-native"

import { HelloWave } from "@/components/hello-wave"
import ParallaxScrollView from "@/components/parallax-scroll-view"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { Link } from "expo-router"
import { useCallback, useRef, useState } from "react"
import {
  AudioContext,
  AudioManager,
  AudioRecorder,
} from "react-native-audio-api"

export default function HomeScreen() {
  const [microphoneOn, setMicrophoneOn] = useState(false)
  const recorderRef = useRef<AudioRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const toggleMicrophone = useCallback(async () => {
    alert(`Microphone turned ${!microphoneOn ? "on" : "off"}`)
    setMicrophoneOn((prev) => !prev)

    if (!microphoneOn) {
      const bufferSize = 1024
      const sampleRate = 48000

      const worklet = (
        audioData: Float32Array[],
        inputChannelCount: number
      ) => {
        "worklet"
        console.log(audioData[0].length)
      }

      if (!(await AudioManager.requestRecordingPermissions())) {
        const msg = "Microphone permission is required to use this feature."
        alert(msg)
        throw new Error(msg)
      }

      const recorder = new AudioRecorder({
        sampleRate,
        bufferLengthInSamples: bufferSize,
      })
      const audioContext = new AudioContext({ sampleRate })

      recorderRef.current = recorder
      audioContextRef.current = audioContext

      const workletNode = audioContext.createWorkletNode(
        worklet,
        bufferSize,
        1,
        "UIRuntime"
      )
      const adapterNode = audioContext.createRecorderAdapter()

      adapterNode.connect(workletNode)
      workletNode.connect(audioContext.destination)
      recorder.connect(adapterNode)

      recorder.start()
    } else {
      recorderRef.current?.stop()
      recorderRef.current = null
      audioContextRef.current?.close()
      audioContextRef.current = null
    }
  }, [microphoneOn])

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <Button
        title={microphoneOn ? "Microphone On" : "Microphone Off"}
        onPress={toggleMicrophone}
      />
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction
              title="Action"
              icon="cube"
              onPress={() => alert("Action pressed")}
            />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert("Share pressed")}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert("Delete pressed")}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">
            npm run reset-project
          </ThemedText>{" "}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
})
