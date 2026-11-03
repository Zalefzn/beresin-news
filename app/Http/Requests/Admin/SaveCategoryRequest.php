<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Models\Category;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SaveCategoryRequest extends FormRequest
{
    /** @var list<string> */
    public const array COLORS = ['bg-blue-600', 'bg-purple-600', 'bg-rose-600', 'bg-emerald-600', 'bg-amber-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-orange-600', 'bg-teal-600', 'bg-pink-600'];

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
        /** @var Category|null $category */
        $category = $this->route('category');

        return [
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('categories', 'slug')->ignore($category?->id)],
            'color' => ['required', Rule::in(self::COLORS)],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['name' => 'nama', 'color' => 'warna', 'description' => 'deskripsi'];
    }
}
