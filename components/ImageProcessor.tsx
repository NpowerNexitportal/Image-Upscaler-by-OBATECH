import React, { useState, useCallback, useRef } from 'react';
import { UpscaleFactor } from '../types';
import { upscaleImage } from '../services/geminiService';
import { UploadIcon } from './icons/UploadIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Spinner } from './Spinner';

const ImageProcessor: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [upscaledImageUrl, setUpscaledImageUrl] = useState<string | null>(null);
  const [scaleFactor, setScaleFactor] = useState<UpscaleFactor>(UpscaleFactor.TWO_X);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setUpscaledImageUrl(null);
      setError(null);
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

  const renderInitialView = () => (
    <div className="w-full max-w-2xl text-center">
      <div 
        className="border-2 border-dashed border-gray-600 rounded-2xl p-12 hover:border-pink-500 transition-all duration-300 cursor-pointer bg-gray-800/20"
        onClick={triggerFileSelect}
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
        accept="image/png, image/jpeg, image/webp"
      />
    </div>
  );

  const renderProcessingView = () => (
    <div className="w-full flex flex-col lg:flex-row gap-8 bg-gray-800/30 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
      {/* Controls Panel */}
      <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col space-y-6">
        <h2 className="text-2xl font-bold border-b border-gray-700 pb-3">Upscale Options</h2>
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
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
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