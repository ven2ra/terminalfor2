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

/** Per-block heights (px), persisted to localStorage under `${storageKey}_sizes`. */
export function useBlockSizes(storageKey) {
  const key = `${storageKey}_sizes`;
  const [sizes, setSizes] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      return saved && typeof saved === 'object' ? saved : {};
    } catch {
      return {};
    }
  });

  const setSize = React.useCallback(
    (id, height) => {
      setSizes(prev => {
        const next = { ...prev, [id]: height };
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [key],
  );

  return [sizes, setSize];
}

function ResizableArea({ id, height, onResize, minHeight = 160, children }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      const h = Math.round(entries[0].contentRect.height);
      if (h > 0) onResize(id, h);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [id, onResize]);

  return (
    <div
      ref={ref}
      style={{
        resize: 'vertical',
        overflow: 'auto',
        minHeight,
        height: height || undefined,
        borderRadius: 'var(--r-card)',
      }}
    >
      {children}
    </div>
  );
}

export function DraggableBlock({ id, dragId, onDragStart, onDragOver, onDrop, onDragEnd, height, onResize, children, style, ...rest }) {
  const dragging = dragId === id;
  return (
    <div
      {...rest}
      style={{ opacity: dragging ? 0.4 : 1, transition: 'opacity var(--dur-fast) var(--ease-standard)', ...style }}
    >
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
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', cursor: 'grab', paddingBottom: 'var(--sp-4)', userSelect: 'none' }}
      >
        <Icon name="grip-vertical" size={14} style={{ background: 'var(--text-faint)' }} />
        <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>
          Перетащите заголовок — порядок · потяните нижний правый угол — размер
        </span>
      </div>
      <ResizableArea id={id} height={height} onResize={onResize}>
        {children}
      </ResizableArea>
    </div>
  );
}

export function DraggableStack({ order, onReorder, blocks, sizes = {}, defaultSizes = {}, onResize, gap = 'var(--sp-9)' }) {
  const [dragId, setDragId] = React.useState(null);

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
          onDragOver={() => {}}
          onDrop={onDrop}
          onDragEnd={() => setDragId(null)}
          height={sizes[id] ?? defaultSizes[id]}
          onResize={onResize}
        >
          {blocks[id]}
        </DraggableBlock>
      ))}
    </div>
  );
}
