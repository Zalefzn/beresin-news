<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveBreakingNewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageNewsroom() ?? false;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'text' => ['required', 'string', 'max:255'],
            'article_id' => ['nullable', 'integer', 'exists:articles,id'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['text' => 'teks', 'starts_at' => 'waktu mulai', 'ends_at' => 'waktu selesai'];
    }
}
