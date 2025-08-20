import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import { ArrowLeft, Download, FileText, Merge, Plus } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface EditorProps {
  files: File[];
  onAddMoreFiles: () => void;
  onBack: () => void;
}

const Editor = ({ files, onAddMoreFiles, onBack }: EditorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast.error('Please select at least 2 PDF files to merge');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const mergedPdf = await PDFDocument.create();
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        
        pages.forEach((page) => mergedPdf.addPage(page));
        
        setProgress(((i + 1) / totalFiles) * 90);
      }

      const mergedPdfBytes = await mergedPdf.save();
      setProgress(100);

      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);

      toast.success('PDFs merged successfully!');
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast.error('Failed to merge PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadMergedPDF = () => {
    if (!mergedPdfUrl) return;
    
    const link = document.createElement('a');
    link.href = mergedPdfUrl;
    link.download = 'merged-document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        
        <h1 className="text-2xl font-bold">PDF Editor</h1>
        
        <div></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* PDF Previews */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Selected PDF Files ({files.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      File #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={onAddMoreFiles}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add More PDFs
              </Button>

              {isProcessing && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Merging Progress</p>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <Button
                onClick={mergePDFs}
                disabled={files.length < 2 || isProcessing}
                className="w-full"
              >
                <Merge className="h-4 w-4 mr-2" />
                {isProcessing ? 'Merging...' : 'Merge PDFs'}
              </Button>

              {mergedPdfUrl && (
                <Button
                  onClick={downloadMergedPDF}
                  variant="secondary"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Merged PDF
                </Button>
              )}
            </CardContent>
          </Card>

          {mergedPdfUrl && (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-green-600 dark:text-green-400 mb-2">✅</div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    PDFs merged successfully!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Click the download button to save your merged document.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;