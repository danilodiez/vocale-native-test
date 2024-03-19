import React from "react";
import { TestWithHooks } from "./TestWithHooks";
import { TestWithCore } from "./TestWithCore";
import { VocaleProvider } from "@vocale/react";
import { Platform } from "react-native";

let hooks = false;
if (Platform.OS === "web") hooks = true;
export default function App() {
  return (
    <>
      <VocaleProvider
        apiKey=""
        siteId=""
        serviceBaseUrl=""
      >
        {hooks ? <TestWithHooks /> : <TestWithCore />}
      </VocaleProvider>
    </>
  );
}
