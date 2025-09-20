<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use OpenApi\Annotations as OA;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Response;

/**
 * @OA\Tag(name="Authentication")
 *
 * @OA\Schema(
 *     schema="TokenResponse",
 *     @OA\Property(property="access_token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."),
 *     @OA\Property(property="token_type", type="string", example="bearer"),
 *     @OA\Property(property="expires_in", type="integer", example=3600)
 * )
 */
class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/auth/register",
     *     tags={"Authentication"},
     *     summary="Register a new user",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation"},
     *             @OA\Property(property="name", type="string", example="Jane Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="jane@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="secret123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="secret123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User created",
     *         @OA\JsonContent(ref="#/components/schemas/TokenResponse")
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json($this->formatTokenResponse($token), Response::HTTP_CREATED);
    }

    /**
     * @OA\Post(
     *     path="/api/auth/login",
     *     tags={"Authentication"},
     *     summary="Log in and issue a JWT",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="jane@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="secret123"),
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Authenticated",
     *         @OA\JsonContent(ref="#/components/schemas/TokenResponse")
     *     ),
     *     @OA\Response(response=401, description="Invalid credentials")
     * )
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        $validator = Validator::make($credentials, [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return response()->json($this->formatTokenResponse($token));
    }

    /**
     * @OA\Post(
     *     path="/api/auth/refresh",
     *     tags={"Authentication"},
     *     summary="Refresh an existing JWT",
     *     security={{"jwt":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Token refreshed",
     *         @OA\JsonContent(ref="#/components/schemas/TokenResponse")
     *     ),
     *     @OA\Response(response=401, description="Token invalid or expired")
     * )
     */
    public function refresh(): JsonResponse
    {
        try {
            $token = auth('api')->refresh();
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'Token inválido ou expirado.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return response()->json($this->formatTokenResponse($token));
    }

    /**
     * @OA\Post(
     *     path="/api/auth/logout",
     *     tags={"Authentication"},
     *     summary="Invalidate the current JWT",
     *     security={{"jwt":{}}},
     *     @OA\Response(response=204, description="Successfully logged out")
     * )
     */
    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatTokenResponse(string $token): array
    {
        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ];
    }
}
