<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ApplicationController extends Controller
{
    private array $allowedStatuses = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'WISHLIST'];

    public function index(Request $request)
    {
        $q = Application::query()
            ->where('user_id', $request->user()->id)
            ->with(['company:id,name']);

        if ($request->filled('status')) {
            $q->where('status', $request->query('status'));
        }

        if ($request->filled('company_id')) {
            $q->where('company_id', (int)$request->query('company_id'));
        }

        if ($request->filled('q')) {
            $term = $request->query('q');
            $q->where(function ($sub) use ($term) {
                $sub->where('role_title', 'like', "%{$term}%")
                    ->orWhere('notes', 'like', "%{$term}%");
            });
        }

        $sort = $request->query('sort', 'updated_desc');
        $q = match ($sort) {
            'applied_asc' => $q->orderBy('applied_date'),
            'applied_desc' => $q->orderByDesc('applied_date'),
            'created_asc' => $q->orderBy('created_at'),
            'created_desc' => $q->orderByDesc('created_at'),
            default => $q->orderByDesc('updated_at'),
        };

        return response()->json($q->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'role_title' => ['required', 'string', 'max:160'],
            'status' => ['required', Rule::in($this->allowedStatuses)],
            'applied_date' => ['nullable', 'date'],
            'next_follow_up' => ['nullable', 'date'],
            'job_url' => ['nullable', 'string', 'max:255'],
            'salary_range' => ['nullable', 'string', 'max:80'],
            'notes' => ['nullable', 'string'],
        ]);

        // Ensure company belongs to user
        $company = Company::findOrFail($data['company_id']);
        abort_if($company->user_id !== $request->user()->id, 403, 'Forbidden');

        $app = Application::create([
            'user_id' => $request->user()->id,
            ...$data,
        ]);

        return response()->json($app->load('company:id,name'), 201);
    }

    public function show(Request $request, Application $application)
    {
        $this->ensureOwner($request, $application);

        return response()->json($application->load('company:id,name'));
    }

    public function update(Request $request, Application $application)
    {
        $this->ensureOwner($request, $application);

        $data = $request->validate([
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'role_title' => ['required', 'string', 'max:160'],
            'status' => ['required', Rule::in($this->allowedStatuses)],
            'applied_date' => ['nullable', 'date'],
            'next_follow_up' => ['nullable', 'date'],
            'job_url' => ['nullable', 'string', 'max:255'],
            'salary_range' => ['nullable', 'string', 'max:80'],
            'notes' => ['nullable', 'string'],
        ]);

        $company = Company::findOrFail($data['company_id']);
        abort_if($company->user_id !== $request->user()->id, 403, 'Forbidden');

        $application->update($data);

        return response()->json($application->load('company:id,name'));
    }

    public function destroy(Request $request, Application $application)
    {
        $this->ensureOwner($request, $application);

        $application->delete();

        return response()->json(['message' => 'Deleted']);
    }

    private function ensureOwner(Request $request, Application $application): void
    {
        abort_if($application->user_id !== $request->user()->id, 403, 'Forbidden');
    }
}
