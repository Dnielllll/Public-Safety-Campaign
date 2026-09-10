<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IProgService
{
    protected string $apiToken;
    protected string $baseUrl = 'https://www.iprogsms.com/api/v1/sms_messages';

    public function __construct()
    {
        $this->apiToken = env('IPROG_API_TOKEN');
    }

    /**
     * Send SMS to a single recipient
     */
    public function sendSMS(string $number, string $message): array
    {
        try {
            $response = Http::withoutVerifying()->asForm()->post($this->baseUrl, [
                'api_token' => $this->apiToken,
                'message' => $message,
                'phone_number' => $this->formatPhoneNumber($number),
            ]);

            $data = $response->json();

            Log::info("iProg SMS response", ['response' => $data, 'status' => $response->status()]);

            if ($response->successful()) {
                Log::info("SMS sent successfully to {$number}");
                return [
                    'success' => true,
                    'data' => $data,
                ];
            }

            Log::error("Failed to send SMS to {$number}", ['response' => $data]);
            return [
                'success' => false,
                'error' => $data['message'] ?? 'Unknown error',
                'data' => $data,
            ];
        } catch (\Exception $e) {
            Log::error("SMS sending exception", ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send SMS to multiple recipients
     */
    public function sendBulkSMS(array $numbers, string $message): array
    {
        $results = [];
        $successCount = 0;
        $failureCount = 0;

        foreach ($numbers as $number) {
            $result = $this->sendSMS($number, $message);
            $results[] = [
                'number' => $number,
                'result' => $result,
            ];

            if ($result['success']) {
                $successCount++;
            } else {
                $failureCount++;
            }

            // Small delay to avoid rate limiting
            usleep(100000); // 100ms
        }

        return [
            'success' => $failureCount === 0,
            'total' => count($numbers),
            'success_count' => $successCount,
            'failure_count' => $failureCount,
            'results' => $results,
        ];
    }

    /**
     * Format phone number to Philippine format (63XXXXXXXXX)
     * iProg expects format like 639109432834
     */
    protected function formatPhoneNumber(string $number): string
    {
        // Remove all non-numeric characters
        $number = preg_replace('/[^0-9]/', '', $number);

        // If starts with 0, replace with 63
        if (str_starts_with($number, '0')) {
            $number = '63' . substr($number, 1);
        }

        // If starts with +63, remove the +
        if (str_starts_with($number, '+63')) {
            $number = substr($number, 1);
        }

        // Ensure it starts with 63
        if (!str_starts_with($number, '63')) {
            // If it's 10 digits starting with 9, prepend 63
            if (strlen($number) === 10 && str_starts_with($number, '9')) {
                $number = '63' . $number;
            }
        }

        return $number;
    }
}
