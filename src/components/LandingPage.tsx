import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Video, Zap, Shield, Download, Settings, Play, CheckCircle } from "lucide-react";

interface LandingPageProps {
  onStartRecording: () => void;
}

export const LandingPage = ({ onStartRecording }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-4 rounded-full bg-gradient-primary shadow-glow">
                <Monitor className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-tight">
              Studio-Quality
              <br />
              Screen Recording
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Professional 4K recording with hardware acceleration, multiple export formats, 
              and browser-optimized encoding for content creators and professionals.
            </p>
            
            <div className="flex justify-center gap-3 flex-wrap mb-8">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Video className="w-4 h-4 mr-2" />
                4K @ 60fps
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Hardware Accelerated
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                MP4 • WebM • MOV
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="xl"
                onClick={onStartRecording}
                className="min-w-[250px] text-lg py-6 px-8 shadow-glow hover:shadow-glow/80 transition-all duration-300"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Recording Now
              </Button>
              <p className="text-sm text-muted-foreground">
                No download required • Works in any browser
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Professional Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for high-quality screen recordings, optimized for modern browsers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <Card className="p-8 text-center shadow-soft hover:shadow-glow/20 transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-primary p-4 group-hover:scale-110 transition-transform duration-300">
                <Video className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Studio Quality</h3>
              <p className="text-muted-foreground mb-4">
                Record in up to 4K resolution at 60fps with advanced codec optimization for crystal-clear output
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  4K @ 60fps recording
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  Variable bitrate encoding
                </div>
              </div>
            </Card>

            <Card className="p-8 text-center shadow-soft hover:shadow-glow/20 transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-primary p-4 group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Smart Optimization</h3>
              <p className="text-muted-foreground mb-4">
                Automatic browser detection and hardware acceleration for optimal performance across all devices
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  Browser-specific codecs
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  Hardware acceleration
                </div>
              </div>
            </Card>

            <Card className="p-8 text-center shadow-soft hover:shadow-glow/20 transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-primary p-4 group-hover:scale-110 transition-transform duration-300">
                <Download className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Multiple Formats</h3>
              <p className="text-muted-foreground mb-4">
                Export in MP4, WebM, or MOV formats with optimized compression for any workflow
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  MP4, WebM, MOV export
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  Optimized compression
                </div>
              </div>
            </Card>

            <Card className="p-8 text-center shadow-soft hover:shadow-glow/20 transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-primary p-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Privacy First</h3>
              <p className="text-muted-foreground mb-4">
                All recording happens locally in your browser. No uploads, no cloud storage, complete privacy
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  Local processing only
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  No data uploads
                </div>
              </div>
            </Card>

            <Card className="p-8 text-center shadow-soft hover:shadow-glow/20 transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-primary p-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Instant Start</h3>
              <p className="text-muted-foreground mb-4">
                No downloads or installations required. Start recording immediately in any modern browser
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  No installation needed
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  Works on all devices
                </div>
              </div>
            </Card>

            <Card className="p-8 text-center shadow-soft hover:shadow-glow/20 transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-primary p-4 group-hover:scale-110 transition-transform duration-300">
                <Monitor className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Advanced Controls</h3>
              <p className="text-muted-foreground mb-4">
                Professional recording controls with pause/resume, audio options, and real-time monitoring
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  Pause/resume recording
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  Audio capture options
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Create?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start recording professional-quality screen content in seconds
          </p>
          <Button
            size="xl"
            onClick={onStartRecording}
            className="min-w-[250px] text-lg py-6 px-8 shadow-glow hover:shadow-glow/80 transition-all duration-300"
          >
            <Play className="w-6 h-6 mr-2" />
            Launch Recorder
          </Button>
        </div>
      </section>
    </div>
  );
};