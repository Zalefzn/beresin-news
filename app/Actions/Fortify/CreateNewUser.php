<?php

namespace App\Actions\Fortify;

use App\Actions\NotifyNewsroom;
use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Notifications\SubmissionNotification;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    public function __construct(private NotifyNewsroom $newsroom) {}

    /**
     * Validate and create a newly registered user. The account waits for an admin to approve it.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
        ]);

        $this->newsroom->handle(SubmissionNotification::registrationPending($user));

        return $user;
    }
}
