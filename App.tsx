import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Match } from './types';
import { CURRENCY_DATA, TABLE_NUMBERS, Currency } from './constants';

// --- ICONS ---
const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TableIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
    </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

// Add global declaration for jsPDF and jsPDF-AutoTable
declare global {
  interface Window {
    jspdf: any;
    autoTable: (doc: any, options: any) => void;
  }
}

// --- CHILD COMPONENTS ---

const DigitalClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => {
            clearInterval(timerId);
        };
    }, []);

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm py-2 px-4 rounded-xl shadow-lg border border-gray-700">
            <p className="text-2xl font-mono text-teal-300 tracking-widest" aria-live="polite">
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </p>
        </div>
    );
};

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ selectedCurrency, onCurrencyChange }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-gray-700 flex items-center gap-2">
            <label htmlFor="currency-select" className="text-sm font-medium text-gray-300 sr-only">Currency:</label>
            <select
                id="currency-select"
                value={selectedCurrency}
                onChange={e => onCurrencyChange(e.target.value as Currency)}
                className="bg-gray-700/50 border-none text-white rounded-md focus:ring-2 focus:ring-green-500 p-2 text-sm font-semibold"
                aria-label="Select currency"
            >
                {Object.keys(CURRENCY_DATA).map(c => (
                    <option key={c} value={c}>{c} ({CURRENCY_DATA[c as Currency].symbol})</option>
                ))}
            </select>
        </div>
    );
};

interface StartMatchFormProps {
  onStartMatch: (table: string, rate: number) => void;
  availableTables: string[];
  currency: Currency;
  selectedRate: number;
  onRateChange: (rate: number) => void;
}

const StartMatchForm: React.FC<StartMatchFormProps> = ({ onStartMatch, availableTables, currency, selectedRate, onRateChange }) => {
  const [table, setTable] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (availableTables.length > 0 && !availableTables.includes(table)) {
        setTable(availableTables[0]);
    } else if (availableTables.length === 0) {
        setTable('');
    }
  }, [availableTables, table]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!table) {
      setError('Please select an available table.');
      return;
    }
    setError('');
    onStartMatch(table, selectedRate);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-2xl shadow-2xl mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
                <label htmlFor="table-select" className="block text-sm font-medium text-gray-300 mb-2">Table Number</label>
                <select 
                    id="table-select" 
                    value={table} 
                    onChange={e => setTable(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 transition disabled:bg-gray-600/50 disabled:cursor-not-allowed"
                    aria-label="Select table number"
                    disabled={availableTables.length === 0}
                >
                    <option value="" disabled>
                      {availableTables.length > 0 ? 'Select a table' : 'All tables are busy'}
                    </option>
                    {availableTables.map(num => <option key={num} value={num}>Table {num}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="rate-select" className="block text-sm font-medium text-gray-300 mb-2">Rate per Minute</label>
                <select 
                    id="rate-select" 
                    value={selectedRate} 
                    onChange={e => onRateChange(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 transition"
                    aria-label="Select rate per minute"
                >
                    {CURRENCY_DATA[currency].rates.map(rate => (
                        <option key={rate} value={rate}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 2 }).format(rate)} / min
                        </option>
                    ))}
                </select>
            </div>
            <button type="submit" disabled={!table} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg disabled:bg-green-800/50 disabled:cursor-not-allowed disabled:transform-none">
                Start Match
            </button>
        </div>
        {error && <p className="text-red-400 text-center text-sm mt-4" role="alert">{error}</p>}
    </form>
  );
};

interface ActiveMatchCardProps {
    table: string;
    startTime: Date;
    onEndMatch: (table: string) => void;
    rate: number;
    currency: Currency;
}

const ActiveMatchCard: React.FC<ActiveMatchCardProps> = ({ table, startTime, onEndMatch, rate, currency }) => {
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    useEffect(() => {
        const timerId = setInterval(() => {
            const now = new Date();
            const diffMs = now.getTime() - startTime.getTime();
            const diffSec = Math.floor(diffMs / 1000);
            const hours = Math.floor(diffSec / 3600);
            const minutes = Math.floor((diffSec % 3600) / 60);
            const seconds = diffSec % 60;
            setElapsedTime(
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            );
        }, 1000);
        return () => clearInterval(timerId);
    }, [startTime]);
    
    const formattedStartTime = useMemo(() => {
        return startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }, [startTime]);

    return (
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg animate-pulse-green-border border border-green-500/50">
            <style>{`
                @keyframes pulse-green-border {
                    0%, 100% { border-color: rgba(74, 222, 128, 0.4); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.3); }
                    50% { border-color: rgba(74, 222, 128, 0.8); box-shadow: 0 0 10px 2px rgba(74, 222, 128, 0.3); }
                }
                .animate-pulse-green-border {
                    animation: pulse-green-border 3s infinite;
                }
            `}</style>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-center text-gray-300">
                <div className="flex items-center gap-3 font-bold text-lg text-white col-span-2 sm:col-span-1">
                    <TableIcon className="w-6 h-6 text-green-400"/>
                    <span>Table {table}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-blue-400" />
                    <span className="font-mono text-sm">Started: {formattedStartTime}</span>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-400">Rate</div>
                    <div className="font-mono font-semibold text-white">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 2 }).format(rate)}/min
                    </div>
                </div>
                <div className="font-mono text-center">
                    <div className="text-sm text-gray-400">Elapsed Time</div>
                    <div className="text-2xl font-semibold text-white tracking-wider">{elapsedTime}</div>
                </div>
                <div className="flex justify-end">
                    <button onClick={() => onEndMatch(table)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 shadow-lg">
                        End Match
                    </button>
                </div>
            </div>
        </div>
    );
};


