import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Monitor, Square, Play, Pause, Download, Settings, Mic, MicOff } from "lucide-react";

interface RecordingOptions {
  video: {
    width: number;
    height: number;
    frameRate: number;
  };
  audio: boolean;
}

export const ScreenRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  const recordingOptions: RecordingOptions = {
    video: {
      width: 1920, // 1080p for optimal performance
      height: 1080,
      frameRate: 60,
    },
    audio: audioEnabled,
  };

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      // Enhanced display media constraints for maximum quality
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: recordingOptions.video.width, max: recordingOptions.video.width },
          height: { ideal: recordingOptions.video.height, max: recordingOptions.video.height },
          frameRate: { ideal: recordingOptions.video.frameRate, max: recordingOptions.video.frameRate }
        } as any,
        audio: recordingOptions.audio ? {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 48000,
          channelCount: 2
        } : false
      } as any);

      streamRef.current = stream;
      
      // Prioritize H.264 for best compatibility and longer recordings
      let mimeType = '';
      let videoBitsPerSecond = 8000000; // 8 Mbps - optimized for longer recordings
      
      const supportedTypes = [
        'video/webm;codecs=h264,opus', // H.264 first for best performance
        'video/mp4;codecs=h264,aac',   // MP4 H.264 fallback
        'video/webm;codecs=vp9,opus',  // VP9 fallback
        'video/webm;codecs=vp8,opus',  // VP8 fallback
        'video/webm',
        'video/mp4'
      ];
      
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond,
        audioBitsPerSecond: 128000 // Optimized audio bitrate
      });

      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        setHasRecording(true);
        stopTimer();
        toast({
          title: "Recording completed",
          description: "Your screen recording is ready for download.",
        });
      };

      // Handle user stopping screen share from browser
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });

      mediaRecorder.start(250); // Collect data every 250ms for smoother recording
      setIsRecording(true);
      setRecordingTime(0);
      startTimer();
      
      toast({
        title: "Recording started",
        description: `Recording at ${recordingOptions.video.width}x${recordingOptions.video.height} @ ${recordingOptions.video.frameRate}fps`,
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Failed to start screen recording. Please check permissions.",
        variant: "destructive",
      });
      console.error('Error starting recording:', error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        startTimer();
        setIsPaused(false);
        toast({
          title: "Recording resumed",
        });
      } else {
        mediaRecorderRef.current.pause();
        stopTimer();
        setIsPaused(true);
        toast({
          title: "Recording paused",
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `screen-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Your screen recording is being downloaded.",
      });
    }
  };

  const resetRecording = () => {
    setRecordedChunks([]);
    setHasRecording(false);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-primary">
              <Monitor className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Pro Screen Recorder
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional 1080p 60fps screen recording optimized for smooth playback
          </p>
          
          {/* Quality Badge */}
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="text-sm">
              1920×1080
            </Badge>
            <Badge variant="secondary" className="text-sm">
              60 FPS
            </Badge>
            <Badge variant="secondary" className="text-sm">
              8 Mbps H.264
            </Badge>
          </div>
        </div>

        {/* Recording Status */}
        {isRecording && (
          <Card className="p-6 border-2 border-destructive bg-gradient-to-r from-destructive/10 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                  <span className="text-lg font-semibold">
                    {isPaused ? 'PAUSED' : 'RECORDING'}
                  </span>
                </div>
                <div className="text-2xl font-mono font-bold">
                  {formatTime(recordingTime)}
                </div>
              </div>
              <Badge variant={isPaused ? "secondary" : "destructive"} className="text-sm">
                Live
              </Badge>
            </div>
          </Card>
        )}

        {/* Main Controls */}
        <Card className="p-8 shadow-soft">
          <div className="space-y-6">
            {/* Audio Toggle */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={audioEnabled ? "default" : "outline"}
                size="lg"
                onClick={() => setAudioEnabled(!audioEnabled)}
                disabled={isRecording}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                {audioEnabled ? 'Audio Enabled' : 'Audio Disabled'}
              </Button>
            </div>

            {/* Recording Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isRecording ? (
                <Button
                  variant="record"
                  size="xl"
                  onClick={startRecording}
                  className="min-w-[200px]"
                >
                  <Monitor className="w-6 h-6" />
                  Start Recording
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    variant={isPaused ? "default" : "secondary"}
                    size="lg"
                    onClick={pauseRecording}
                  >
                    {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button
                    variant="stop"
                    size="lg"
                    onClick={stopRecording}
                  >
                    <Square className="w-5 h-5" />
                    Stop
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Download Section */}
        {hasRecording && (
          <Card className="p-6 border-2 border-success bg-gradient-to-r from-success/10 to-transparent">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-success">Recording Complete!</h3>
              <p className="text-muted-foreground">
                Your high-quality screen recording is ready for download.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="success"
                  size="lg"
                  onClick={downloadRecording}
                >
                  <Download className="w-5 h-5" />
                  Download Recording
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={resetRecording}
                >
                  New Recording
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <Monitor className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">High Quality</h3>
            <p className="text-sm text-muted-foreground">
              1080p resolution at 60fps with 12 Mbps bitrate optimized for smooth playback
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Settings className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Easy Controls</h3>
            <p className="text-sm text-muted-foreground">
              Simple start, pause, and stop controls with real-time recording status
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Download className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Instant Download</h3>
            <p className="text-sm text-muted-foreground">
              Download your recordings immediately as WebM files with VP9 codec
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};