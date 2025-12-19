import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("authToken", "", {
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
  });
  return response;
}
