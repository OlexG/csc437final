import Tweep, { ITweep } from '../models/Tweep';

export class TweepService {
  // Create a new tweep
  static async createTweep(tweepData: {
    username: string;
    audioData: Buffer;
    duration: string;
  }): Promise<ITweep | null> {
    try {
      const tweep = new Tweep(tweepData);
      return await tweep.save();
    } catch (error) {
      console.error('Error creating tweep:', error);
      return null;
    }
  }

  // Delete a tweep by ID (only by the owner)
  static async deleteTweep(tweepId: string, username: string): Promise<boolean> {
    try {
      const result = await Tweep.findOneAndDelete({
        _id: tweepId,
        username: username // Ensure only the owner can delete
      });
      return !!result;
    } catch (error) {
      console.error('Error deleting tweep:', error);
      return false;
    }
  }

  // Get tweeps by username
  static async getTweepsByUsername(username: string): Promise<ITweep[]> {
    try {
      return await Tweep.find({ username })
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting tweeps by username:', error);
      return [];
    }
  }

  // Get all tweeps (for homepage feed)
  static async getAllTweeps(): Promise<ITweep[]> {
    try {
      return await Tweep.find()
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all tweeps:', error);
      return [];
    }
  }

  // Get a single tweep by ID
  static async getTweepById(tweepId: string): Promise<ITweep | null> {
    try {
      return await Tweep.findById(tweepId);
    } catch (error) {
      console.error('Error getting tweep by ID:', error);
      return null;
    }
  }

  // Update username for all tweeps by a user
  static async updateUsernameForAllTweeps(oldUsername: string, newUsername: string): Promise<boolean> {
    try {
      const result = await Tweep.updateMany(
        { username: oldUsername },
        { username: newUsername }
      );
      return result.acknowledged;
    } catch (error) {
      console.error('Error updating username for tweeps:', error);
      return false;
    }
  }
} 