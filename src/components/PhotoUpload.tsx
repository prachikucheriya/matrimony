"use client";

import { ChangeEvent, useRef, useState } from "react";

type PhotoUploadProps = {
  currentUrl?: string | null;
  onUploaded?: (url: string) => void;
};

export function PhotoUpload({ currentUrl, onUploaded }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setMessage(null);
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function upload() {
    if (!pendingFile) {
      setError("Please choose a photo first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("photo", pendingFile);
      const response = await fetch("/api/profile/photo", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      setPreview(data.photoUrl);
      setPendingFile(null);
      setMessage("Photo uploaded.");
      onUploaded?.(data.photoUrl);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="photo-upload">
      <div className="photo-preview">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Profile preview" />
        ) : (
          <span>No photo</span>
        )}
      </div>

      <div className="photo-actions">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={onPick}
        />
        <button
          type="button"
          className="btn-ghost"
          onClick={() => inputRef.current?.click()}
        >
          Choose photo
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={loading || !pendingFile}
          onClick={upload}
        >
          {loading ? "Uploading…" : "Upload"}
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {message ? <p className="form-hint">{message}</p> : null}
    </div>
  );
}

type PendingPhotoPickerProps = {
  preview: string | null;
  onPick: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function PendingPhotoPicker({ preview, onPick }: PendingPhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="photo-upload">
      <div className="photo-preview">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Selected profile photo" />
        ) : (
          <span>Add a photo</span>
        )}
      </div>
      <div className="photo-actions">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={onPick}
        />
        <button
          type="button"
          className="btn-ghost"
          onClick={() => inputRef.current?.click()}
        >
          {preview ? "Change photo" : "Choose photo"}
        </button>
      </div>
      <p className="otp-dev-note">Optional — JPG/PNG/WEBP, max 5MB. You can also add later.</p>
    </div>
  );
}
