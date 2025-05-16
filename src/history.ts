export type ObjectType = "experience" | "want_to_do" | "job_summary";

export interface HistoryEntry {
  timestamp: string;
  toolName: string;
  objectType: ObjectType;
  previousState: any;
}

export class HistoryManager {
  private entries: HistoryEntry[] = [];

  add(entry: HistoryEntry): void {
    this.entries.push(entry);
  }

  getHistory(): HistoryEntry[] {
    return this.entries;
  }
}

export const historyManager = new HistoryManager();
