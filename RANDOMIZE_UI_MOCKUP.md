# 📸 UI Mockup: Randomize Features

## Full Page Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  Football Leagues Admin                                    [Logout] │
├────────────────────────────────────────────────────────────────────┤
│  ← Back to Dashboard                                                │
│                                                                      │
│  Cup Groups Manager                                                 │
│  Manage group stage untuk tournament cup                           │
│                                                                      │
├────────────────────────────────────────────────────────────────────┤
│  ℹ️  Group Stage Setup                                              │
│                                                                      │
│  Buat groups (A, B, C, D, dst) dan assign tim ke masing-masing     │
│  group. Setelah semua tim diassign, input hasil match untuk        │
│  update group standings otomatis.                                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Pilih Cup Tournament                                               │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ Piala Indonesia 2025 (2025)                          ▼  │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                      │
│  Tournament Settings                                                │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Total Teams        Teams per Group    Qualifiers         │    │
│  │      16                   4                 2              │    │
│  │                                                            │    │
│  │  Groups Needed: 4                                          │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
├────────────────────────────────────────────────────────────────────┤
│  ✅ 16 tim berhasil diacak ke 4 grup!                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🎲 Randomize Tools                                                 │
│  Acak tim ke grup secara otomatis                                  │
│                                                                      │
│  ┌───────────────────┬───────────────────┬───────────────────┐     │
│  │  🎲 Acak Tim      │  🔀 Acak Posisi   │  🗑️  Clear Semua  │     │
│  │  ke Grup          │  Tim              │                   │     │
│  │                   │                   │                   │     │
│  │  Random           │  Shuffle urutan   │  Hapus semua      │     │
│  │  assignment       │  tim dalam grup   │  assignment       │     │
│  │  ke semua grup    │                   │                   │     │
│  └───────────────────┴───────────────────┴───────────────────┘     │
│                                                                      │
│  💡 Tips:                                                           │
│  • Buat grup terlebih dahulu sebelum mengacak tim                  │
│  • "Acak Tim ke Grup" akan mendistribusikan semua tim secara       │
│    merata                                                           │
│  • "Acak Posisi Tim" hanya mengacak urutan dalam grup yang         │
│    sudah ada                                                        │
│                                                                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────┬──────────────────────────┐           │
│  │  ➕ Create New Group     │  🎯 Assign Team to Group │           │
│  │                          │                          │           │
│  │  [ Create Group ]        │  Select Team:            │           │
│  │                          │  ┌────────────────────┐  │           │
│  │                          │  │ -- Select Team --▼ │  │           │
│  │                          │  └────────────────────┘  │           │
│  │                          │                          │           │
│  │                          │  Select Group:           │           │
│  │                          │  ┌────────────────────┐  │           │
│  │                          │  │ -- Select Group--▼ │  │           │
│  │                          │  └────────────────────┘  │           │
│  │                          │                          │           │
│  │                          │  [ Assign Team ]         │           │
│  └──────────────────────────┴──────────────────────────┘           │
│                                                                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Cup Groups (4)                                                     │
│                                                                      │
│  ┌────────────────┬────────────────┬────────────────┐              │
│  │  GROUP A       │  GROUP B       │  GROUP C       │              │
│  │  (4/4) ✓       │  (4/4) ✓       │  (4/4) ✓       │              │
│  │                │                │                │              │
│  │  1. ⚽ Persija  │  1. ⚽ Persib   │  1. ⚽ Arema    │              │
│  │  2. ⚽ PSM      │  2. ⚽ Bali Utd │  2. ⚽ Persebaya│              │
│  │  3. ⚽ Borneo   │  3. ⚽ Madura   │  3. ⚽ PSIS     │              │
│  │  4. ⚽ PSS      │  4. ⚽ Dewa Utd │  4. ⚽ Persis   │              │
│  └────────────────┴────────────────┴────────────────┘              │
│                                                                      │
│  ┌────────────────┐                                                 │
│  │  GROUP D       │                                                 │
│  │  (4/4) ✓       │                                                 │
│  │                │                                                 │
│  │  1. ⚽ Persita  │                                                 │
│  │  2. ⚽ Persik   │                                                 │
│  │  3. ⚽ Barito   │                                                 │
│  │  4. ⚽ Malut    │                                                 │
│  └────────────────┘                                                 │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## Randomize Tools Section (Close-up)

