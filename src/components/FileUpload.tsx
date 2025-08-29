import React, { useRef } from 'react';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import { readExcelFile, downloadExcelTemplate } from '../utils/excelReader';
import { DonationData } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: DonationData) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await readExcelFile(file);
      onDataLoaded(data);
    } catch (error) {
      alert('Error reading Excel file. Please check the format and try again.');
      console.error('Excel read error:', error);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-slate-800">Excel Database</h3>
            <p className="text-sm text-slate-600">Upload your donations Excel file</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={downloadExcelTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
          
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
          >
            <Upload className="w-4 h-4" />
            Upload Excel File
          </button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};