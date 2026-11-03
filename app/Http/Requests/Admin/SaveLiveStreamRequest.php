<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveLiveStreamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageNewsroom() ?? false;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'stream_url' => ['nullable', 'url:https,http', 'max:255'],
            'is_live' => ['boolean'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['title' => 'judul siaran', 'stream_url' => 'URL stream'];
    }
}
