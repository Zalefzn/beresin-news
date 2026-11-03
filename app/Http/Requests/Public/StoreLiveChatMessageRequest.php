<?php

declare(strict_types=1);

namespace App\Http\Requests\Public;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLiveChatMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->chat_blocked_at === null;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return ['body' => ['required', 'string', 'max:200']];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'body.required' => 'Pesan tidak boleh kosong.',
            'body.max' => 'Pesan maksimal 200 karakter.',
        ];
    }
}
