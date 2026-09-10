<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SemaphoreService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://api.semaphore.co/api/v4';

    public function __construct()
    {
        $this->apiKey = env('SEMAPHORE_API_KEY');
    }

    /**
     * Send SMS to a single recipient
     */
    public function sendSMS(string $number, string $message, string $senderName = 'Barangay178'): array
    {
        try {
            $response = Http::asForm()->withoutVerifying()->post("{$this->baseUrl}/messages", [
                'apikey' => $this->apiKey,
                'number' => $this->formatPhoneNumber($number),
                'message' => $message,
                'sendername' => $senderName,
            ]);

            $data = $response->json();

            if ($response->successful() && isset($data[0]['status']) && $data[0]['status'] === 'success') {
                Log::info("SMS sent successfully to {$number}", ['message_id' => $data[0]['message_id']]);
                return [
                    'success' => true,
                    'message_id' => $data[0]['message_id'],
                    'data' => $data[0],
                ];
            }

            Log::error("Failed to send SMS to {$number}", ['response' => $data]);
            return [
                'success' => false,
                'error' => $data[0]['message'] ?? 'Unknown error',
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
    public function sendBulkSMS(array $numbers, string $message, string $senderName = 'Barangay178'): array
    {
        $results = [];
        $successCount = 0;
        $failureCount = 0;

        foreach ($numbers as $number) {
            $result = $this->sendSMS($number, $message, $senderName);
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
     * Format phone number to Philippine format (09XXXXXXXXX)
     */
    protected function formatPhoneNumber(string $number): string
    {
        // Remove all non-numeric characters
        $number = preg_replace('/[^0-9]/', '', $number);

        // If starts with 63, replace with 0
        if (str_starts_with($number, '63')) {
            $number = '0' . substr($number, 2);
        }

        // If starts with +63, replace with 0
        if (str_starts_with($number, '+63')) {
            $number = '0' . substr($number, 3);
        }

        // Ensure it starts with 09
        if (!str_starts_with($number, '09')) {
            // If it's 9 digits starting with 9, prepend 0
            if (strlen($number) === 10 && str_starts_with($number, '9')) {
                $number = '0' . $number;
            }
        }

        return $number;
    }

    /**
     * Get account balance
     */
    public function getBalance(): array
    {
        try {
            $response = Http::withoutVerifying()->get("{$this->baseUrl}/account", [
                'apikey' => $this->apiKey,
            ]);

            $data = $response->json();

            if ($response->successful()) {
                return [
                    'success' => true,
                    'balance' => $data['balance'] ?? 0,
                    'data' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => 'Failed to fetch balance',
                'data' => $data,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
