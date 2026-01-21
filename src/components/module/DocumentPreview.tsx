import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, CheckCircle } from 'lucide-react';
import { DocumentData, FamilyAgreementData, ThirtyDayPlanData } from '@/lib/documentTypes';
import { downloadDocument } from '@/lib/documentGenerators';
import { toast } from '@/hooks/use-toast';

interface DocumentPreviewProps {
  data: DocumentData;
  onDownload?: () => void;
}

const FamilyAgreementPreview = ({ data }: { data: FamilyAgreementData }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <FileText className="h-5 w-5" />
        <h3 className="font-semibold">Family Technology Agreement</h3>
      </div>
      
      <div className="text-sm text-muted-foreground space-y-2">
        {data.sections.familyValues.length > 0 && (
          <div>
            <span className="font-medium text-foreground">Family Values: </span>
            {data.sections.familyValues.slice(0, 3).join(', ')}
            {data.sections.familyValues.length > 3 && '...'}
          </div>
        )}
        
        {data.sections.screenTimeRules.length > 0 && (
          <div>
            <span className="font-medium text-foreground">Screen Time Rules: </span>
            {data.sections.screenTimeRules.length} rules defined
          </div>
        )}
        
        {data.sections.deviceRules.length > 0 && (
          <div>
            <span className="font-medium text-foreground">Devices Covered: </span>
            {data.sections.deviceRules.map(d => d.device).join(', ')}
          </div>
        )}
        
        {data.sections.aiUsageGuidelines.length > 0 && (
          <div>
            <span className="font-medium text-foreground">AI Guidelines: </span>
            {data.sections.aiUsageGuidelines.length} guidelines
          </div>
        )}
      </div>
    </div>
  );
};

const ThirtyDayPlanPreview = ({ data }: { data: ThirtyDayPlanData }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <FileText className="h-5 w-5" />
        <h3 className="font-semibold">30-Day Family Tech Plan</h3>
      </div>
      
      <div className="text-sm text-muted-foreground space-y-2">
        <div>
          <span className="font-medium text-foreground">Main Goal: </span>
          {data.mainGoal}
        </div>
        
        <div>
          <span className="font-medium text-foreground">Plan Structure: </span>
          {data.weeks.length} weeks
        </div>
        
        {data.weeks.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {data.weeks.map((week) => (
              <div 
                key={week.weekNumber} 
                className="rounded-lg bg-muted/50 px-3 py-2 text-xs"
              >
                <div className="font-medium text-foreground">Week {week.weekNumber}</div>
                <div className="text-muted-foreground truncate">{week.theme}</div>
              </div>
            ))}
          </div>
        )}
        
        {data.successMetrics.length > 0 && (
          <div className="mt-2">
            <span className="font-medium text-foreground">Success Metrics: </span>
            {data.successMetrics.length} ways to measure progress
          </div>
        )}
      </div>
    </div>
  );
};

const DocumentPreview = ({ data, onDownload }: DocumentPreviewProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadDocument(data);
      setHasDownloaded(true);
      onDownload?.();
      toast({
        title: 'Document downloaded!',
        description: 'Open it in Google Docs, Word, or any word processor.',
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 md:p-5">
      {data.type === 'family_agreement' ? (
        <FamilyAgreementPreview data={data as FamilyAgreementData} />
      ) : (
        <ThirtyDayPlanPreview data={data as ThirtyDayPlanData} />
      )}
      
      <div className="mt-4 pt-4 border-t border-primary/10">
        <Button 
          onClick={handleDownload} 
          disabled={isDownloading}
          className="w-full gap-2"
          variant={hasDownloaded ? 'outline' : 'default'}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Document...
            </>
          ) : hasDownloaded ? (
            <>
              <CheckCircle className="h-4 w-4 text-success" />
              Download Again
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download as Word Document
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Opens in Google Docs, Microsoft Word, and more
        </p>
      </div>
    </div>
  );
};

export default DocumentPreview;
