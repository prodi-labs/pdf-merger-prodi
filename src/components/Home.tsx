import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface HomeProps {
  onFilesSelected: (files: File[]) => void;
}

const Home = ({ onFilesSelected }: HomeProps) => {
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      toast.error('Please select PDF files only');
      return;
    }
    
    if (pdfFiles.length !== files.length) {
      toast.error('Some files were ignored. Only PDF files are supported.');
    }
    
    onFilesSelected(pdfFiles);
    toast.success(`${pdfFiles.length} PDF file(s) selected successfully`);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          PDF Merger Tool
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload multiple PDF files and merge them into a single document. 
          Simply drag and drop your files or click to select them from your computer.
        </p>
      </div>

      <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
        <CardContent className="p-12">
          <div
            className="flex flex-col items-center justify-center min-h-[300px] space-y-6"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="p-4 rounded-full bg-primary/10">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Drop your PDF files here</h3>
              <p className="text-muted-foreground">
                or click the button below to select files from your computer
              </p>
            </div>

            <input
              id="pdf-files"
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <Button
              size="lg"
              onClick={() => document.getElementById('pdf-files')?.click()}
              className="px-8 py-3"
            >
              <Upload className="h-5 w-5 mr-2" />
              Select PDF Files
            </Button>

            <p className="text-sm text-muted-foreground">
              Supports multiple PDF files • Max file size: 10MB each
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;