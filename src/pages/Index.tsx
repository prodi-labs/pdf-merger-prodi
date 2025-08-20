import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Home from '@/components/Home';
import Editor from '@/components/Editor';

type View = 'home' | 'editor';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setCurrentView('editor');
  };

  const handleAddMoreFiles = (newFiles: File[]) => {
    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const handleBackToHome = () => {
    setSelectedFiles([]);
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {currentView === 'home' ? (
        <Home onFilesSelected={handleFilesSelected} />
      ) : (
        <Editor 
          files={selectedFiles}
          onAddMoreFiles={handleAddMoreFiles}
          onRemoveFile={handleRemoveFile}
          onBack={handleBackToHome}
        />
      )}
    </div>
  );
};

export default Index;
