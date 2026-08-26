import React from 'react';
import { Icon } from '../components/core/Icon.jsx';
import { IconButton } from '../components/core/IconButton.jsx';

// A free-form canvas: every block has an absolute { xPct, y, wPct, h } —
// x/width as a percentage of the canvas (so it stays sane across viewport
// widths and browser zoom), y/height in pixels (the page just scrolls
// taller). Nothing snaps to a grid or to another block's edge — a block can
// be dropped at literally any point on the canvas, including empty space
// with nothing else nearby, which a row/edge-zone reorder model can't do.

const MIN_W_PCT = 14; // ~240px on a 1700px-wide canvas
const MIN_H = 160;

/** Per-block { xPct, y, wPct, h }, persisted to localStorage under `${storageKey}_layout`. */
export function useBlockLayout(storageKey, defaultLayout) {
  const key = `${storageKey}_layout`;
  const [layout, setLayout] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved && typeof saved === 'object') {
        // Keep the default for any block added since the layout was last
        // saved (a new widget type), but prefer whatever's stored otherwise.
        const merged = { ...defaultLayout };
        Object.keys(defaultLayout).forEach(id => {
          if (saved[id]) merged[id] = { ...defaultLayout[id], ...saved[id] };
        });
        return merged;
      }
    } catch {}
    return defaultLayout;
  });

  const persist = React.useCallback(
    next => {
      setLayout(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
    },
    [key],
  );

  const updateBlock = React.useCallback(
    (id, patch) => {
      setLayout(prev => {
        const next = { ...prev, [id]: { ...prev[id], ...patch } };
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [key],
  );

  const reset = React.useCallback(() => persist(defaultLayout), [persist, defaultLayout]);

  return [layout, updateBlock, reset];
}

/** Per-widget show/hide, persisted to localStorage under `${storageKey}_visible`.
 * Kept separate from layout so a hidden widget re-appears where it was. */
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

function FreeBlock({ id, pos, containerRef, onMoveEnd, onResizeEnd, onDragZ, onRemove, children }) {
  const boxRef = React.useRef(null);
  const [dragPos, setDragPos] = React.useState(null); // live { xPct, y } while dragging
  const [dragging, setDragging] = React.useState(false);
  const lastSizeRef = React.useRef({ wPct: pos.wPct, h: pos.h });
  lastSizeRef.current = { wPct: pos.wPct, h: pos.h };

  const startDrag = e => {
    // Only the primary button/touch starts a move — and not from a click
    // that landed on the remove button (it stops propagation itself).
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const origXPct = pos.xPct;
    const origY = pos.y;
    const wPct = pos.wPct;
    setDragging(true);
    onDragZ?.(id);

    const onMove = ev => {
      const rect = containerRef.current.getBoundingClientRect();
      const dxPct = ((ev.clientX - startX) / rect.width) * 100;
      const dy = ev.clientY - startY;
      const nextX = Math.min(Math.max(origXPct + dxPct, 0), Math.max(0, 100 - wPct));
      const nextY = Math.max(origY + dy, 0);
      setDragPos({ xPct: nextX, y: nextY });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setDragging(false);
      setDragPos(cur => {
        if (cur) onMoveEnd(id, cur);
        return null;
      });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Native CSS `resize: both` on the box itself — committed on release, the
  // same "only react to an actual user drag, not every layout tick" guard
  // used elsewhere, converted from its on-screen pixel size back into a
  // canvas-relative percentage width.
  React.useEffect(() => {
    const el = boxRef.current;
    if (!el || !containerRef.current) return;
    const commit = () => {
      const rect = el.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const wPct = Math.min((rect.width / containerRect.width) * 100, Math.max(0, 100 - pos.xPct));
      const h = Math.round(rect.height);
      const prev = lastSizeRef.current;
      if (Math.abs(wPct - prev.wPct) > 0.2 || Math.abs(h - prev.h) > 1) {
        onResizeEnd(id, { wPct, h });
      }
    };
    el.addEventListener('pointerup', commit);
    return () => el.removeEventListener('pointerup', commit);
  }, [id, pos.xPct, onResizeEnd]);

  const current = dragPos || pos;

  return (
    <div
      ref={boxRef}
      style={{
        position: 'absolute',
        left: `${current.xPct}%`,
        top: current.y,
        width: `${pos.wPct}%`,
        height: pos.h,
        minWidth: `${MIN_W_PCT}%`,
        minHeight: MIN_H,
        resize: 'both',
        overflow: 'auto',
        borderRadius: 'var(--r-card)',
        zIndex: dragging ? 50 : 1,
        boxShadow: dragging ? 'var(--shadow-popover)' : 'none',
        transition: dragging ? 'none' : 'box-shadow var(--dur-fast) var(--ease-standard)',
      }}
    >
      <div
        onPointerDown={startDrag}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', cursor: dragging ? 'grabbing' : 'grab', paddingBottom: 'var(--sp-4)', userSelect: 'none', touchAction: 'none' }}
      >
        <Icon name="grip-vertical" size={14} style={{ background: 'var(--text-faint)' }} />
        <span style={{ flex: 1, minWidth: 0 }} />
        {onRemove && (
          <IconButton
            icon="x"
            size={22}
            label="Скрыть блок"
            onClick={e => { e.stopPropagation(); onRemove(id); }}
            onPointerDown={e => e.stopPropagation()}
          />
        )}
      </div>
      {children}
    </div>
  );
}

export function FreeCanvas({ layout, onUpdate, blocks, hidden = {}, onRemove, style }) {
  const containerRef = React.useRef(null);
  const [zOrder, setZOrder] = React.useState([]);

  const ids = Object.keys(blocks).filter(id => layout[id] && !hidden[id]);
  const bringToFront = id => setZOrder(prev => [...prev.filter(x => x !== id), id]);

  const canvasHeight = Math.max(
    600,
    ...ids.map(id => (layout[id].y || 0) + (layout[id].h || MIN_H) + 40),
  );

  const ordered = [...ids].sort((a, b) => zOrder.indexOf(a) - zOrder.indexOf(b));

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: canvasHeight, ...style }}>
      {ordered.map(id => (
        <FreeBlock
          key={id}
          id={id}
          pos={layout[id]}
          containerRef={containerRef}
          onDragZ={bringToFront}
          onMoveEnd={(blockId, patch) => onUpdate(blockId, patch)}
          onResizeEnd={(blockId, patch) => onUpdate(blockId, patch)}
          onRemove={onRemove}
        >
          {blocks[id]}
        </FreeBlock>
      ))}
    </div>
  );
}
