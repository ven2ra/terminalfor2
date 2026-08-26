import React from 'react';
import { Icon } from '../components/core/Icon.jsx';

/** Rows of block ids (each row is a horizontal group) — lets a block be
 * dropped either beside a neighbor (same row) or on a new row below/above
 * it, depending on which edge of the target it's dropped on. Persists to
 * localStorage. */
export function useBlockRows(storageKey, defaultOrder) {
  const [rows, setRows] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      const flat = Array.isArray(saved) ? saved.flat() : null;
      if (flat && defaultOrder.every(id => flat.includes(id)) && flat.every(id => defaultOrder.includes(id))) {
        // Migrate a legacy flat order (one block per row) transparently.
        return Array.isArray(saved[0]) ? saved : saved.map(id => [id]);
      }
    } catch {}
    return defaultOrder.map(id => [id]);
  });

  const persist = React.useCallback(
    next => {
      setRows(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
    },
    [storageKey],
  );

  return [rows, persist];
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
        resize: 'both',
        overflow: 'auto',
        minHeight,
        minWidth: 280,
        maxWidth: '100%',
        width: '100%',
        height: height || undefined,
        borderRadius: 'var(--r-card)',
      }}
    >
      {children}
    </div>
  );
}

// Which edge of `rect` the point (x, y) is closest to — picks the drop intent:
// left/right = "beside this block, same row", top/bottom = "new row above/below it".
function edgeZone(x, y, rect) {
  const rx = (x - rect.left) / rect.width;
  const ry = (y - rect.top) / rect.height;
  const dx = Math.min(rx, 1 - rx);
  const dy = Math.min(ry, 1 - ry);
  if (dx < dy) return rx < 0.5 ? 'left' : 'right';
  return ry < 0.5 ? 'top' : 'bottom';
}

const EDGE_INDICATOR = {
  left: { left: 0, top: 0, bottom: 0, width: 4 },
  right: { right: 0, top: 0, bottom: 0, width: 4 },
  top: { left: 0, right: 0, top: 0, height: 4 },
  bottom: { left: 0, right: 0, bottom: 0, height: 4 },
};

export function DraggableBlock({ id, dragId, onDragStart, onDropZone, onDragEnd, height, onResize, children, style, ...rest }) {
  const dragging = dragId === id;
  const [overZone, setOverZone] = React.useState(null);
  const isDropSource = dragId != null;

  return (
    <div
      {...rest}
      onDragOver={e => {
        e.preventDefault();
        if (!isDropSource || dragging) return;
        setOverZone(edgeZone(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect()));
      }}
      onDragLeave={() => setOverZone(null)}
      onDrop={e => {
        e.preventDefault();
        e.stopPropagation();
        const zone = edgeZone(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
        setOverZone(null);
        onDropZone(id, zone);
      }}
      style={{ position: 'relative', opacity: dragging ? 0.4 : 1, transition: 'opacity var(--dur-fast) var(--ease-standard)', ...style }}
    >
      {overZone && (
        <span
          style={{
            position: 'absolute', zIndex: 3, background: 'var(--border-accent)', borderRadius: 2,
            pointerEvents: 'none', ...EDGE_INDICATOR[overZone],
          }}
        />
      )}
      <div
        draggable
        onDragStart={e => {
          e.dataTransfer.effectAllowed = 'move';
          onDragStart(id);
        }}
        onDragEnd={onDragEnd}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', cursor: 'grab', paddingBottom: 'var(--sp-4)', userSelect: 'none' }}
      >
        <Icon name="grip-vertical" size={14} style={{ background: 'var(--text-faint)' }} />
        <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>
          Перетащите заголовок: край блока — рядом, верх/низ — новая строка
        </span>
      </div>
      <ResizableArea id={id} height={height} onResize={onResize}>
        {children}
      </ResizableArea>
    </div>
  );
}

function moveBlock(rows, dragId, targetId, zone) {
  const stripped = rows.map(r => r.filter(id => id !== dragId)).filter(r => r.length > 0);
  if (targetId == null) return [...stripped, [dragId]];

  const rowIdx = stripped.findIndex(r => r.includes(targetId));
  if (rowIdx === -1) return [...stripped, [dragId]];

  const next = stripped.map(r => [...r]);
  const row = next[rowIdx];
  const colIdx = row.indexOf(targetId);

  if (zone === 'left') row.splice(colIdx, 0, dragId);
  else if (zone === 'right') row.splice(colIdx + 1, 0, dragId);
  else if (zone === 'top') next.splice(rowIdx, 0, [dragId]);
  else next.splice(rowIdx + 1, 0, [dragId]);

  return next;
}

export function DraggableStack({ rows, onReorder, blocks, sizes = {}, defaultSizes = {}, onResize, gap = 'var(--sp-9)' }) {
  const [dragId, setDragId] = React.useState(null);

  const onDropZone = (targetId, zone) => {
    if (dragId == null) return;
    onReorder(moveBlock(rows, dragId, targetId, zone));
    setDragId(null);
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault();
        onDropZone(null, null);
      }}
    >
      {rows.map((row, i) => (
        <div key={row.join('|')} style={{ display: 'flex', alignItems: 'flex-start', gap, flexWrap: 'nowrap' }}>
          {row.map(id => (
            <div key={id} style={{ flex: '1 1 380px', minWidth: 0 }}>
              <DraggableBlock
                id={id}
                dragId={dragId}
                onDragStart={setDragId}
                onDropZone={onDropZone}
                onDragEnd={() => setDragId(null)}
                height={sizes[id] ?? defaultSizes[id]}
                onResize={onResize}
              >
                {blocks[id]}
              </DraggableBlock>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
