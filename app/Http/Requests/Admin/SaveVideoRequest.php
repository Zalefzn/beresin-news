<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Models\Video;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SaveVideoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageNewsroom() ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['slug' => $this->input('slug') ?: Str::slug((string) $this->input('title'))]);
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        /** @var Video|null $video */
        $video = $this->route('video');

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('videos', 'slug')->ignore($video?->id)],
            'source_url' => ['required', 'url:https,http', 'max:255'],
            'thumbnail' => ['nullable', 'url:https,http', 'max:255'],
            'duration' => ['nullable', 'string', 'regex:/^\d{1,3}:\d{2}(:\d{2})?$/'],
            'description' => ['nullable', 'string', 'max:2000'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'published_at' => ['nullable', 'date'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['title' => 'judul', 'source_url' => 'URL video', 'thumbnail' => 'URL thumbnail', 'duration' => 'durasi', 'description' => 'deskripsi'];
    }
}
