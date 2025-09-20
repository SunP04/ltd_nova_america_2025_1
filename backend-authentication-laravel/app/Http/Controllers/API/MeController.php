<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(name="Profile")
 */
class MeController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/me",
     *     tags={"Profile"},
     *     summary="Return the authenticated user",
     *     security={{"jwt":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Authenticated user",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="created_at", type="string", format="date-time"),
     *             @OA\Property(property="updated_at", type="string", format="date-time")
     *         )
     *     )
     * )
     */
    public function show(): JsonResponse
    {
        return response()->json(auth('api')->user());
    }
}
