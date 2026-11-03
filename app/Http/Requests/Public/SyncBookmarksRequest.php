<?php

declare(strict_types=1);

namespace App\Http\Requests\Public;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SyncBookmarksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'max:100'],
            'ids.*' => ['integer', 'min:1'],
        ];
    }
}
