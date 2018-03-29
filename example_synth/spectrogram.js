var osc;
var freq=400;
var playing = false; // indication of sound or no sound
var fft;
var backgroundColor;
var x=0;


function setup()
{
  createCanvas(1200,512);
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
  
  /*
   * FFT analysis
   */
  var spectrum = fft.analyze();
  //var logspectrum = fft.logAverages(fft.getOctaveBands(50,20));
  for(var i=0; i<spectrum.length; i++){
    stroke(spectrum[i]);
    point(x,height-i)
  } // for

  x++;
  if(x >= width){
    x=0;
    background(backgroundColor);
  }  // if

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