interface MatchCardProps {
  match: Match;
  onDelete: (serial: number) => void;
  onEdit: (match: Match) => void;
  currency: Currency;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onDelete, onEdit, currency }) => {
    const formatDate = (isoString: string) => {
        if (!isoString || isNaN(new Date(isoString).getTime())) {
            return 'Invalid Date';
        }
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatTime = (isoString: string) => {
        if (!isoString || isNaN(new Date(isoString).getTime())) {
            return 'Invalid Time';
        }
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg transition-all hover:shadow-green-500/20 hover:ring-1 hover:ring-green-500/50">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 items-center text-gray-300">
        <div className="flex items-center gap-3 font-bold text-lg text-white">
          <span className="text-green-400"># {match.serial.toString().padStart(3, '0')}</span>
        </div>
        <div className="flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-green-400" />
            <span className="font-semibold">Table {match.table}</span>
        </div>
         <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-400" />
            <span className="text-sm">{formatDate(match.startTime)}</span>
        </div>
        <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-400" />
            <span className="text-sm">{formatTime(match.startTime)}</span>
        </div>
        <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-red-400" />
            <span className="text-sm">{formatTime(match.endTime)}</span>
        </div>
        <div className="font-mono text-center">
            <div className="text-sm text-gray-400">Duration</div>
            <div className="text-lg font-semibold text-white">{match.duration} min</div>
        </div>
        <div className="font-mono text-center">
            <div className="text-sm text-gray-400">Rate</div>
            <div className="text-lg font-semibold text-white">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 2 }).format(match.rate)}
            </div>
        </div>
        <div className="flex justify-between items-center">
            <div className="text-right flex-grow">
                <div className="text-sm text-gray-400">Amount</div>
                <div className="text-lg font-bold text-green-400">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 2 }).format(match.amount)}
                </div>
            </div>
            <div className="flex items-center ml-2">
                <button onClick={() => onEdit(match)} aria-label={`Edit match #${match.serial}`} className="p-2 text-gray-400 hover:text-blue-400 rounded-full hover:bg-gray-700 transition">
                    <EditIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => onDelete(match.serial)} aria-label={`Delete match #${match.serial}`} className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700 transition">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

