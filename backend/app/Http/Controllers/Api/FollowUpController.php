<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ApplicationEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class FollowUpController extends Controller
{
    public function list(Request $request)
    {
        $range = $request->query('range', 'week');
        $userId = $request->user()->id;

        $from = Carbon::today();
        $to = $range === 'today' ? Carbon::today() : Carbon::today()->addDays(7);

        $items = Application::where('user_id', $userId)
            ->whereNotNull('next_follow_up')
            ->whereDate('next_follow_up', '>=', $from)
            ->whereDate('next_follow_up', '<=', $to)
            ->orderBy('next_follow_up')
            ->with('company:id,name')
            ->get();

        return response()->json([
            'range' => $range,
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'items' => $items,
        ]);
    }

    public function markDone(Request $request, Application $application)
    {
        abort_if($application->user_id !== $request->user()->id, 403, 'Forbidden');

        $data = $request->validate([
            'note' => ['nullable', 'string'],
            'next_follow_up' => ['nullable', 'date'],
        ]);

        ApplicationEvent::create([
            'user_id' => $request->user()->id,
            'application_id' => $application->id,
            'type' => 'FOLLOW_UP',
            'event_date' => Carbon::today()->toDateString(),
            'note' => $data['note'] ?? 'Follow-up completed',
            'meta' => ['previous_follow_up' => $application->next_follow_up],
        ]);

        $application->next_follow_up = $data['next_follow_up'] ?? null;
        $application->save();

        return response()->json($application->load('company:id,name'));
    }
}
