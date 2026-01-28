import { useState, useRef, useCallback } from 'react';
import { useAppState } from '../../data/AppStateContext';
import { Invoice } from '../../data/types';
import { ConfirmModal } from './Modal';

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: '16px',
  },
  header: {
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#888',
  },
  cardStack: {
    flex: 1,
    position: 'relative',
    minHeight: '320px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: '100%',
    maxWidth: '320px',
    background: 'linear-gradient(145deg, #2a2a4a 0%, #1e1e3f 100%)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
    touchAction: 'none',
    userSelect: 'none',
    cursor: 'grab',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  invoiceNumber: {
    fontSize: '14px',
    color: '#888',
    fontFamily: 'monospace',
  },
  dueDate: {
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '8px',
    background: 'rgba(255, 193, 7, 0.2)',
    color: '#ffc107',
  },
  dueDateOverdue: {
    background: 'rgba(244, 67, 54, 0.2)',
    color: '#f44336',
  },
  contractor: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '8px',
  },
  amount: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#4dabf7',
    marginBottom: '20px',
  },
  cardMeta: {
    fontSize: '12px',
    color: '#888',
    display: 'flex',
    justifyContent: 'space-between',
  },
  swipeIndicator: {
    position: 'absolute',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'uppercase',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  swipeLeft: {
    top: '50%',
    right: '16px',
    transform: 'translateY(-50%) rotate(15deg)',
    background: '#888',
    color: '#fff',
  },
  swipeUp: {
    top: '16px',
    left: '50%',
    transform: 'translateX(-50%) rotate(-5deg)',
    background: '#4caf50',
    color: '#fff',
  },
  swipeDown: {
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%) rotate(5deg)',
    background: '#f44336',
    color: '#fff',
  },
  instructions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginTop: '8px',
  },
  instruction: {
    textAlign: 'center',
    padding: '10px 8px',
    background: '#252545',
    borderRadius: '10px',
    fontSize: '11px',
    color: '#888',
  },
  instructionIcon: {
    fontSize: '20px',
    marginBottom: '4px',
    display: 'block',
  },
  undoButton: {
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: '#444',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  statCard: {
    background: '#252545',
    borderRadius: '10px',
    padding: '12px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#fff',
  },
  statLabel: {
    fontSize: '10px',
    color: '#888',
    marginTop: '4px',
    textTransform: 'uppercase',
  },
  empty: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#888',
  },
};

const SWIPE_THRESHOLD = 80;

