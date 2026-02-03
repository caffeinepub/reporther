import { useState } from 'react';
import { useGenerateMessage } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { MessageTone, ToneIntensity } from '../backend';
import { Info } from 'lucide-react';

interface MessageGeneratorProps {
  incidentId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function MessageGenerator({ incidentId, onCancel, onSuccess }: MessageGeneratorProps) {
  const [selectedTone, setSelectedTone] = useState<MessageTone>(MessageTone.directWarning);
  const [selectedIntensity, setSelectedIntensity] = useState<ToneIntensity>(ToneIntensity.firm);
  const generateMessage = useGenerateMessage();

  const toneOptions = [
    {
      value: MessageTone.directWarning,
      label: 'Direct Warning',
      description: 'Clear and assertive warning to cease harassing behavior immediately with tone intensity options.',
    },
    {
      value: MessageTone.formalEvidence,
      label: 'Evidence Documentation',
      description: 'Professional formal statement suitable for legal documentation and official records.',
    },
    {
      value: MessageTone.documentationNotice,
      label: 'Documentation Notice',
      description: 'Professional notification that actions are being monitored and documented as evidence.',
    },
  ];

  const intensityOptions = [
    {
      value: ToneIntensity.calm,
      label: 'Calm',
      description: 'Professional but clear warning language with measured tone',
    },
    {
      value: ToneIntensity.firm,
      label: 'Firm',
      description: 'Assertive and direct language with clear consequences, zero tolerance messaging',
    },
    {
      value: ToneIntensity.severe,
      label: 'Severe',
      description: 'Strong, forceful language emphasizing serious legal action and accountability',
    },
    {
      value: ToneIntensity.veryHarsh,
      label: 'Very Harsh',
      description: 'Maximum intensity using condemning and intimidating language while remaining lawful',
    },
  ];

  const handleGenerate = async () => {
    try {
      const intensity = selectedTone === MessageTone.directWarning ? selectedIntensity : null;
      await generateMessage.mutateAsync({
        incidentId,
        tone: selectedTone,
        intensity,
      });
      toast.success('Message generated successfully with contextual content');
      onSuccess();
    } catch (error) {
      toast.error('Failed to generate message');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-primary/50 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <strong className="text-primary">Enhanced Message Generation:</strong> All messages are now generated with meaningful, 
          contextually relevant content based on your incident details, stalker information, and selected tone. Each message type 
          produces professional ReportHer language tailored to your specific situation.
        </AlertDescription>
      </Alert>

      <div>
        <Label className="text-base font-semibold mb-4 block">Select Message Type</Label>
        <RadioGroup value={selectedTone} onValueChange={(value) => setSelectedTone(value as MessageTone)}>
          <div className="space-y-3">
            {toneOptions.map((option) => (
              <Card
                key={option.value}
                className={`cursor-pointer transition-colors ${
                  selectedTone === option.value ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedTone(option.value)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={option.value} className="font-semibold cursor-pointer">
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      {selectedTone === MessageTone.directWarning && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Choose Message Tone Intensity</Label>
          <Select value={selectedIntensity} onValueChange={(value) => setSelectedIntensity(value as ToneIntensity)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select intensity level" />
            </SelectTrigger>
            <SelectContent>
              {intensityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col items-start py-1">
                    <span className="font-semibold">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Higher intensity levels use more forceful and condemning language while remaining lawful and professional.
          </p>
        </div>
      )}

      {selectedTone === MessageTone.formalEvidence && (
        <Alert className="border-secondary/50 bg-secondary/5">
          <Info className="h-4 w-4 text-secondary" />
          <AlertDescription className="text-sm">
            <strong>Evidence Documentation:</strong> This message type generates a comprehensive formal statement 
            with legal formatting, including incident details, timestamps, and Criminal Activity Report Number for 
            official documentation and legal proceedings.
          </AlertDescription>
        </Alert>
      )}

      {selectedTone === MessageTone.documentationNotice && (
        <Alert className="border-secondary/50 bg-secondary/5">
          <Info className="h-4 w-4 text-secondary" />
          <AlertDescription className="text-sm">
            <strong>Documentation Notice:</strong> This message type generates a professional notification 
            informing third parties or authorities that actions are being monitored, documented, and may be 
            submitted to law enforcement with proper evidence references.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleGenerate}
          disabled={generateMessage.isPending}
          className="flex-1"
        >
          {generateMessage.isPending ? 'Generating...' : 'Generate Message'}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={generateMessage.isPending}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
