<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            ['name' => 'Urgent', 'color' => 'red', 'description' => 'Urgent service or priority'],
            ['name' => 'Follow-up', 'color' => 'yellow', 'description' => 'Requires follow-up action'],
            ['name' => 'Warranty', 'color' => 'blue', 'description' => 'Under warranty coverage'],
            ['name' => 'Recall', 'color' => 'purple', 'description' => 'Factory recall service'],
            ['name' => 'Completed', 'color' => 'green', 'description' => 'Work completed'],
        ];

        foreach ($tags as $tag) {
            Tag::firstOrCreate(
                ['name' => $tag['name']],
                ['color' => $tag['color'], 'description' => $tag['description']]
            );
        }
    }
}
