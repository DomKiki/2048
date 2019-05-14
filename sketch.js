/********************* Constants *********************/

const canvasSize = 800;
const gridSize   = 4;

const squareSize = 100;

const startNum   = 2;

/****************** Global variables *****************/

var grid;

var score = 0,
	scoreTxt;

/********************** p5 Methods *******************/

function setup() {
	
    var canvas = createCanvas(canvasSize, canvasSize);
	canvas.parent("canvas");
	
	scoreTxt = select("#score");
	
	initGrid();
	feedGrid(startNum);
	
}

function draw() {
	
    background(255);
	updateScore();
	drawGrid(squareSize);
	
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
		g = rotateGrid(g);
		
	// Actual move and combination
	g = slideGrid(g,a,d);
	g = combineGrid(g,a,d);
	
	// Rotate back 
	if (a == 1)
		g = unrotateGrid(g);
	
	// Save changes
	grid = g;
	
	// Feed new number into the grid if something moved
	if (!gridEquals(p))
		feedGrid();
	
}

/************************* Grid **********************/

// Fill grid with zeros
function initGrid() {
	grid = new Array(gridSize);
	for (var i = 0; i < gridSize; i++)
		grid[i] = new Array(gridSize).fill(0);
}

// Swap row and column of an array
function rotateGrid(g) {
	var s  = g.length,
		cp = copyGrid(g);
	for (var i = 0; i < s; i++) {
		cp[i].fill(0);
		for (var j = 0; j < s; j++)
			cp[i][j] = g[j][i];
	}		
	return cp;
}

// Undo the rotation on an array (just rotate it 3x)
function unrotateGrid(g) {
	var res = copyGrid(g);
	for (var i = 0; i < 3; i++)
		res = rotateGrid(res);
	return res;
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
	
	var ok = 0,
		num,
		pos;
	while (ok < n) {
		num = (random() < 0.5) ? 2 : 4;
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

function updateScore() { scoreTxt.html(score + " pts"); }

/*********************** Display *********************/

function drawGrid(w) {
	
	var v;
	for (var i = 0; i < gridSize; i++)
		for (var j = 0; j < gridSize; j++) {
			
			noFill();
			strokeWeight(2);
			stroke(0);
			rect(j * w, i * w, w, w);
			
			v = grid[i][j];
			if (v != 0) {
				textAlign(CENTER, CENTER);
				textSize(50);
				fill(0);
				noStroke();
				text(v, (j*w) + (w/2), (i*w) + (w/2));
			}
		}
	
}