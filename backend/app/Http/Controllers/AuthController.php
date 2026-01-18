<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('username', 'password');
        
        // Find user with matching username
        $user = User::where('username', $request->username)
                    ->where('is_active', true)
                    ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Generate JWT token
        $token = JWTAuth::fromUser($user);

        // Load related profile based on role
        $profile = null;
        if ($user->role === 'student') {
            $profile = $user->student;
        } elseif ($user->role === 'tutor') {
            $profile = $user->tutor;
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'user_id' => $user->user_id,
                'id' => $user->user_id, // Backward compatibility
                'username' => $user->username,
                'role' => $user->role,
                'profile' => $profile,
                'tutor_id' => ($user->role === 'tutor' && $profile) ? $profile->tutor_id : null,
                'student_id' => ($user->role === 'student' && $profile) ? $profile->student_id : null,
            ]
        ]);
    }

    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to logout'
            ], 500);
        }
    }

    public function me()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            
            $profile = null;
            if ($user->role === 'student') {
                $profile = $user->student;
            } elseif ($user->role === 'tutor') {
                $profile = $user->tutor;
            }

            return response()->json([
                'success' => true,
                'user' => [
                    'user_id' => $user->user_id,
                    'id' => $user->user_id, // Backward compatibility
                    'username' => $user->username,
                    'role' => $user->role,
                    'profile' => $profile,
                    'tutor_id' => ($user->role === 'tutor' && $profile) ? $profile->tutor_id : null,
                    'student_id' => ($user->role === 'student' && $profile) ? $profile->student_id : null,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
    }

    public function refresh()
    {
        try {
            $token = JWTAuth::parseToken()->refresh();
            return response()->json([
                'success' => true,
                'token' => $token
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token refresh failed'
            ], 401);
        }
    }
}
