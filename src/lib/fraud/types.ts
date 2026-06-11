export type Severity = "low" | "medium" | "high";

export interface SignalCandidate {
  userId: string; // the subject whose money/standing is affected
  signalType: string;
  severity: Severity;
  evidence: {
    /** Stable key for deduping against existing open signals */
    dedupeKey: string;
    /** Reader accounts whose sessions get marked suspicious on high severity */
    sessionUserIds?: string[];
    windowStart: string;
    windowEnd: string;
    [k: string]: unknown;
  };
}

export type FraudRule = (windowStart: Date, windowEnd: Date) => Promise<SignalCandidate[]>;
