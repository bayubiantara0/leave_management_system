<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view_permissions')->only(['index', 'show']);
        $this->middleware('permission:create_permissions')->only(['store']);
        $this->middleware('permission:edit_permissions')->only(['update']);
        $this->middleware('permission:delete_permissions')->only(['destroy']);
    }

    public function index()
    {
        $permissions = \Spatie\Permission\Models\Permission::orderBy('name', 'asc')->get();
        return response()->json([
            'permissions' => $permissions
        ]);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'unique:permissions,name'],
        ]);

        $permission = \Spatie\Permission\Models\Permission::create(['name' => $request->name]);

        return response()->json([
            'message' => 'Permission created successfully',
            'permission' => $permission
        ], 201);
    }

    public function show($id)
    {
        $permission = \Spatie\Permission\Models\Permission::findOrFail($id);
        return response()->json(['permission' => $permission]);
    }

    public function update(\Illuminate\Http\Request $request, $id)
    {
        $permission = \Spatie\Permission\Models\Permission::findOrFail($id);

        $request->validate([
            'name' => ['required', 'string', \Illuminate\Validation\Rule::unique('permissions', 'name')->ignore($permission->id)],
        ]);

        $permission->update(['name' => $request->name]);

        return response()->json([
            'message' => 'Permission updated successfully',
            'permission' => $permission
        ]);
    }

    public function destroy($id)
    {
        $permission = \Spatie\Permission\Models\Permission::findOrFail($id);
        $permission->delete();

        return response()->json(['message' => 'Permission deleted successfully']);
    }
}
