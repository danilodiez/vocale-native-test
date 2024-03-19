import React, { useContext } from "react";
import { StatusBar } from "expo-status-bar";
import { useForm, Controller } from "react-hook-form";
import {
  useForm as useFormVocale,
  useVoiceRecording,
  VocaleProvider,
} from "@vocale/react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export function TestWithHooks() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [submittedData, setSubmittedData] = React.useState(null);
  const [completion, setCompletion] = React.useState(null);
  const onSubmit = (data) => {
    console.log("Submitted Data:", data);
    setSubmittedData(data);
  };

  // The requestCompletion is not triggered because Vocale is not in react context
  const { requestCompletion, syncForm } = useFormVocale("my-custom-form", {
    onCompletion: (completion) => {
      console.log("completion: ", completion);
      setCompletion(completion);
    },
    onError: (error) => {
      console.log("error!!!");
      console.log(error);
    },
  });

  React.useEffect(() => {
    syncForm({
      pathname: "/",
      forms: [
        {
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
        },
      ],
    });
  }, []);

  const { isRecording, startRecording, stopRecording } = useVoiceRecording({
    onError: (error) => {
      console.log(error);
    },
    onFinish: async (audio, duration) => {
      try {
        await requestCompletion(audio, duration);
      } catch (e) {
        console.log(e);
      }
    },
  });

  const toggleRecording = React.useCallback(() => {
    if (isRecording) stopRecording();
    else startRecording();
  }, [isRecording, startRecording, stopRecording]);

  return (
    <View style={styles.container} id="my-custom-form">
      <Text>Test with hooks</Text>
      <StatusBar style="auto" />
      <Controller
        control={control}
        render={({ field }) => (
          <TextInput {...field} style={styles.input} placeholder="Your Name" />
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
          <TextInput {...field} style={styles.input} placeholder="Email" />
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

      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
      <Button title="Record" onPress={toggleRecording} />

      {submittedData && (
        <View style={styles.submittedContainer}>
          <Text style={styles.submittedTitle}>Submitted Data:</Text>
          <Text>Name: {submittedData.name}</Text>
          <Text>Email: {submittedData.email}</Text>
        </View>
      )}
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
