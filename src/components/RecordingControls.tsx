import { Button } from "@/components/ui/button";
import { Monitor, Square, Play, Pause, Mic, MicOff, Settings, ArrowLeft } from "lucide-react";

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  audioEnabled: boolean;
  useVBR: boolean;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onStopRecording: () => void;
  onToggleAudio: () => void;
  onToggleVBR: () => void;
  onBack?: () => void;
}

export const RecordingControls = ({
  isRecording,
  isPaused,
  audioEnabled,
  useVBR,
  onStartRecording,
  onPauseRecording,
  onStopRecording,
  onToggleAudio,
  onToggleVBR,
  onBack
}: RecordingControlsProps) => {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      )}

      {/* Recording Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Audio Toggle */}
        <Button
          variant={audioEnabled ? "default" : "outline"}
          size="lg"
          onClick={onToggleAudio}
          disabled={isRecording}
          className="flex items-center gap-2"
        >
          {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          {audioEnabled ? 'Audio On' : 'Audio Off'}
        </Button>
        
        {/* VBR Toggle */}
        <Button
          variant={useVBR ? "default" : "outline"}
          size="lg"
          onClick={onToggleVBR}
          disabled={isRecording}
          className="flex items-center gap-2"
        >
          <Settings className="w-5 h-5" />
          {useVBR ? 'VBR Mode' : 'CBR Mode'}
        </Button>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isRecording ? (
          <Button
            variant="default"
            size="xl"
            onClick={onStartRecording}
            className="min-w-[200px] bg-gradient-primary hover:bg-gradient-primary/90 shadow-glow"
          >
            <Monitor className="w-6 h-6" />
            Start Recording
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              variant={isPaused ? "default" : "secondary"}
              size="lg"
              onClick={onPauseRecording}
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={onStopRecording}
            >
              <Square className="w-5 h-5" />
              Stop
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};