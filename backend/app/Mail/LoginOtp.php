<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class LoginOtp extends Mailable
{
    public function __construct(public readonly string $code) {}

    public function build(): static
    {
        return $this->subject('Your Prosthuti sign-in code')->text('mail.otp');
    }
}
