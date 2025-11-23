class AudioService {
    private audioContext: AudioContext | null = null;
    private oscillator: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;
    private isPlaying: boolean = false;

    constructor() {
        if (typeof window !== 'undefined') {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    private initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    public playBeep() {
        if (this.isPlaying) return;
        this.initAudio();

        if (!this.audioContext) return;

        this.oscillator = this.audioContext.createOscillator();
        this.gainNode = this.audioContext.createGain();

        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
        this.gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime); // Low volume

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);

        this.oscillator.start();
        this.isPlaying = true;
    }

    public stopBeep() {
        if (!this.isPlaying || !this.oscillator) return;

        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
        this.isPlaying = false;
    }
}

export const audioService = new AudioService();
