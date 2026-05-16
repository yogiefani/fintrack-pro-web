import { NextRequest, NextResponse } from 'next/server';
import { scanReceiptImage } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported image format' }, { status: 400 });
    }

    // Convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const result = await scanReceiptImage(base64, file.type);

    // Upload image to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, file, { contentType: file.type });

    let imageUrl: string | null = null;
    if (!uploadError && uploadData) {
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(uploadData.path);
      imageUrl = urlData.publicUrl;
    }

    return NextResponse.json({ ...result, imageUrl });
  } catch (err) {
    console.error('Scan receipt error:', err);
    return NextResponse.json({ error: 'Failed to scan receipt' }, { status: 500 });
  }
}
