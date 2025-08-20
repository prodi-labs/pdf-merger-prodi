import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import { ArrowLeft, Download, FileText, Merge, Plus } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

// Alternative approach - use PDF-lib for preview generation instead of pdfjs-dist

interface EditorProps {
  files: File[];
  onAddMoreFiles: (newFiles: File[]) => void;
  onBack: () => void;
}

const Editor = ({ files, onAddMoreFiles, onBack }: EditorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [pdfPreviews, setPdfPreviews] = useState<{[key: string]: string}>({});

  // Generate PDF previews when files change - using a simpler approach without pdfjs
  useEffect(() => {
    const generatePreviews = async () => {
      const previews: {[key: string]: string} = {};
      
      for (const file of files) {
        try {
          console.log('Creating placeholder preview for:', file.name);
          
          // Create a simple placeholder preview using canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            console.error('Could not get canvas context for', file.name);
            continue;
          }
          
          // Set canvas size for a document-like preview
          canvas.width = 200;
          canvas.height = 280;
          
          // Draw a simple document preview
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw border
          context.strokeStyle = '#e5e7eb';
          context.lineWidth = 2;
          context.strokeRect(0, 0, canvas.width, canvas.height);
          
          // Draw header area
          context.fillStyle = '#f3f4f6';
          context.fillRect(10, 10, canvas.width - 20, 40);
          
          // Draw content lines
          context.fillStyle = '#d1d5db';
          for (let i = 0; i < 8; i++) {
            const y = 70 + i * 20;
            context.fillRect(20, y, canvas.width - 40, 3);
          }
          
          // Draw PDF icon in center
          context.fillStyle = '#ef4444';
          context.font = 'bold 24px Arial';
          context.textAlign = 'center';
          context.fillText('PDF', canvas.width / 2, canvas.height / 2);
          
          // Draw file name at bottom
          context.fillStyle = '#374151';
          context.font = '12px Arial';
          const fileName = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
          context.fillText(fileName, canvas.width / 2, canvas.height - 15);
          
          previews[file.name] = canvas.toDataURL();
          console.log('Successfully generated placeholder preview for:', file.name);
        } catch (error) {
          console.error('Error generating preview for', file.name, error);
          previews[file.name] = '';
        }
      }
      
      setPdfPreviews(previews);
    };

    if (files.length > 0) {
      generatePreviews();
    }
  }, [files]);

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

  const handleAddMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    
    const pdfFiles = Array.from(selectedFiles).filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      toast.error('Please select PDF files only');
      return;
    }
    
    if (pdfFiles.length !== selectedFiles.length) {
      toast.error('Some files were ignored. Only PDF files are supported.');
    }
    
    onAddMoreFiles(pdfFiles);
    toast.success(`${pdfFiles.length} PDF file(s) added successfully`);
    
    // Reset the input value so the same files can be selected again if needed
    e.target.value = '';
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
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Selected PDF Files ({files.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    {/* PDF Preview */}
                    <div className="aspect-[3/4] mb-3 bg-muted rounded border flex items-center justify-center overflow-hidden">
                      {pdfPreviews[file.name] ? (
                        <img
                          src={pdfPreviews[file.name]}
                          alt={`Preview of ${file.name}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Loading preview...</span>
                        </div>
                      )}
                    </div>
                    
                    {/* PDF Info */}
                    <div className="space-y-1">
                      <p className="font-medium text-sm truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • File #{index + 1}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                id="add-more-pdfs"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleAddMoreFiles}
                className="hidden"
              />
              <Button
                onClick={() => document.getElementById('add-more-pdfs')?.click()}
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