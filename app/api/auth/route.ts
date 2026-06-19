import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password is not configured on the server.' },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      return NextResponse.json({
        success: true,
        token: adminPassword, // Simple token for header verification
      });
    }

    return NextResponse.json(
      { error: 'Incorrect password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Server authentication error' },
      { status: 500 }
    );
  }
}
