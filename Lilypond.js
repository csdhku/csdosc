let notenames = ["c","cis","d","dis","e","f","fis","g","gis","a","ais","b"];
let durations = [64,32,16,8,4,2,1];
let scoreDetails = {
  "tempo":120,
  "title":"Composition in JS",
  "artist":"mr computer",
  "key":"c \\major",
  "time":"4/4",
  "score": {
    "main": {
      "instrument":"violin",
      "notes":[54,60],
      "duration":[2,2],
      "lilyNotes":"c4"    
    },
    "bass": {
      "instrument":"violin",
      "notes":[34,40],
      "duration":[2,2],
      "lilyNotes":"c4"    
    }
  }
}
class Lilypond {
  setData(data) {
    if (data.target === "make") {
      console.log("hey");
      // createHeader();
      for (let i in scoreDetails.score) {
        let notes = scoreDetails.score[i].notes
        let duration = scoreDetails.score[i].duration
        let ties = processDuration(duration,notes);
        let bars = getBars(duration);
        scoreDetails.score[i].lilyNotes = createNotes(notes,duration,ties,bars);  
        console.log(scoreDetails);
      }
      
      // createFooter();
    }
    else if (data.target === "tempo" || data.target === "title" || data.target === "artist" || data.target === "key" || data.target === "time") {
      scoreDetails[data.target] = data.value;  
    }
    else {
      scoreDetails["score"][data.score][data.target] = data.value;
    }
    
  }
}

function createHeader() {
  let txt = "";
  txt += '\\version "2.18.2"\n';
  txt += "\\header{ \n \t";
  txt += "title = "+title+"\n \t";
  txt += "composer = "+artist+"\n";
  txt += "} \n";
  txt += "\\score{ \n \t";
  txt += "\\relative c' { \n \t \t";
  txt += "\\clef ";
  txt += clef;
  txt += "\n \t \t \\key ";
  txt += key;
  txt += "\n \t \t \\time ";
  txt += time;
  txt += "\n \t \t \\tempo 4 = ";
  txt += tempo;
  // txt += " \n \t \t";
  console.log(txt);
}

function createFooter() {
  let txt = "";
  txt += "\t } \n";
  txt += "}";
  console.log(txt);
}

//create the notes with duration, ties and bar-signs.
function createNotes(notes,duration,ties,bars) {
  let prevOct = 5;
  let prevDur = 4;
  let text = "\t\t\t"
  if (notes.length != duration.length) {
    console.log("note and duration info are not the same.")
  }
  else {
    for (let i in notes) {
      let note, oct,octAddon;
      if (Array.isArray(notes[i])) {
        note = "<";
        for (let j in notes[i]) {
          note += (Number.isInteger(notes[i][j]))?notenames[notes[i][j]%12]+" ":notes[i][j]+" ";
          if (j == 0) {
            oct = parseInt(notes[i][j]/12); 
            [prevOct,octAddon] = getRelativeOct(oct,prevOct);  
          } 
        }
        note += ">";
      }
      else {
        note = (Number.isInteger(notes[i]))?notenames[notes[i]%12]:notes[i];
        oct = parseInt(notes[i]/12);
        [prevOct,octAddon] = getRelativeOct(oct,prevOct);  
      }
      
      [prevDur,durAddon] = getDuration(duration[i],prevDur);
      let tie = (ties[i] == 1)?" ~ ":"";
      let bar = (bars[i] == 1)?" |\n\t\t\t":" ";
      text+=note+octAddon+durAddon+tie+bar;
    }
  }
  return text;
}

//resize a the durations to fit in a bar. Add rests at the end if time is left.
function processDuration(dur,notes) {
  let allDurations = calculateAllDurations(4);
  let ties=[];
  let length = 0;
  let resetLength = 4;
  let iterations = dur.length;
  for (let i=0; i<iterations; i++) {
    length += 4/fromDot(dur[i]);
    if (length == resetLength) {
      resetLength = 4;
      length = 0;
    }
    if (length > 4) {
      let tieaddon = 0;
      let beforeBar = getRestDuration(4 - (length - 4/dur[i]),allDurations);
      let afterBar = getRestDuration(length - 4,allDurations);
      for (let j in beforeBar) {
        if (j == 0){
          dur[i] = beforeBar[j];     
          ties[i] = (notes[i]=='r')?0:1;
        }
        else {
          let insertOn = i+parseInt(j);
          dur.splice(insertOn,0,beforeBar[j]);
          notes.splice(insertOn,0,notes[i]);
          iterations++;
          ties[insertOn] = (notes[i]=='r')?0:1;
          tieaddon = parseInt(j);
          resetLength = 4/fromDot(beforeBar[j]);
        }
      }
      for (let j in afterBar) {
        let insertOn = i+parseInt(j)+(tieaddon+1)
        dur.splice(insertOn,0,afterBar[j]);
        notes.splice(insertOn,0,notes[i]);
        iterations++;
        if (j != afterBar.length-1) {
          ties[insertOn] = (notes[i]=='r')?0:1;  
        }
      }
      length = 0;

    }
    if (i == iterations-1) {
      let left = (length==0)?0:4-length;
      if (left > 0) {
        calculateEndRest(left);
        return ties;
      }
      else {
        return ties;
      }
    }
  } 
}

//recursive function to devide time left in (dotted) notes.
function getRestDuration(left,allDurations,result=[]) {
  for (let i = 0; i < allDurations.length; i++) {
    if (left - allDurations[i] < 0) {
      left -= allDurations[i-1];
      result.push(getDot(allDurations[i-1]));
      if (left != 0) {
        return getRestDuration(left,allDurations,result);
        break;
      }
      else {
        return result
      }  
    }
  }
}

//calculate all the available durations including single dotted up to 64's
function calculateAllDurations(beat) {
  let allDurations = [];
  for (let i in durations) {
    allDurations.push(beat/durations[i]);
    allDurations.push(beat/durations[i]+((beat/durations[i])/2));
  }
  return allDurations;
}

function getBars(duration) {
  let length = 0;
  let bars = [];
  duration.map((i,index) => {
    length+=4/fromDot(i);
    bars[index] = (length % 4 == 0) ? 1 : 0;
  });
  return bars;
}

//from (dotted) note to duration (x/4)
function fromDot(dur) {
  if (!Number.isInteger(dur)) {
    let source = parseInt(dur.slice(0,-1));
    source = (4/source)+(4/source)/2;
    return 4/source
  }
  else {
    return dur
  }
}

//get possible octave additions (' or ,)
function getOctAdd(oct) {
  let result = "";
  for (let i=0;i<Math.abs(oct);i++) {
    result+=(oct<0)?",":"'";
  }
  return result;
}

//calculate if the note is in the same octave as the previous note.
function getRelativeOct(oct,prev) {
  let change = (oct-prev)
  let result = getOctAdd(change);
  return[oct,result];
}

//only return the duration if it is different from before
function getDuration(dur,prev) {
  return [dur,(prev!=dur)?dur:''];
}

module.exports = {
  Lilypond: new Lilypond()
}