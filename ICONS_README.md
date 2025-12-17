# Icon Files Required for PWA

Your `manifest.json` references these icon files that need to be created:

## Required Icons

1. **logo192.png** - 192x192 pixels (for Android home screen)
2. **logo512.png** - 512x512 pixels (for Android splash screen and Play Store)

## How to Create Icons

### Option 1: Online Tools (Easiest)
1. Visit https://www.favicon-generator.org or https://realfavicongenerator.net
2. Upload a square image (at least 512x512)
3. Download the generated icons
4. Place `logo192.png` and `logo512.png` in the `public` folder

### Option 2: Image Editor
1. Create a square image (512x512 minimum)
2. Export as PNG:
   - `logo192.png` at 192x192 pixels
   - `logo512.png` at 512x512 pixels
3. Place both files in the `public` folder

### Option 3: Quick Placeholder (For Testing)
You can use any square image and resize it:
- Use Paint, GIMP, Photoshop, or online tools
- Create simple colored squares with text "Todo" if needed
- Minimum requirement: Square PNG images at specified sizes

## File Location

```
public/
  ├── logo192.png  ← Add this file
  ├── logo512.png  ← Add this file
  └── manifest.json
```

## After Adding Icons

1. Rebuild your app:
   ```bash
   npm run build
   ```

2. Verify icons are included in the `build` folder

3. Test PWA installation on Android device

## Note

The icons are required for:
- Android home screen icon
- Android splash screen
- Google Play Store listing (if publishing)
- PWA installation prompts

Without these icons, the PWA will still work but may show default browser icons.

