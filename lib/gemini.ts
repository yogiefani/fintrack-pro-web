import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface ReceiptScanResult {
  merchant_name: string;
  date: string;
  items: {
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  confidence_score: number;
}

export async function scanReceiptImage(imageBase64: string, mimeType: string): Promise<ReceiptScanResult> {
  const RECEIPT_PROMPT = `Analyze this receipt/invoice image and extract the following data. Return ONLY valid JSON, no explanation or markdown.

{
  "merchant_name": "string - store/restaurant name",
  "date": "string - ISO date format YYYY-MM-DD, use today if unclear",
  "items": [
    {
      "name": "string",
      "quantity": number,
      "unit_price": number,
      "total_price": number
    }
  ],
  "subtotal": number,
  "tax_amount": number,
  "total_amount": number,
  "currency": "string - IDR, USD, SGD etc. Default IDR",
  "confidence_score": number between 0 and 1
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
          { text: RECEIPT_PROMPT },
        ],
      },
    ],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();

  return JSON.parse(cleaned) as ReceiptScanResult;
}

export async function getFinancialInsight(context: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Kamu adalah AI Financial Advisor. Berikan 1 insight/tip finansial singkat (2-3 kalimat) berdasarkan data berikut:\n\n${context}\n\nGunakan bahasa Indonesia yang ramah dan actionable.`,
          },
        ],
      },
    ],
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada insight tersedia.';
}
