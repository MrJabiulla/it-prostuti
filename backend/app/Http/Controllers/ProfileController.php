<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $preferences = DB::table('user_preferences')->where('user_id', $request->user()->id)->first();
        if ($preferences) {
            $preferences->focus_subject_ids = json_decode($preferences->focus_subject_ids ?? '[]', true);
        }

        return ['data' => $request->user()->only(['id', 'name', 'email', 'role', 'email_verified_at']), 'preferences' => $preferences];
    }

    public function update(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:80', 'exam_id' => 'nullable|integer|exists:exams,id', 'daily_minutes' => 'required|integer|between:5,480', 'daily_questions' => 'required|integer|between:1,500', 'target_date' => 'nullable|date_format:Y-m-d', 'theme' => 'required|in:light,dark,system', 'font_size' => 'required|in:standard,large,extra', 'reminder' => 'required|boolean', 'reminder_time' => 'required|date_format:H:i', 'timezone' => 'required|timezone',
            'focus_subject_ids' => 'sometimes|array|max:100',
            'focus_subject_ids.*' => 'required|integer|distinct|exists:subjects,id',
            'low_data' => 'sometimes|boolean', 'streak_alert' => 'sometimes|boolean',
            'theme_chosen' => 'sometimes|boolean', 'reader_size' => 'sometimes|integer|in:16,18,20,24',
            'last_lesson_id' => ['sometimes', 'nullable', 'integer', Rule::exists('lessons', 'id')->where('published', true)],
            'selected_paper_id' => ['sometimes', 'nullable', 'integer', Rule::exists('papers', 'id')->where('published', true)]]);
        DB::transaction(function () use ($request, $data) {
            $request->user()->update(['name' => $data['name']]);
            unset($data['name']);
            $data += ['exam_id' => null, 'target_date' => null];
            if (array_key_exists('focus_subject_ids', $data)) {
                $data['focus_subject_ids'] = json_encode(array_map('intval', $data['focus_subject_ids']));
            }
            DB::table('user_preferences')->upsert([$data + ['user_id' => $request->user()->id, 'created_at' => now(), 'updated_at' => now()]], ['user_id'], array_merge(array_keys($data), ['updated_at']));
        });

        return $this->show($request);
    }
}
