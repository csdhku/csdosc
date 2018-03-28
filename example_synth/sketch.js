var osc;
var freq=400;
var playing = false; // indication of sound or no sound
var fft;
var backgroundColor;


function setup()
{
  createCanvas(500,500);
  backgroundColor = color(100);

  osc = new p5.Oscillator(); // create new oscillator
  osc.setType('sine'); // select waveform
  osc.freq(freq);
  osc.amp(0);
  osc.start();
  
  fft = new p5.FFT(0.8,1024);

} // setup()


function draw()
{
  background(backgroundColor);
  
  /*
   * FFT analysis
   */
  var spectrum = fft.analyze();
  noStroke();
  fill(0,255,0);
  for (var i = 0; i< spectrum.length; i++){
    var x = map(i, 0, spectrum.length, 0, width);
    var h = map(spectrum[i], 0, 255, height, 0) - height;
    rect(x, height, width / spectrum.length, h )
  } // for

  /*
   * Waveform plot
   */
  var waveform = fft.waveform();
  noFill();
  beginShape();
  stroke(255,0,0);
  strokeWeight(3);
  for (var i = 0; i< waveform.length; i++){
    var x = map(i, 0, waveform.length, 0, width);
    var y = map(waveform[i], -1, 1, 0, height);
    vertex(x,y);
  } // for
  endShape();

} // draw()


function toggleSound() // turn sound on or off with fade in/out
{
  if (!playing) { // currently not playing
    osc.amp(0.3, 1); // ramp amplitude to 0.3 over 1 second
    playing = true; // switch playing on
  }
  else { // currently playing
    osc.amp(0, 1); // ramp amplitude to 0 over 1 second
    playing = false; // switch playing off
  }
} // toggleSound()


/*
 * mouseClicked() is called when the user clicks a mouse button
 */
function mouseClicked()
{
  toggleSound();

  freq *= 1.05;
  if(freq > 1000) freq=1000; // limit
  osc.freq(freq);
} // mouseClicked()


/*
 * mouseMoved() is called when the user moves the mouse
 */
function mouseMoved()
{
  osc.freq(freq);
} // mouseMoved()


/*
 * keyTyped() is called when the user types a key
 * The key is found in the variable key
 */
function keyTyped()
{
  switch(key)
  {
    case ' ':
       toggleSound();
    break;
    case 's': // sinus
      osc.setType('sine');
    break;
  } // switch
} // mouseClicked()



