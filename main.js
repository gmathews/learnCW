// Configuration
const decayTime = 1005; // Tone drop off in milliseconds
const frequency = 600; // Tone frequency

// Setup a tone generator
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioContext.createGain();
const useGainNode = decayTime > 0;
if( useGainNode ){
    gainNode.connect( audioContext.destination );
}

let soundPlaying = false;
let keyPressed = 0;
let currentOscillator = 0;
let oldOscillator = 0;

// Reusable tone generation
function createToneGenerator(){
    const oscillator = audioContext.createOscillator();
    // Select a frequency
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // See if we will ramp down later
    if( useGainNode ){
        oscillator.connect( gainNode );
        gainNode.gain.setValueAtTime( 1, audioContext.currentTime );
    }else{
        oscillator.connect( audioContext.destination );
    }

    oscillator.start();
    soundPlaying = true;
    currentOscillator = oscillator;
}

// End the tone
function beQuiet(){
    if( !soundPlaying ){
        return;
    }

    // We didn't have time to stop gracefully
    if( oldOscillator ){
        oldOscillator.stop();
    }

    // Save, in case we create a new sound
    oldOscillator = currentOscillator;
    function donePlaying(){
        oldOscillator.stop();
        soundPlaying = false;
        console.log('Done playing sound');
    }

    if( useGainNode ){
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
        // gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + ( decayTime / 1000 ) );
        gainNode.gain.setTargetAtTime(0, audioContext.currentTime, ( decayTime / 1000 ) );
        // Quiet time
        setTimeout( donePlaying, decayTime );
    }else{
        donePlaying();
    }
}

function printKey( intro, keycode ){
    console.log( intro + "'" + keycode + "'" );
}

// Only accept the keys we want
function filterKey( key ){
    // Tab messes things up
    return key == 'Tab';

}

// On while key is down make a tone
window.addEventListener( 'keydown', function( downEvent ){
    // Do nothing if the event was already processed or we are already playing sound
    if( downEvent.defaultPrevented || soundPlaying ){
        return;
    }
    // Cancel the default action to avoid it being handled twice
    downEvent.preventDefault();

    // Ignore if this is a lousy key
    if( filterKey( downEvent.key ) ){
        return;
    }

    // Track what key we need to let up
    keyPressed = downEvent.key;
    printKey( 'DOWN: ', keyPressed );

    // Start making noise
    createToneGenerator();

}, {capture: true} );

// Get ready to stop making noise
window.addEventListener( 'keyup', function( upEvent ){

    if( upEvent.defaultPrevented ){
        return; // Do nothing if the event was already processed
    }
    // Cancel the default action to avoid it being handled twice
    upEvent.preventDefault();

    const upKeycode = upEvent.key;
    printKey( 'UP: ', upKeycode );
    // Stop making noise
    if( upKeycode == keyPressed ){
        beQuiet();
    }
}, {capture: true} );

// Shut up when we leave
window.addEventListener( 'blur', beQuiet, false);
