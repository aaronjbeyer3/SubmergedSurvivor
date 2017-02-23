
/*
DOCUMENTATION

*/

var queue; // LoadQueue
var stage; // Stage

//KEYS
var KEYCODE_SPACE = 32;
var KEYCODE_UP = 38;
var KEYCODE_DOWN = 40;
var KEYCODE_LEFT = 37;
var KEYCODE_RIGHT = 39;
var KEYCODE_W = 87;
var KEYCODE_A = 65;
var KEYCODE_D = 68;
var KEYCODE_S = 83;

var xKeyHeld = "NONE";
var yKeyHeld = "NONE";
var playerDirection = "RIGHT";

var yMomentum = 0;
var onGround = 0;
var pressedLeft = 0, pressedRight = 0;
var pressedDown = 0;

var diver, tank, oceanbackground, blackScreen, redScreen, redarrowL, redarrowR;
var floor, platform1, platform2, platform3, platform4, platform5;
var diverChangeX, diverChangeY;
var oxygenLabel, oxygenBarBack, oxygenBar, oxygenCommand, oxygenRate = 0.5;
var scoreLabel, score = 0, scoreRate = 0;

const PWidth=300; //width of the platforms

var pB; // pause button
var pausedLabel;
var isInstructions = 1;
var isGameOver = 0;

function load()
{
    queue = new createjs.LoadQueue(false);
    queue.addEventListener( "complete", init );
    queue.loadManifest([{id:"bigdaddy",src:"bigdaddy.png"},{id:"tank",src:"tank.png"},
        {id:"oceanbackground",src:"oceanbackground.png"},{id:"redarrow",src:"redarrow.png"}]);

    document.onkeyup = handleKeyUp.bind(this);
    document.onkeydown = handleKeyDown.bind(this);
    document.getElementById("canvas").onkeydown = handleKeyDown;

    pB = document.getElementById("pauseBtn");
}

