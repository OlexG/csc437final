import User, { IUser } from '../models/User';

export class UserService {
  // Find user by ID
  static async findById(userId: string): Promise<IUser | null> {
    try {
      return await User.findById(userId).select('-password');
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  // Find user by username
  static async findByUsername(username: string): Promise<IUser | null> {
    try {
      return await User.findOne({ username }).select('-password');
    } catch (error) {
      console.error('Error finding user by username:', error);
      return null;
    }
  }

  // Find user by username (with password for auth)
  static async findByUsernameWithPassword(username: string): Promise<IUser | null> {
    try {
      return await User.findOne({ username });
    } catch (error) {
      console.error('Error finding user by username:', error);
      return null;
    }
  }

  // Create new user
  static async createUser(userData: {
    username: string;
    password: string;
  }): Promise<IUser | null> {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // Check if username exists
  static async usernameExists(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      const query: any = { username };
      if (excludeUserId) {
        query._id = { $ne: excludeUserId };
      }
      const user = await User.findOne(query);
      return !!user;
    } catch (error) {
      console.error('Error checking username existence:', error);
      return false;
    }
  }

  // Get user profile without password
  static async getUserProfile(userId: string): Promise<{
    id: string;
    username: string;
    createdAt: Date;
  } | null> {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) return null;

      return {
        id: (user._id as string).toString(),
        username: user.username,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Get all users (for admin purposes or user listing)
  static async getAllUsers(limit: number = 50): Promise<Array<{
    id: string;
    username: string;
    createdAt: Date;
  }>> {
    try {
      const users = await User.find()
        .select('username createdAt')
        .sort({ createdAt: -1 })
        .limit(limit);

      return users.map(user => ({
        id: (user._id as string).toString(),
        username: user.username,
        createdAt: user.createdAt
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
} 