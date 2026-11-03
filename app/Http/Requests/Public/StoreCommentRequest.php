<?php

declare(strict_types=1);

namespace App\Http\Requests\Public;

use App\Enums\CommentStatus;
use App\Models\Article;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        $isGuest = $this->user() === null;
        /** @var Article $article */
        $article = $this->route('article');

        return [
            'name' => [Rule::requiredIf($isGuest), 'nullable', 'string', 'min:2', 'max:60'],
            'email' => [Rule::requiredIf($isGuest), 'nullable', 'email', 'max:255'],
            'body' => ['required', 'string', 'min:3', 'max:1000'],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('comments', 'id')
                    ->where('article_id', $article->id)
                    ->where('status', CommentStatus::Approved->value)
                    ->whereNull('parent_id'),
            ],
            'website' => ['nullable', 'string'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi.',
            'name.min' => 'Nama minimal 2 karakter.',
            'name.max' => 'Nama maksimal 60 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'body.required' => 'Komentar wajib diisi.',
            'body.min' => 'Komentar minimal 3 karakter.',
            'body.max' => 'Komentar maksimal 1000 karakter.',
            'parent_id.exists' => 'Komentar yang dibalas tidak ditemukan.',
        ];
    }
}
