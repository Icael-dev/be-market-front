import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  folder?: string;
  multiple?: boolean;
  single?: boolean;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  folder = 'products',
  multiple = true,
  single = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('folder', folder);

    const res = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: fd,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('be_market_jwt_token') || ''}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.errors?.image?.[0] || err.error || `Upload failed (${res.status})`);
    }

    const data = await res.json();
    return data.url;
  }, [folder]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setCameraError(null);

    const remaining = single ? 1 : maxFiles - value.length;
    const toUpload = Array.from(files).slice(0, remaining);

    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const url = await uploadFile(file);
        urls.push(url);
      }
      if (single) {
        onChange(urls);
      } else {
        onChange([...value, ...urls]);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setCameraError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [single, maxFiles, value, onChange, uploadFile]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('La camera n\'est pas supportee par ce navigateur. Utilisez l\'upload.');
      return;
    }
    try {
      const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isMobile ? 'environment' : 'user' },
        audio: false,
      });
      setStream(mediaStream);
      setCameraOpen(true);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Impossible d\'acceder a la camera. Autorisez l\'acces ou utilisez l\'upload.');
      setCameraOpen(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    setCameraOpen(false);
    setCameraError(null);
  }, [stream]);

  useEffect(() => {
    if (!cameraOpen) return;
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    }
  }, [cameraOpen, stream]);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !stream) {
      setCameraError('Camera non disponible. Fermez et rouvrez la camera.');
      return;
    }

    if (!video.videoWidth) {
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('video-timeout')), 3000);
          const check = () => {
            if (video.videoWidth) {
              clearTimeout(timeout);
              resolve();
            } else {
              requestAnimationFrame(check);
            }
          };
          check();
        });
      } catch {
        setCameraError('Flux video non pret. Patientez une seconde ou rouvrez la camera.');
        return;
      }
    }

    const maxDim = 1280;
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });

    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange([...value, url]);
      stopCamera();
    } catch (err) {
      console.error('Capture upload error:', err);
      const status = (err as { status?: number }).status;
      if (status === 413 || status === 422) {
        setCameraError('Photo trop lourde ou format non supporte. Utilisez une image JPEG/PNG de moins de 10 Mo.');
      } else if (err instanceof TypeError) {
        setCameraError('Impossible de joindre le serveur (probleme CORS ou reseau). Verifiez que le backend est demarre et autorise cette origine, puis reessayez.');
      } else {
        setCameraError('Erreur lors de l\'envoi de la photo. Reessayez.');
      }
    } finally {
      setUploading(false);
    }
  }, [stream, uploadFile, value, onChange, stopCamera]);

  const removeImage = useCallback((url: string) => {
    onChange(value.filter(img => img !== url));
  }, [value, onChange]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  const displayValue = single ? (value[0] ? [value[0]] : []) : value;

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple && !single}
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || cameraOpen || (single ? displayValue.length > 0 : displayValue.length >= maxFiles)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          <span className="text-sm font-medium">
            {uploading ? 'Upload...' : (single ? (displayValue.length > 0 ? 'Changer l\'image' : 'Choisir une image') : (displayValue.length >= maxFiles ? 'Limite atteinte' : 'Choisir des images'))}
          </span>
        </button>
        <button
          type="button"
          onClick={cameraOpen ? stopCamera : startCamera}
          disabled={uploading || value.length >= maxFiles}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors disabled:opacity-50"
        >
          <Camera className="w-5 h-5" />
          <span className="text-sm font-medium">
            {cameraOpen ? 'Fermer la camera' : 'Prendre une photo'}
          </span>
        </button>
      </div>

      {cameraError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">{cameraError}</p>
        </div>
      )}

      {cameraOpen && (
        <div className="relative bg-black rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            className="w-full h-64 object-contain"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <button
              type="button"
              onClick={capturePhoto}
              disabled={uploading}
              className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              Capturer
            </button>
          </div>
        </div>
      )}

      {displayValue.length > 0 && (
        <div className={single ? "" : "grid grid-cols-4 gap-3"}>
          {displayValue.map((url, idx) => (
            <div key={idx} className="relative group">
              <img
                src={url}
                alt={single ? "Image" : `Upload ${idx + 1}`}
                className={single ? "w-full h-40 object-cover rounded-lg border dark:border-gray-700" : "w-full h-24 object-cover rounded-lg border dark:border-gray-700"}
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
