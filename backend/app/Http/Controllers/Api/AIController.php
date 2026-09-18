<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
    /**
     * Generate text-to-speech audio using Google Cloud TTS
     */
    public function textToSpeech(Request $request)
    {
        $request->validate([
            'text' => 'required|string|max:5000',
            'voice' => 'sometimes|string|in:fil-PH-Wavenet-A,fil-PH-Wavenet-B,en-US-Wavenet-D',
        ]);

        $text = $request->input('text');
        $voice = $request->input('voice', 'fil-PH-Wavenet-A');

        // Map voice selection to Google Cloud TTS voice names
        $voiceMap = [
            'fil-PH-Wavenet-A' => 'fil-PH-Wavenet-A', // Filipino Female
            'fil-PH-Wavenet-B' => 'fil-PH-Wavenet-B', // Filipino Male
            'en-US-Wavenet-D' => 'en-US-Wavenet-D',   // English Male
        ];

        $selectedVoice = $voiceMap[$voice] ?? 'fil-PH-Wavenet-A';

        // Get Google Cloud credentials from environment
        $apiKey = env('GOOGLE_CLOUD_API_KEY');
        
        if (!$apiKey) {
            return response()->json([
                'error' => 'Google Cloud API key not configured',
                'message' => 'Please configure GOOGLE_CLOUD_API_KEY in environment settings'
            ], 500);
        }

        try {
            // Call Google Cloud Text-to-Speech API
            $response = Http::post('https://texttospeech.googleapis.com/v1/text:synthesize?key=' . $apiKey, [
                'input' => [
                    'text' => $text
                ],
                'voice' => [
                    'languageCode' => 'fil-PH',
                    'name' => $selectedVoice
                ],
                'audioConfig' => [
                    'audioEncoding' => 'MP3',
                    'speakingRate' => 0.9,
                    'pitch' => 0
                ]
            ]);

            if ($response->failed()) {
                return response()->json([
                    'error' => 'Google Cloud TTS API error',
                    'message' => $response->json()['error']['message'] ?? 'Unknown error'
                ], $response->status());
            }

            $audioContent = $response->json()['audioContent'];

            // Return the base64 encoded audio content
            return response()->json([
                'success' => true,
                'audioContent' => $audioContent,
                'voice' => $selectedVoice
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate speech',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate AI text content (placeholder for future implementation)
     */
    public function generateText(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string',
            'category' => 'sometimes|string'
        ]);

        // Placeholder for AI text generation
        return response()->json([
            'error' => 'AI text generation not yet implemented',
            'message' => 'This feature will be integrated with Google Cloud or OpenAI API'
        ], 501);
    }

    /**
     * Rewrite content using AI (placeholder for future implementation)
     */
    public function rewrite(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'instruction' => 'sometimes|string'
        ]);

        // Placeholder for AI rewrite
        return response()->json([
            'error' => 'AI rewrite not yet implemented',
            'message' => 'This feature will be integrated with Google Cloud or OpenAI API'
        ], 501);
    }
}
