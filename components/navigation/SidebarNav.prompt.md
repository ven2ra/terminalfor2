The app rail — 212px wide, near-black, hairline right edge, items grouped under faint 10px section labels.

```jsx
<SidebarNav greeting="Welcome Back, Jason" meta="Last login 15 Jun 2025" active="dashboard" onSelect={setView}
  groups={[{ label: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: 'layout-grid' }] }]} />
```

The active row is the white-to-transparent gradient pill; hover on the rest is a 4.5% white wash.
