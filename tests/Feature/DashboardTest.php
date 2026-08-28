<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_operator_is_redirected_to_operator_dashboard()
    {
        $user = User::factory()->operator()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('dashboard.admin'));

        $opResponse = $this->get(route('dashboard.admin'));
        $opResponse->assertOk();
    }

    public function test_authenticated_port_master_is_redirected_to_port_master_dashboard()
    {
        $user = User::factory()->kepalaPelabuhan()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('port.dashboard'));
    }
}
