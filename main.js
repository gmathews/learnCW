// Configuration
const frequency = 600; // Tone frequency
const desiredWPM = 4; // Desired Words Per Minute

// End Configuration

const dotLength = 1200 / desiredWPM; // Milliseconds
// Since these are standard to morse code, don't change these
const dashLength = dotLength * 3;
const elementGap = dotLength; // The gap between the dots and dashes in a character
const minLetterGap = dotLength * 3; // Various teaching methods have you make these longer
const minWordGap = dotLength * 7;

// Setup a tone generator
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let soundPlaying = false;
let keyPressed = 0;
let currentOscillator = 0;
let toneStart = 0;

// Reusable tone generation
function createToneGenerator(){
    if( soundPlaying ){
        return;
    }

    const oscillator = audioContext.createOscillator();
    // Select a frequency
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    oscillator.connect( audioContext.destination );
    toneStart = audioContext.currentTime;
    oscillator.start();
    soundPlaying = true;
    currentOscillator = oscillator;
}

// End the tone
function beQuiet(){
    if( !soundPlaying ){
        return;
    }

    // Calculate our stopping time
    let halfWavelengthDuration = 0.5 / frequency;
    let toneLength = audioContext.currentTime - toneStart;
    let completedHalfWavelengths = Math.floor( toneLength / halfWavelengthDuration );
    let timeOfLastZero = toneStart + ( halfWavelengthDuration * completedHalfWavelengths );
    let timeOfNextZero = timeOfLastZero + halfWavelengthDuration;

    currentOscillator.stop( timeOfNextZero );
    soundPlaying = false;

    // Display nicely
    let displayTime = Math.ceil( ( timeOfNextZero - toneStart ) * 1000 );
    document.getElementById("toneTime").style.color = "green";
    document.getElementById("toneTime").innerHTML = displayTime;
}

function printKey( intro, keycode ){
    console.log( intro + "'" + keycode + "'" );
}

// Only accept the keys we want
function filterKey( key ){
    // Tab messes things up
    return key == 'Tab';

}

// Used to calculate Words Per Minute from our current dot size
function calcWPM( averageDotSize ){
    // averageDotSize is in milliseconds
    return 1200 / averageDotSize;
}

// TODO: given some n elements, determine the size of a dot
// TODO: given a element of length k, determine if it is a dash or dot.
// TODO: given a gap of length k, determine if it is a letter, element, or word gap

// On while key is down make a tone
window.addEventListener( 'keydown', function( downEvent ){
    // Do nothing if the event was already processed
    if( downEvent.defaultPrevented ){
        return;
    }
    // Cancel the default action to avoid it being handled twice
    downEvent.preventDefault();
    downEvent.stopPropagation()
    // Ignore if this is a lousy key
    if( filterKey( downEvent.key ) ){
        return;
    }

    // Track what key we need to let up
    keyPressed = downEvent.key;
    // printKey( 'DOWN: ', keyPressed );

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
    upEvent.stopPropagation()

    const upKeycode = upEvent.key;
    // printKey( 'UP: ', upKeycode );
    // Stop making noise
    if( upKeycode == keyPressed ){
        beQuiet();
    }
}, {capture: true} );

// Shut up when we leave
window.addEventListener( 'blur', beQuiet, false);
