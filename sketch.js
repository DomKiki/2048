/********************* Constants *********************/

const gridSize   = 4;
const squareSize = 100;

const canvasSize = gridSize * squareSize + 1;

const startNum   = 2;

const colors     = [ "#FFFFFF", "#FFFFFF", "#FFFFCC", "#FFCC99", "#FFCC00", "#FF0000", "#CC0099", "#6600FF", 
					 "#0000FF", "#006699", "#00CC00", "#99FF99", "#0099cc", "#003399", "#000000" ];

/****************** Global variables *****************/

var grid;

var score = 0,
	scoreTxt;
	
var gameOver = false;

/********************** p5 Methods *******************/

function setup() {
	
    var canvas = createCanvas(canvasSize, canvasSize);
	canvas.parent("canvas");
	
	scoreTxt = select("#score");
	
	initGrid();
	feedGrid(startNum);
	
	update();
	noLoop();
	
}

/************************ Moves **********************/

function keyPressed() {
	
	// Key detection
	var a,d;
	switch (keyCode) {
		
		case UP_ARROW:
			a = 1;
			d = 0;
			break;
		
		case DOWN_ARROW:
			a = 1;
			d = 1;
			break;
			
		case LEFT_ARROW:
			a = 0;
			d = 0;
			break;
		
		case RIGHT_ARROW:
			a = 0;
			d = 1;
			break;
			
		default:
			return;		
	}
	
	// Copy for further change check
	var g = copyGrid(grid),
		p = copyGrid(grid);
	// Rotate the grid if up/down
	if (a == 1)
		g = rotateGrid(g, 1);
		
	// Actual move and combination
	g = slideGrid(g,a,d);
	g = combineGrid(g,a,d);
	
	// Rotate back 
	if (a == 1)
		g = rotateGrid(g, 3);
	
	// Save changes
	grid = g;
		
	// Feed new number into the grid if something moved
	if (!gridEquals(p))
		feedGrid();
	
	// Display
	update();
	
	// Game Over : display final score
	gameOver = isGameOver();
	if (gameOver)
		updateScore();
	
}

/************************* Grid **********************/

// Fill grid with zeros
function initGrid() {
	grid = new Array(gridSize);
	for (var i = 0; i < gridSize; i++)
		grid[i] = new Array(gridSize).fill(0);
}

// Swap row and column of an array
function rotateGrid(g, d) {
	var s, 
		cp = copyGrid(g), cp2; 
	for (var n = 0; n < d; n++) {
		cp2 = copyGrid(cp);
		s   = cp.length;
		for (var i = 0; i < s; i++) {
			cp2[i].fill(0);
			for (var j = 0; j < s; j++)
				cp2[i][j] = cp[j][i];
		}		
		cp = copyGrid(cp2);
	}
	return cp;
}

// Make a copy of an array
function copyGrid(g) {
	var s  = g.length,
		cp = new Array(s);
	for (var i = 0; i < s; i++) {
		cp[i] = new Array(s);
		for (var j = 0; j < s; j++)
			cp[i][j] = g[i][j];
	}
	return cp;
}
	
// Randomly throw 2s or 4s in an array
function feedGrid(n=1) {
	
	// Don't get stuck in an infinite loop
	var avail = false;
	for (var i = 0; i < gridSize; i++)
		if (grid[i].includes(0)) {
			avail = true;
			break;
		}
	if (!avail)
		return;
	
	// Feed it !
	var ok = 0,
		num,
		pos;
	while (ok < n) {
		num = (random() < 0.9) ? 2 : 4;
		pos = createVector(floor(random(gridSize)), floor(random(gridSize)));
		if (grid[pos.x][pos.y] == 0) {
			grid[pos.x][pos.y] = num;
			ok++;
		}
	}
	
}

// Test equality between grid and c
function gridEquals(c) {

	for (var i = 0; i < gridSize; i++)
		for (var j = 0; j < gridSize; j++)
			if (grid[i][j] != c[i][j])
				return false;
	return true;
		
}

// Slide the grid along an axis (0 for rows, 1 for columns)
function slideGrid(g, axis, dir) {

	var fil,
		res = copyGrid(g);
	for (var r = 0; r < res.length; r++) {
		var fil = res[r].filter(x => x);
		var pad = new Array(res.length - fil.length).fill(0);
		res[r]  = (dir == 0) ? fil.concat(pad) : pad.concat(fil);
	}
	return res;
	
}

// Combine adjacent equal numbers
function combineGrid(g, axis, dir) {
	
	var res = copyGrid(g);
	for (var r = 0; r < res.length; r++) {
		
		var row = res[r],
			i1 = (dir == 0) ? 0                : (res.length - 1),
			i2 = (dir == 0) ? (res.length - 1) : 0,
			di = (dir == 0) ? 1                : -1,
			a, b;
			
		for (var i = i1; i != i2; i += di) {
			a = row[i];
			b = row[i + di];
			if (a == b) {
				row[i] = a + b;
				row[i + di] = 0;
				score += row[i];
			}
		}
		
	}
	return slideGrid(res, axis, dir);
	
}

/************************ Data ***********************/

function updateScore() { 
	var str = score + " pts";
	if (gameOver)
		str = "Final Score : " + str;
	scoreTxt.html(str); 
}

// Checks if there is an empty space in the grid or 2 identical values that could be merged
function isGameOver() {
	for (var i = 0; i < gridSize; i++)
		for (var j = 0; j < gridSize; j++)
			if (grid[i][j] == 0)
				return false;
			else if ((i < (gridSize - 1)) && (grid[i][j] == grid[i+1][j]))
				return false;
			else if ((j < (gridSize - 1)) && (grid[i][j] == grid[i][j+1]))
				return false;
	return true;
}

/*********************** Display *********************/

function update() {
	
    background(255);
	updateScore();
	drawGrid(squareSize);
	
}

function drawGrid(w) {
	
	var v, p, c;
	for (var i = 0; i < gridSize; i++)
		for (var j = 0; j < gridSize; j++) {
			
			v = grid[i][j];
			p = (v != 0) ? round(Math.log2(v)) : 1;
			c = colors[p];
			fill(c);
			strokeWeight(1);
			stroke(0);
			rect(j * w, i * w, w, w, 10);
			
			if (v != 0) {
				textAlign(CENTER, CENTER);
				textSize(round(50 - p));
				stroke(invertColor(c));
				fill(invertColor(c));
				text(v, (j*w) + (w/2), (i*w) + (w/2));
			}
		}
	
}

function invertColor(c) { return color(255 - red(c), 255 - green(c), 255 - blue(c)); }