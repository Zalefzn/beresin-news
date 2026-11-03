<?php

declare(strict_types=1);

namespace App\Http\Requests\Dashboard;

use App\Enums\ArticlePackage;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:10', 'max:255'],
            'dateline' => ['nullable', 'string', 'max:100'],
            'excerpt' => ['required', 'string', 'max:300'],
            'body' => ['required', 'string'],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')->where('is_active', true)],
            'package' => ['required', Rule::enum(ArticlePackage::class)],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'cover_caption' => ['nullable', 'string', 'max:255'],
            'cover_credit' => ['nullable', 'string', 'max:255'],
            'pay_now' => ['boolean'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'title' => 'judul',
            'body' => 'isi berita',
            'excerpt' => 'ringkasan',
            'category_id' => 'kategori',
            'package' => 'paket',
            'cover' => 'gambar sampul',
        ];
    }
}
