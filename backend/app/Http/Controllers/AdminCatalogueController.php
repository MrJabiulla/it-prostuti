<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminCatalogueController extends Controller
{
    private const TABLES = ['subjects', 'chapters', 'topics', 'exams', 'institutes', 'posts'];

    public function index(Request $request, string $resource)
    {
        abort_unless(in_array($resource, self::TABLES, true), 404);
        $request->validate(['per_page' => 'sometimes|integer|between:1,100']);

        return DB::table($resource)->orderBy('id')->paginate($request->integer('per_page', 30));
    }

    public function save(Request $request, string $resource, ?int $id = null)
    {
        abort_unless(in_array($resource, self::TABLES, true), 404);
        if ($id) {
            abort_unless(DB::table($resource)->where('id', $id)->exists(), 404);
        }
        $rules = ['title' => 'required|string|max:200'];
        if (in_array($resource, ['subjects', 'exams', 'institutes'])) {
            $rules['slug'] = ['required', 'alpha_dash:ascii', 'max:100', Rule::unique($resource)->ignore($id)];
        }
        if (in_array($resource, ['subjects', 'chapters', 'topics'])) {
            $rules['english'] = 'sometimes|nullable|string|max:255';
            $rules['bengali'] = 'sometimes|nullable|string|max:255';
            $rules['position'] = 'required|integer|between:0,10000';
        }
        if ($resource === 'subjects') {
            $rules += ['short' => 'sometimes|nullable|string|max:80', 'symbol' => 'sometimes|nullable|string|max:40', 'color' => ['sometimes', 'nullable', 'regex:/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/']];
        }
        if ($resource === 'chapters') {
            $rules += ['subject_id' => 'required|integer|exists:subjects,id', 'overview' => 'nullable|string|max:4000'];
        }
        if ($resource === 'topics') {
            $rules['chapter_id'] = 'required|integer|exists:chapters,id';
        }
        if ($resource === 'posts') {
            $rules['institute_id'] = 'required|integer|exists:institutes,id';
        }
        $data = $request->validate($rules) + ['updated_at' => now()];
        if ($id) {
            DB::table($resource)->where('id', $id)->update($data);
        } else {
            $id = DB::table($resource)->insertGetId($data + ['created_at' => now()]);
        }

        return response()->json(['data' => DB::table($resource)->find($id)]);
    }

    public function destroy(string $resource, int $id)
    {
        abort_unless(in_array($resource, self::TABLES, true), 404);
        abort_unless(DB::table($resource)->where('id', $id)->delete(), 404);

        return response()->noContent();
    }

    public function syllabus(Request $request, int $exam)
    {
        abort_unless(DB::table('exams')->find($exam), 404);
        $data = $request->validate(['subjects' => 'present|array|max:100', 'subjects.*.subject_id' => 'required|integer|distinct|exists:subjects,id', 'subjects.*.syllabus' => 'required|string|max:10000']);
        DB::transaction(function () use ($exam, $data) {
            DB::table('exams')->where('id', $exam)->lockForUpdate()->first();
            DB::table('exam_subject')->where('exam_id', $exam)->delete();
            DB::table('exam_subject')->insert(array_map(fn ($row) => ['exam_id' => $exam, 'subject_id' => $row['subject_id'], 'syllabus' => $row['syllabus']], $data['subjects']));
        });

        return response()->noContent();
    }
}
