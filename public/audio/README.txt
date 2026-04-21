Drop your engine-rev.mp3 (loopable, ~2-4s) into this directory.

The Tachometer loading screen references /audio/engine-rev.mp3 and gracefully
fails if the file is missing (user toggles are no-ops without audio).

Recommended sources:
- Record a real bike rev with a phone at ~1m away, 44.1kHz mono, trim to 2-4s loop.
- freesound.org / zapsplat.com (check licences).
- Use Audacity: Amplify -1 dB, Fade In 100ms, Fade Out 100ms, export 128kbps MP3.
