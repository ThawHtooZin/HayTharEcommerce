<?php

namespace Tests\Feature\Api;

use Tests\TestCase;

class NewsletterApiTest extends TestCase
{
    public function test_newsletter_subscribe_creates_subscription(): void
    {
        $this->postJson('/api/newsletter', ['email' => 'fan@example.com'])
            ->assertCreated()
            ->assertJsonPath('message', 'Subscribed! Check your inbox for 10% off.');

        $this->assertDatabaseHas('newsletter_subscriptions', ['email' => 'fan@example.com']);
    }

    public function test_newsletter_rejects_duplicate_email(): void
    {
        $this->postJson('/api/newsletter', ['email' => 'fan@example.com'])->assertCreated();

        $this->postJson('/api/newsletter', ['email' => 'fan@example.com'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }
}
