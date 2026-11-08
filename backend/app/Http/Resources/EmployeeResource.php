<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the employee model into the shape expected by the AssetFlow frontend.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->public_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'department' => $this->department,
            'position' => $this->position,
            'status' => $this->status,
            'joinDate' => optional($this->join_date)->format('Y-m-d'),
            'manager' => $this->manager,
            'location' => $this->location,
            'initials' => $this->initials,
            'avatarColor' => $this->avatar_color,
            'assets' => $this->assets_count,
            'grade' => $this->grade,
            'notes' => $this->notes,
        ];
    }
}
