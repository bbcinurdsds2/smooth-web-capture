import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { ScreenRecorder } from "@/components/ScreenRecorder";

const Index = () => {
  const [showRecorder, setShowRecorder] = useState(false);

  if (showRecorder) {
    return <ScreenRecorder onBack={() => setShowRecorder(false)} />;
  }

  return <LandingPage onStartRecording={() => setShowRecorder(true)} />;
};

export default Index;