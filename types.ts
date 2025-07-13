
export interface Match {
  serial: number;
  table: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  rate: number; // cost per minute for this match
  amount: number;
}