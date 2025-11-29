import { useState } from 'react';
import { useI18n } from '../../i18n/useI18n';

interface MediaUploadFieldProps {
  label: string;
  accept: string; // e.g., "video/*" or "image/*"
  value: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
}

export default function MediaUploadField({
  label,
  accept,
  value,
  onChange,
  required = false,
}: MediaUploadFieldProps) {
  const { t } = useI18n();
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);

    // Create preview URL
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Validate file type
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const isValid = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return file.type.startsWith(category + '/');
        }
        return file.type === type;
      });

      if (isValid) {
        onChange(file);
        const url = URL.createObjectURL(file);
        setPreview(url);
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {!value ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`file-${label}`}
            required={required}
          />
          <label
            htmlFor={`file-${label}`}
            className="cursor-pointer flex flex-col items-center"
          >
            <svg
              className={`w-12 h-12 mb-2 transition-colors ${
                isDragging ? 'text-blue-500' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className={`text-sm ${isDragging ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
              {isDragging ? t.mediaUpload.dropHere || 'Drop file here' : t.mediaUpload.clickToUpload.replace('{type}', accept.split('/')[0])}
            </span>
            {!isDragging && (
              <span className="text-xs text-gray-500 mt-1">
                {accept === 'video/*' ? t.mediaUpload.videoTypes : accept === 'image/*' ? t.mediaUpload.imageTypes : 'MP3, WAV, etc.'}
              </span>
            )}
          </label>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{value.name}</span>
            <button
              type="button"
              onClick={handleRemove}
              className="cursor-pointer text-red-500 hover:text-red-700 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="text-xs text-gray-500 mb-3">
            {(value.size / 1024 / 1024).toFixed(2)} {t.mediaUpload.mb}
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-2">
              {accept.startsWith('video') ? (
                <video
                  src={preview}
                  controls
                  className="w-full max-h-48 rounded-lg bg-black"
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-48 object-contain rounded-lg bg-gray-100"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
