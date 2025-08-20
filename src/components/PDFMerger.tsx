import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import { Upload, Download, FileText, Merge } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

const PDFMerger = () => {
  const [firstPdf, setFirstPdf] = useState<File | null>(null);
  const [secondPdf, setSecondPdf] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (file: File, isFirst: boolean) => {
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    
    if (isFirst) {
      setFirstPdf(file);
    } else {
      setSecondPdf(file);
    }
    toast.success(`${isFirst ? 'First' : 'Second'} PDF uploaded successfully`);
  };

  const mergePDFs = async () => {
    if (!firstPdf || !secondPdf) {
      toast.error('Please upload both PDF files');
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      // Read the first PDF file
      const firstPdfArrayBuffer = await firstPdf.arrayBuffer();
      setProgress(30);
      
      // Read the second PDF file
      const secondPdfArrayBuffer = await secondPdf.arrayBuffer();
      setProgress(50);

      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();
      setProgress(60);

      // Load the first PDF
      const firstPdfDoc = await PDFDocument.load(firstPdfArrayBuffer);
      const firstPdfPages = await mergedPdf.copyPages(firstPdfDoc, firstPdfDoc.getPageIndices());
      setProgress(70);

      // Add pages from first PDF
      firstPdfPages.forEach((page) => mergedPdf.addPage(page));
      setProgress(80);

      // Load the second PDF
      const secondPdfDoc = await PDFDocument.load(secondPdfArrayBuffer);
      const secondPdfPages = await mergedPdf.copyPages(secondPdfDoc, secondPdfDoc.getPageIndices());
      setProgress(90);

      // Add pages from second PDF
      secondPdfPages.forEach((page) => mergedPdf.addPage(page));

      // Serialize the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      setProgress(100);

      // Create download URL
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

  const reset = () => {
    setFirstPdf(null);
    setSecondPdf(null);
    setMergedPdfUrl(null);
    setProgress(0);
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-3xl">
            <Merge className="h-8 w-8 text-primary" />
            PDF Merger Tool
          </CardTitle>
          <CardDescription>
            Upload two PDF files and merge them into a single document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* First PDF Upload */}
            <div className="space-y-2">
              <Label htmlFor="first-pdf">First PDF Document</Label>
              <div className="relative">
                <Input
                  id="first-pdf"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, true);
                  }}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full h-32 border-dashed border-2 flex flex-col items-center justify-center gap-2"
                  onClick={() => document.getElementById('first-pdf')?.click()}
                >
                  {firstPdf ? (
                    <>
                      <FileText className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium">{firstPdf.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(firstPdf.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8" />
                      <span>Upload First PDF</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Second PDF Upload */}
            <div className="space-y-2">
              <Label htmlFor="second-pdf">Second PDF Document</Label>
              <div className="relative">
                <Input
                  id="second-pdf"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, false);
                  }}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full h-32 border-dashed border-2 flex flex-col items-center justify-center gap-2"
                  onClick={() => document.getElementById('second-pdf')?.click()}
                >
                  {secondPdf ? (
                    <>
                      <FileText className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium">{secondPdf.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(secondPdf.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8" />
                      <span>Upload Second PDF</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <Label>Merging Progress</Label>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={mergePDFs}
              disabled={!firstPdf || !secondPdf || isProcessing}
              className="flex-1"
            >
              <Merge className="h-4 w-4 mr-2" />
              {isProcessing ? 'Merging...' : 'Merge PDFs'}
            </Button>
            
            {mergedPdfUrl && (
              <Button
                onClick={downloadMergedPDF}
                variant="secondary"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Merged PDF
              </Button>
            )}
            
            <Button
              onClick={reset}
              variant="outline"
              className="flex-1"
            >
              Reset
            </Button>
          </div>

          {/* Success Message */}
          {mergedPdfUrl && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                ✅ Your PDFs have been successfully merged! Click the download button above to save the merged document.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFMerger;