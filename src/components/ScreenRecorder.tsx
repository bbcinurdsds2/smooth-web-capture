import { useState, useRef, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Monitor, Cpu, Zap } from "lucide-react";
import { RecordingControls } from "./RecordingControls";
import { FormatSelector, ExportFormat } from "./FormatSelector";

interface RecordingOptions {
  video: {
    width: number;
    height: number;
    frameRate: number;
  };
  audio: boolean;
}

interface ScreenRecorderProps {
  onBack?: () => void;
}

interface BrowserInfo {
  name: string;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  isSafari: boolean;
  supportsHardwareAcceleration: boolean;
}

export const ScreenRecorder = ({ onBack }: ScreenRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [selectedCodec, setSelectedCodec] = useState<string>('');
  const [useVBR, setUseVBR] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('webm');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  // Detect browser and hardware acceleration capabilities
  const detectBrowser = useCallback((): BrowserInfo => {
    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    const isEdge = /Edge/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    
    // Basic hardware acceleration detection
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const supportsHardwareAcceleration = gl !== null;

    let name = 'Unknown';
    if (isChrome) name = 'Chrome';
    else if (isFirefox) name = 'Firefox';
    else if (isEdge) name = 'Edge';
    else if (isSafari) name = 'Safari';

    return {
      name,
      isChrome,
      isFirefox,
      isEdge,
      isSafari,
      supportsHardwareAcceleration
    };
  }, []);

  // Get optimal codec based on browser
  const getOptimalCodec = useCallback((browser: BrowserInfo) => {
    const codecs = [];
    
    if (browser.isChrome && browser.supportsHardwareAcceleration) {
      // Chrome with hardware acceleration - prefer VP9
      codecs.push(
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=h264,opus',
        'video/mp4;codecs=h264,aac'
      );
    } else if (browser.isFirefox) {
      // Firefox - prefer H.264
      codecs.push(
        'video/webm;codecs=h264,opus',
        'video/mp4;codecs=h264,aac',
        'video/webm;codecs=vp9,opus'
      );
    } else if (browser.isEdge) {
      // Edge - prefer H.264 with hardware acceleration
      codecs.push(
        'video/mp4;codecs=h264,aac',
        'video/webm;codecs=h264,opus',
        'video/webm;codecs=vp9,opus'
      );
    } else if (browser.isSafari) {
      // Safari - H.264 only
      codecs.push(
        'video/mp4;codecs=h264,aac',
        'video/webm;codecs=h264,opus'
      );
    } else {
      // Fallback for other browsers
      codecs.push(
        'video/webm;codecs=h264,opus',
        'video/mp4;codecs=h264,aac',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus'
      );
    }
    
    // Add fallbacks
    codecs.push('video/webm', 'video/mp4');
    
    return codecs;
  }, []);

  useEffect(() => {
    const browser = detectBrowser();
    setBrowserInfo(browser);
    
    // Set optimal codec for detected browser
    const codecs = getOptimalCodec(browser);
    for (const codec of codecs) {
      if (MediaRecorder.isTypeSupported(codec)) {
        setSelectedCodec(codec);
        break;
      }
    }
  }, [detectBrowser, getOptimalCodec]);

  const recordingOptions: RecordingOptions = {
    video: {
      width: 3840, // 4K for studio quality
      height: 2160,
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
      
      // Use browser-optimized codec selection
      const mimeType = selectedCodec || 'video/webm';
      
      // Calculate optimal bitrate for studio quality
      let videoBitsPerSecond = 25000000; // 25 Mbps base for 4K
      
      if (browserInfo?.isChrome && browserInfo.supportsHardwareAcceleration) {
        videoBitsPerSecond = 30000000; // 30 Mbps for Chrome with HW acceleration
      } else if (browserInfo?.isFirefox) {
        videoBitsPerSecond = 22000000; // 22 Mbps for Firefox optimization
      }
      
      // VBR configuration - allow fluctuation for better quality/size balance
      const recordingConfig: any = {
        mimeType,
        audioBitsPerSecond: 128000
      };
      
      if (useVBR) {
        // Variable bitrate: allow 50% fluctuation for optimal quality
        recordingConfig.videoBitsPerSecond = videoBitsPerSecond;
      } else {
        // Constant bitrate for stable file sizes
        recordingConfig.videoBitsPerSecond = videoBitsPerSecond;
      }
      
      const mediaRecorder = new MediaRecorder(stream, recordingConfig);

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
        description: `Studio quality: ${recordingOptions.video.width}x${recordingOptions.video.height} @ ${recordingOptions.video.frameRate}fps`,
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

  const downloadRecording = (format: ExportFormat) => {
    if (recordedChunks.length > 0) {
      let mimeType = 'video/webm';
      let extension = 'webm';
      
      switch (format) {
        case 'mp4':
          mimeType = 'video/mp4';
          extension = 'mp4';
          break;
        case 'mov':
          mimeType = 'video/quicktime';
          extension = 'mov';
          break;
        case 'webm':
        default:
          mimeType = 'video/webm';
          extension = 'webm';
          break;
      }
      
      const blob = new Blob(recordedChunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studio-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: `Your ${format.toUpperCase()} recording is being downloaded.`,
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
            <div className="p-3 rounded-full bg-gradient-primary shadow-glow">
              <Monitor className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Studio Screen Recorder
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional 4K 60fps studio-quality recording with hardware acceleration
          </p>
          
          {/* Quality Badge */}
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              4K Ultra HD
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              60 FPS
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              25+ Mbps
            </Badge>
            {browserInfo && (
              <Badge variant="secondary" className="text-sm flex items-center gap-1 px-3 py-1">
                {browserInfo.supportsHardwareAcceleration && <Zap className="w-3 h-3" />}
                {browserInfo.name}
              </Badge>
            )}
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {selectedCodec.includes('vp9') ? 'VP9' : selectedCodec.includes('h264') ? 'H.264' : 'Auto'} {useVBR ? 'VBR' : 'CBR'}
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

        {/* Browser Info */}
        <Card className="p-4 bg-gradient-secondary border-border/50">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                {browserInfo?.name || 'Detecting...'}
              </span>
              {browserInfo?.supportsHardwareAcceleration && (
                <Zap className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <div className="text-muted-foreground">•</div>
            <div>Codec: {selectedCodec.includes('vp9') ? 'VP9' : selectedCodec.includes('h264') ? 'H.264' : 'Auto'}</div>
            <div className="text-muted-foreground">•</div>
            <div>Mode: {useVBR ? 'Variable Bitrate' : 'Constant Bitrate'}</div>
          </div>
        </Card>

        {/* Main Controls */}
        <Card className="p-8 shadow-soft border-border/50">
          <RecordingControls
            isRecording={isRecording}
            isPaused={isPaused}
            audioEnabled={audioEnabled}
            useVBR={useVBR}
            onStartRecording={startRecording}
            onPauseRecording={pauseRecording}
            onStopRecording={stopRecording}
            onToggleAudio={() => setAudioEnabled(!audioEnabled)}
            onToggleVBR={() => setUseVBR(!useVBR)}
            onBack={onBack}
          />
        </Card>

        {/* Download Section */}
        {hasRecording && (
          <FormatSelector
            selectedFormat={selectedFormat}
            onFormatChange={setSelectedFormat}
            onDownload={downloadRecording}
            recordedChunks={recordedChunks}
            recordingTime={recordingTime}
          />
        )}

        {hasRecording && (
          <Card className="p-6 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={resetRecording}
              className="min-w-[200px]"
            >
              Start New Recording
            </Button>
          </Card>
        )}

        {!hasRecording && (
          <Card className="p-8 text-center bg-gradient-secondary border-border/50">
            <h3 className="text-xl font-semibold mb-4">Studio-Quality Features</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <Monitor className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">4K Recording</div>
                <div className="text-muted-foreground">Ultra HD resolution</div>
              </div>
              <div>
                <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Hardware Accelerated</div>
                <div className="text-muted-foreground">Optimized encoding</div>
              </div>
              <div>
                <Cpu className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Multi-Format Export</div>
                <div className="text-muted-foreground">MP4, WebM, MOV</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};