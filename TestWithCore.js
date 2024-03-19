import React from "react";
import { StatusBar } from "expo-status-bar";
import { useForm, Controller } from "react-hook-form";
import Vocale from "@vocale/core";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Audio } from "expo-av";

export function TestWithCore() {
  const {
    control,
    formState: { errors },
  } = useForm();
  const [recording, setRecording] = React.useState(null);
  const [recordingStatus, setRecordingStatus] = React.useState("off");
  const [audioPerm, setAudioPerm] = React.useState(false);
  const [completion, setCompletion] = React.useState({});
  const ref = React.useRef(null);

  const vocale = new Vocale({
    apiKey: "",
    serviceBaseUrl: "",
    siteId: "",
  });

  const forms = {
    id: "my-custom-form",
    schema: [
      {
        id: "name",
        label: "Name",
        type: "text",
        fieldType: "text",
      },
      {
        id: "email",
        label: "Email",
        type: "text",
        fieldType: "text",
      },
    ],
  };
  React.useEffect(() => {
    // Get perms for the mic
    Audio.requestPermissionsAsync().then((permission) => {
      setAudioPerm(permission.granted);
    });

    // Sync forms
    vocale.sync({
      pathname: "/",
      forms: [{ formId: "my-custom-form", schema: forms.schema }],
    });
  }, []);

  async function startRecording() {
    try {
      // needed for IoS
      if (audioPerm) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }

      const newRecording = new Audio.Recording();
      console.log("Starting Recording");
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();
      setRecording(newRecording);
      setRecordingStatus("recording");
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  }

  async function stopRecording() {
    try {
      if (recordingStatus === "recording") {
        console.log("Stopping Recording");
        await recording.stopAndUnloadAsync();

        const recordingUri = recording.getURI();
        // const recordBlobAudio = await convertAudioUriToBlob(recordingUri);

        const file = {
          uri: recordingUri, // e.g. 'file:///path/to/file/image123.jpg'
          name: "audio.m4a", // e.g. 'image123.jpg',
          type: "audio/x-m4a", // e.g. 'image/jpg'
        };

        const vocaleResponse = await vocale.voice(file, {
          pathname: "/",
          trigger: {
            formId: "my-custom-form",
          },
          metadata: { audioDuration: 2000 },
          forms: [forms],
        });

        // resert our states to record again
        setRecording(null);
        setRecordingStatus("stopped");
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  }

  async function handleRecordButtonPress() {
    if (recording) {
      const audioUri = await stopRecording(recording);
      if (audioUri) {
        console.log("Saved audio file to", savedUri);
      }
    } else {
      await startRecording();
    }
  }

  console.log(completion[0]?.value);
  return (
    <View style={styles.container} id="my-custom-form" ref={ref}>
      <Text>Test with Core</Text>
      <StatusBar style="auto" />
      <Controller
        control={control}
        render={({ field }) => (
          <TextInput
            {...field}
            style={styles.input}
            placeholder="Your Name"
            value={completion[1]?.value ?? ""}
          />
        )}
        name="name"
        rules={{ required: "You must enter your name" }}
      />
      {errors.name && (
        <Text style={styles.errorText}>{errors.name.message}</Text>
      )}

      <Controller
        control={control}
        render={({ field }) => (
          <TextInput
            {...field}
            style={styles.input}
            placeholder="Email"
            value={completion[0]?.value ?? ""}
          />
        )}
        name="email"
        rules={{
          required: "You must enter your email",
          pattern: {
            value: /^\S+@\S+$/i,
            message: "Enter a valid email address",
          },
        }}
      />
      {errors.email && (
        <Text style={styles.errorText}>{errors.email.message}</Text>
      )}

      <Button
        title={recordingStatus === "recording" ? "Stop" : "Record"}
        onPress={handleRecordButtonPress}
      />
      <Text>Record status: {recordingStatus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 100,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});