interface EditMatchModalProps {
    match: Match;
    onSave: (updatedMatch: Match) => void;
    onClose: () => void;
    currency: Currency;
}

const EditMatchModal: React.FC<EditMatchModalProps> = ({ match, onSave, onClose, currency }) => {
    const toDatetimeLocal = (isoString: string): string => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const timezoneOffset = date.getTimezoneOffset() * 60000;
            const localDate = new Date(date.getTime() - timezoneOffset);
            return localDate.toISOString().slice(0, 16);
        } catch (e) {
            return '';
        }
    };

    const [editedMatch, setEditedMatch] = useState<Match>(match);
    const [startTimeLocal, setStartTimeLocal] = useState(toDatetimeLocal(match.startTime));
    const [endTimeLocal, setEndTimeLocal] = useState(toDatetimeLocal(match.endTime));
    const [error, setError] = useState('');

    useEffect(() => {
        const start = new Date(startTimeLocal);
        const end = new Date(endTimeLocal);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
        
        const durationInMs = end.getTime() - start.getTime();
        const durationInMinutes = Math.ceil(durationInMs / (1000 * 60));

        if (durationInMinutes < 0) {
            setError('End time must be after start time.');
        } else {
            setError('');
        }
        
        const amount = Math.max(0, durationInMinutes) * editedMatch.rate;

        setEditedMatch(prev => ({
            ...prev,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            duration: Math.max(0, durationInMinutes),
            amount: amount,
        }));

    }, [startTimeLocal, endTimeLocal, editedMatch.rate]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedMatch(prev => ({ ...prev, [name]: name === 'rate' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (error) return;
        onSave(editedMatch);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true"
            aria-labelledby="edit-match-title"
        >
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-lg border border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 id="edit-match-title" className="text-2xl font-bold text-white mb-6">Edit Match #{match.serial.toString().padStart(3, '0')}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="edit-table" className="block text-sm font-medium text-gray-300 mb-2">Table</label>
                            <select id="edit-table" name="table" value={editedMatch.table} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 transition">
                                {TABLE_NUMBERS.map(num => <option key={num} value={num}>Table {num}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="edit-rate" className="block text-sm font-medium text-gray-300 mb-2">Rate</label>
                            <select id="edit-rate" name="rate" value={editedMatch.rate} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 transition">
                                {CURRENCY_DATA[currency].rates.map(rate => (
                                    <option key={rate} value={rate}>
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 2 }).format(rate)} / min
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="edit-startTime" className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                            <input type="datetime-local" id="edit-startTime" name="startTime" value={startTimeLocal} onChange={e => setStartTimeLocal(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 transition" />
                        </div>
                        <div>
                            <label htmlFor="edit-endTime" className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                            <input type="datetime-local" id="edit-endTime" name="endTime" value={endTimeLocal} onChange={e => setEndTimeLocal(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 transition" />
                        </div>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg flex justify-around text-center border border-gray-700">
                        <div>
                            <p className="text-sm text-gray-400">New Duration</p>
                            <p className="text-xl font-bold text-white">{editedMatch.duration} min</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">New Amount</p>
                            <p className="text-xl font-bold text-green-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 2 }).format(editedMatch.amount)}</p>
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-center text-sm" role="alert">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition">Cancel</button>
                        <button type="submit" disabled={!!error} className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:bg-green-800/50 disabled:cursor-not-allowed">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

const App = () => {
    // A one-time migration to ensure all match times are ISO strings.
    const migrateMatchData = (data: any[]): Match[] => {
        return data.map(match => {
            if (match.startTime && !match.startTime.includes('T')) {
                const today = new Date().toISOString().split('T')[0];
                return {
                    ...match,
                    startTime: new Date(`${today}T${match.startTime}`).toISOString(),
                    endTime: new Date(`${today}T${match.endTime}`).toISOString(),
                };
            }
            return match;
        });
    };

    const [matches, setMatches] = useState<Match[]>(() => {
        try {
            const savedMatches = localStorage.getItem('snookerMatches');
            if (!savedMatches) return [];
            const parsed = JSON.parse(savedMatches);
            return migrateMatchData(parsed);
        } catch (error) {
            console.error("Failed to parse matches from localStorage", error);
            return [];
        }
    });

    const [serialCounter, setSerialCounter] = useState<number>(() => {
        const savedCounter = localStorage.getItem('snookerSerialCounter');
        return savedCounter ? parseInt(savedCounter, 10) : 1;
    });
    
    type StorableActiveMatch = { startTime: string; rate: number };

    const [activeMatches, setActiveMatches] = useState<Record<string, { startTime: Date; rate: number }>>(() => {
        try {
            const savedActiveMatches = localStorage.getItem('snookerActiveMatches');
            if (!savedActiveMatches) return {};
            
            const parsedMatches: Record<string, StorableActiveMatch> = JSON.parse(savedActiveMatches);
            const liveMatches: Record<string, { startTime: Date; rate: number }> = {};
            
            for (const table in parsedMatches) {
                if (Object.prototype.hasOwnProperty.call(parsedMatches, table)) {
                    liveMatches[table] = {
                        ...parsedMatches[table],
                        startTime: new Date(parsedMatches[table].startTime),
                    };
                }
            }
            return liveMatches;
        } catch (error) {
            console.error("Failed to parse active matches from localStorage", error);
            return {};
        }
    });

    const [currency, setCurrency] = useState<Currency>(() => {
        const savedCurrency = localStorage.getItem('snookerCurrency');
        return savedCurrency && Object.keys(CURRENCY_DATA).includes(savedCurrency)
            ? savedCurrency as Currency
            : 'INR';
    });

    const [selectedRate, setSelectedRate] = useState<number>(() => {
        const savedCurrency = localStorage.getItem('snookerCurrency') as Currency || 'INR';
        return CURRENCY_DATA[savedCurrency].defaultRate;
    });
    
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);

    // --- PERSISTENCE EFFECTS ---
    useEffect(() => {
        try {
            localStorage.setItem('snookerMatches', JSON.stringify(matches));
        } catch (error) {
            console.error("Failed to save matches to localStorage", error);
        }
    }, [matches]);

    useEffect(() => {
        localStorage.setItem('snookerSerialCounter', String(serialCounter));
    }, [serialCounter]);

    useEffect(() => {
        try {
            const storableActiveMatches: Record<string, StorableActiveMatch> = {};
            for (const table in activeMatches) {
                if (Object.prototype.hasOwnProperty.call(activeMatches, table)) {
                    storableActiveMatches[table] = {
                        ...activeMatches[table],
                        startTime: activeMatches[table].startTime.toISOString(),
                    };
                }
            }
            localStorage.setItem('snookerActiveMatches', JSON.stringify(storableActiveMatches));
        } catch (error) {
            console.error("Failed to save active matches to localStorage", error);
        }
    }, [activeMatches]);

    useEffect(() => {
        localStorage.setItem('snookerCurrency', currency);
    }, [currency]);

    useEffect(() => {
        const newDefaultRate = CURRENCY_DATA[currency].defaultRate;
        const currentRates = CURRENCY_DATA[currency].rates;
        if (!currentRates.includes(selectedRate)) {
            setSelectedRate(newDefaultRate);
        }
    }, [currency, selectedRate]);

    const availableTables = useMemo(() => {
        const activeTableNumbers = Object.keys(activeMatches);
        return TABLE_NUMBERS.filter(tn => !activeTableNumbers.includes(tn));
    }, [activeMatches]);

    const handleStartMatch = useCallback((table: string, rate: number) => {
        if (!table || activeMatches[table]) return;
        setActiveMatches(prev => ({
            ...prev,
            [table]: { startTime: new Date(), rate }
        }));
    }, [activeMatches]);

    const handleEndMatch = useCallback((table: string) => {
        const activeMatch = activeMatches[table];
        if (!activeMatch) return;

        const endTime = new Date();
        const durationInMs = endTime.getTime() - activeMatch.startTime.getTime();
        const durationInMinutes = Math.ceil(durationInMs / (1000 * 60));

        if (durationInMinutes < 1) {
            setActiveMatches(prev => {
                const newActive = { ...prev };
                delete newActive[table];
                return newActive;
            });
            alert("Match was less than a minute and was not saved to history.");
            return;
        }

        const amount = durationInMinutes * activeMatch.rate;

        const newMatch: Match = {
            serial: serialCounter,
            table,
            startTime: activeMatch.startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: durationInMinutes,
            rate: activeMatch.rate,
            amount,
        };
        
        setMatches(prev => [...prev, newMatch].sort((a,b) => b.serial - a.serial));
        setSerialCounter(prev => prev + 1);
        setActiveMatches(prev => {
            const newActive = { ...prev };
            delete newActive[table];
            return newActive;
        });
    }, [activeMatches, serialCounter]);

    const handleDeleteMatch = useCallback((serial: number) => {
        if (window.confirm(`Are you sure you want to delete match #${serial}?`)) {
            setMatches(prev => prev.filter(match => match.serial !== serial));
        }
    }, []);
    
    const handleOpenEditModal = useCallback((matchToEdit: Match) => {
        setEditingMatch(matchToEdit);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setEditingMatch(null);
    }, []);

    const handleUpdateMatch = useCallback((updatedMatch: Match) => {
        setMatches(prevMatches =>
            prevMatches
                .map(m => (m.serial === updatedMatch.serial ? updatedMatch : m))
                .sort((a,b) => b.serial - a.serial)
        );
        setEditingMatch(null);
    }, []);
    
    const summary = useMemo(() => {
        const totalMinutes = matches.reduce((sum, match) => sum + match.duration, 0);
        const totalAmount = matches.reduce((sum, match) => sum + match.amount, 0);
        return { totalMinutes, totalAmount };
    }, [matches]);

    const handleDownloadPdf = useCallback(() => {
        if (matches.length === 0) {
            alert('No match history to download.');
            return;
        }

        if (!window.jspdf || !window.jspdf.jsPDF || typeof window.autoTable !== 'function') {
            alert('PDF library is not loaded yet. Please try again in a moment.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
            style: 'currency', currency, minimumFractionDigits: 2
        }).format(amount);

        const formatDate = (isoString: string) => {
            if (!isoString || isNaN(new Date(isoString).getTime())) return 'N/A';
            const date = new Date(isoString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
            });
        };

        const formatTime = (isoString: string) => {
            if (!isoString || isNaN(new Date(isoString).getTime())) return 'N/A';
            const date = new Date(isoString);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', hour12: true,
            });
        };

        doc.setFontSize(18);
        doc.text('Snooker Match History', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString('en-US')}`, 14, 29);

        const tableColumn = ['#', 'Table', 'Date', 'Start Time', 'End Time', 'Duration', 'Rate', 'Amount'];
        const tableRows = matches.map(match => [
            match.serial.toString().padStart(3, '0'),
            `Table ${match.table}`,
            formatDate(match.startTime),
            formatTime(match.startTime),
            formatTime(match.endTime),
            `${match.duration} min`,
            formatCurrency(match.rate),
            formatCurrency(match.amount)
        ]);

        window.autoTable(doc, {
            startY: 35,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74] },
        });

        const finalY = (doc as any).lastAutoTable.finalY || 10;
        doc.setFontSize(14);
        doc.text('Total Summary', 14, finalY + 15);
        doc.setFontSize(12);
        doc.setTextColor(40);
        doc.text(`Total Minutes: ${summary.totalMinutes}`, 14, finalY + 22);
        doc.text(`Total Revenue: ${formatCurrency(summary.totalAmount)}`, 14, finalY + 29);

        doc.save(`snooker-history-${new Date().toISOString().split('T')[0]}.pdf`);
    }, [matches, currency, summary]);

    const hasActiveMatches = Object.keys(activeMatches).length > 0;

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-start mb-8 flex-wrap">
                    <div className="hidden sm:block">
                        <CurrencySelector selectedCurrency={currency} onCurrencyChange={setCurrency} />
                    </div>
                    <div className="text-center flex-grow">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500 pb-2">
                            Snooker Time & Billing
                        </h1>
                        <p className="text-gray-400 mt-2">Select a table and rate to start a match.</p>
                    </div>
                    <div className="hidden sm:block" aria-hidden="true">
                        <DigitalClock />
                    </div>
                    <div className="w-full flex sm:hidden justify-center items-center mt-4 gap-4">
                        <CurrencySelector selectedCurrency={currency} onCurrencyChange={setCurrency} />
                        <DigitalClock />
                    </div>
                </header>

                <StartMatchForm 
                    onStartMatch={handleStartMatch} 
                    availableTables={availableTables}
                    currency={currency}
                    selectedRate={selectedRate}
                    onRateChange={setSelectedRate}
                />

                {hasActiveMatches && (
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-200 mb-4 border-l-4 border-green-500 pl-3">Active Matches</h2>
                        <div className="space-y-4">
                            {Object.entries(activeMatches)
                                .sort(([tableA], [tableB]) => tableA.localeCompare(tableB))
                                .map(([table, matchData]) => (
                                    <ActiveMatchCard 
                                        key={table} 
                                        table={table} 
                                        startTime={matchData.startTime} 
                                        onEndMatch={handleEndMatch}
                                        rate={matchData.rate}
                                        currency={currency}
                                    />
                            ))}
                        </div>
                    </div>
                )}
                
                <div>
                    <h2 className="text-2xl font-bold text-gray-200 mb-4 border-l-4 border-gray-500 pl-3">Match History</h2>
                    <div className="space-y-4">
                        {matches.length > 0 ? (
                            matches.map(match => <MatchCard key={match.serial} match={match} onDelete={handleDeleteMatch} onEdit={handleOpenEditModal} currency={currency} />)
                        ) : (
                            <div className="text-center py-16 px-6 bg-gray-800 rounded-2xl">
                                <h3 className="text-xl font-semibold text-gray-300">No Completed Matches</h3>
                                <p className="text-gray-500 mt-2">When a match ends, it will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {matches.length > 0 && (
                    <footer className="mt-10 bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-inner border border-gray-700">
                        <h3 className="text-2xl font-bold text-white mb-4 text-center">Total Summary</h3>
                        <div className="flex justify-around items-center text-center mb-6">
                            <div className="font-mono">
                                <div className="text-lg text-gray-400">Total Minutes</div>
                                <div className="text-3xl font-bold text-green-400">{summary.totalMinutes}</div>
                            </div>
                            <div className="font-mono">
                                <div className="text-lg text-gray-400">Total Revenue</div>
                                <div className="text-3xl font-bold text-green-400">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 2 }).format(summary.totalAmount)}
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <button 
                                onClick={handleDownloadPdf} 
                                disabled={matches.length === 0}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg disabled:bg-blue-800/50 disabled:cursor-not-allowed disabled:transform-none"
                                aria-label="Download match history as PDF"
                            >
                                <DownloadIcon className="w-5 h-5"/>
                                <span>Download PDF</span>
                            </button>
                        </div>
                    </footer>
                )}
            </div>
            {editingMatch && (
                <EditMatchModal
                    match={editingMatch}
                    onSave={handleUpdateMatch}
                    onClose={handleCloseEditModal}
                    currency={currency}
                />
            )}
        </div>
    );
};

export default App;