<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GenericEmail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public string $customSubject,
        public string $customView,
        public array $data = []
    ) {}

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject($this->customSubject)
            ->view($this->customView, $this->data);
    }
}
