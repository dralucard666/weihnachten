import { useState } from 'react';

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
  const [preview, setPreview] = useState<string | null>(null);

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

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {!value ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
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
              className="w-12 h-12 text-gray-400 mb-2"
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
            <span className="text-sm text-gray-600">Click to upload {accept.split('/')[0]}</span>
            <span className="text-xs text-gray-500 mt-1">
              {accept === 'video/*' ? 'MP4, WebM, etc.' : 'JPG, PNG, etc.'}
            </span>
          </label>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{value.name}</span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="text-xs text-gray-500 mb-3">
            {(value.size / 1024 / 1024).toFixed(2)} MB
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