### Desktop View
```
┌──────────────────────────────────────────────────────────────────┐
│  🎲 Randomize Tools                                              │
│  Acak tim ke grup secara otomatis                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┬────────────────────┬──────────────────┐ │
│  │                    │                    │                  │ │
│  │  🎲                │  🔀                │  🗑️              │ │
│  │  Acak Tim ke Grup  │  Acak Posisi Tim   │  Clear Semua     │ │
│  │                    │                    │                  │ │
│  │  Random assignment │  Shuffle urutan    │  Hapus semua     │ │
│  │  ke semua grup     │  tim dalam grup    │  assignment      │ │
│  │                    │                    │                  │ │
│  └────────────────────┴────────────────────┴──────────────────┘ │
│                                                                  │
│  💡 Tips:                                                        │
│  • Buat grup terlebih dahulu sebelum mengacak tim              │
│  • "Acak Tim ke Grup" akan mendistribusikan semua tim secara   │
│    merata                                                       │
│  • "Acak Posisi Tim" hanya mengacak urutan dalam grup yang     │
│    sudah ada                                                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Mobile View
```
┌─────────────────────────────────┐
│  🎲 Randomize Tools             │
│  Acak tim ke grup secara otomatis│
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │  🎲                       │  │
│  │  Acak Tim ke Grup         │  │
│  │                           │  │
│  │  Random assignment        │  │
│  │  ke semua grup            │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  🔀                       │  │
│  │  Acak Posisi Tim          │  │
│  │                           │  │
│  │  Shuffle urutan           │  │
│  │  tim dalam grup           │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  🗑️                        │  │
│  │  Clear Semua              │  │
│  │                           │  │
│  │  Hapus semua              │  │
│  │  assignment               │  │
│  └───────────────────────────┘  │
│                                 │
│  💡 Tips:                       │
│  • Buat grup terlebih dahulu    │
│  • "Acak Tim ke Grup" merata    │
│  • "Acak Posisi Tim" shuffle    │
│                                 │
└─────────────────────────────────┘
```

---

## Interaction States

### 1. Initial State (Idle)
```
┌───────────────────────┐
│  🎲                   │
│  Acak Tim ke Grup     │
│                       │
│  Random assignment    │
│  ke semua grup        │
└───────────────────────┘
```

### 2. Loading State
```
┌───────────────────────┐
│  ⏳                   │
│  Mengacak...          │
│                       │
│  Processing...        │
│  [████░░░░░] 50%      │
└───────────────────────┘
```

### 3. Success State (with message)
```
┌──────────────────────────────────────────┐
│  ✅ 16 tim berhasil diacak ke 4 grup!    │
└──────────────────────────────────────────┘

┌───────────────────────┐
│  🎲                   │
│  Acak Tim ke Grup     │
│                       │
│  Random assignment    │
│  ke semua grup        │
└───────────────────────┘
```

### 4. Disabled State
```
┌───────────────────────┐
│  🎲 (grayed out)      │
│  Acak Tim ke Grup     │
│                       │
│  Random assignment    │
│  ke semua grup        │
│  [DISABLED]           │
└───────────────────────┘
```

---

## Confirmation Dialogs

### Dialog 1: Randomize Confirmation
```
┌────────────────────────────────────────────┐
│  ⚠️  Konfirmasi                            │
├────────────────────────────────────────────┤
│                                            │
│  Acak semua tim ke grup secara random?     │
│  Tim yang sudah di-assign akan             │
│  di-reassign ulang.                        │
│                                            │
│  ┌──────────┐  ┌──────────┐               │
│  │  Cancel  │  │  Confirm │               │
│  └──────────┘  └──────────┘               │
│                                            │
└────────────────────────────────────────────┘
```

### Dialog 2: Shuffle Confirmation
```
┌────────────────────────────────────────────┐
│  ⚠️  Konfirmasi                            │
├────────────────────────────────────────────┤
│                                            │
│  Acak posisi tim dalam setiap grup?        │
│                                            │
│  ┌──────────┐  ┌──────────┐               │
│  │  Cancel  │  │  Confirm │               │
│  └──────────┘  └──────────┘               │
│                                            │
└────────────────────────────────────────────┘
```

### Dialog 3: Clear Confirmation
```
┌────────────────────────────────────────────┐
│  ⚠️  Konfirmasi                            │
├────────────────────────────────────────────┤
│                                            │
│  ⚠️ Hapus semua assignment tim dari grup?  │
│  Tindakan ini tidak bisa di-undo!          │
│                                            │
│  ┌──────────┐  ┌──────────┐               │
│  │  Cancel  │  │  Confirm │               │
│  └──────────┘  └──────────┘               │
│                                            │
└────────────────────────────────────────────┘
```

---

## Success Messages

```
┌────────────────────────────────────────────┐
│  ✅ 16 tim berhasil diacak ke 4 grup!      │
└────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────┐
│  ✅ Posisi tim di 4 grup berhasil diacak!  │
└────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────┐
│  ✅ Semua assignment tim berhasil dihapus! │
└────────────────────────────────────────────┘
```

---

## Error Messages

```
┌────────────────────────────────────────────┐
│  ❌ No groups found. Create groups first.  │
└────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────┐
│  ❌ Failed to randomize teams             │
└────────────────────────────────────────────┘
```

---

## Before & After Comparison

### BEFORE Randomize
```
┌──────────────────────────────────────────────┐
│  ⚠️ Unassigned Teams (16)                    │
├──────────────────────────────────────────────┤
│  ⚽ Persija Jakarta                          │
│  ⚽ Persib Bandung                           │
│  ⚽ Arema FC                                 │
│  ⚽ PSM Makassar                             │
│  ⚽ Bali United                              │
│  ⚽ Borneo FC                                │
│  ⚽ Persebaya Surabaya                       │
│  ⚽ Madura United                            │
│  ⚽ PSS Sleman                               │
│  ⚽ Dewa United                              │
│  ⚽ PSIS Semarang                            │
│  ⚽ Persis Solo                              │
│  ⚽ Persita Tangerang                        │
│  ⚽ Persik Kediri                            │
│  ⚽ Barito Putera                            │
│  ⚽ Malut United                             │
└──────────────────────────────────────────────┘

