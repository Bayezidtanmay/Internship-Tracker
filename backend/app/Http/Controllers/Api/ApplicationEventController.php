<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ApplicationEvent;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ApplicationEventController extends Controller
{
    private array $allowedTypes = [
        'APPLIED',
        'FOLLOW_UP',
        'INTERVIEW',
        'OFFER',
        'REJECTED',
        'NOTE',
        'STATUS_CHANGED'
    ];

    public function index(Request $request, Application $application)
    {
        $this->ensureOwner($request, $application);

        return response()->json(
            $application->events()->get()
        );
    }

    public function store(Request $request, Application $application)
    {
        $this->ensureOwner($request, $application);

        $data = $request->validate([
            'type' => ['required', Rule::in($this->allowedTypes)],
            'event_date' => ['nullable', 'date'],
            'note' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
        ]);

        $event = ApplicationEvent::create([
            'user_id' => $request->user()->id,
            'application_id' => $application->id,
            ...$data,
        ]);

        return response()->json($event, 201);
    }

    public function destroy(Request $request, Application $application, ApplicationEvent $event)
    {
        $this->ensureOwner($request, $application);
        abort_if($event->application_id !== $application->id, 404);

        abort_if($event->user_id !== $request->user()->id, 403, 'Forbidden');

        $event->delete();

        return response()->json(['message' => 'Deleted']);
    }

    private function ensureOwner(Request $request, Application $application): void
    {
        abort_if($application->user_id !== $request->user()->id, 403, 'Forbidden');
    }
}