function init()
{
    stage = new createjs.Stage("canvas");

    var diverImage = queue.getResult("bigdaddy");
    var tankImage = queue.getResult("tank");
    var oceanImage = queue.getResult("oceanbackground");
    var redarrowImage = queue.getResult("redarrow");

    // floor rectangle
    var g1 = new createjs.Graphics();
    g1.beginStroke("black").beginFill("#E5CF7F").drawRect(0, 550, 800, 50);

    // platform1 rectangle
    var g2 = new createjs.Graphics();
    g2.beginStroke("black").beginFill("#7481BA").drawRect(0, 0, PWidth, 30);

    // black screen
    var g3 = new createjs.Graphics();
    g3.beginStroke("black").beginFill("black").drawRect(0, 0, 800, 600);

    // oxygen bar black background  
    var g4 = new createjs.Graphics();
    g4.beginStroke("black").beginFill("#434343").drawRect(0, 0, 400, 25);

    // oxygen bar
    var g5 = new createjs.Graphics();
    g5.beginStroke("black").beginFill("lightblue"); //.drawRect() is set in a command later

    // red screen (for gameOver)
    var g6 = new createjs.Graphics();
    g6.beginStroke("red").beginFill("red").drawRect(0, 0, 800, 600);

    oceanbackground = new createjs.Bitmap(oceanImage);
    oceanbackground.x = 0; oceanbackground.y = 0;
    stage.addChild(oceanbackground);
    stage.update();

    floor = new createjs.Shape(g1);
    stage.addChild(floor);
    stage.update();

    platform1 = new createjs.Shape(g2);
    platform1.x = 250; platform1.y = 250;
    stage.addChild(platform1);
    stage.update();

    platform2 = new createjs.Shape(g2);
    platform2.x = -138; platform2.y = 100;
    stage.addChild(platform2);
    stage.update();

    platform3 = new createjs.Shape(g2);
    platform3.x = 638; platform3.y = 100;
    stage.addChild(platform3);
    stage.update();

    platform4 = new createjs.Shape(g2);
    platform4.x = -138; platform4.y = 400;
    stage.addChild(platform4);
    stage.update();

    platform5 = new createjs.Shape(g2);
    platform5.x = 638; platform5.y = 400;
    stage.addChild(platform5);
    stage.update();

    oxygenLabel = new createjs.Text("Oxygen: ", "bold 25px Arial", "#434343");
    oxygenLabel.x = 30; oxygenLabel.y = 562;
    stage.addChild(oxygenLabel);
    stage.update();

    oxygenBarBack = new createjs.Shape(g4);
    oxygenBarBack.x = 140; oxygenBarBack.y = 565;
    stage.addChild(oxygenBarBack);
    stage.update();

    oxygenBar = new createjs.Shape(g5);    
    oxygenBar.x = 140; oxygenBar.y = 565;
    oxygenCommand = oxygenBar.graphics.drawRect(0, 0, 400, 25).command;
    stage.addChild(oxygenBar);
    stage.update();

    redScreen = new createjs.Shape(g6);
    stage.addChild(redScreen);
    redScreen.alpha = 0;
    stage.update();

    scoreLabel = new createjs.Text("Score: " + score, "bold 25px Arial", "#434343");
    scoreLabel.x = 580; scoreLabel.y = 562;
    stage.addChild(scoreLabel);
    stage.update();

    blackScreen = new createjs.Shape(g3);
    stage.addChild(blackScreen);
    stage.update();

    redarrowL = new createjs.Bitmap(redarrowImage);
    redarrowL.x = 330; redarrowL.y = 227;
    stage.addChild(redarrowL);
    stage.update();

    redarrowR = new createjs.Bitmap(redarrowImage);
    redarrowR.x = 455; redarrowR.y = 227;
    redarrowR.regX = redarrowR.image.width/2;
    redarrowR.scaleX *= -1;
    stage.addChild(redarrowR);
    stage.update();

    tank = new createjs.Bitmap(tankImage);
    tank.x = 390; tank.y = 230;
    stage.addChild(tank);
    stage.update();

    diver = new createjs.Bitmap(diverImage);
    diverChangeX = diver.image.width/2;
    diverChangeY = diver.image.height/2;
    diver.x = 400; diver.y = 450;
    diver.regX = 20; diver.regY = 23; //set regX & refY to center (40x46)    
    stage.addChild(diver);
    stage.update();

    //Create text for instructions
    var instructions = new createjs.Text("Quickly! Gather Oxygen Tanks to stay alive!\nUse the ARROW KEYS to move left, right, up and down!\n\nPress SPACEBAR to begin!", "bold 25px Arial", "white");
    instructions.x = 400; instructions.y = 70;
    instructions.textAlign = "center";
    stage.addChild(instructions);
    stage.update();
    pause();
    isInstructions = 0;
    stage.removeChild(instructions);
    createjs.Tween.get(blackScreen).to({alpha: 0}, 500);
    createjs.Tween.get(redarrowL).to({alpha: 0}, 500);
    createjs.Tween.get(redarrowR).to({alpha: 0}, 500);

    pausedLabel = new createjs.Text("PAUSED", "bold 70px Arial", "white");
    pausedLabel.x = 400; pausedLabel.y = 120;
    pausedLabel.textAlign = "center";
    pausedLabel.visible = false;
    stage.addChild(pausedLabel);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", tick);
	
}

