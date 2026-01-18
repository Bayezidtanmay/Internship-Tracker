<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use App\Models\Application;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'demo@example.com'],
            ['name' => 'Demo User', 'password' => Hash::make('password123')]
        );

        $companies = [
            ['name' => 'Nordic Tech Oy', 'website' => 'https://example.com', 'location' => 'Helsinki'],
            ['name' => 'Helsinki Startups', 'website' => null, 'location' => 'Espoo'],
            ['name' => 'CloudWorks', 'website' => null, 'location' => 'Tampere'],
        ];

        $companyIds = [];
        foreach ($companies as $c) {
            $company = Company::firstOrCreate(
                ['user_id' => $user->id, 'name' => $c['name']],
                ['website' => $c['website'], 'location' => $c['location'], 'notes' => null]
            );
            $companyIds[] = $company->id;
        }

        $apps = [
            ['role_title' => 'Frontend Intern', 'status' => 'APPLIED'],
            ['role_title' => 'Full Stack Intern', 'status' => 'INTERVIEW'],
            ['role_title' => 'Junior Developer', 'status' => 'WISHLIST'],
            ['role_title' => 'Backend Intern', 'status' => 'REJECTED'],
            ['role_title' => 'React Developer Intern', 'status' => 'OFFER'],
        ];

        foreach ($apps as $i => $a) {
            Application::create([
                'user_id' => $user->id,
                'company_id' => $companyIds[$i % count($companyIds)],
                'role_title' => $a['role_title'],
                'status' => $a['status'],
                'applied_date' => now()->subDays(12 - $i)->toDateString(),
                'next_follow_up' => now()->addDays($i + 1)->toDateString(),
                'job_url' => null,
                'salary_range' => null,
                'notes' => 'Seeded demo record',
            ]);
        }
    }
}
