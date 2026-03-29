# Audio Files Setup Guide for GitaSaar Meditation

## 📁 Required Folder Structure

```
/app/assets/sounds/
├── ambient/           # Background looping sounds
│   ├── rain.mp3
│   ├── ocean.mp3
│   ├── forest.mp3
│   ├── om.mp3
│   ├── bowl.mp3
│   └── flute.mp3
│
└── effects/           # One-time sound effects
    ├── bell_start.mp3
    ├── bell_end.mp3
    └── chime.mp3
```

---

## 🎵 Required Audio Files

### **Ambient Sounds (Background - Looping)**

1. **rain.mp3**
   - Rain sounds (peaceful, gentle)
   - Duration: ~2 minutes minimum
   - Loop-friendly (seamless loop)

2. **ocean.mp3**
   - Ocean waves sounds
   - Duration: ~2 minutes minimum
   - Loop-friendly

3. **forest.mp3**
   - Forest birds chirping
   - Duration: ~2 minutes minimum
   - Loop-friendly

4. **om.mp3**
   - Om chanting (continuous)
   - Duration: ~1 minute minimum
   - Loop-friendly

5. **bowl.mp3**
   - Tibetan singing bowl resonance
   - Duration: ~30 seconds minimum
   - Loop-friendly

6. **flute.mp3**
   - Meditation flute music
   - Duration: ~1.5 minutes minimum
   - Loop-friendly

### **Effect Sounds (One-time)**

7. **bell_start.mp3**
   - Meditation bell sound
   - Duration: 2-5 seconds
   - Plays at meditation start

8. **bell_end.mp3**
   - Meditation completion bell
   - Duration: 2-5 seconds
   - Plays at meditation end

9. **chime.mp3**
   - Mindfulness chime
   - Duration: 3-5 seconds
   - Optional interval reminder

---

## 📝 Audio File Specifications

### **Format:**
- ✅ **MP3** (recommended)
- ✅ **M4A** (also works)
- ❌ WAV (too large for mobile)

### **Quality:**
- **Bitrate:** 128-192 kbps (good balance of quality/size)
- **Sample Rate:** 44.1 kHz or 48 kHz
- **Channels:** Stereo or Mono (both work)

### **File Size:**
- Ambient sounds: 2-5 MB each
- Effect sounds: < 500 KB each
- Total: ~15-20 MB for all files

---

## 🔧 How to Add Your Files

### **Option 1: Manual Upload (If using file manager)**
1. Place all your MP3 files in the correct folders
2. Make sure file names match exactly (case-sensitive)
3. Restart the app

### **Option 2: Using Command Line**
```bash
# From your local machine
scp rain.mp3 server:/app/assets/sounds/ambient/
scp ocean.mp3 server:/app/assets/sounds/ambient/
# ... etc
```

### **Option 3: Create placeholder files (for testing)**
```bash
# Navigate to ambient folder
cd /app/assets/sounds/ambient

# Create empty files (replace with real audio later)
touch rain.mp3 ocean.mp3 forest.mp3 om.mp3 bowl.mp3 flute.mp3

# Navigate to effects folder
cd /app/assets/sounds/effects
touch bell_start.mp3 bell_end.mp3 chime.mp3
```

---

## ✅ Verification Checklist

After adding files, verify:

```bash
# Check if all files exist
ls -lh /app/assets/sounds/ambient/
ls -lh /app/assets/sounds/effects/

# Should show:
# ambient: rain.mp3, ocean.mp3, forest.mp3, om.mp3, bowl.mp3, flute.mp3
# effects: bell_start.mp3, bell_end.mp3, chime.mp3
```

---

## 🎵 Free Audio Resources (If you need files)

If you don't have audio files yet, download from:

### **Freesound.org** (Creative Commons)
- Search: "rain meditation"
- Search: "ocean waves"
- Search: "singing bowl"
- Search: "meditation bell"
- Download as MP3

### **YouTube Audio Library**
- Free meditation music
- Ambient sounds
- Download and convert to MP3

### **Pixabay** (Free sounds)
- pixabay.com/music
- Search meditation, nature, ambient
- All free to use

---

## 🚨 Troubleshooting

### **Issue: "Audio file not found" error**

**Solution:**
1. Check file names match exactly (case-sensitive)
2. Check files are in correct folders
3. Restart Metro bundler:
   ```bash
   npx expo start --clear
   ```

### **Issue: Audio doesn't play**

**Solution:**
1. Check file format is MP3 or M4A
2. Check file is not corrupted
3. Check file size is reasonable (< 5 MB for ambient)
4. Try playing file on computer first

### **Issue: Files exist but app doesn't load them**

**Solution:**
1. Clear cache:
   ```bash
   rm -rf node_modules/.cache
   npx expo start --clear
   ```
2. Rebuild app

---

## 📱 Testing

After adding files:

1. Open Meditation Library
2. Select any meditation
3. Tap "Audio Settings"
4. Choose different ambient sounds
5. Press Play
6. Verify:
   - ✅ Start bell plays
   - ✅ Background music plays
   - ✅ Can switch between sounds
   - ✅ Volume control works
   - ✅ End bell plays

---

## 🎯 Quick Start (With Your Files)

If you already have the audio files:

1. **Organize files:**
   ```
   your_files/
   ├── rain_sound.mp3     → rename to: rain.mp3
   ├── ocean_waves.mp3    → rename to: ocean.mp3
   ├── meditation_bell.mp3 → rename to: bell_start.mp3
   etc...
   ```

2. **Upload to correct folders:**
   - All ambient → `/app/assets/sounds/ambient/`
   - All effects → `/app/assets/sounds/effects/`

3. **Restart app:**
   ```bash
   npx expo start --clear
   ```

4. **Test in app:**
   - Open meditation
   - Enable audio
   - Select sound
   - Play!

---

## 💡 Pro Tips

1. **Loop-friendly files:**
   - Make sure ambient sounds loop seamlessly
   - No silence at start/end
   - Use audio editor (Audacity) to trim properly

2. **File size optimization:**
   - Use 128 kbps for ambient (smaller file)
   - Use 192 kbps for effects (better quality)
   - Convert WAV to MP3 to save space

3. **Testing on device:**
   - Always test on actual device
   - Web audio might behave differently
   - Check background playback works

---

## 📞 Need Help?

If you need specific audio files or have trouble:
1. Share what files you have
2. Share any error messages
3. I can help with file conversion/optimization

**Current Status:** 
- ✅ Code updated to use local files
- ✅ Folder structure created
- ⏳ Waiting for your audio files to be placed

**Once you add the files, meditation will work with your custom sounds!** 🎵✨
