'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  type = 'danger'
}: ConfirmModalProps) {
  
  const colors = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700',
      icon: 'text-red-600'
    },
    warning: {
      button: 'bg-yellow-600 hover:bg-yellow-700',
      icon: 'text-yellow-600'
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700',
      icon: 'text-blue-600'
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full bg-gray-100 ${colors[type].icon}`}>
                  <AlertTriangle size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              </div>
              
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${colors[type].button}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}