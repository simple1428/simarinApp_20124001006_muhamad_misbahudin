<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::orderBy('name')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_current_user' => $user->id === Auth::id(),
                'created_at' => $user->created_at ? $user->created_at->translatedFormat('d M Y') : '-',
            ];
        });

        return Inertia::render('settings/users', [
            'users' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'in:operator,kepala_pelabuhan'],
            'password' => ['required', 'string', Password::min(8)],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => Carbon::now(),
        ]);

        return redirect()
            ->route('users.index')
            ->with('success', "Akun pengguna {$validated['name']} berhasil ditambahkan ke dalam sistem.");
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', 'in:operator,kepala_pelabuhan'],
            'password' => ['nullable', 'string', Password::min(8)],
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()
            ->route('users.index')
            ->with('success', "Data dan hak akses akun {$user->name} berhasil diperbarui.");
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return redirect()
                ->route('users.index')
                ->with('error', 'Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini.');
        }

        $userName = $user->name;
        $user->delete();

        return redirect()
            ->route('users.index')
            ->with('success', "Akun {$userName} telah berhasil dihapus dari sistem.");
    }
}
