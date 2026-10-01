<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return ['data' => $request->user()->only(['id', 'name', 'email', 'role', 'email_verified_at']), 'preferences' => DB::table('user_preferences')->where('user_id', $request->user()->id)->first()];
    }

    public function update(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:80', 'exam_id' => 'nullable|integer|exists:exams,id', 'daily_minutes' => 'required|integer|between:5,480', 'daily_questions' => 'required|integer|between:1,500', 'target_date' => 'nullable|date_format:Y-m-d', 'theme' => 'required|in:light,dark,system', 'font_size' => 'required|in:standard,large', 'reminder' => 'required|boolean', 'reminder_time' => 'required|date_format:H:i', 'timezone' => 'required|timezone']);
        DB::transaction(function () use ($request, $data) {
            $request->user()->update(['name' => $data['name']]);
            unset($data['name']);
            $data += ['exam_id' => null, 'target_date' => null];
            DB::table('user_preferences')->upsert([$data + ['user_id' => $request->user()->id, 'created_at' => now(), 'updated_at' => now()]], ['user_id'], array_merge(array_keys($data), ['updated_at']));
        });

        return $this->show($request);
    }
}
