<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\ArticleStatus;
use App\Models\Article;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaveArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessNewsroom() ?? false;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        /** @var Article|null $article */
        $article = $this->route('article');

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('articles', 'slug')->ignore($article?->id)],
            'dateline' => ['nullable', 'string', 'max:100'],
            'excerpt' => ['nullable', 'string', 'max:300'],
            'body' => ['required', 'string'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'cover_caption' => ['nullable', 'string', 'max:255'],
            'cover_credit' => ['nullable', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'tags' => ['nullable', 'array', 'max:15'],
            'tags.*' => ['string', 'max:50'],
            'is_headline' => ['boolean'],
            'is_trending' => ['boolean'],
            'is_breaking' => ['boolean'],
            'status' => ['required', Rule::enum(ArticleStatus::class)],
            'published_at' => ['nullable', 'date', Rule::requiredIf($this->input('status') === ArticleStatus::Scheduled->value), Rule::when($this->input('status') === ArticleStatus::Scheduled->value, 'after:now')],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $status = ArticleStatus::tryFrom((string) $this->input('status'));

            if ($status?->requiresPublishPermission() && ! $this->user()?->isAdmin()) {
                $validator->errors()->add('status', 'Hanya admin yang dapat menerbitkan artikel. Ajukan untuk ditinjau admin.');
            }

            /** @var Article|null $article */
            $article = $this->route('article');

            if ($status?->requiresPublishPermission() && $article?->package !== null && ! $article->hasPaidOrder()) {
                $validator->errors()->add('status', 'Naskah berbayar ini belum lunas, jadi belum bisa diterbitkan.');
            }
        });
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'title' => 'judul',
            'body' => 'isi artikel',
            'excerpt' => 'ringkasan',
            'category_id' => 'kategori',
            'cover' => 'gambar sampul',
            'published_at' => 'jadwal terbit',
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'slug.regex' => 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.',
            'published_at.required' => 'Jadwal terbit wajib diisi untuk artikel terjadwal.',
            'published_at.after' => 'Jadwal terbit harus di masa depan.',
        ];
    }
}
