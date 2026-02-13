<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view_departments')->only(['index', 'show']);
        $this->middleware('permission:create_departments')->only(['store']);
        $this->middleware('permission:edit_departments')->only(['update']);
        $this->middleware('permission:delete_departments')->only(['destroy']);
    }

    public function index()
    {
        return response()->json(['departments' => Department::all()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:departments,code'],
        ]);

        $department = Department::create($request->all());

        return response()->json([
            'message' => 'Department created successfully',
            'department' => $department
        ], 201);
    }

    public function show($id)
    {
        $department = Department::findOrFail($id);
        return response()->json(['department' => $department]);
    }

    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', Rule::unique('departments', 'code')->ignore($department->id)],
        ]);

        $department->update($request->all());

        return response()->json([
            'message' => 'Department updated successfully',
            'department' => $department
        ]);
    }

    public function destroy($id)
    {
        $department = Department::findOrFail($id);
        
        if ($department->users()->exists()) {
            return response()->json(['message' => 'Cannot delete department with assigned users'], 422);
        }

        $department->delete();

        return response()->json(['message' => 'Department deleted successfully']);
    }
}