function tick(event) {
    if (!event.paused)
    {

        //Left and Right controls
        switch (xKeyHeld)
        {
            case "LEFT":
                diver.x -= 6;
                if (diver.x <= -38) // pacman/mario bros logic
                    diver.x = 832;
                break;
            case "RIGHT":
                diver.x += 6;
                if (diver.x >= 838)
                    diver.x = -32
                break;
        }

        //Up control
        if (yKeyHeld == "UP")
        {
            if (diver.y > 20) //Prevents character from swimming too high out of view
                yMomentum = -10
            onGround = 0;
        }

        //GRAVITY
        if (diver.y < 545 - diverChangeY) //Prevents character from falling through the floor
        {
            //Check if on platforms
            if (onPlatform(platform1) == 1 || onPlatform(platform2) || onPlatform(platform3) ||
                    onPlatform(platform4) || onPlatform(platform5)) 
            {
                yMomentum = 0;
            }
            else
            {
                diver.y += yMomentum; //apply gravity
            }

            if(pressedDown == 1) //holding DOWN
            {
                if(yMomentum < 7)
                    yMomentum++;
            }
            else if (yMomentum > 3)
                yMomentum--; //Slow down
            else
                yMomentum++; //Increase gravity
        
        }
        else //On floor
        { 
            if (onGround == 0) //Adjusts to floor
            {
                diver.y = 550 - diverChangeY;
                onGround = 1;
            }               
            if (yMomentum < 0)
                diver.y += yMomentum;
        }
		
		//Going to check and see if the sprite collided with the tank.
		checkTankCollision();

        if(oxygenCommand.w > 0)
        {
            oxygenCommand.w -= oxygenRate;
			
			//Adding to the score
			score++;
			scoreLabel.text = "Score: " + score;
        }
		else
		{
            oxygenCommand.w = 0; //Makes it look cleaner when gameover.

            gameOver();
		}
		
        stage.update();
    }
}

function onPlatform(p)
{
    //On top of platform
    if (yMomentum >= 0 && pressedDown == 0 &&
        diver.y >= p.y-4 - diverChangeY && diver.y <= p.y - diverChangeY &&
        diver.x >= p.x - diverChangeX && diver.x <= p.x + PWidth + diverChangeX)
        {
            diver.y = p.y - diverChangeY;
            return 1;
        }
    else
        return 0;
}

function checkTankCollision()
{
	//Going to get the local point for the middle of the oxygen tank
	var point = tank.localToLocal(10, 10, diver);
	
	//Now comparing the local point to see if the diver has hit the middle of the tank.
	if (diver.hitTest(point.x, point.y))
	{
        //Move tank to a different location
		movesTank();

		//Reset oxygen bar 
		oxygenCommand.w = 400;

        //Adjust score/difficulty
        scoreRate += 100;
		score += (1000 + scoreRate);
        if(oxygenRate <= 3) //Dropping faster is too hard
            oxygenRate += 0.05;
	}
}

function movesTank()
{
	//I have a list of locations that the tank could be in
	var myArray=[
        {x:390, y:230}, //middle platform
        {x:390, y:530}, //middle floor
        {x:10, y:80}, //top left platform
        {x:10, y:380}, //bottom left platform
        {x:10, y:530}, //left floor
        {x:770, y:80}, //top right platform
        {x:770, y:380}, //bottom right platform
        {x:770, y:530} //right floor
        ];
		
	//I take the current location of the tank, remove it, and then randomly place the tank in another location.
	var myx=tank.x;
	var myy=tank.y;
	for (var i=0; i<myArray.length; i++)
	{
		if (myArray[i].x==tank.x && myArray[i].y==tank.y)
		{
			break;
		}
		else
		{
			continue;
		}
	}
	
	//Whatever value the for loop stops at indicates the index of the location that will be removed.
	myArray.splice(i, 1); //This should remove the current location.
	
	//Going to select a random location
	var randomIndex=Math.floor(Math.random()*(myArray.length)); 
	
	//Set the tank to the random index's location
	tank.x=myArray[randomIndex].x;
	tank.y=myArray[randomIndex].y;
	
	stage.update();
	
}

