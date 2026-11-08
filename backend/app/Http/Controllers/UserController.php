<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    /**
     * Return the account directory.
     */
    public function index(): AnonymousResourceCollection
    {
        return UserResource::collection(
            User::query()->orderBy('id')->get()
        );
    }

    /**
     * Return a single account by public id.
     */
    public function show(string $user): UserResource
    {
        $account = User::where('public_id', $user)->firstOrFail();

        return new UserResource($account);
    }
}
