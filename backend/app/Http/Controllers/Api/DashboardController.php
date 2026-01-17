<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        $userId = $request->user()->id;

        $counts = Application::where('user_id', $userId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $total = Application::where('user_id', $userId)->count();

        $upcoming = Application::where('user_id', $userId)
            ->whereNotNull('next_follow_up')
            ->whereDate('next_follow_up', '>=', Carbon::today())
            ->orderBy('next_follow_up')
            ->limit(5)
            ->with('company:id,name')
            ->get();

        return response()->json([
            'total' => $total,
            'byStatus' => $counts,
            'upcomingFollowUps' => $upcoming,
        ]);
    }
}
