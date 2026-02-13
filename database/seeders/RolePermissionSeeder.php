<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view_dashboard',

            'view_departments', 'create_departments', 'edit_departments', 'delete_departments',
            'view_users', 'create_users', 'edit_users', 'delete_users',
            'view_roles', 'create_roles', 'edit_roles', 'delete_roles',
            'view_permissions', 'create_permissions', 'edit_permissions', 'delete_permissions',

            'view_own_leaves',
            'create_leaves',
            'view_all_leaves',
            'approve_leaves',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        $employeeRole = Role::firstOrCreate(['name' => 'employee']);
        $employeeRole->givePermissionTo([
            'view_dashboard',
            'view_own_leaves',
            'create_leaves',
        ]);

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
            ]
        );
        $admin->assignRole($adminRole);
        
        if (!$admin->employee) {
            $admin->employee()->create([
                'nik' => 'ADM001',
                'department_id' => 1,
                'leave_balance' => 12,
                'position' => 'Administrator',
            ]);
        }

        $employee = User::firstOrCreate(
            ['email' => 'employee@example.com'],
            [
                'name' => 'Regular Employee',
                'password' => Hash::make('password'),
            ]
        );
        $employee->assignRole($employeeRole);

        if (!$employee->employee) {
            $employee->employee()->create([
                'nik' => 'EMP001',
                'department_id' => 1,
                'leave_balance' => 12,
                'position' => 'Staff',
            ]);
        }
    }
}
