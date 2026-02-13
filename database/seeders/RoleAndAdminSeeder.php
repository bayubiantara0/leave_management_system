<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

class RoleAndAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        $permissions = [
            'access_master_data',
            'access_role_permissions',
            // User Permissions
            'view_users', 'create_users', 'edit_users', 'delete_users',
            // Role Permissions
            'view_roles', 'create_roles', 'edit_roles', 'delete_roles',
            // Permission Permissions
            'view_permissions', 'create_permissions', 'edit_permissions', 'delete_permissions',
            // Leave Permissions
            'view_own_leaves', 'view_all_leaves', 'create_leaves', 'approve_leaves',
            // Department Permissions
            'view_departments', 'create_departments', 'edit_departments', 'delete_departments',
        ];

        foreach ($permissions as $permission) {
            \Spatie\Permission\Models\Permission::create(['name' => $permission]);
        }

        // Create Departments
        \App\Models\Department::create(['name' => 'Sewing', 'code' => 'SWG']);
        \App\Models\Department::create(['name' => 'Cutting', 'code' => 'CUT']);
        \App\Models\Department::create(['name' => 'Finishing', 'code' => 'FIN']);
        \App\Models\Department::create(['name' => 'Quality Assurance', 'code' => 'QA']);

        // create roles
        $roleAdmin = Role::create(['name' => 'admin']);
        $roleUser = Role::create(['name' => 'user']);
        
        // assign all permissions to admin role
        $roleAdmin->givePermissionTo(\Spatie\Permission\Models\Permission::all());

        // create admin user
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@admin.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $admin->assignRole($roleAdmin);
    }
}
