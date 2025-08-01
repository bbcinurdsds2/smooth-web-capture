import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileVideo, HardDrive } from "lucide-react";

export type ExportFormat = 'webm' | 'mp4' | 'mov';

interface FormatOption {
  format: ExportFormat;
  label: string;
  description: string;
  mimeType: string;
  extension: string;
  icon: React.ReactNode;
  recommended?: boolean;
}

interface FormatSelectorProps {
  selectedFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  onDownload: (format: ExportFormat) => void;
  recordedChunks: Blob[];
  recordingTime: number;
}

const formatOptions: FormatOption[] = [
  {
    format: 'webm',
    label: 'WebM',
    description: 'High quality, smaller file size, web optimized',
    mimeType: 'video/webm',
    extension: 'webm',
    icon: <FileVideo className="w-5 h-5" />,
    recommended: true
  },
  {
    format: 'mp4',
    label: 'MP4',
    description: 'Universal compatibility, good for sharing',
    mimeType: 'video/mp4',
    extension: 'mp4',
    icon: <FileVideo className="w-5 h-5" />
  },
  {
    format: 'mov',
    label: 'MOV',
    description: 'Professional editing, high quality',
    mimeType: 'video/quicktime',
    extension: 'mov',
    icon: <HardDrive className="w-5 h-5" />
  }
];

export const FormatSelector = ({
  selectedFormat,
  onFormatChange,
  onDownload,
  recordedChunks,
  recordingTime
}: FormatSelectorProps) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const estimateFileSize = (format: ExportFormat) => {
    if (recordedChunks.length === 0) return '0 MB';
    
    const totalBytes = recordedChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    let multiplier = 1;
    
    // Rough conversion estimates based on typical compression
    switch (format) {
      case 'webm':
        multiplier = 0.8; // WebM typically smaller
        break;
      case 'mp4':
        multiplier = 1.0; // Base reference
        break;
      case 'mov':
        multiplier = 1.2; // MOV typically larger
        break;
    }
    
    const estimatedBytes = totalBytes * multiplier;
    const mb = estimatedBytes / (1024 * 1024);
    
    if (mb < 1) {
      return `${(mb * 1024).toFixed(0)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Choose Export Format</h3>
          <p className="text-muted-foreground">
            Duration: {formatTime(recordingTime)} • Select your preferred format for download
          </p>
        </div>

        <div className="grid gap-4">
          {formatOptions.map((option) => (
            <div
              key={option.format}
              className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${selectedFormat === option.format 
                  ? 'border-primary bg-primary/5 shadow-glow/30' 
                  : 'border-border hover:border-primary/50 hover:bg-card/50'
                }
              `}
              onClick={() => onFormatChange(option.format)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-lg 
                    ${selectedFormat === option.format ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                  `}>
                    {option.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{option.label}</h4>
                      {option.recommended && (
                        <Badge variant="secondary" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    Est. {estimateFileSize(option.format)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    .{option.extension}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => onDownload(selectedFormat)}
            size="lg"
            className="min-w-[200px] bg-gradient-primary hover:bg-gradient-primary/90 shadow-glow"
          >
            <Download className="w-5 h-5 mr-2" />
            Download as {selectedFormat.toUpperCase()}
          </Button>
        </div>
      </div>
    </Card>
  );
};