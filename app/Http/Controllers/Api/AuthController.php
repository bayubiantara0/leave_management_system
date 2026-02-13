<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;
use Throwable;

class AuthController extends Controller
{


    public function login(Request $request)
    {
        try {
            $data = $request->validate([
                'email' => ['required','email'],
                'password' => ['required','string'],
            ]);

            $this->ensureIsNotRateLimited($request);

            $user = User::where('email', $request->email)->first();

            if (! $user || ! Hash::check($request->password, $user->password)) {
                RateLimiter::hit($this->throttleKey($request));

                Log::channel('security')->warning('auth.login.failed', [
                    'email' => $data['email'],
                    'ip' => $request->ip(),
                    'ua' => substr((string) $request->userAgent(), 0, 180),
                ]);

                throw ValidationException::withMessages([
                    'email' => trans('auth.failed'),
                ]);
            }

            RateLimiter::clear($this->throttleKey($request));

            $token = $user->createToken('auth_token')->plainTextToken;

            Log::channel('security')->info('auth.login.success', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'ua' => substr((string) $request->userAgent(), 0, 180),
            ]);

            $permissions = $user->getAllPermissions()->pluck('name');
            $role = $user->getRoleNames()->first();
            
            // Prepare complete user data including employee and department
            $user->load(['employee.department']);
            $userData = $user->toArray();
            $userData['role'] = $role;
            $userData['permissions'] = $permissions;

            return response()->json([
                'message' => 'Logged in',
                'user' => $userData,
                'token' => $token,
            ]);

        } catch (Throwable $e) {
            Log::channel('security')->error('auth.login.error', [
                'email' => (string) $request->input('email'),
                'ip' => $request->ip(),
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Login failed'], 500);
        }
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $user->load(['employee.department']); // Ensure employee and department is loaded
        
        $permissions = $user->getAllPermissions()->pluck('name');
        $role = $user->getRoleNames()->first();

        $userData = $user->toArray();
        $userData['permissions'] = $permissions;
        $userData['role'] = $role;

        return response()->json([
            'user' => $userData,
        ]);
    }

    public function logout(Request $request)
    {
        try {
            $user = $request->user();

            // Revoke current token
            $user->currentAccessToken()->delete();

            Log::channel('security')->info('auth.logout.success', [
                'user_id' => $user?->id,
                'email' => $user?->email,
                'ip' => $request->ip(),
            ]);

            return response()->json(['message' => 'Logged out']);

        } catch (Throwable $e) {
            Log::channel('security')->error('auth.logout.error', [
                'ip' => $request->ip(),
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Logout failed'], 500);
        }
    }
    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(Request $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(Request $request): string
    {
        return Str::transliterate(Str::lower($request->input('email')).'|'.$request->ip());
    }
}
