<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $companies = Company::where('user_id', $request->user()->id)
            ->orderBy('name')
            ->get();

        return response()->json($companies);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'website' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string'],
        ]);

        $company = Company::create([
            'user_id' => $request->user()->id,
            ...$data,
        ]);

        return response()->json($company, 201);
    }

    public function show(Request $request, Company $company)
    {
        $this->ensureOwner($request, $company);

        return response()->json($company);
    }

    public function update(Request $request, Company $company)
    {
        $this->ensureOwner($request, $company);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'website' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string'],
        ]);

        $company->update($data);

        return response()->json($company);
    }

    public function destroy(Request $request, Company $company)
    {
        $this->ensureOwner($request, $company);

        $company->delete();

        return response()->json(['message' => 'Deleted']);
    }

    private function ensureOwner(Request $request, Company $company): void
    {
        abort_if($company->user_id !== $request->user()->id, 403, 'Forbidden');
    }
}
