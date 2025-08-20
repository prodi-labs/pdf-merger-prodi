import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { ArrowLeft, Download, FileText, Merge, Plus, X, GripVertical } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Configure PDF.js with proper worker for Vite
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

interface EditorProps {
  files: File[];
  onAddMoreFiles: (newFiles: File[]) => void;
  onRemoveFile: (index: number) => void;
  onReorderFiles: (files: File[]) => void;
  onBack: () => void;
}

// Sortable PDF Card Component
interface SortablePDFCardProps {
  file: File;
  index: number;
  preview: string;
  onRemove: (index: number) => void;
}

const SortablePDFCard = ({ file, index, preview, onRemove }: SortablePDFCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.name + index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      className={`overflow-hidden group relative hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing hover:cursor-grab ${isDragging ? 'z-50' : ''}`}
    >
      <CardContent className="p-4">

        {/* Delete button - only visible on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove(index);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className="absolute top-3 right-3 z-50 w-6 h-6 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200 cursor-pointer"
          aria-label={`Remove ${file.name}`}
          style={{ pointerEvents: 'auto' }}
        >
          <X className="h-3 w-3 text-gray-600 hover:text-red-600" />
        </button>

        {/* PDF Preview */}
        <div className="aspect-[3/4] mb-3 bg-muted rounded border flex items-center justify-center overflow-hidden">
          {preview ? (
            <img
              src={preview}
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
            {(file.size / (1024 * 1024)).toFixed(2)} MB • Position #{index + 1}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const Editor = ({ files, onAddMoreFiles, onRemoveFile, onReorderFiles, onBack }: EditorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfPreviews, setPdfPreviews] = useState<{[key: string]: string}>({});
  const [isDragOver, setIsDragOver] = useState(false);

  // File drag and drop handlers
  const handleFileDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Only hide drop zone if cursor is completely outside the element
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );

    if (droppedFiles.length > 0) {
      onAddMoreFiles(droppedFiles);
      toast.success(`Added ${droppedFiles.length} PDF file(s)`);
    } else {
      toast.error('Please drop only PDF files');
    }
  };

  // Configure drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for reordering
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = files.findIndex((file, index) => file.name + index === active.id);
      const newIndex = files.findIndex((file, index) => file.name + index === over.id);
      
      const reorderedFiles = arrayMove(files, oldIndex, newIndex);
      onReorderFiles(reorderedFiles);
      toast.success('PDFs reordered successfully');
    }
  };

  // Generate PDF previews when files change - render actual PDF pages
  useEffect(() => {
    const generatePreviews = async () => {
      const previews: {[key: string]: string} = {};
      
      for (const file of files) {
        try {
          console.log('Generating actual PDF preview for:', file.name);
          const arrayBuffer = await file.arrayBuffer();
          
          const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            verbosity: 0 // Reduce console noise
          });
          
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            console.error('Could not get canvas context for', file.name);
            continue;
          }
          
          // Get viewport and scale it down for thumbnail
          const viewport = page.getViewport({ scale: 1.0 });
          const scale = Math.min(300 / viewport.width, 400 / viewport.height);
          const scaledViewport = page.getViewport({ scale });
          
          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;
          
          // Render PDF page to canvas
          const renderContext = {
            canvasContext: context,
            viewport: scaledViewport,
            canvas: canvas
          };
          
          await page.render(renderContext).promise;
          previews[file.name] = canvas.toDataURL('image/jpeg', 0.8);
          console.log('Successfully generated PDF preview for:', file.name);
        } catch (error) {
          console.error('Error generating PDF preview for', file.name, error);
          // Fallback to placeholder
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

    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();

      // Auto-download the merged PDF
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      URL.revokeObjectURL(url);

      toast.success('PDFs merged successfully and downloaded!', {
        duration: 3000
      });
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast.error('Failed to merge PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
          {/* Drop zone wrapper */}
          <div 
            onDragEnter={handleFileDragEnter}
            onDragLeave={handleFileDragLeave}
            onDragOver={handleFileDragOver}
            onDrop={handleFileDrop}
            className={`relative min-h-[400px] rounded-lg border-2 border-dashed transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5 border-primary/50' 
                : 'border-gray-200 bg-gray-50/50'
            }`}
          >
            {/* Drop zone hint */}
            {files.length === 0 || isDragOver ? (
              <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 transition-opacity ${
                isDragOver ? 'opacity-100' : 'opacity-70'
              }`}>
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    {isDragOver ? 'Drop PDFs here' : 'Drag and drop PDF files here'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Or use the "Add More PDFs" button to browse files
                  </p>
                </div>
              </div>
            ) : null}
            
            {/* Existing content */}
            <div className={`relative z-20 p-6 ${files.length === 0 ? 'opacity-0' : 'opacity-100'}`}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Selected PDF Files ({files.length})</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop to reorder • Files will be merged in this order
                </p>
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={files.map((file, index) => file.name + index)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map((file, index) => (
                        <SortablePDFCard
                          key={file.name + index}
                          file={file}
                          index={index}
                          preview={pdfPreviews[file.name]}
                          onRemove={onRemoveFile}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
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

              <Button
                onClick={mergePDFs}
                disabled={files.length < 2 || isProcessing}
                className="w-full"
              >
                <Merge className="h-4 w-4 mr-2" />
                {isProcessing ? 'Merging...' : 'Merge PDFs'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Editor;