import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-out',
  },
  modal: {
    background: '#252545',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '340px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    animation: 'slideUp 0.2s ease-out',
  },
  title: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '16px',
    textAlign: 'center',
  },
};

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {title && <h3 style={styles.title}>{title}</h3>}
        {children}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const buttonStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  button: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  cancel: {
    background: '#444',
    color: '#fff',
  },
  confirm: {
    background: '#4dabf7',
    color: '#000',
  },
};

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{ color: '#ccc', textAlign: 'center', lineHeight: 1.5 }}>{message}</p>
      <div style={buttonStyles.container}>
        <button
          style={{ ...buttonStyles.button, ...buttonStyles.cancel }}
          onClick={onClose}
        >
          Nie
        </button>
        <button
          style={{ ...buttonStyles.button, ...buttonStyles.confirm }}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Tak
        </button>
      </div>
    </Modal>
  );
}
