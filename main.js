// Configuration
const frequency = 600; // Tone frequency

// End Configuration

// Setup a tone generator
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const toneTranslator = new CWTranslator();
const characterMap = new CharacterMap();

let soundPlaying = false;
let keyPressed = 0;
let currentOscillator = 0;
let toneStart = 0;
let silenceStart = 0;
let updater = 0;
let currentSentence = '';
let currentChar = '';

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

    let silenceLength = ( audioContext.currentTime - silenceStart ) * 1000;
    let gapWordPercentage = toneTranslator.gapWordPercentage( silenceLength );
    // If we had been quiet long enough, we are making a new letter
    if( gapWordPercentage >= 1 ){
        currentSentence += ' ';
    }

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
    let currentLetterAdded = false;
    let clearLetter = false;

    currentOscillator.stop( timeOfNextZero );
    soundPlaying = false;

    let element = toneLength * 1000;
    toneTranslator.addElement( element );
    if( toneTranslator.isDash( element ) ){
        document.getElementById('toneType').innerHTML = 'dah';
        currentChar += '3';
    }else if( toneTranslator.isDot( element ) ){
        document.getElementById('toneType').innerHTML = 'di';
        currentChar += '1';
    }else{ // Confusing and bad
        document.getElementById('toneType').innerHTML = ':(';
        clearLetter = true;
    }

    // This is just what it was before, so no need to change the highlighting
    if( !clearLetter){
        highlightCurrentChar( currentChar );
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
        let gapLetterPercentage = toneTranslator.gapLetterPercentage( silenceLength );
        updateProgressBar( gapLetterPercentage, 'gapLetterBar', true, 0.66 );
        updateProgressBar( toneTranslator.gapWordPercentage( silenceLength ), 'gapWordBar', true, 0.66 );
        let gapOverflowPercentage = toneTranslator.gapOverflowPercentage( silenceLength );
        updateProgressBar( gapOverflowPercentage, 'gapOverflowBar', false );

        // Add in the letter we just made, or dump our garbage
        if( !currentLetterAdded && ( gapLetterPercentage >= 1 || clearLetter ) ){
            currentLetterAdded = true;
            currentSentence += characterMap.currentChar( currentChar );
            // Only keep the last n chars
            if( currentSentence.length > 30 ){
                currentSentence = currentSentence.slice( -29 );
            }
            document.getElementById( 'currentSentence' ).innerHTML = currentSentence + '&lt;';
            clearLetter = true;
        }

        if( clearLetter ){
            clearHighlights( currentChar );
            currentChar = '';
        }

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
    return key === 'Tab' || key !== 'Shift'; // TODO: only use shift for debug

}

function buildTable(){
    function parseTree( item, tdId ){
        function check( c ){
            if( item.hasOwnProperty( c ) ){
                if( item[ c ].hasOwnProperty('res') ){
                    const td = document.getElementById( tdId + c );
                    if( td === null ){
                        // console.log( 'missing td ', tdId, c, ' for ', item[ c ].res );
                    }else{
                        td.innerHTML = item[ c ].res;
                    }
                }
                parseTree( item[ c ], tdId + c );
            }
        }
        check( '1' );
        check( '3' );
    }
    parseTree( characterMap.searchTree, '' );
}

buildTable();

// String is 1 for dot and 3 for dash
function highlightCurrentChar( letter ){
    if( letter === '' ){
        return;
    }
    const td = document.getElementById( letter );
    if( td === null ){
        console.log( 'Cannot highlight td ', letter );
    }else{
        if( letter.slice( -1 ) === '1' ){
            td.classList.add( 'treeDotHigh' );
        }else{
            td.classList.add( 'treeDashHigh' );
        }
    }
}
function clearHighlights( oldLetter ){
    if( oldLetter === '' ){
        return;
    }
    const td = document.getElementById( oldLetter );
    if( td === null ){
        console.log( 'Cannot highlight td ', oldLetter );
    }else{
        if( oldLetter.slice( -1 ) === '1' ){
            td.classList.remove( 'treeDotHigh' );
        }else{
            td.classList.remove( 'treeDashHigh' );
        }
    }
    if( oldLetter.length > 1 ){
        clearHighlights( oldLetter.slice( 0, -1 ) );
    }
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
    if( upKeycode === keyPressed ){
        beQuiet();
    }
}, {capture: true} );

// Shut up when we leave
window.addEventListener( 'blur', beQuiet, false);
