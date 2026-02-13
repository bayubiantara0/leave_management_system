<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view_users')->only(['index', 'show']);
        $this->middleware('permission:create_users')->only(['store']);
        $this->middleware('permission:edit_users')->only(['update']);
        $this->middleware('permission:delete_users')->only(['destroy']);
    }

    public function index()
    {
        $users = User::with(['roles', 'department'])->get();
        return response()->json(['users' => $users]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'exists:roles,name'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'nik' => ['nullable', 'string', 'unique:users,nik'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'department_id' => $request->department_id,
            'nik' => $request->nik,
        ]);

        $user->assignRole($request->role);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->load(['roles', 'department'])
        ], 201);
    }

    public function show($id)
    {
        $user = User::with(['roles', 'department'])->findOrFail($id);
        return response()->json(['user' => $user]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', 'exists:roles,name'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'nik' => ['nullable', 'string', Rule::unique('users', 'nik')->ignore($user->id)],
        ]);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'department_id' => $request->department_id,
            'nik' => $request->nik,
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        $user->syncRoles([$request->role]);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->load(['roles', 'department'])
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->hasRole('admin') && User::role('admin')->count() === 1) {
             return response()->json(['message' => 'Cannot delete the last admin'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
