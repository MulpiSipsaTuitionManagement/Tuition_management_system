<?php

// app/Services/SMSService.php
namespace App\Services;

class SMSService
{
    protected $apiKey;
    protected $apiUrl;
    protected $provider;

    public function __construct()
    {
        $this->provider = env('SMS_PROVIDER', 'notify_lk'); // notify_lk, twilio, nexmo
        $this->apiKey = env('SMS_API_KEY');
        $this->setApiUrl();
    }

    protected function setApiUrl()
    {
        switch ($this->provider) {
            case 'notify_lk':
                $this->apiUrl = 'https://app.notify.lk/api/v1/send';
                break;
            case 'twilio':
                $this->apiUrl = 'https://api.twilio.com/2010-04-01/Accounts/' . env('TWILIO_ACCOUNT_SID') . '/Messages.json';
                break;
            case 'nexmo':
                $this->apiUrl = 'https://rest.nexmo.com/sms/json';
                break;
            default:
                $this->apiUrl = null;
        }
    }

    public function send($phoneNumber, $message)
    {
        // Clean phone number (remove spaces, dashes, etc.)
        $phoneNumber = preg_replace('/[^0-9+]/', '', $phoneNumber);

        try {
            switch ($this->provider) {
                case 'notify_lk':
                    return $this->sendViaNotifyLK($phoneNumber, $message);
                case 'twilio':
                    return $this->sendViaTwilio($phoneNumber, $message);
                case 'nexmo':
                    return $this->sendViaNexmo($phoneNumber, $message);
                default:
                    // For development/testing - just log the message
                    \Log::info("SMS to {$phoneNumber}: {$message}");
                    return [
                        'success' => true,
                        'message' => 'SMS logged (test mode)',
                        'provider' => 'test'
                    ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    protected function sendViaNotifyLK($phoneNumber, $message)
    {
        $client = new \GuzzleHttp\Client();

        $response = $client->post($this->apiUrl, [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json'
            ],
            'json' => [
                'user_id' => env('NOTIFY_LK_USER_ID'),
                'api_key' => $this->apiKey,
                'sender_id' => env('NOTIFY_LK_SENDER_ID', 'MulpiSipsa'),
                'to' => $phoneNumber,
                'message' => $message
            ]
        ]);

        $result = json_decode($response->getBody(), true);

        return [
            'success' => $result['status'] === 'success',
            'message' => $result['message'] ?? 'SMS sent',
            'provider' => 'notify_lk'
        ];
    }

    protected function sendViaTwilio($phoneNumber, $message)
    {
        $client = new \GuzzleHttp\Client();

        $response = $client->post($this->apiUrl, [
            'auth' => [env('TWILIO_ACCOUNT_SID'), env('TWILIO_AUTH_TOKEN')],
            'form_params' => [
                'From' => env('TWILIO_PHONE_NUMBER'),
                'To' => $phoneNumber,
                'Body' => $message
            ]
        ]);

        $result = json_decode($response->getBody(), true);

        return [
            'success' => isset($result['sid']),
            'message' => 'SMS sent via Twilio',
            'provider' => 'twilio',
            'message_id' => $result['sid'] ?? null
        ];
    }

    protected function sendViaNexmo($phoneNumber, $message)
    {
        $client = new \GuzzleHttp\Client();

        $response = $client->post($this->apiUrl, [
            'form_params' => [
                'api_key' => env('NEXMO_API_KEY'),
                'api_secret' => env('NEXMO_API_SECRET'),
                'from' => env('NEXMO_FROM', 'MulpiSipsa'),
                'to' => $phoneNumber,
                'text' => $message
            ]
        ]);

        $result = json_decode($response->getBody(), true);

        return [
            'success' => $result['messages'][0]['status'] === '0',
            'message' => 'SMS sent via Nexmo',
            'provider' => 'nexmo',
            'message_id' => $result['messages'][0]['message-id'] ?? null
        ];
    }

    public function sendBulk(array $recipients, $message)
    {
        $results = [];

        foreach ($recipients as $phoneNumber) {
            $results[] = $this->send($phoneNumber, $message);
            
            // Add small delay to avoid rate limiting
            usleep(100000); // 0.1 second delay
        }

        return $results;
    }
}