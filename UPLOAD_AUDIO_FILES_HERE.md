# 🎵 Audio Files Setup - Simple Guide

## 📁 Kahan Lagani Hain Files?

```
/app/assets/sounds/
├── ambient/       ← Background music files yahan
└── effects/       ← Bell/chime sounds yahan
```

---

## 📝 Exact File Names (Case-Sensitive!)

### **Folder 1: `/app/assets/sounds/ambient/`**
Ye 6 files lagao (background music - looping sounds):

1. `rain.mp3` - Rain sound
2. `ocean.mp3` - Ocean waves
3. `forest.mp3` - Forest birds
4. `om.mp3` - Om chanting
5. `bowl.mp3` - Singing bowl
6. `flute.mp3` - Meditation flute

### **Folder 2: `/app/assets/sounds/effects/`**
Ye 3 files lagao (bell sounds - short sounds):

7. `bell_start.mp3` - Start bell (2-5 seconds)
8. `bell_end.mp3` - End bell (2-5 seconds)
9. `chime.mp3` - Chime sound (3-5 seconds)

---

## ✅ File Requirements

**Format:** MP3 only
**Naming:** Exactly as written above (lowercase, no spaces)
**Size:** 
- Ambient: 1-5 MB each
- Effects: < 500 KB each

---

## 🚀 Steps

1. **Apne laptop se in files ko rename karo exactly:**
   - `rain.mp3`, `ocean.mp3`, etc.

2. **Upload karo:**
   - 6 ambient files → `/app/assets/sounds/ambient/`
   - 3 effect files → `/app/assets/sounds/effects/`

3. **Restart app:**
   ```bash
   npx expo start --clear
   ```

4. **Done!** Meditation mein aapki files play hongi 🎵

---

## 📋 Checklist

**Ambient folder mein:**
- [ ] rain.mp3
- [ ] ocean.mp3
- [ ] forest.mp3
- [ ] om.mp3
- [ ] bowl.mp3
- [ ] flute.mp3

**Effects folder mein:**
- [ ] bell_start.mp3
- [ ] bell_end.mp3
- [ ] chime.mp3

**Total:** 9 files

---

## ⚠️ Important

**File names MUST match exactly:**
- ✅ `rain.mp3` (correct)
- ❌ `Rain.mp3` (wrong - capital R)
- ❌ `rain sound.mp3` (wrong - space)
- ❌ `rain.wav` (wrong - must be .mp3)

**Folders MUST be:**
- `/app/assets/sounds/ambient/` (not `Ambient` or `ambients`)
- `/app/assets/sounds/effects/` (not `Effects` or `effect`)

---

## 🎯 After Upload

Verify files:
```bash
cd /app/assets/sounds
ls ambient/
ls effects/
```

Should show exactly 9 MP3 files with correct names!

---

**Code ready hai - bas files upload karo!** 🚀
