'use client';

import { FileText, Upload, Download } from 'lucide-react';
import Section from './Section';

export default function ExpedientePdfSection() {
  return (
    <Section title="Expediente PDF" icon={<FileText size={22} />}>
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#C6A43F] transition-colors cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Arrastra o haz clic para subir el expediente PDF</p>
          <p className="text-sm text-gray-400 mt-1">PDF hasta 10MB</p>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="text-[#C6A43F]" size={20} />
            <div>
              <p className="text-sm font-medium text-gray-900">expediente_completo.pdf</p>
              <p className="text-xs text-gray-500">Subido: 15/01/2024 • 2.3 MB</p>
            </div>
          </div>
          <button className="text-gray-600 hover:text-[#C6A43F] transition-colors">
            <Download size={18} />
          </button>
        </div>
      </div>
    </Section>
  );
}