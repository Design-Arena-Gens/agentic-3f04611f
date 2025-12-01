'use client';

import Image from 'next/image';
import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type SVGProps,
} from 'react';

type Entry = {
  id: string;
  plateNumber: string;
  yukBilan: number;
  yuksiz: number;
  sofVazin: number;
  date: string;
  price: string;
  checkNumber: string;
};

type FormState = {
  plateNumber: string;
  yukBilan: string;
  yuksiz: string;
  date: string;
  summa: string;
  checkNumber: string;
};

const priceOptions = ['30,000', '40,000'];

const seedEntries: Array<Omit<Entry, 'id'>> = [
  {
    plateNumber: '90A111AA',
    yukBilan: 48000,
    yuksiz: 12500,
    sofVazin: 35500,
    date: '2024-11-18',
    price: '30,000',
    checkNumber: 'CHK-2024-9081',
  },
  {
    plateNumber: '30B555BB',
    yukBilan: 52500,
    yuksiz: 14000,
    sofVazin: 38500,
    date: '2024-11-19',
    price: '40,000',
    checkNumber: 'CHK-2024-9124',
  },
];

const makeInitialFormState = (): FormState => ({
  plateNumber: '',
  yukBilan: '',
  yuksiz: '',
  date: new Date().toISOString().split('T')[0],
  summa: priceOptions[0],
  checkNumber: '',
});

