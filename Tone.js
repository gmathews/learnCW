// Configuration
const frequency = 600; // Tone frequency

// End Configuration

class Tone{
    constructor(){
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    startTone(){
        const oscillator = this.audioContext.createOscillator();
        // Select a frequency
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        oscillator.connect( this.audioContext.destination );
        oscillator.start();

        this.soundPlaying = true;
        this.currentOscillator = oscillator;
        this.toneStart = this.audioContext.currentTime;
    }

    stopTone(){
        // Calculate our stopping time
        let halfWavelengthDuration = 0.5 / frequency;
        let toneLength = this.audioContext.currentTime - this.toneStart;
        let completedHalfWavelengths = Math.floor( toneLength / halfWavelengthDuration );
        let timeOfLastZero = this.toneStart + ( halfWavelengthDuration * completedHalfWavelengths );
        let timeOfNextZero = timeOfLastZero + halfWavelengthDuration;
        let currentLetterAdded = false;

        this.soundPlaying = false;
        this.currentOscillator.stop( timeOfNextZero );
        this.silenceStart = this.audioContext.currentTime;
    }

    get toneLength(){
        return ( this.audioContext.currentTime - this.toneStart ) * 1000;
    }

    get silenceLength(){
        return ( this.audioContext.currentTime - this.silenceStart ) * 1000;
    }
}
