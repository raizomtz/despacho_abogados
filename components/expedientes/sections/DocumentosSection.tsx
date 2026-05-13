'use client';

import { File, Upload, Download, Trash2, FileText, FileImage, FileArchive } from 'lucide-react';
import Section from './Section';

const documentosPrueba = [
  { id: 1, nombre: 'INE Cliente.pdf', tipo: 'pdf', fecha: '10/01/2024', size: '1.2 MB' },
  { id: 2, nombre: 'Acta Nacimiento.pdf', tipo: 'pdf', fecha: '10/01/2024', size: '0.8 MB' },
  { id: 3, nombre: 'Comprobante Domicilio.jpg', tipo: 'image', fecha: '12/01/2024', size: '0.5 MB' },
  { id: 4, nombre: 'Poder Notarial.pdf', tipo: 'pdf', fecha: '15/01/2024', size: '1.5 MB' },
];

const getIcon = (tipo: string) => {
  if (tipo === 'pdf') return <FileText size={18} className="text-red-500" />;
  if (tipo === 'image') return <FileImage size={18} className="text-blue-500" />;
  return <FileArchive size={18} className="text-yellow-500" />;
};

export default function DocumentosSection() {
  return (
    <Section title="Documentos" icon={<File size={22} />} defaultOpen={true}>
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#C6A43F] transition-colors cursor-pointer">
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Subir nuevo documento</p>
        </div>
        
        <div className="space-y-2">
          {documentosPrueba.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                {getIcon(doc.tipo)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.nombre}</p>
                  <p className="text-xs text-gray-500">{doc.fecha} • {doc.size}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-gray-600 hover:text-[#C6A43F] transition-colors">
                  <Download size={16} />
                </button>
                <button className="text-gray-600 hover:text-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}