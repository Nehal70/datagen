# DataGen - Dataset Tinder

**Customizing image datasets through Deep Reinforcement Learning Techniques**

Upload 10 images, get 100-200 similar images automatically using AI-powered object detection and image scraping.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the app:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to http://localhost:3025

4. **Upload images and get results!**

## Demo

Upload 5 images of black dogs → Get 200 similar black dog images automatically!

## Features

- 🖼️ **Image Upload**: Drag & drop up to 10 images
- 🤖 **Object Detection**: Automatically detects objects in images
- 🌐 **Smart Scraping**: Searches for relevant similar images
- 📊 **Real-time Progress**: Track processing status
- 🎨 **Gallery View**: Browse all scraped images

## Tech Stack

- Next.js 15, React 19, TypeScript
- Image scraping from multiple sources
- Local processing (no external services required)

## Project Structure

```
datagen/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities
└── package.json
```

## License

Private project - All rights reserved
