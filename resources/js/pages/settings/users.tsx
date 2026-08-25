import { useState, FormEvent } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Edit3,
    KeyRound,
    Lock,
    Plus,
    Shield,
    ShieldAlert,
    Trash2,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: 'operator' | 'kepala_pelabuhan';
    is_current_user: boolean;
    created_at: string;
}

interface Props {
    users: UserItem[];
}

export default function UsersManagement({ users = [] }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

    // Create Form
    const createForm = useForm({
        name: '',
        email: '',
        role: 'operator' as 'operator' | 'kepala_pelabuhan',
        password: '',
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        email: '',
        role: 'operator' as 'operator' | 'kepala_pelabuhan',
        password: '',
    });

    const handleOpenEdit = (user: UserItem) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
        });
        editForm.clearErrors();
    };

    const submitCreate = (e: FormEvent) => {
        e.preventDefault();
        createForm.post('/settings/users', {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        editForm.put(`/settings/users/${editingUser.id}`, {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    const confirmDelete = () => {
        if (!deletingUser) return;
        router.delete(`/settings/users/${deletingUser.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeletingUser(null);
            },
        });
    };

    return (
        <>
            <Head title="Kelola Pengguna & Hak Akses - SIMARIN" />

            <div className="space-y-6">
                {/* SECTION HEADER & ADD BUTTON */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">
                            Kelola Akun Pengguna & Hak Akses (RBAC)
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Daftarkan akun staf baru, atur kewenangan dinas, atau ubah kata sandi akun internal.
                        </p>
                    </div>

                    <Button
                        onClick={() => {
                            createForm.reset();
                            createForm.clearErrors();
                            setShowCreateModal(true);
                        }}
                        className="h-9 cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 px-3.5 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 shrink-0"
                    >
                        <UserPlus className="mr-1.5 size-4" />
                        Tambah Akun Pengguna
                    </Button>
                </div>

                {/* INTERNAL APP AUTH NOTICE */}
                <div className="flex items-start gap-3 rounded-xl border border-cyan-500/30 bg-cyan-50/60 p-4 dark:border-cyan-900/40 dark:bg-cyan-950/20 text-xs text-cyan-950 dark:text-cyan-200 leading-relaxed">
                    <Shield className="mt-0.5 size-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                    <div>
                        <span className="font-bold">Otorisasi Internal Terpusat:</span>
                        <p className="mt-0.5 text-[11px] text-cyan-950/80 dark:text-cyan-200/80">
                            SIMARIN adalah sistem operasional pelabuhan internal. Pendaftaran mandiri publik (*public registration*) telah dinonaktifkan. Seluruh akses staf dan pejabat pelabuhan dikonfigurasi melalui modul ini.
                        </p>
                    </div>
                </div>

                {/* USERS TABLE */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Users className="size-4 text-blue-600" />
                            Daftar Akun Pengguna Terdaftar ({users.length} Akun)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-y border-border/80 bg-muted/50 font-bold text-muted-foreground">
                                    <tr>
                                        <th className="py-3 px-4">Nama Lengkap & Email</th>
                                        <th className="py-3 px-3 text-center">Peran (Role)</th>
                                        <th className="py-3 px-3">Terdaftar Sejak</th>
                                        <th className="py-3 px-4 text-right">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 font-medium">
                                    {users.map((user) => (
                                        <tr key={user.id} className="transition-colors hover:bg-muted/30">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex size-7 items-center justify-center rounded-full bg-muted font-bold text-xs text-muted-foreground uppercase">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground flex items-center gap-1.5">
                                                            {user.name}
                                                            {user.is_current_user && (
                                                                <span className="rounded-sm bg-cyan-500/15 px-1 py-0.2 text-[9px] font-bold text-cyan-600 dark:text-cyan-400">
                                                                    Akun Anda
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <Badge
                                                    className={
                                                        user.role === 'operator'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] font-bold'
                                                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold'
                                                    }
                                                >
                                                    {user.role === 'operator' ? 'Operator / Admin' : 'Kepala Pelabuhan'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-3 text-muted-foreground text-[11px]">
                                                {user.created_at}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenEdit(user)}
                                                        className="h-7 px-2.5 text-xs font-semibold"
                                                    >
                                                        <Edit3 className="mr-1 size-3 text-blue-600" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={user.is_current_user}
                                                        onClick={() => setDeletingUser(user)}
                                                        className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title={user.is_current_user ? 'Tidak dapat menghapus akun sendiri' : 'Hapus akun'}
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* MODAL CREATE USER */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
                                    <UserPlus className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">
                                        Tambah Akun Pengguna Baru
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Daftarkan staf atau pejabat pelabuhan
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={submitCreate} className="space-y-3.5">
                                <div className="space-y-1">
                                    <Label htmlFor="create_name" className="text-xs font-semibold">Nama Lengkap</Label>
                                    <Input
                                        id="create_name"
                                        type="text"
                                        required
                                        placeholder="Contoh: Budi Santoso"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <InputError message={createForm.errors.name} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create_email" className="text-xs font-semibold">Email Dinas / Login</Label>
                                    <Input
                                        id="create_email"
                                        type="email"
                                        required
                                        placeholder="Contoh: budi@simarin.test"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <InputError message={createForm.errors.email} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create_role" className="text-xs font-semibold">Peran / Kewenangan</Label>
                                    <select
                                        id="create_role"
                                        value={createForm.data.role}
                                        onChange={(e) => createForm.setData('role', e.target.value as 'operator' | 'kepala_pelabuhan')}
                                        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-2xs focus:border-cyan-500 focus:outline-none"
                                    >
                                        <option value="operator">Operator Pelabuhan (Input Manifest & Manajemen Data)</option>
                                        <option value="kepala_pelabuhan">Kepala Pelabuhan (Eksekutif & Analisis Prediksi)</option>
                                    </select>
                                    <InputError message={createForm.errors.role} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="create_password" className="text-xs font-semibold">Kata Sandi Awal</Label>
                                    <Input
                                        id="create_password"
                                        type="password"
                                        required
                                        placeholder="Minimal 8 karakter"
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <InputError message={createForm.errors.password} />
                                </div>

                                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowCreateModal(false)}
                                        disabled={createForm.processing}
                                        className="text-xs"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={createForm.processing}
                                        className="bg-cyan-600 text-xs font-bold text-white hover:bg-cyan-700"
                                    >
                                        {createForm.processing ? 'Menyimpan...' : 'Simpan Akun'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL EDIT USER */}
                {editingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                    <Edit3 className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">
                                        Edit Akun: {editingUser.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Perbarui data akun atau reset kata sandi
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={submitEdit} className="space-y-3.5">
                                <div className="space-y-1">
                                    <Label htmlFor="edit_name" className="text-xs font-semibold">Nama Lengkap</Label>
                                    <Input
                                        id="edit_name"
                                        type="text"
                                        required
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <InputError message={editForm.errors.name} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit_email" className="text-xs font-semibold">Email Login</Label>
                                    <Input
                                        id="edit_email"
                                        type="email"
                                        required
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <InputError message={editForm.errors.email} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit_role" className="text-xs font-semibold">Peran / Kewenangan</Label>
                                    <select
                                        id="edit_role"
                                        value={editForm.data.role}
                                        onChange={(e) => editForm.setData('role', e.target.value as 'operator' | 'kepala_pelabuhan')}
                                        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-2xs focus:border-cyan-500 focus:outline-none"
                                    >
                                        <option value="operator">Operator Pelabuhan (Input Manifest & Manajemen Data)</option>
                                        <option value="kepala_pelabuhan">Kepala Pelabuhan (Eksekutif & Analisis Prediksi)</option>
                                    </select>
                                    <InputError message={editForm.errors.role} />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit_password" className="text-xs font-semibold">
                                        Reset Kata Sandi Baru <span className="font-normal text-muted-foreground">(Opsional)</span>
                                    </Label>
                                    <Input
                                        id="edit_password"
                                        type="password"
                                        placeholder="Kosongkan jika tidak ingin mengubah kata sandi"
                                        value={editForm.data.password}
                                        onChange={(e) => editForm.setData('password', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                    <InputError message={editForm.errors.password} />
                                </div>

                                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingUser(null)}
                                        disabled={editForm.processing}
                                        className="text-xs"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={editForm.processing}
                                        className="bg-blue-600 text-xs font-bold text-white hover:bg-blue-700"
                                    >
                                        {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL CONFIRM DELETE */}
                {deletingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                                    <Trash2 className="size-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">
                                        Hapus Akun Pengguna?
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {deletingUser.name} ({deletingUser.email})
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Apakah Anda yakin ingin menghapus akun <b>{deletingUser.name}</b>? Pengguna ini tidak akan dapat login lagi ke sistem SIMARIN.
                            </p>

                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeletingUser(null)}
                                    className="text-xs"
                                >
                                    Batal
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={confirmDelete}
                                    className="bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
                                >
                                    Ya, Hapus Akun
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

UsersManagement.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan',
            href: '/settings/profile',
        },
        {
            title: 'Kelola Pengguna',
            href: '/settings/users',
        },
    ],
};
