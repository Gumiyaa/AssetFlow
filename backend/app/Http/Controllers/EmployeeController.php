<?php

namespace App\Http\Controllers;

use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EmployeeController extends Controller
{
    /**
     * Return the employee directory.
     */
    public function index(): AnonymousResourceCollection
    {
        return EmployeeResource::collection(
            Employee::query()->orderBy('id')->get()
        );
    }

    /**
     * Return a single employee by public id.
     */
    public function show(Employee $employee): EmployeeResource
    {
        return new EmployeeResource($employee);
    }
}
