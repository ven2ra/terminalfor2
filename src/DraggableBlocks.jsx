import React from 'react';
import { Icon } from '../components/core/Icon.jsx';
import { IconButton } from '../components/core/IconButton.jsx';

/** Rows of block ids (each row is a horizontal group) — lets a block be
 * dropped either beside a neighbor (same row) or on a new row below/above
 * it, depending on which edge of the target it's dropped on. Persists to
 * localStorage. */
export function useBlockRows(storageKey, defaultOrder) {
  // `defaultOrder` may be a flat id array (one block per row) or already
  // rows-shaped (array of arrays), for a widget grid that should start
  // grouped rather than stacked.
  const defaultRows = Array.isArray(defaultOrder[0]) ? defaultOrder : defaultOrder.map(id => [id]);
  const defaultFlat = defaultRows.flat();

  const [rows, setRows] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      const flat = Array.isArray(saved) ? saved.flat() : null;
      if (flat && defaultFlat.every(id => flat.includes(id)) && flat.every(id => defaultFlat.includes(id))) {
        // Migrate a legacy flat order (one block per row) transparently.
        return Array.isArray(saved[0]) ? saved : saved.map(id => [id]);
      }
    } catch {}
    return defaultRows;
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

  const reset = React.useCallback(() => persist(defaultRows), [persist, defaultRows]);

  return [rows, persist, reset];
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

  const reset = React.useCallback(() => {
    setSizes({});
    try {
      localStorage.removeItem(key);
    } catch {}
  }, [key]);

  return [sizes, setSize, reset];
}

/** Per-widget show/hide, persisted to localStorage under `${storageKey}_visible`.
 * Kept separate from row order so a hidden widget re-appears in its old spot. */
export function useWidgetVisibility(storageKey, ids) {
  const key = `${storageKey}_visible`;
  const [visible, setVisible] = React.useState(() => {
    const init = {};
    ids.forEach(id => { init[id] = true; });
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved && typeof saved === 'object') {
        ids.forEach(id => { if (typeof saved[id] === 'boolean') init[id] = saved[id]; });
      }
    } catch {}
    return init;
  });

  const set = React.useCallback(
    (id, value) => {
      setVisible(prev => {
        const next = { ...prev, [id]: value };
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [key],
  );

  const visibleRef = React.useRef(visible);
  visibleRef.current = visible;
  const toggle = React.useCallback(id => set(id, !visibleRef.current[id]), [set]);

  const reset = React.useCallback(() => {
    const all = {};
    ids.forEach(id => { all[id] = true; });
    setVisible(all);
    try {
      localStorage.removeItem(key);
    } catch {}
  }, [key, ids]);

  return [visible, toggle, set, reset];
}

function ResizableArea({ id, size, onResize, minHeight = 160, minWidth = 240, children }) {
  const ref = React.useRef(null);
  const lastRef = React.useRef(size);
  lastRef.current = size;

  // Only commit a size when the user actually releases the native `resize`
  // drag handle — reacting to a ResizeObserver tick instead would also fire
  // on every layout-driven size change (e.g. the browser window resizing),
  // permanently locking the block to a stale pixel size and defeating the
  // "shrinks and adapts" requirement for the common, unresized case.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const commit = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      const prev = lastRef.current;
      if (w !== prev?.w || h !== prev?.h) onResize(id, { w, h });
    };
    el.addEventListener('pointerup', commit);
    return () => el.removeEventListener('pointerup', commit);
  }, [id, onResize]);

  return (
    <div
      ref={ref}
      style={{
        resize: 'both',
        overflow: 'auto',
        minHeight,
        minWidth,
        width: '100%',
        height: size?.h || undefined,
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

export function DraggableBlock({ id, dragId, onDragStart, onDropZone, onDragEnd, size, onResize, onRemove, children, style, ...rest }) {
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
        <span style={{ flex: 1, minWidth: 0, font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>
          Перетащите заголовок: край блока — рядом, верх/низ — новая строка
        </span>
        {onRemove && (
          <IconButton
            icon="x"
            size={22}
            label="Скрыть блок"
            onClick={e => { e.stopPropagation(); onRemove(id); }}
            onDragStart={e => e.stopPropagation()}
            draggable={false}
          />
        )}
      </div>
      <ResizableArea id={id} size={size} onResize={onResize}>
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

export function DraggableStack({ rows, onReorder, blocks, sizes = {}, defaultSizes = {}, onResize, gap = 'var(--sp-9)', hidden = {}, onRemove }) {
  const [dragId, setDragId] = React.useState(null);

  const onDropZone = (targetId, zone) => {
    if (dragId == null) return;
    onReorder(moveBlock(rows, dragId, targetId, zone));
    setDragId(null);
  };

  return (
    <div
      // `minHeight` keeps this the drop target for the whole visible
      // workspace, not just the box its current rows happen to fill — with a
      // short layout (few rows, or all short blocks) the leftover page space
      // below them would otherwise have no drag listener at all and silently
      // swallow the drop.
      style={{ display: 'flex', flexDirection: 'column', gap, minHeight: 'calc(100vh - 220px)' }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault();
        onDropZone(null, null);
      }}
    >
      {rows.map(row => {
        const visibleIds = row.filter(id => !hidden[id]);
        if (!visibleIds.length) return null;
        const lastId = visibleIds[visibleIds.length - 1];
        return (
          <div
            key={row.join('|')}
            style={{ display: 'flex', alignItems: 'flex-start', gap, flexWrap: 'wrap' }}
            // Catches a drop on this row's own background — the gap between
            // blocks, or the leftover space after the last one — and appends
            // the dragged block to the end of THIS row, instead of letting it
            // bubble up and jump to the very end of the whole stack.
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              e.stopPropagation();
              onDropZone(lastId, 'right');
            }}
          >
            {visibleIds.map(id => {
              // A block the user has never manually resized stays a flexible
              // flex item (responsive to the row/viewport). One with a saved
              // width switches to a fixed box at that width, matching the
              // ResizableArea inside it 1:1 so the drag handle's result holds.
              const w = sizes[id]?.w;
              const h = sizes[id]?.h ?? (typeof defaultSizes[id] === 'number' ? defaultSizes[id] : defaultSizes[id]?.h);
              return (
                <div key={id} style={{ flex: w ? '0 0 auto' : '1 1 380px', width: w || undefined, minWidth: 240, maxWidth: '100%' }}>
                  <DraggableBlock
                    id={id}
                    dragId={dragId}
                    onDragStart={setDragId}
                    onDropZone={onDropZone}
                    onDragEnd={() => setDragId(null)}
                    size={{ w, h }}
                    onResize={onResize}
                    onRemove={onRemove}
                  >
                    {blocks[id]}
                  </DraggableBlock>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
