import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Share2, FileText, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useLogSmsUsage } from '../hooks/useQueries';
import type { GeneratedMessage } from '../backend';

interface MessageListProps {
  messages: GeneratedMessage[];
  isLoading: boolean;
  onGenerateNew: () => void;
  redChatLogMode?: boolean;
}

export default function MessageList({ messages, isLoading, onGenerateNew, redChatLogMode = false }: MessageListProps) {
  const logSmsUsage = useLogSmsUsage();

  const formatDateTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getToneLabel = (tone: string) => {
    switch (tone) {
      case 'formalEvidence':
        return 'Evidence Documentation';
      case 'directWarning':
        return 'Direct Warning';
      case 'documentationNotice':
        return 'Documentation Notice';
      default:
        return tone;
    }
  };

  const getIntensityLabel = (intensity?: string) => {
    if (!intensity) return null;
    switch (intensity) {
      case 'calm':
        return 'Calm';
      case 'firm':
        return 'Firm';
      case 'severe':
        return 'Severe';
      case 'veryHarsh':
        return 'Very Harsh';
      default:
        return intensity;
    }
  };

  const getIntensityVariant = (intensity?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (!intensity) return 'secondary';
    switch (intensity) {
      case 'calm':
        return 'outline';
      case 'firm':
        return 'secondary';
      case 'severe':
        return 'default';
      case 'veryHarsh':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Message copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const shareMessage = async (content: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: content,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.error('Share failed:', error);
      }
    } else {
      // Fallback to copy
      copyToClipboard(content);
    }
  };

  const isSmsSupported = () => {
    // SMS is supported on mobile devices (iOS and Android)
    // Desktop browsers may not support it properly
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    return isMobile;
  };

  const sendViaSms = async (message: GeneratedMessage) => {
    try {
      // Log SMS usage to backend for documentation
      await logSmsUsage.mutateAsync({
        incidentId: message.incidentId,
        messageId: message.id,
        messageContent: message.content,
        recipient: null,
      });

      // Open SMS app with pre-filled message
      const smsUri = `sms:?body=${encodeURIComponent(message.content)}`;
      window.location.href = smsUri;

      toast.success('SMS app opened with message ready to send');
    } catch (error) {
      console.error('SMS error:', error);
      toast.error('Failed to open SMS app');
    }
  };

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-8">Loading messages...</p>;
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-4">No messages generated yet</p>
        <Button onClick={onGenerateNew}>Generate Your First Message</Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {messages.map((message) => (
          <Card 
            key={message.id.toString()} 
            className={redChatLogMode ? 'red-chat-card' : 'border-2'}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                <div>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <Badge 
                      variant="secondary"
                      className={redChatLogMode ? 'red-chat-badge' : ''}
                    >
                      {getToneLabel(message.tone.toString())}
                    </Badge>
                    {message.intensity && (
                      <Badge 
                        variant={getIntensityVariant(message.intensity.toString())}
                        className={redChatLogMode ? 'red-chat-badge-intensity' : ''}
                      >
                        {getIntensityLabel(message.intensity.toString())}
                      </Badge>
                    )}
                  </div>
                  <p className={`text-xs ${redChatLogMode ? 'red-chat-timestamp' : 'text-muted-foreground'}`}>
                    Generated: {formatDateTime(message.timestamp)}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(message.content)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => shareMessage(message.content)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  {isSmsSupported() ? (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => sendViaSms(message)}
                      disabled={logSmsUsage.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {logSmsUsage.isPending ? 'Logging...' : 'Send via SMS'}
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Send via SMS
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">SMS feature is available on mobile devices. Use Copy or Share on desktop.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              <Separator className={redChatLogMode ? 'red-chat-separator' : 'mb-4'} />

              <div className={redChatLogMode ? 'red-chat-content' : 'bg-muted/30 rounded-lg p-4'}>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}
