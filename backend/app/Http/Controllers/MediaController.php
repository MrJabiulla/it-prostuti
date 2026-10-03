<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:10240']);
        $file = $data['file'];
        $disk = config('filesystems.media_disk');
        $path = $file->store('learning', $disk);
        abort_unless($path, 503, 'File storage unavailable.');
        try {
            $id = DB::table('media_files')->insertGetId(['user_id' => $request->user()->id, 'disk' => $disk, 'path' => $path, 'name' => mb_substr(basename($file->getClientOriginalName()), 0, 200), 'mime' => $file->getMimeType(), 'size' => $file->getSize(), 'published' => false, 'created_at' => now(), 'updated_at' => now()]);
        } catch (\Throwable $error) {
            Storage::disk($disk)->delete($path);
            throw $error;
        }

        return response()->json(['data' => ['id' => $id, 'published' => false]], 201);
    }

    public function index(Request $request)
    {
        $request->validate(['per_page' => 'sometimes|integer|between:1,50']);

        return DB::table('media_files')->orderByDesc('id')->paginate($request->integer('per_page', 20), ['id', 'name', 'mime', 'size', 'published', 'created_at']);
    }

    public function publish(Request $request, int $media)
    {
        $data = $request->validate(['published' => 'required|boolean']);
        abort_unless(DB::table('media_files')->find($media), 404);
        DB::table('media_files')->where('id', $media)->update($data + ['updated_at' => now()]);

        return response()->noContent();
    }

    public function download(Request $request, int $media)
    {
        $file = DB::table('media_files')->find($media);
        abort_unless($file && ($file->published || $request->user()->role === 'admin'), 404);

        return Storage::disk($file->disk)->download($file->path, $file->name, ['X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, no-store']);
    }
}
