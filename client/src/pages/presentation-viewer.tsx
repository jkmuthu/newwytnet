
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Presentation } from 'lucide-react';

export default function PresentationViewer() {
  const [presentations, setPresentations] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/presentations')
      .then(res => res.json())
      .then(data => setPresentations(data.presentations || []))
      .catch(console.error);
  }, []);

  const handleDownload = async (slug: string) => {
    try {
      const response = await fetch(`/api/presentations/${slug}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Presentations</h1>
        <p className="text-muted-foreground mb-8">
          Download and export WytNet platform presentations
        </p>

        <div className="grid gap-6">
          {presentations.map((pres) => (
            <Card key={pres.slug}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Presentation className="w-5 h-5" />
                  {pres.slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </CardTitle>
                <CardDescription>
                  Markdown presentation file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => handleDownload(pres.slug)} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Markdown
                  </Button>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">How to convert to PPT/PDF:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Download the Markdown file</li>
                    <li>Use <a href="https://marp.app/" target="_blank" rel="noopener" className="text-primary underline">Marp</a> or <a href="https://slidev.dev/" target="_blank" rel="noopener" className="text-primary underline">Slidev</a> to convert</li>
                    <li>Or paste into Google Slides using <a href="https://workspace.google.com/marketplace/app/markdown_to_slides/361277880411" target="_blank" rel="noopener" className="text-primary underline">Markdown to Slides addon</a></li>
                    <li>Export as PDF or PPTX from your tool</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