┌────────────────┐ ┌────────────────┐
│  GROUP A       │ │  GROUP B       │
│  (0/4)         │ │  (0/4)         │
│                │ │                │
│  No teams      │ │  No teams      │
└────────────────┘ └────────────────┘

┌────────────────┐ ┌────────────────┐
│  GROUP C       │ │  GROUP D       │
│  (0/4)         │ │  (0/4)         │
│                │ │                │
│  No teams      │ │  No teams      │
└────────────────┘ └────────────────┘
```

### AFTER Randomize
```
┌──────────────────────────────────────────────┐
│  ✅ Unassigned Teams (0)                     │
│  All teams have been assigned!               │
└──────────────────────────────────────────────┘

┌────────────────┐ ┌────────────────┐
│  GROUP A       │ │  GROUP B       │
│  (4/4) ✓       │ │  (4/4) ✓       │
│                │ │                │
│  1. ⚽ Arema    │ │  1. ⚽ Barito   │
│  2. ⚽ PSIS     │ │  2. ⚽ Persebaya│
│  3. ⚽ Persija  │ │  3. ⚽ Persib   │
│  4. ⚽ PSS      │ │  4. ⚽ Persita  │
└────────────────┘ └────────────────┘

┌────────────────┐ ┌────────────────┐
│  GROUP C       │ │  GROUP D       │
│  (4/4) ✓       │ │  (4/4) ✓       │
│                │ │                │
│  1. ⚽ PSM      │ │  1. ⚽ Persik   │
│  2. ⚽ Malut    │ │  2. ⚽ Borneo   │
│  3. ⚽ Madura   │ │  3. ⚽ Dewa Utd │
│  4. ⚽ Bali Utd │ │  4. ⚽ Persis   │
└────────────────┘ └────────────────┘
```

---

## Color Scheme

```
Purple Button (Acak Tim ke Grup):
  Background: bg-purple-600
  Hover: bg-purple-700
  Text: text-white

Blue Button (Acak Posisi Tim):
  Background: bg-blue-600
  Hover: bg-blue-700
  Text: text-white

Red Button (Clear Semua):
  Background: bg-red-600
  Hover: bg-red-700
  Text: text-white

Section Background:
  Gradient: from-purple-900/20 to-blue-900/20
  Border: border-purple-700/30

Success Message:
  Background: bg-green-900/20
  Border: border-green-700/30
  Text: text-green-400

Error Message:
  Background: bg-red-900/20
  Border: border-red-700/30
  Text: text-red-400
```

---

## Animation Flow

```
1. User clicks "Acak Tim ke Grup"
   ↓
2. Button shows "Mengacak..." with spinner
   ↓
3. Backend processes (1-2 seconds)
   ↓
4. Success message appears (green banner)
   ↓
5. Groups refresh with new data
   ↓
6. Unassigned count updates to 0
   ↓
7. Success message fades after 5 seconds
```

---

## 🎉 Complete UI Package

All mockups show the complete user experience for the randomize features, including:
- ✅ Button layouts (desktop & mobile)
- ✅ Loading states
- ✅ Confirmation dialogs
- ✅ Success/Error messages
- ✅ Before/After states
- ✅ Color schemes
- ✅ Animation flows

**Status**: 📸 Ready for Implementation Review
