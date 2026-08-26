import React from 'react';
import { Icon } from '../components/core/Icon.jsx';

/** Vertical stack of blocks the user can reorder by dragging; order persists to localStorage. */
export function useBlockOrder(storageKey, defaultOrder) {
  const [order, setOrder] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(saved) && defaultOrder.every(id => saved.includes(id))) return saved;
    } catch {}
    return defaultOrder;
  });

  const persist = React.useCallback(
    next => {
      setOrder(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
    },
    [storageKey],
  );

  return [order, persist];
}

export function DraggableBlock({ id, title, dragId, onDragStart, onDragOver, onDrop, onDragEnd, children, style, ...rest }) {
  const dragging = dragId === id;
  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(id);
      }}
      onDragOver={e => {
        e.preventDefault();
        onDragOver(id);
      }}
      onDrop={e => {
        e.preventDefault();
        onDrop(id);
      }}
      onDragEnd={onDragEnd}
      {...rest}
      style={{ opacity: dragging ? 0.4 : 1, transition: 'opacity var(--dur-fast) var(--ease-standard)', ...style }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', cursor: 'grab', paddingBottom: 'var(--sp-4)', userSelect: 'none' }}>
        <Icon name="grip-vertical" size={14} style={{ background: 'var(--text-faint)' }} />
        <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>Перетащите, чтобы изменить порядок</span>
      </div>
      {children}
    </div>
  );
}

export function DraggableStack({ order, onReorder, blocks, gap = 'var(--sp-9)' }) {
  const [dragId, setDragId] = React.useState(null);
  const overRef = React.useRef(null);

  const onDrop = targetId => {
    if (dragId == null || dragId === targetId) return setDragId(null);
    const next = order.filter(id => id !== dragId);
    const idx = next.indexOf(targetId);
    next.splice(idx, 0, dragId);
    onReorder(next);
    setDragId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {order.map(id => (
        <DraggableBlock
          key={id}
          id={id}
          dragId={dragId}
          onDragStart={setDragId}
          onDragOver={id2 => (overRef.current = id2)}
          onDrop={onDrop}
          onDragEnd={() => setDragId(null)}
        >
          {blocks[id]}
        </DraggableBlock>
      ))}
    </div>
  );
}
