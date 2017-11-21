// Configuration
const desiredWPM = 4; // Desired Words Per Minute
const marginOfError = 0.10; // 10% margin of error to still count elements as dots
const numberOfElementsToStore = 5; // Number of elements to calculate average

// End Configuration

const dotLength = 1200 / desiredWPM; // Milliseconds
// Since these are standard to morse code, don't change these
const dashLength = dotLength * 3;
const elementGap = dotLength; // The gap between the dots and dashes in a character
const minLetterGap = dotLength * 3; // Various teaching methods have you make these longer
const minWordGap = dotLength * 7;

const gapTypes = {
    INVALID: 0,
    ELEMENT: 1,
    LETTER: 2,
    WORD: 3,
    LOUSY_LETTER: 4,
    LOUSY_WORD: 5
};

class CWTranslator{

    constructor(){
        // This is the last n elements
        this.elements = [ dotLength ]; // Start with our target value
        // Init our average dot size
        this._updateAverageDotSize();
    }

    // Used to calculate Words Per Minute from our current dot size
    calcWPM(){
        // averageDotSize is in milliseconds
        return 1200 / this.averageDotSize;
    }

    // Store our elements for determining dot size
    addElement( element ){
        this.elements.push( element );
        // Only store the last n elements
        if( this.elements.length > numberOfElementsToStore ){
            this.elements.shift();
        }
        this._updateAverageDotSize();
    }

    // Given some n elements, determine the size of a dot
    _updateAverageDotSize(){
        let avg = this.elements.reduce( ( prev, curr ) => {
            return prev + curr;
        }) / this.elements.length;
        this.averageDotSize = Math.max( 1, avg ); // Make sure this is never 0
    }
    // TODO: given some n elements, determine the symbol they represent
    convertCodeToSymbol( elements ){

    }

    static _between( min, num, max ){
        return num >= min && num <= max;
    }
    static _betweenMarginOfError( num, desiredAmount ){
        return CWTranslator._between( desiredAmount - desiredAmount * marginOfError, num,
            desiredAmount + desiredAmount * marginOfError );
    }

    // Given a element of length k, determine if it is a dot.
    isDot( element ){
        return CWTranslator._betweenMarginOfError( element, this.averageDotSize );
    }
    // Given a element of length k, determine if it is a dash.
    isDash( element ){
        // Ratio of dot length to dash length
        const dashDotDiff = this.averageDotSize * ( dashLength / dotLength );
        return CWTranslator._betweenMarginOfError( element, dashDotDiff );
    }
    // Given a gap of length k, determine if it is a letter, element, or word gap
    gapType( space ){
        // Ratio of dot length to gap length
        const gapDotDiff = this.averageDotSize * ( elementGap / dotLength );
        const LetterDotDiff = this.averageDotSize * ( minLetterGap / dotLength );
        const WordDotDiff = this.averageDotSize * ( minWordGap / dotLength );

        if( CWTranslator._betweenMarginOfError( space, gapDotDiff ) ){
            return gapTypes.ELEMENT;
        }else if( CWTranslator._betweenMarginOfError( space, LetterDotDiff ) ){
            return gapTypes.LETTER;
        }else if( space < LetterDotDiff ){
            return gapTypes.INVALID;
        }else if( CWTranslator._betweenMarginOfError( space, WordDotDiff ) ){
            return gapTypes.WORD;
        }else if( space > WordDotDiff ){
            return gapTypes.LOUSY_WORD;
        }else{
            return gapTypes.LOUSY_LETTER;
        }
    }

};
