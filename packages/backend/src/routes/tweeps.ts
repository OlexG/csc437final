import { Router, Request, Response } from 'express';
import multer from 'multer';
import { TweepService } from '../services/tweepService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Configure multer for audio file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Create a new tweep (requires authentication)
router.post('/', authenticateToken, upload.single('audio'), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const { duration } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      res.status(400).json({ error: 'Audio file is required' });
      return;
    }

    if (!duration) {
      res.status(400).json({ error: 'Duration is required' });
      return;
    }

    // Validate duration format (HH:MM:SS)
    const durationRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (!durationRegex.test(duration)) {
      res.status(400).json({ error: 'Duration must be in HH:MM:SS format' });
      return;
    }

    const tweep = await TweepService.createTweep({
      username: user.username,
      audioData: audioFile.buffer,
      duration
    });

    if (!tweep) {
      res.status(500).json({ error: 'Failed to create tweep' });
      return;
    }

    res.status(201).json({
      message: 'Tweep created successfully',
      tweep: {
        id: tweep._id,
        username: tweep.username,
        duration: tweep.duration,
        createdAt: tweep.createdAt
      }
    });
  } catch (error) {
    console.error('Create tweep error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all tweeps (public - for homepage feed)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const tweeps = await TweepService.getAllTweeps();

    const tweepsWithoutAudioData = tweeps.map(tweep => ({
      id: tweep._id,
      username: tweep.username,
      duration: tweep.duration,
      createdAt: tweep.createdAt
    }));

    res.json({
      tweeps: tweepsWithoutAudioData
    });
  } catch (error) {
    console.error('Get tweeps error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tweeps by username (public)
router.get('/user/:username', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const tweeps = await TweepService.getTweepsByUsername(username);

    const tweepsWithoutAudioData = tweeps.map(tweep => ({
      id: tweep._id,
      username: tweep.username,
      duration: tweep.duration,
      createdAt: tweep.createdAt
    }));

    res.json({
      tweeps: tweepsWithoutAudioData
    });
  } catch (error) {
    console.error('Get user tweeps error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get audio file for a specific tweep (public)
router.get('/:id/audio', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tweep = await TweepService.getTweepById(id);

    if (!tweep) {
      res.status(404).json({ error: 'Tweep not found' });
      return;
    }

    res.set({
      'Content-Type': 'audio/wav', // Default to wav
      'Content-Length': tweep.audioData.length.toString(),
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    });

    res.send(tweep.audioData);
  } catch (error) {
    console.error('Get audio error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a tweep (requires authentication and ownership)
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const { id } = req.params;
    const success = await TweepService.deleteTweep(id, user.username);

    if (!success) {
      res.status(404).json({ error: 'Tweep not found or not authorized to delete' });
      return;
    }

    res.json({ message: 'Tweep deleted successfully' });
  } catch (error) {
    console.error('Delete tweep error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 