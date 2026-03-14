import db from '../../config/db';
import bcrypt from 'bcrypt';

export class ProfileService {
  static async getProfile(userId: string) {
    const user = await db('users')
      .select('id', 'name', 'email', 'role', 'created_at')
      .where({ id: userId })
      .first();
    if (!user) throw new Error('User not found');
    return user;
  }

  static async updateProfile(userId: string, data: { name?: string; email?: string; current_password?: string; new_password?: string }) {
    const user = await db('users').where({ id: userId }).first();
    if (!user) throw new Error('User not found');

    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.email) {
      // Check uniqueness
      const existing = await db('users').where({ email: data.email }).whereNot({ id: userId }).first();
      if (existing) throw new Error('Email already in use');
      updateData.email = data.email;
    }

    if (data.new_password) {
      if (!data.current_password) throw new Error('Current password is required to set a new password');
      const match = await bcrypt.compare(data.current_password, user.password_hash);
      if (!match) throw new Error('Current password is incorrect');
      updateData.password_hash = await bcrypt.hash(data.new_password, 10);
    }

    if (Object.keys(updateData).length === 0) throw new Error('No fields to update');

    updateData.updated_at = db.fn.now();
    await db('users').where({ id: userId }).update(updateData);

    return ProfileService.getProfile(userId);
  }
}