const computeNetWeight = (loaded: string, empty: string): number => {
  const loadedValue = Number(loaded.replace(/,/g, '')) || 0;
  const emptyValue = Number(empty.replace(/,/g, '')) || 0;
  const diff = loadedValue - emptyValue;
  return diff > 0 ? diff : 0;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatNumber = (value: number) =>
  value.toLocaleString('en-US', { maximumFractionDigits: 0 });

const generateId = () => Math.random().toString(36).slice(2, 10);

const MoonIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path d="M20.354 15.354A9 9 0 0 1 8.646 3.646a7 7 0 1 0 11.708 11.708z" />
  </svg>
);

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>(
    seedEntries.map((entry) => ({ ...entry, id: generateId() }))
  );
  const [form, setForm] = useState<FormState>(makeInitialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const searchTermLower = searchTerm.trim().toLowerCase();

  const filteredEntries = useMemo(() => {
    if (!searchTermLower) {
      return entries;
    }

    return entries.filter((entry) => {
      const haystack = [
        entry.plateNumber,
        entry.yukBilan.toString(),
        entry.yuksiz.toString(),
        entry.sofVazin.toString(),
        entry.date,
        entry.price,
        entry.checkNumber,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(searchTermLower);
    });
  }, [entries, searchTermLower]);

  const netWeight = computeNetWeight(form.yukBilan, form.yuksiz);

  const handleInputChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = event.target;
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const resetForm = () => {
    setForm(makeInitialFormState());
    setEditingId(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.plateNumber.trim()) {
      return;
    }

    const newEntry: Entry = {
      id: editingId ?? generateId(),
      plateNumber: form.plateNumber.trim(),
      yukBilan: Number(form.yukBilan) || 0,
      yuksiz: Number(form.yuksiz) || 0,
      sofVazin: netWeight,
      date: form.date,
      price: form.summa,
      checkNumber:
        form.checkNumber.trim() || `CHK-${generateId().toUpperCase()}`,
    };

    setEntries((prev) =>
      editingId
        ? prev.map((entry) => (entry.id === editingId ? newEntry : entry))
        : [newEntry, ...prev]
    );

    resetForm();
  };

  const handleEdit = (id: string) => {
    const entry = entries.find((item) => item.id === id);
    if (!entry) {
      return;
    }

    setForm({
      plateNumber: entry.plateNumber,
      yukBilan: entry.yukBilan.toString(),
      yuksiz: entry.yuksiz.toString(),
      date: entry.date,
      summa: entry.price,
      checkNumber: entry.checkNumber,
    });
    setEditingId(id);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  const handleRelay = () => {
    setEntries(seedEntries.map((entry) => ({ ...entry, id: generateId() })));
    setSearchTerm('');
    resetForm();
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const highlightMatch = (value: string) => {
    if (!searchTermLower) {
      return value;
    }

    const regex = new RegExp(`(${escapeRegExp(searchTermLower)})`, 'gi');
    const segments = value.split(regex);

    return segments.map((segment, index) => {
      const isMatch = segment.toLowerCase() === searchTermLower;
      return (
        <span
          key={`${segment}-${index}`}
          className={isMatch ? 'text-red-600 font-semibold' : undefined}
        >
          {segment}
        </span>
      );
    });
  };

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl rounded-3xl light-card p-6 shadow-2xl shadow-black/30 sm:p-10">
        <header className="flex flex-col gap-6 border-b border-orange-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 p-2 shadow-inner shadow-orange-300/60">
              <Image
                src="/camel-logo.svg"
                alt="Camel caravan logo"
                width={72}
                height={72}
                priority
              />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-wide text-stone-800 sm:text-3xl">
                Desert Weighmaster Control
              </h1>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-amber-700">
                Add · Delete · Edit · Relay
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-red-400/70 bg-red-100/70 px-4 py-3">
            <span className="relative flex h-5 w-5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/80 opacity-75"></span>
              <span className="relative inline-flex h-5 w-5 alarm-glow rounded-full bg-red-600"></span>
            </span>
            <div className="leading-tight">
              <span className="block text-xs font-semibold text-red-700 uppercase tracking-[0.2em]">
                Active Alarm
              </span>
              <span className="block text-sm font-semibold text-red-900">
                Caravan Monitoring Online
              </span>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_3fr] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl bg-white/85 p-6 shadow-lg shadow-amber-900/10"
          >
            <h2 className="text-lg font-semibold text-stone-800">
              Data Entry Fields
            </h2>
            <label className="text-sm font-medium text-stone-600">
              Plate Number
              <input
                type="text"
                value={form.plateNumber}
                onChange={handleInputChange('plateNumber')}
                className="mt-1 w-full rounded-xl border border-amber-300 bg-white/70 px-4 py-2 text-stone-800 shadow-inner focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
                placeholder="e.g. 10X123AA"
                required
              />
            </label>
            <label className="text-sm font-medium text-stone-600">
              Yuk bilan (Kg)
              <input
                type="number"
                min={0}
                value={form.yukBilan}
                onChange={handleInputChange('yukBilan')}
                className="mt-1 w-full rounded-xl border border-amber-300 bg-white/70 px-4 py-2 text-stone-800 shadow-inner focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
                placeholder="Loaded weight"
                required
              />
            </label>
            <label className="text-sm font-medium text-stone-600">
              Yuksiz (Kg)
              <input
                type="number"
                min={0}
                value={form.yuksiz}
                onChange={handleInputChange('yuksiz')}
                className="mt-1 w-full rounded-xl border border-amber-300 bg-white/70 px-4 py-2 text-stone-800 shadow-inner focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
                placeholder="Empty weight"
                required
              />
            </label>
            <label className="text-sm font-medium text-stone-600">
              Sof Vazin (Kg)
              <input
                type="text"
                value={netWeight ? formatNumber(netWeight) : ''}
                readOnly
                className="mt-1 w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-stone-800 shadow-inner"
                placeholder="Calculated automatically"
              />
            </label>
            <label className="text-sm font-medium text-stone-600">
              Date
              <input
                type="date"
                value={form.date}
                onChange={handleInputChange('date')}
                className="mt-1 w-full rounded-xl border border-amber-300 bg-white/70 px-4 py-2 text-stone-800 shadow-inner focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
                required
              />
            </label>
            <label className="text-sm font-medium text-stone-600">
              Summa
              <select
                value={form.summa}
                onChange={handleInputChange('summa')}
                className="mt-1 w-full rounded-xl border border-amber-300 bg-white/70 px-4 py-2 text-stone-800 shadow-inner focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
              >
                {priceOptions.map((price) => (
                  <option key={price} value={price}>
                    {price} UZS
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-stone-600">
              Check Number
              <input
                type="text"
                value={form.checkNumber}
                onChange={handleInputChange('checkNumber')}
                className="mt-1 w-full rounded-xl border border-amber-300 bg-white/70 px-4 py-2 text-stone-800 shadow-inner focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
                placeholder="Optional add-on check number"
              />
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-50 transition hover:bg-amber-700"
              >
                {editingId ? 'Update Entry' : 'Add Entry'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50/80"
              >
                Clear
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 rounded-2xl bg-white/85 p-4 shadow-lg shadow-amber-900/10 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <MoonIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-700" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-xl border border-amber-300 bg-white/70 py-2 pl-10 pr-4 text-stone-800 shadow-inner focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
                  placeholder="Search caravan data..."
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="rounded-xl border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={handleReload}
                  className="rounded-xl border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  Reload
                </button>
                <button
                  type="button"
                  onClick={handleRelay}
                  className="rounded-xl border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  Relay
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white/90 shadow-xl shadow-amber-900/20">
              <table className="min-w-full divide-y divide-amber-200 text-left text-sm text-stone-700">
                <thead className="bg-amber-100 text-xs font-semibold uppercase tracking-wider text-amber-900">
                  <tr>
                    <th className="px-4 py-3">Plate_Number</th>
                    <th className="px-4 py-3">Yuk_bilan</th>
                    <th className="px-4 py-3">Sana (Date)</th>
                    <th className="px-4 py-3">Yuksiz</th>
                    <th className="px-4 py-3">Sof_Vazin</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Check_Number</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-base font-semibold text-amber-900/80"
                      >
                        No matching records found.
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => {
                      const isSearchActive = Boolean(searchTermLower);
                      const rowClass = isSearchActive
                        ? 'bg-red-50/70 text-red-700'
                        : 'bg-white/95 text-stone-800';

                      return (
                        <tr key={entry.id} className={`${rowClass}`}>
                          <td className="px-4 py-3 font-semibold">
                            {highlightMatch(entry.plateNumber)}
                          </td>
                          <td className="px-4 py-3">
                            {highlightMatch(formatNumber(entry.yukBilan))}
                          </td>
                          <td className="px-4 py-3">
                            {highlightMatch(entry.date)}
                          </td>
                          <td className="px-4 py-3">
                            {highlightMatch(formatNumber(entry.yuksiz))}
                          </td>
                          <td className="px-4 py-3">
                            {highlightMatch(formatNumber(entry.sofVazin))}
                          </td>
                          <td className="px-4 py-3">
                            {highlightMatch(`${entry.price} UZS`)}
                          </td>
                          <td className="px-4 py-3">
                            {highlightMatch(entry.checkNumber)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(entry.id)}
                                className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-amber-600"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(entry.id)}
                                className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-red-600"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={handleRelay}
                                className="rounded-lg bg-stone-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-stone-700"
                              >
                                Relay
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
