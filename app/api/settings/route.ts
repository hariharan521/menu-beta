import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || authHeader !== adminPassword) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid password' },
        { status: 401 }
      );
    }

    const { newPassword } = await request.json();
    if (!newPassword || newPassword.trim().length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters long' },
        { status: 400 }
      );
    }

    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = `ADMIN_PASSWORD=${newPassword.trim()}\n`;
    
    await fs.writeFile(envPath, envContent, 'utf-8');

    // Update in memory for the running server instance
    process.env.ADMIN_PASSWORD = newPassword.trim();

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error saving password setting:', error);
    return NextResponse.json(
      { error: 'Failed to update credentials' },
      { status: 500 }
    );
  }
}