export function InvoicesTab() {
  const { state, dispatch } = useAppState();
  const [dragState, setDragState] = useState({ x: 0, y: 0, isDragging: false });
  const [confirmModal, setConfirmModal] = useState<{
    type: 'factoring' | 'collections';
    invoice: Invoice;
  } | null>(null);

  const startPos = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const currentInvoice = state.invoices[0];

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!cardRef.current) return;
    cardRef.current.setPointerCapture(e.pointerId);
    startPos.current = { x: e.clientX, y: e.clientY };
    setDragState({ x: 0, y: 0, isDragging: true });
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.isDragging) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setDragState({ x: dx, y: dy, isDragging: true });
  }, [dragState.isDragging]);

  const handlePointerUp = useCallback(() => {
    if (!dragState.isDragging || !currentInvoice) return;

    const { x, y } = dragState;

    // Determine swipe direction based on thresholds
    if (x < -SWIPE_THRESHOLD && Math.abs(x) > Math.abs(y)) {
      // Swipe LEFT - ignore (immediate)
      dispatch({ type: 'SWIPE_INVOICE', invoiceId: currentInvoice.id, direction: 'left' });
    } else if (y < -SWIPE_THRESHOLD && Math.abs(y) > Math.abs(x)) {
      // Swipe UP - factoring (needs confirmation)
      setConfirmModal({ type: 'factoring', invoice: currentInvoice });
    } else if (y > SWIPE_THRESHOLD && Math.abs(y) > Math.abs(x)) {
      // Swipe DOWN - collections (needs confirmation)
      setConfirmModal({ type: 'collections', invoice: currentInvoice });
    }

    setDragState({ x: 0, y: 0, isDragging: false });
  }, [dragState, currentInvoice, dispatch]);

  const handleConfirm = () => {
    if (!confirmModal) return;
    const direction = confirmModal.type === 'factoring' ? 'up' : 'down';
    dispatch({ type: 'SWIPE_INVOICE', invoiceId: confirmModal.invoice.id, direction });
    setConfirmModal(null);
  };

  const handleUndo = () => {
    dispatch({ type: 'UNDO_INVOICE' });
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date('2024-01-15');

  // Calculate indicator opacity based on drag position
  const leftOpacity = Math.min(1, Math.max(0, -dragState.x / SWIPE_THRESHOLD));
  const upOpacity = Math.min(1, Math.max(0, -dragState.y / SWIPE_THRESHOLD));
  const downOpacity = Math.min(1, Math.max(0, dragState.y / SWIPE_THRESHOLD));

  if (state.invoices.length === 0 && state.undoStack.length === 0) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Faktury</h1>
          <p style={styles.subtitle}>Zarządzaj fakturami przesuwając karty</p>
        </header>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{state.ignoredInvoices.length}</div>
            <div style={styles.statLabel}>Pominięte</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#4caf50' }}>
              {state.factoringInvoices.length}
            </div>
            <div style={styles.statLabel}>Faktoring</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#f44336' }}>
              {state.collectionsInvoices.length}
            </div>
            <div style={styles.statLabel}>Windykacja</div>
          </div>
        </div>

        <div style={styles.empty}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</p>
          <p>Wszystkie faktury zostały przetworzone!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Faktury</h1>
        <p style={styles.subtitle}>
          {state.invoices.length} faktur do przetworzenia
        </p>
      </header>

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{state.ignoredInvoices.length}</div>
          <div style={styles.statLabel}>Pominięte</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#4caf50' }}>
            {state.factoringInvoices.length}
          </div>
          <div style={styles.statLabel}>Faktoring</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#f44336' }}>
            {state.collectionsInvoices.length}
          </div>
          <div style={styles.statLabel}>Windykacja</div>
        </div>
      </div>

      <div style={styles.cardStack}>
        {currentInvoice && (
          <div
            ref={cardRef}
            style={{
              ...styles.card,
              transform: `translate(${dragState.x}px, ${dragState.y}px) rotate(${dragState.x * 0.05}deg)`,
              transition: dragState.isDragging ? 'none' : 'transform 0.3s ease-out',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div
              style={{
                ...styles.swipeIndicator,
                ...styles.swipeLeft,
                opacity: leftOpacity,
              }}
            >
              Pomiń
            </div>
            <div
              style={{
                ...styles.swipeIndicator,
                ...styles.swipeUp,
                opacity: upOpacity,
              }}
            >
              Faktoring
            </div>
            <div
              style={{
                ...styles.swipeIndicator,
                ...styles.swipeDown,
                opacity: downOpacity,
              }}
            >
              Windykacja
            </div>

            <div style={styles.cardHeader}>
              <span style={styles.invoiceNumber}>{currentInvoice.number}</span>
              <span
                style={{
                  ...styles.dueDate,
                  ...(isOverdue(currentInvoice.dueDate) ? styles.dueDateOverdue : {}),
                }}
              >
                {isOverdue(currentInvoice.dueDate) ? 'Po terminie' : `Do ${currentInvoice.dueDate}`}
              </span>
            </div>

            <div style={styles.contractor}>{currentInvoice.contractor}</div>
            <div style={styles.amount}>{formatCurrency(currentInvoice.amount)}</div>

            <div style={styles.cardMeta}>
              <span>Wystawiono: {currentInvoice.issuedDate}</span>
              <span>Termin: {currentInvoice.dueDate}</span>
            </div>
          </div>
        )}
      </div>

      <div style={styles.instructions}>
        <div style={styles.instruction}>
          <span style={styles.instructionIcon}>👈</span>
          Pomiń
        </div>
        <div style={styles.instruction}>
          <span style={styles.instructionIcon}>👆</span>
          Faktoring
        </div>
        <div style={styles.instruction}>
          <span style={styles.instructionIcon}>👇</span>
          Windykacja
        </div>
      </div>

      {state.undoStack.length > 0 && (
        <button style={styles.undoButton} onClick={handleUndo}>
          ↩️ Cofnij ostatnią akcję
        </button>
      )}

      <ConfirmModal
        isOpen={confirmModal !== null}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirm}
        title="Czy na pewno?"
        message={
          confirmModal?.type === 'factoring'
            ? `Czy chcesz skierować fakturę ${confirmModal.invoice.number} do faktoringu?`
            : `Czy chcesz skierować fakturę ${confirmModal?.invoice.number} do windykacji?`
        }
      />
    </div>
  );
}
