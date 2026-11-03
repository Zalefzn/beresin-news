import type { TvProgram } from '@/types';

export default function TvSchedule({ programs }: { programs: TvProgram[] }) {
    if (programs.length === 0) {
        return (
            <p className="py-6 text-center text-xs text-slate-400">
                Belum ada jadwal hari ini.
            </p>
        );
    }

    return (
        <ul className="space-y-2.5 text-xs">
            {programs.map((program) => (
                <li
                    key={program.id}
                    className={
                        program.is_now
                            ? 'rounded border-l-2 border-brand-blue bg-brand-blue/20 p-2 text-slate-200'
                            : 'rounded bg-slate-900 p-2 text-slate-400'
                    }
                >
                    <span
                        className={
                            program.is_now
                                ? 'font-bold text-sky-300'
                                : 'font-bold text-slate-300'
                        }
                    >
                        {program.starts_at} - {program.ends_at}
                        {program.is_now && ' (SEKARANG)'}
                    </span>
                    <p
                        className={
                            program.is_now
                                ? 'mt-0.5 font-semibold text-white'
                                : 'mt-0.5 font-medium text-slate-300'
                        }
                    >
                        {program.title}
                    </p>
                </li>
            ))}
        </ul>
    );
}
