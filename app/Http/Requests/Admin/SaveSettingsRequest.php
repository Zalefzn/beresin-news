<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'site_name' => ['required', 'string', 'max:100'],
            'weather_city' => ['required', 'string', 'max:60'],
            'weather_temp' => ['required', 'string', 'max:10'],
            'social' => ['array'],
            'social.facebook' => ['nullable', 'url:https,http'],
            'social.x' => ['nullable', 'url:https,http'],
            'social.youtube' => ['nullable', 'url:https,http'],
            'social.instagram' => ['nullable', 'url:https,http'],
            'contact' => ['array'],
            'contact.address' => ['nullable', 'string', 'max:500'],
            'contact.email' => ['nullable', 'email'],
            'contact.phone' => ['nullable', 'string', 'max:30'],
            'footer_text' => ['nullable', 'string', 'max:500'],
            'analytics_code' => ['nullable', 'string', 'max:30', 'regex:/^[A-Za-z0-9-]+$/'],
            'live_quality' => ['nullable', 'string', 'max:30'],
            'live_studio' => ['nullable', 'string', 'max:100'],
            'price_general' => ['sometimes', 'required', 'integer', 'min:1000', 'max:100000000'],
            'price_branding' => ['sometimes', 'required', 'integer', 'min:1000', 'max:100000000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'analytics_code.regex' => 'Kode analytics hanya berupa ID pengukuran, misalnya G-ABC123.',
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'site_name' => 'nama situs',
            'weather_city' => 'kota cuaca',
            'weather_temp' => 'suhu',
            'contact.address' => 'alamat',
            'contact.email' => 'email redaksi',
            'contact.phone' => 'telepon',
            'footer_text' => 'teks footer',
            'price_general' => 'harga berita umum',
            'price_branding' => 'harga berita khusus',
        ];
    }
}
