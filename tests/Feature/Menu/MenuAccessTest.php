<?php

namespace Tests\Feature\Menu;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MenuAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // ensure vite manifest exists for Inertia layout during tests
        $buildDir = public_path('build');
        if (! file_exists($buildDir)) {
            mkdir($buildDir, 0777, true);
        }

        // create a minimal manifest that the Vite helper expects during tests
        $manifest = [
            'resources/css/app.css' => ['file' => 'app.css', 'src' => 'resources/css/app.css'],
            'resources/js/app.jsx' => ['file' => 'app.js', 'src' => 'resources/js/app.jsx'],
            'resources/js/Pages/Dashboard/Parts/Stock/Create.jsx' => ['file' => 'pages/Dashboard/Parts/Stock/Create.js', 'src' => 'resources/js/Pages/Dashboard/Parts/Stock/Create.jsx'],
        ];

        file_put_contents(public_path('build/manifest.json'), json_encode($manifest));

        // ensure referenced files exist
        file_put_contents(public_path('build/app.css'), '/* test css */');
        file_put_contents(public_path('build/app.js'), '// test js');
        if (! file_exists(public_path('build/pages/Dashboard/Parts/Stock'))) {
            mkdir(public_path('build/pages/Dashboard/Parts/Stock'), 0777, true);
        }
        file_put_contents(public_path('build/pages/Dashboard/Parts/Stock/Create.js'), '// page stub');
    }

    public function test_super_admin_can_access_stock_in_and_out_routes()
    {
        Permission::firstOrCreate(['name' => 'parts-stock-in', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'parts-stock-out', 'guard_name' => 'web']);

        $role = Role::firstOrCreate(['name' => 'super-admin']);
        $role->givePermissionTo(Permission::all());

        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $this->actingAs($user)->get(route('parts.stock.in.create'))->assertOk();
        $this->actingAs($user)->get(route('parts.stock.out.create'))->assertOk();
    }

    public function test_non_privileged_user_gets_forbidden_on_stock_in_out()
    {
        $user = User::factory()->create();

        $response1 = $this->actingAs($user)->get(route('parts.stock.in.create'));
        $response2 = $this->actingAs($user)->get(route('parts.stock.out.create'));

        $this->assertFalse($response1->isOk());
        $this->assertFalse($response2->isOk());
    }
}
