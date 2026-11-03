<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Models\Tag;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SaveTagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['slug' => $this->input('slug') ?: Str::slug((string) $this->input('name'))]);
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        /** @var Tag|null $tag */
        $tag = $this->route('tag');

        return [
            'name' => ['required', 'string', 'max:50'],
            'slug' => ['required', 'string', 'max:60', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('tags', 'slug')->ignore($tag?->id)],
            'is_trending' => ['boolean'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['name' => 'nama tag'];
    }
}
