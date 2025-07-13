
import React, { useState, useMemo, useCallback } from 'react';
import { Match } from './types';
import { RATES_PER_MINUTE, TABLE_NUMBERS } from './constants';

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

const RupeeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-5 4h5m-5 4h5M5 21V3h14v18H5zM5 7h14M9 3v4" />
    </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


// --- CHILD COMPONENTS ---

interface MatchFormProps {
  onAddMatch: (table: string, startTime: string, endTime: string, rate: number) => void;
}

const MatchForm: React.FC<MatchFormProps> = ({ onAddMatch }) => {
  const [table, setTable] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [rate, setRate] = useState<string>(RATES_PER_MINUTE[0].toString());
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!table || !startTime || !endTime || !rate) {
      setError('Please fill in all fields.');
      return;
    }

    const start = new Date(`1970-01-01T${startTime}`);
    let end = new Date(`1970-01-01T${endTime}`);
    if (end <= start) {
        end.setDate(end.getDate() + 1);
    }
    const durationInMs = end.getTime() - start.getTime();
    if(durationInMs <= 0) {
        setError('End time must be after start time.');
        return;
    }

    setError('');
    onAddMatch(table, startTime, endTime, parseFloat(rate));
    setTable('');
    setStartTime('');
    setEndTime('');
    setRate(RATES_PER_MINUTE[0].toString());
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-2xl shadow-2xl mb-10 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
                <label htmlFor="table-select" className="block text-sm font-medium text-gray-300 mb-2">Table Number</label>
                <select 
                    id="table-select" 
                    value={table} 
                    onChange={e => setTable(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 transition"
                >
                    <option value="" disabled>Select a table</option>
                    {TABLE_NUMBERS.map(num => <option key={num} value={num}>Table {num}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="start-time" className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <input 
                    type="time" 
                    id="start-time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 transition"
                />
            </div>
            <div>
                <label htmlFor="end-time" className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                <input 
                    type="time" 
                    id="end-time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 transition"
                />
            </div>
            <div>
                <label htmlFor="rate-select" className="block text-sm font-medium text-gray-300 mb-2">Rate (₹/min)</label>
                <select 
                    id="rate-select" 
                    value={rate} 
                    onChange={e => setRate(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 transition"
                >
                    {RATES_PER_MINUTE.map(r => <option key={r} value={r}>{r.toFixed(2)}</option>)}
                </select>
            </div>
        </div>
        {error && <p className="text-red-400 text-center text-sm">{error}</p>}
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg">
            Add Match
        </button>
    </form>
  );
};

interface MatchCardProps {
  match: Match;
  onDelete: (serial: number) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onDelete }) => {
  const formatTime = (timeString: string) => {
    const [hour, minute] = timeString.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg transition-all hover:shadow-green-500/20 hover:ring-1 hover:ring-green-500/50">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 items-center text-gray-300">
        <div className="flex items-center gap-3 font-bold text-lg text-white">
          <span className="text-green-400"># {match.serial.toString().padStart(3, '0')}</span>
        </div>
        <div className="flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-green-400" />
            <span className="font-semibold">Table {match.table}</span>
        </div>
        <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-400" />
            <span>{formatTime(match.startTime)}</span>
        </div>
        <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-red-400" />
            <span>{formatTime(match.endTime)}</span>
        </div>
        <div className="font-mono text-center">
            <div className="text-sm text-gray-400">Duration</div>
            <div className="text-lg font-semibold text-white">{match.duration} min</div>
        </div>
        <div className="font-mono text-center">
            <div className="text-sm text-gray-400">Rate</div>
            <div className="text-lg font-semibold text-white">
               ₹{match.rate.toFixed(2)}
            </div>
        </div>
        <div className="flex justify-between items-center">
            <div className="text-right flex-grow">
                <div className="text-sm text-gray-400">Amount</div>
                <div className="text-lg font-bold text-green-400">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(match.amount)}
                </div>
            </div>
            <button onClick={() => onDelete(match.serial)} className="ml-4 p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-700 transition">
                <TrashIcon className="w-5 h-5"/>
            </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [serialCounter, setSerialCounter] = useState(1);

  const handleAddMatch = useCallback((table: string, startTime: string, endTime: string, rate: number) => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    let end = new Date(`1970-01-01T${endTime}:00`);

    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const durationInMs = end.getTime() - start.getTime();
    const durationInMinutes = Math.round(durationInMs / (1000 * 60));

    if (durationInMinutes <= 0) return;

    const amount = durationInMinutes * rate;

    const newMatch: Match = {
      serial: serialCounter,
      table,
      startTime,
      endTime,
      duration: durationInMinutes,
      amount,
      rate,
    };
    
    setMatches(prev => [...prev, newMatch]);
    setSerialCounter(prev => prev + 1);
  }, [serialCounter]);

  const handleDeleteMatch = useCallback((serial: number) => {
    setMatches(prev => prev.filter(match => match.serial !== serial));
  }, []);

  const summary = useMemo(() => {
    const totalMinutes = matches.reduce((sum, match) => sum + match.duration, 0);
    const totalAmount = matches.reduce((sum, match) => sum + match.amount, 0);
    return { totalMinutes, totalAmount };
  }, [matches]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500 pb-2">
            Snooker Time & Billing
          </h1>
          <p className="text-gray-400 mt-2">Track match times and calculate costs seamlessly.</p>
        </header>

        <MatchForm onAddMatch={handleAddMatch} />

        <div className="space-y-4">
          {matches.length > 0 ? (
            matches.map(match => <MatchCard key={match.serial} match={match} onDelete={handleDeleteMatch} />)
          ) : (
            <div className="text-center py-16 px-6 bg-gray-800 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-300">No Matches Added</h3>
              <p className="text-gray-500 mt-2">Use the form above to add a new match entry.</p>
            </div>
          )}
        </div>

        {matches.length > 0 && (
          <footer className="mt-10 bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-inner border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Total Summary</h3>
            <div className="flex justify-around items-center text-center">
                <div className="font-mono">
                    <div className="text-lg text-gray-400">Total Minutes</div>
                    <div className="text-3xl font-bold text-green-400">{summary.totalMinutes}</div>
                </div>
                <div className="font-mono">
                    <div className="text-lg text-gray-400">Total Revenue</div>
                    <div className="text-3xl font-bold text-green-400">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(summary.totalAmount)}
                    </div>
                </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default App;
