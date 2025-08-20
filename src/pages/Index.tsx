import PDFMerger from '@/components/PDFMerger';
import Navbar from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-8">
        <PDFMerger />
      </div>
    </div>
  );
};

export default Index;
