<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run our demo data seeder (creates demo user + companies + applications)
        $this->call(DemoSeeder::class);
    }
}
