import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

createRoot(document.getElementById("root")!).render(<App />);
