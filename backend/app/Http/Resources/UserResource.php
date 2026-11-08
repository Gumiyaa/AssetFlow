<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the user model into the shape expected by the AssetFlow frontend.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->public_id ?? (string) $this->id,
            'employeeId' => $this->employee_id,
            'name' => $this->name,
            'email' => $this->email,
            'username' => $this->username,
            'role' => $this->role,
            'position' => $this->position,
            'department' => $this->department,
            'phone' => $this->phone,
            'initials' => $this->initials,
            'avatarColor' => $this->avatar_color,
            'joinDate' => optional($this->join_date)->format('Y-m-d'),
            'twoFA' => $this->two_fa,
            'status' => $this->status,
            'lastLogin' => $this->formatLastLogin(),
        ];
    }

    private function formatLastLogin(): ?string
    {
        if (! $this->last_login) {
            return null;
        }

        $date = $this->last_login->copy()->timezone(config('app.timezone'));
        $now = now(config('app.timezone'));

        if ($date->isSameDay($now)) {
            return 'Hari ini, '.$date->format('H:i').' WIB';
        }

        if ($date->isSameDay($now->copy()->subDay())) {
            return 'Kemarin, '.$date->format('H:i').' WIB';
        }

        return $date->locale('id')->translatedFormat('d M Y, H:i').' WIB';
    }
}
