
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UpscaleFactor } from '../types';
import { upscaleImage } from '../services/geminiService';
import { UploadIcon } from './icons/UploadIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Spinner } from './Spinner';
import { ErrorIcon } from './icons/ErrorIcon';

const ImageProcessor: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [upscaledImageUrl, setUpscaledImageUrl] = useState<string | null>(null);
  const [scaleFactor, setScaleFactor] = useState<UpscaleFactor>(UpscaleFactor.TWO_X);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];

  useEffect(() => {
    // Clean up the object URL to avoid memory leaks
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const processFile = (file: File) => {
    if (file && acceptedMimeTypes.includes(file.type)) {
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setUpscaledImageUrl(null);
      setError(null);
    } else {
      setError(`Invalid file type. Please upload a PNG, JPEG, or WEBP image.`);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpscale = useCallback(async () => {
    if (!originalFile) return;

    setIsLoading(true);
    setError(null);
    setUpscaledImageUrl(null);

    try {
      const resultUrl = await upscaleImage(originalFile, scaleFactor);
      setUpscaledImageUrl(resultUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [originalFile, scaleFactor]);

  const handleReset = useCallback(() => {
    setOriginalFile(null);
    setPreviewUrl(null);
    setUpscaledImageUrl(null);
    setError(null);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const renderInitialView = () => (
    <div className="w-full max-w-2xl text-center">
      <div 
        className={`border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer bg-gray-800/20 ${
            isDragging 
            ? 'border-pink-500 border-solid scale-105 shadow-2xl shadow-pink-500/20' 
            : 'border-gray-600 hover:border-pink-500'
        }`}
        onClick={triggerFileSelect}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadIcon className="mx-auto h-16 w-16 text-gray-500 mb-4" />
        <h2 className="text-xl font-semibold text-white">Select Image</h2>
        <p className="text-gray-400 mt-2">Click here or drag and drop an image file</p>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={acceptedMimeTypes.join(',')}
      />
      {error && !originalFile && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start space-x-3 max-w-md mx-auto">
          <ErrorIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm text-left">{error}</p>
        </div>
      )}
    </div>
  );

  const renderProcessingView = () => (
    <div className="w-full flex flex-col lg:flex-row gap-8 bg-gray-800/30 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
      {/* Controls Panel */}
      <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col">
        <h2 className="text-2xl font-bold border-b border-gray-700 pb-3 mb-6">Upscale Options</h2>
        <div className="flex-grow space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Upscale To</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setScaleFactor(UpscaleFactor.TWO_X)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${scaleFactor === UpscaleFactor.TWO_X ? 'bg-pink-600 text-white shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                2X Upscale
              </button>
              <button
                onClick={() => setScaleFactor(UpscaleFactor.FOUR_X)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${scaleFactor === UpscaleFactor.FOUR_X ? 'bg-pink-600 text-white shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                4X Upscale
              </button>
            </div>
          </div>
          <button
            onClick={handleUpscale}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-violet-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading && <Spinner />}
            <span>{isLoading ? 'Upscaling...' : 'Upscale'}</span>
          </button>
          
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start space-x-3">
              <ErrorIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {upscaledImageUrl && !isLoading && (
              <a
                  href={upscaledImageUrl}
                  download={`upscaled_${originalFile?.name || 'image.png'}`}
                  className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-center"
              >
                  <DownloadIcon className="h-5 w-5" />
                  <span>Download</span>
              </a>
          )}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700/50">
            <button
                onClick={handleReset}
                className="w-full py-3 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 text-center"
            >
                <span>Start Over</span>
            </button>
        </div>
      </div>

      {/* Image Preview Area */}
      <div className="w-full lg:w-2/3 xl:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Original</h3>
          <div className="w-full aspect-square bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
            {previewUrl && <img src={previewUrl} alt="Original" className="w-full h-full object-contain" />}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Upscaled</h3>
          <div className="w-full aspect-square bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
            {isLoading && <Spinner size="lg" />}
            {upscaledImageUrl && !isLoading && <img src={upscaledImageUrl} alt="Upscaled" className="w-full h-full object-contain" />}
            {!isLoading && !upscaledImageUrl && <div className="text-gray-500">Result will appear here</div>}
          </div>
        </div>
      </div>
    </div>
  );


  return originalFile ? renderProcessingView() : renderInitialView();
};

export default ImageProcessor;
