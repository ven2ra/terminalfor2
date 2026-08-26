Glyph-only square control — card overflow ("ellipsis-vertical"), topbar bell/messages, panel expand, rail collapse.

```jsx
<IconButton icon="ellipsis-vertical" size={28} label="Card actions" />
<IconButton icon="bell" size={36} dot label="Notifications" />
```

Always pass `label`. Use `variant="bare"` inside already-inset containers so tiles don't stack.