function handleKeyDown(e)
{
    //cross browser issues
    if (!e)
    {
        var e = window.event;
    }

    //handle for which key is pressed
    switch (e.keyCode)
    {
        case KEYCODE_SPACE:
            if(isGameOver == 0)
                pause();
            else
                resetGame();
            break;

        case KEYCODE_D:
        case KEYCODE_RIGHT:
            pressedRight = 1;
            xKeyHeld = "RIGHT";
            if (playerDirection != "RIGHT") //Should diver change direction?
            {
                diver.scaleX *= -1;
                playerDirection = "RIGHT";
            }               
            break;

        case KEYCODE_A:
        case KEYCODE_LEFT:
            pressedLeft = 1;
            xKeyHeld = "LEFT";
            if (playerDirection != "LEFT") //Should diver change direction?
            {
                diver.scaleX *= -1;
                playerDirection = "LEFT";
            }               
            break;

        case KEYCODE_W:
        case KEYCODE_UP:
            yKeyHeld = "UP";
            break;

        case KEYCODE_S:
        case KEYCODE_DOWN:
            pressedDown = 1;
            break;

    }
}

function handleKeyUp(e)
{
    //cross browser issues
    if (!e)
    {
        var e = window.event;
    }

    //handle for which key is released
    switch (e.keyCode)
    {
        case KEYCODE_D:
        case KEYCODE_RIGHT:           
            pressedRight = 0;
            if (pressedLeft == 1) //Checks to see if left key is still pressed down
            {
                xKeyHeld = "LEFT";
                
                if (playerDirection != "LEFT") //Should diver change direction?
                {
                    diver.scaleX *= -1;
                    playerDirection = "LEFT";
                }
            }               
            else
                xKeyHeld = "NONE";
            break;

        case KEYCODE_A:
        case KEYCODE_LEFT:            
            pressedLeft = 0;
            if (pressedRight == 1) //Checks to see if right key is still pressed down
            {
                xKeyHeld = "RIGHT";

                if (playerDirection != "RIGHT") //Should diver change direction?
                {
                    diver.scaleX *= -1;
                    playerDirection = "RIGHT";
                }
            }                
            else
                xKeyHeld = "NONE";
            break;

        case KEYCODE_W:
        case KEYCODE_UP:
            yKeyHeld = "NONE";
            break;

        case KEYCODE_S:
        case KEYCODE_DOWN:
            pressedDown = 0;
            break;

    } 

}

//Pauses the ticker
function pause()
{
    if (createjs.Ticker.getPaused())
    {
        createjs.Ticker.setPaused(false);
        pB.textContent="Pause Game";
        pausedLabel.visible = false;
        stage.update();
    }
    else {
        createjs.Ticker.setPaused(true);
        pB.textContent="Paused";
        if(isInstructions == 0)
        {
            pausedLabel.visible = true;
            stage.update();
        }
    }
}

function gameOver()
{
    //Reposition scoreLabel
    scoreLabel.color = "white";
    scoreLabel.font = "bold 50px Arial";
    scoreLabel.x = 400; scoreLabel.y = 500;
    scoreLabel.textAlign = "center";
    stage.swapChildren(diver, scoreLabel);
    
    //reuse pauseLabel
    pausedLabel.text = "GAME OVER"
    pausedLabel.visible = true;

    var gameOverText = new createjs.Text("Click SPACEBAR to play again!", "bold 30px Arial", "white");
    gameOverText.textAlign = "center";
    gameOverText.x = 400; gameOverText.y = 300;
    stage.addChild(gameOverText);
    stage.update();

    tank.visible = false;

    createjs.Ticker.setPaused(true);
    redScreen.alpha = 1;
    isGameOver = true;

}

function resetGame()
{
    //reset variables
    score = 0;
    scoreRate = 0;
    oxygenRate = 0.5;
    oxygenCommand.w = 400;
    isInstructions = 1;
    yMomentum = 0;
    onGround = 0;
    pressedLeft = 0, pressedRight = 0;
    pressedDown = 0;
    isGameOver = 0;

    //removes all children from stage. Saves memory (i think)
    for (var i = stage.children.length - 1; i >= 0; i--)
    {
        stage.removeChild(stage.children[i]);
    };

    init();
}