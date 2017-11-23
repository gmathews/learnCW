// Configuration
const frequency = 600; // Tone frequency

// End Configuration

// Setup a tone generator
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let soundPlaying = false;
let keyPressed = 0;
let currentOscillator = 0;
let toneStart = 0;
let silenceStart = 0;
let updater = 0;
let toneTranslator = new CWTranslator();

// Update the width of the progress bar and if modifyColor is true, the color of it.
// startingPercentage allows the bar to stay red until we hit the starting percentage
function updateProgressBar( percentage, styleId, modifyColor=true, startingPercentage=0 ){
    let style = document.getElementById(styleId).style;
    style.width = ( percentage * 100 ) + '%';
    if( modifyColor ){
        // 0 - 120 (red to green)
        let hue = Math.max( 0, percentage - startingPercentage ) *
            ( 120 / ( 1 - startingPercentage ) );
        style.backgroundColor = 'hsl(' + hue + ', 100%, 50%)';
    }
}

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

    // Update time
    document.getElementById('silenceTime').innerHTML = '0ms';
    clearInterval( updater );
    updater = setInterval( () => {
        let toneLength = ( audioContext.currentTime - toneStart ) * 1000;
        if( toneTranslator.isDash( toneLength ) || toneTranslator.isDot( toneLength ) ){
            document.getElementById('toneTime').style.color = 'green';
        }else{
            document.getElementById('toneTime').style.color = 'red';
        }
        // Display nicely
        let displayTime = Math.ceil( toneLength );
        document.getElementById('toneTime').innerHTML = displayTime + 'ms';

        // Build fill target bar
        updateProgressBar( toneTranslator.dotPercentage( toneLength ), 'dotBar' );
        updateProgressBar( toneTranslator.dashPercentage( toneLength ), 'dashBar', true, 0.66 );
        updateProgressBar( toneTranslator.overflowPercentage( toneLength ), 'overflowBar', false );
    }, 10);
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

    let element = toneLength * 1000;
    toneTranslator.addElement( element );
    if( toneTranslator.isDash( element ) ){
        document.getElementById('toneType').innerHTML = 'dah';
    }else if( toneTranslator.isDot( element ) ){
        document.getElementById('toneType').innerHTML = 'di';
    }else{ // Confusing and bad
        document.getElementById('toneType').innerHTML = ':(';
    }

    silenceStart = audioContext.currentTime;
    // Update time
    clearInterval( updater );
    updater = setInterval( () => {
        let silenceLength = ( audioContext.currentTime - silenceStart ) * 1000;
        // Display nicely
        let displayTime = Math.ceil( silenceLength );
        document.getElementById('silenceTime').innerHTML = displayTime + 'ms';

        // Build gap target bar
        updateProgressBar( toneTranslator.gapElementPercentage( silenceLength ), 'gapElementBar' );
        updateProgressBar( toneTranslator.gapLetterPercentage( silenceLength ), 'gapLetterBar', true, 0.66 );
        updateProgressBar( toneTranslator.gapWordPercentage( silenceLength ), 'gapWordBar', true, 0.66 );
        let gapOverflowPercentage = toneTranslator.gapOverflowPercentage( silenceLength );
        updateProgressBar( gapOverflowPercentage, 'gapOverflowBar', false );

        // At this point, no need to keep updating
        if( gapOverflowPercentage >= 1 ){
            clearInterval( updater );
        }
    }, 10);
}
function printKey( intro, keycode ){
    console.log( intro + "'" + keycode + "'" );
}

// Only accept the keys we want
function filterKey( key ){
    // Tab messes things up
    return key == 'Tab' || key != 'Shift'; // TODO: only use shift for debug

}

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
