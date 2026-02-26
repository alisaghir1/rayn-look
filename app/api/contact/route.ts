import { NextRequest, NextResponse } from 'next/server';

// POST /api/contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Sanitize inputs
    const sanitized = {
      name: name.slice(0, 100).trim(),
      email: email.slice(0, 255).trim(),
      subject: subject.slice(0, 200).trim(),
      message: message.slice(0, 5000).trim(),
    };

    // In production, send email via Supabase Edge Function, Resend, or similar
    console.log('Contact form submission:', sanitized);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/contact error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
