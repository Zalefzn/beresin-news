import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

const FIELD_ICON =
    'pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-sm text-slate-400 transition group-focus-within:text-brand-blue dark:group-focus-within:text-sky-400';

const FIELD_INPUT =
    'h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 text-sm text-slate-900 shadow-none transition placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-blue/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus-visible:bg-slate-900';

const FIELD_LABEL = 'text-xs font-bold text-slate-700 dark:text-slate-200';

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk" />

            {status && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                    <i
                        className="fa-solid fa-circle-check mt-0.5"
                        aria-hidden="true"
                    />
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="email" className={FIELD_LABEL}>
                                Alamat email
                            </Label>
                            <div className="group relative">
                                <i
                                    className={`fa-regular fa-envelope ${FIELD_ICON}`}
                                    aria-hidden="true"
                                />
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    aria-invalid={Boolean(errors.email)}
                                    className={FIELD_INPUT}
                                />
                            </div>
                            <InputError
                                message={errors.email}
                                className="text-xs"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className={FIELD_LABEL}>
                                Kata sandi
                            </Label>
                            <div className="group relative">
                                <i
                                    className={`fa-solid fa-lock ${FIELD_ICON}`}
                                    aria-hidden="true"
                                />
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder="Masukkan kata sandi"
                                    aria-invalid={Boolean(errors.password)}
                                    className={FIELD_INPUT}
                                />
                            </div>
                            <InputError
                                message={errors.password}
                                className="text-xs"
                            />
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <Checkbox id="remember" name="remember" />
                                <Label
                                    htmlFor="remember"
                                    className="text-xs font-medium text-slate-600 dark:text-slate-300"
                                >
                                    Ingat saya
                                </Label>
                            </div>
                            {canResetPassword && (
                                <Link
                                    href={request()}
                                    className="text-xs font-bold text-brand-blue hover:underline dark:text-sky-400"
                                >
                                    Lupa kata sandi?
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            data-test="login-button"
                            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-blue text-sm font-bold text-white shadow-lg shadow-brand-blue/25 transition hover:bg-brand-dark-blue hover:shadow-xl hover:shadow-brand-blue/30 focus-visible:ring-4 focus-visible:ring-brand-blue/30 focus-visible:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <>
                                    Masuk
                                    <i
                                        className="fa-solid fa-arrow-right text-xs transition group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                                        aria-hidden="true"
                                    />
                                </>
                            )}
                        </button>

                        <p className="pt-1 text-center text-sm text-slate-600 dark:text-slate-300">
                            Belum punya akun?{' '}
                            <Link
                                href={register()}
                                className="font-bold text-brand-blue hover:underline dark:text-sky-400"
                            >
                                Daftar sekarang
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Selamat datang kembali',
    description: 'Masuk untuk menyimpan berita dan ikut berdiskusi.',
};
