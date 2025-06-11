import { Router, Request, Response } from 'express';
import User from '../models/User';
import { TweepService } from '../services/tweepService';
import { generateToken, authenticateToken } from '../middleware/auth';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      res.status(400).json({ error: 'Username already taken' });
      return;
    }

    // Create new user
    const user = new User({
      username,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken((user._id as string).toString());

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken((user._id as string).toString());

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile (display name only)
router.put('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const { displayName } = req.body;

    // Validate input
    if (!displayName) {
      res.status(400).json({ error: 'Display name is required' });
      return;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { displayName },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change username
router.put('/change-username', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const { newUsername } = req.body;

    // Validate input
    if (!newUsername) {
      res.status(400).json({ error: 'New username is required' });
      return;
    }

    // Check if new username is different from current
    if (newUsername === user.username) {
      res.status(400).json({ error: 'New username must be different from current username' });
      return;
    }

    // Check if new username is already taken
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      res.status(400).json({ error: 'Username already taken' });
      return;
    }

    // Store old username for tweep updates
    const oldUsername = user.username;

    // Update username
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { username: newUsername },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update all tweeps with the old username to use the new username
    const tweepsUpdated = await TweepService.updateUsernameForAllTweeps(oldUsername, newUsername);
    if (!tweepsUpdated) {
      console.warn(`Failed to update tweeps for username change: ${oldUsername} -> ${newUsername}`);
    }

    res.json({
      message: 'Username changed successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Username change error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 