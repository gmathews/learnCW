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
        // this._updateAverageDotSize();
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
    static _betweenMarginOfError( num, desiredAmount, marginOfErrorMs ){
        return CWTranslator._between( desiredAmount - marginOfErrorMs, num,
            desiredAmount + marginOfErrorMs );
    }

    // Given a element of length k in ms, determine if it is a dot.
    isDot( element ){
        const marginOfErrorMs = marginOfError * this.averageDotSize;
        return CWTranslator._betweenMarginOfError( element, this.averageDotSize, marginOfErrorMs );
    }
    // returns [0=>1] accepts element length in ms
    dotPercentage( element ){
        return Math.min( 1.0, element / this.averageDotSize );
    }
    // Given a element of length k in ms, determine if it is a dash.
    isDash( element ){
        const marginOfErrorMs = marginOfError * this.averageDotSize;
        // Ratio of dot length to dash length
        const dashDotDiff = this.averageDotSize * ( dashLength / dotLength );
        return CWTranslator._betweenMarginOfError( element, dashDotDiff, marginOfErrorMs );
    }
    // [0=>1] Accepts element length in ms
    dashPercentage( element ){
        // Ratio of dot length to dash length
        const dashDotDiff = this.averageDotSize * ( dashLength / dotLength );
        return Math.max( 0, Math.min( 1.0, ( element ) / dashDotDiff ) );
    }
    // [0=>1] A dash is 84% of this bar. Accepts element length in ms.
    overflowPercentage( element ){
        const overflowDotDiff = this.averageDotSize * ( dashLength / dotLength );
        return Math.min( 1.0, ( 0.84 * element ) / overflowDotDiff );
    }

    // [0=>1] length in ms.
    gapElementPercentage( space ){
        const gapDotDiff = this.averageDotSize * ( elementGap / dotLength );
        return Math.min( 1.0, space / gapDotDiff );
    }
    // [0=>1] length in ms.
    gapLetterPercentage( space ){
        const letterDotDiff = this.averageDotSize * ( minLetterGap / dotLength );
        return Math.min( 1.0, space / letterDotDiff );
    }
    // [0=>1] length in ms.
    gapWordPercentage( space ){
        const wordDotDiff = this.averageDotSize * ( minWordGap / dotLength );
        return Math.min( 1.0, space / wordDotDiff );
    }
    // [0=>1] length in ms. [0-98] is word % in this percentage
    gapOverflowPercentage( space ){
        const overflowDotDiff = this.averageDotSize * ( ( minWordGap ) / dotLength );
        return Math.min( 1.0, ( 0.98 * space ) / overflowDotDiff );
    }

    // Given a gap of length k, determine if it is a letter, element, or word gap
    gapType( space ){
        // Ratio of dot length to gap length
        const gapDotDiff = this.averageDotSize * ( elementGap / dotLength );
        const LetterDotDiff = this.averageDotSize * ( minLetterGap / dotLength );
        const WordDotDiff = this.averageDotSize * ( minWordGap / dotLength );
        const marginOfErrorMs = marginOfError * this.averageDotSize;

        if( CWTranslator._betweenMarginOfError( space, gapDotDiff, marginOfErrorMs ) ){
            return gapTypes.ELEMENT;
        }else if( CWTranslator._betweenMarginOfError( space, LetterDotDiff, marginOfErrorMs ) ){
            return gapTypes.LETTER;
        }else if( space < LetterDotDiff ){
            return gapTypes.INVALID;
        }else if( CWTranslator._betweenMarginOfError( space, WordDotDiff, marginOfErrorMs ) ){
            return gapTypes.WORD;
        }else if( space > WordDotDiff ){
            return gapTypes.LOUSY_WORD;
        }else{
            return gapTypes.LOUSY_LETTER;
        }
    }

};
