<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AutosaveArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessNewsroom() ?? false;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'dateline' => ['nullable', 'string', 'max:100'],
            'excerpt' => ['nullable', 'string', 'max:300'],
            'body' => ['nullable', 'string'],
        ];
    }
}
