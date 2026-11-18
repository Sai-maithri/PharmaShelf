import { GoogleGenAI, Type } from '@google/genai';
import type { OcrPackResult } from '../src/types.ts';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function extractMedicinePackFromImage(
  base64Data: string,
  mimeType: string
): Promise<OcrPackResult> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('OCR_NOT_CONFIGURED');
  }

  const cleanBase64 = base64Data.includes(',')
    ? base64Data.split(',')[1]
    : base64Data;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        },
        {
          text: [
            'Read the printed text on this medicine pack / strip / bottle photo.',
            'Extract ONLY what is clearly printed and legible:',
            '1. medicineName: The brand or generic medicine name & strength if visible (e.g., "Paracetamol 650mg").',
            '2. manufacturer: The pharmaceutical manufacturer name if clearly printed.',
            '3. batchNumber: The batch/lot number (often labeled B.No., Batch No., Lot).',
            '4. expiryRaw: The printed expiry date exactly as printed (e.g., "12/2026", "08/2027", or "15/09/2026"). Do NOT convert MM/YYYY into a day.',
            '5. notes: Brief observation if any field is blurry, cut off, or partially obscured.',
            'CRITICAL RULE: NEVER guess, invent, or infer missing batch numbers or expiry dates. If a field is not clearly readable in the photo, return null for that field.',
          ].join('\n'),
        },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          medicineName: { type: Type.STRING, nullable: true },
          manufacturer: { type: Type.STRING, nullable: true },
          batchNumber: { type: Type.STRING, nullable: true },
          expiryRaw: { type: Type.STRING, nullable: true },
          notes: { type: Type.STRING, nullable: true },
        },
      },
    },
  });

  const text = (response.text ?? '{}').trim();
  const parsed = JSON.parse(text) as Partial<OcrPackResult>;
  return {
    medicineName: parsed.medicineName?.trim() || null,
    manufacturer: parsed.manufacturer?.trim() || null,
    batchNumber: parsed.batchNumber?.trim() || null,
    expiryRaw: parsed.expiryRaw?.trim() || null,
    notes: parsed.notes?.trim() || null,
  };
}
