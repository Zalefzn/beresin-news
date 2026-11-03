<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveTvProgramRequest extends FormRequest
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
            'description' => ['nullable', 'string', 'max:1000'],
            'hosts' => ['nullable', 'string', 'max:255'],
            'day_of_week' => ['nullable', 'integer', 'between:0,6'],
            'starts_at' => ['required', 'date_format:H:i'],
            'ends_at' => ['required', 'date_format:H:i', 'after:starts_at'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['title' => 'judul', 'hosts' => 'pembawa acara', 'starts_at' => 'jam mulai', 'ends_at' => 'jam selesai'];
    }
}
