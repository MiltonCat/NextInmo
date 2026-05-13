"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Toast({ message, linkText, link, onClose, delay = 5000 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 2000);
    const closeTimer = setTimeout(() => handleClose(), delay + 2000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [delay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible && !message) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-white rounded-xl shadow-2xl border-2 border-[#FF5A5F] p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">🏠</div>
          <div className="flex-1">
            <p className="text-gray-700 text-sm">{message}</p>
            {linkText && link && (
              <Link
                href={link}
                className="text-[#FF5A5F] text-sm font-medium hover:underline mt-1 block"
              >
                {linkText} →
              </Link>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
