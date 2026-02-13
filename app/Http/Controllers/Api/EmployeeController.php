<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $employees = Employee::with(['user', 'department'])->latest()->get();
        return response()->json(['employees' => $employees]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'nik' => 'required|string|unique:employees,nik',
            'department_id' => 'required|exists:departments,id',
            'position' => 'required|string',
            'leave_balance' => 'integer',
            'role' => 'required|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole($request->role);

        $employee = $user->employee()->create([
            'nik' => $request->nik,
            'department_id' => $request->department_id,
            'position' => $request->position,
            'leave_balance' => $request->leave_balance ?? 12,
            'phone' => $request->phone,
            'address' => $request->address,
            'date_of_joining' => $request->date_of_joining,
        ]);

        return response()->json(['message' => 'Employee created successfully', 'employee' => $employee], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
         $employee = Employee::with(['user', 'department'])->findOrFail($id);
         return response()->json(['employee' => $employee]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);
        $user = $employee->user;

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'nik' => ['required', 'string', Rule::unique('employees')->ignore($employee->id)],
            'department_id' => 'required|exists:departments,id',
            'position' => 'required|string',
            'role' => 'required|exists:roles,name',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($request->filled('password')) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        $user->syncRoles([$request->role]);

        $employee->update([
            'nik' => $request->nik,
            'department_id' => $request->department_id,
            'position' => $request->position,
            'leave_balance' => $request->leave_balance ?? $employee->leave_balance,
            'phone' => $request->phone,
            'address' => $request->address,
            'date_of_joining' => $request->date_of_joining,
        ]);

        return response()->json(['message' => 'Employee updated successfully', 'employee' => $employee]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $employee = Employee::findOrFail($id);
        $user = $employee->user;
        
        $employee->delete();
        $user->delete();

        return response()->json(['message' => 'Employee deleted successfully']);
    }
}
