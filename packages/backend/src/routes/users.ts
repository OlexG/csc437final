import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all users (public - for user listing/discovery)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const users = await UserService.getAllUsers(limit);
    
    res.json({
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by username (public - for profile viewing)
router.get('/:username', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const user = await UserService.findByUsername(username);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
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
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 