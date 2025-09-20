import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-midnight-blue/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative w-full max-w-md mx-auto bg-marble border-2 border-bronze rounded-xl shadow-2xl
                      transform transition-all duration-300 animate-slide-up">
        {/* Decorative header */}
        <div className="relative bg-gradient-to-r from-bronze/10 to-amber-100/20 rounded-t-xl p-4 border-b border-bronze/20">
          {/* Greek pattern decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bronze via-amber-400 to-bronze"></div>
          
          <div className="flex items-center justify-between">
            {title && (
              <h3 className="font-cinzel font-semibold text-lg text-midnight-blue">
                {title}
              </h3>
            )}
            <button
              onClick={onClose}
              className="ml-auto p-1 rounded-full hover:bg-bronze/10 transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-bronze/50"
            >
              <X className="w-5 h-5 text-bronze" />
            </button>
          </div>
        </div>
        
        {/* Modal body */}
        <div className="p-6">
          {children}
        </div>
        
        {/* Decorative footer */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-bronze via-amber-400 to-bronze rounded-b-xl"></div>
      </div>
    </div>
  );
};

export default Modal;