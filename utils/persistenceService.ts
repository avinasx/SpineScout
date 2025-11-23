export interface SessionData {
    userId: string;
    startTime: number;
    badPostureDurationSeconds: number;
}

class PersistenceService {
    private currentSessionId: string | null = null;
    private userId: string = 'user_123'; // Simulated User ID

    constructor() {
        // In a real app, we'd fetch this from auth
    }

    public startSession(): string {
        this.currentSessionId = `session_${Date.now()}`;
        const sessionData: SessionData = {
            userId: this.userId,
            startTime: Date.now(),
            badPostureDurationSeconds: 0,
        };

        this.saveSession(sessionData);
        console.log(`[Persistence] Session started: ${this.currentSessionId}`, sessionData);
        return this.currentSessionId;
    }

    public updateSession(badPostureDurationSeconds: number) {
        if (!this.currentSessionId) return;

        const sessionData: SessionData = {
            userId: this.userId,
            startTime: Date.now(), // In real app, we wouldn't update start time, but for simplicity we just log current state
            badPostureDurationSeconds,
        };

        // Simulate Firestore path: /artifacts/${process.env.NEXT_PUBLIC_APP_ID || 'unknown_app'}/users/{userId}/spine-scout
        // We'll store in localStorage for persistence across reloads if needed, but mostly just log here.
        this.saveSession(sessionData);

        // Log to console to demonstrate "Persistence"
        // console.log(`[Persistence] Updated session ${this.currentSessionId}: Bad Posture Duration = ${badPostureDurationSeconds}s`);
    }

    private saveSession(data: SessionData) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(`spine_scout_${this.currentSessionId}`, JSON.stringify(data));
        }
    }
}

export const persistenceService = new PersistenceService();
