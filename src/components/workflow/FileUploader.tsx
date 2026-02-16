import React, { useCallback, useState } from 'react';
import { UploadedFile } from '../../types/index.ts';
import { XCircleIcon } from '../shared/Icons.tsx';

interface FileUploaderProps {
    files: UploadedFile[];
    onFilesChange: (files: UploadedFile[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ files, onFilesChange }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileRead = (file: File): Promise<UploadedFile> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                const uploadedFile: UploadedFile = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                };
                
                const textMimeTypes = ['text/plain', 'text/markdown', 'text/csv', 'application/json'];
                const isTextFile = textMimeTypes.includes(file.type) || 
                                   file.name.endsWith('.md') || 
                                   file.name.endsWith('.csv') || 
                                   file.name.endsWith('.json') || 
                                   file.name.endsWith('.txt');

                if (isTextFile) {
                    uploadedFile.textContent = result;
                } else { // Images, PDF, XLSX, etc., are treated as binary and encoded.
                    // result from readAsDataURL is "data:mime/type;base64,ENCODED_DATA"
                    uploadedFile.base64 = result.split(',')[1];
                }
                resolve(uploadedFile);
            };
            reader.onerror = reject;

            const textMimeTypesForRead = ['text/plain', 'text/markdown', 'text/csv', 'application/json'];
             const isTextFileForRead = textMimeTypesForRead.includes(file.type) || 
                                   file.name.endsWith('.md') || 
                                   file.name.endsWith('.csv') || 
                                   file.name.endsWith('.json') || 
                                   file.name.endsWith('.txt');

            if (isTextFileForRead) {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file); // Default to base64 for everything else (images, pdf, xlsx)
            }
        });
    };

    const processFiles = useCallback(async (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        
        const newFilePromises = Array.from(selectedFiles)
            .filter(file => !files.some(existing => existing.name === file.name)) // Avoid duplicates
            .map(handleFileRead);
            
        if (newFilePromises.length === 0) return;

        const newFiles = await Promise.all(newFilePromises);

        onFilesChange([...files, ...newFiles]);
    }, [files, onFilesChange]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
    }, [processFiles]);

    const handleDragEvent = (e: React.DragEvent<HTMLLabelElement>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isEntering);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        // Reset file input to allow selecting the same file again
        e.target.value = '';
    };

    const handleRemoveFile = (fileNameToRemove: string) => {
        onFilesChange(files.filter(f => f.name !== fileNameToRemove));
    };

    return (
        <div className="flex flex-col gap-2">
            <label 
                htmlFor="file-upload" 
                onDrop={handleDrop}
                onDragOver={(e) => handleDragEvent(e, true)}
                onDragEnter={(e) => handleDragEvent(e, true)}
                onDragLeave={(e) => handleDragEvent(e, false)}
                className={`flex flex-col items-center justify-center w-full h-24 px-4 transition bg-slate-900 border-2 ${isDragging ? 'border-teal-400' : 'border-slate-700'} border-dashed rounded-md appearance-none cursor-pointer hover:border-slate-500 focus:outline-none`}
            >
                <span className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="font-medium text-gray-500">
                        Arrastra archivos, o <span className="text-teal-400 underline">navega</span>
                    </span>
                </span>
                 <p className="text-xs text-gray-600 mt-1">Soporta: Imágenes, txt, md, csv, json, pdf, xlsx</p>
                <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileSelect} accept="image/*,text/plain,.md,.csv,application/json,.pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" />
            </label>
            {files.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs">
                    {files.map(file => (
                        <div key={file.name} className="flex items-center gap-1.5 bg-slate-700 text-gray-200 px-2 py-1 rounded-full animate-fade-in">
                            <span>{file.name}</span>
                            <button onClick={() => handleRemoveFile(file.name)} className="hover:text-red-400">
                                <XCircleIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUploader;