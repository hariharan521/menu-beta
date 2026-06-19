import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { MenuData } from '@/types/menu';

const dataPath = path.join(process.cwd(), 'data', 'menu.json');

async function getMenuFromFile(): Promise<MenuData> {
  const fileContent = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(fileContent) as MenuData;
}

async function saveMenuToFile(data: MenuData): Promise<void> {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const data = await getMenuFromFile();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading menu file:', error);
    return NextResponse.json(
      { error: 'Failed to read menu data' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    if (!body || !body.cafeSettings || !body.categories || !body.items) {
      return NextResponse.json(
        { error: 'Invalid menu data structure' },
        { status: 400 }
      );
    }

    await saveMenuToFile(body);
    return NextResponse.json({ message: 'Menu updated successfully' });
  } catch (error) {
    console.error('Error updating menu file:', error);
    return NextResponse.json(
      { error: 'Failed to save menu data' },
      { status: 500 }
    );
  }
}
