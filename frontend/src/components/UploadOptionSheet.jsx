import React from "react";
import "./UploadOptionSheet.css";

function UploadOptionsSheet({ open, onClose, onSelect }) {
  if (!open) return null;

  const options = [
    {
      id: "camera",
      label: "Take a photo",
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
    },
    {
      id: "gallery",
      label: "from gallery",
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
    {
      id: "files",
      label: "Upload files",
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="sheet-backdrop" onClick={onClose} />

      {/* Bottom Sheet */}
      <div className="upload-options-sheet">
        {/* Drag Handle */}
        <div className="sheet-handle" />

        <p className="sheet-title">Add a record</p>

        <div className="sheet-options">
          {options.map((opt) => (
            <button
              key={opt.id}
              className="sheet-option-btn"
              onClick={() => {
                onSelect(opt.id);
                onClose();
              }}
            >
              <div className="sheet-option-icon">{opt.icon}</div>
              <span className="sheet-option-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default UploadOptionsSheet;
