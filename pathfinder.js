//Variables
var canvas;
var nodeMenu;
var mazeMenu;
var reset;
var canStart = false;
var startSelect = true;
var endSelect = false;
var wallSelect = false;
var secondClick;
var cols = 65;
var rows = 25;
var grid;
var gridWidth;
var gridHeight;
var openSet;
var closedSet;
var path;
var pathReverse;
var wallPercentage = 0.2;
var start;
var end;
var horizontal;
var vertical;
var goalReached;

//Initial function
function setup() {
  //Canvas size
  canvas = createCanvas(1700, 625);
  canvas.position(110, 200);

  //User settings
  gui();

  //Create nodes, neighbours, start, destination
  initialValues();

  //Sets start and finish nodes
  startFinish();

  //Draws the initial grid
  drawNodes();
}

//Sets initials values
function initialValues() {
  //Finds the size nodes on grid
  gridWidth = width/cols;
  gridHeight = height/rows;

  //Sets the initial variable values
  openSet = [];
  closedSet = [];
  path = [];
  pathReverse = [];
  grid = [];
  goalReached = false;
  horizontal = true;
  vertical = false;
  secondClick = false;

  //Generates a 2D array by adding array elements to array
  for (var i = 0; i < cols; i++) {
    grid[i] = [];
  }

  //Fiils 2D array with nodes
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j] = new Node(i, j);
    }
  }

  //Generates neighbours of all nodes
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].generateNeighbours(grid);
    }
  }
  //Draws the initial grid with default start end nodes
  startFinish();
  drawNodes();
}

//Sets the start and destination nodes
function startFinish () {
  //Start and end nodes
  start = grid[0][1];
  end = grid[cols - 1][rows - 2];

  //Make sure they aren't walls
  start.wall = false;
  end.wall = false;
}

//Estimates cost of cheapest path from node to end
function heuristic(node, end) {
  //Since the neighbours are up down left right use
  //Manhattan distance with D = 1
  var d1 = abs(node.x - end.x);
  var d2 = abs(node.y - end.y);
  return d1 + d2;
}

//Creates drop-down menus and run button
function gui() {
  //Node selection
  nodeMenu = createSelect();
  nodeMenu.option("Start", 0);
  nodeMenu.option("End", 1);
  nodeMenu.option("Wall", 2);
  nodeMenu.selected("Start");
  nodeMenu.changed(nodeSelectEvent);
  nodeMenu.position(600, 860);
  nodeMenu.style("background-color", "aliceblue");
  nodeMenu.style("color", "crimson");
  nodeMenu.style("padding", "8px 16px 8px 16px");
  nodeMenu.style("font-size", "25px");
  nodeMenu.style("font-family", "'Unica One");
  nodeMenu.style("border", "4px solid crimson");
  nodeMenu.style("border-radius", "4px");

  //Run button
  run = createButton('Run Pathfinder');
  run.mousePressed(runPathfinder);
  run.position(750, 860);
  run.style("background-color", "aliceblue");
  run.style("color", "crimson");
  run.style("padding", "8px 16px 8px 16px");
  run.style("font-size", "25px");
  run.style("font-family", "'Unica One");
  run.style("border", "4px solid crimson");
  run.style("border-radius", "4px");

  //Wall selection
  wallMenu = createSelect();
  wallMenu.option('No walls', 0);
  wallMenu.option('Maze', 1);
  wallMenu.option('Random Walls', 2);
  wallMenu.selected("No Walls");
  wallMenu.mouseClicked(wallSelectEvent);
  wallMenu.position(1100, 860);
  wallMenu.style("background-color", "aliceblue");
  wallMenu.style("color", "crimson");
  wallMenu.style("padding", "8px 0px 8px 16px");
  wallMenu.style("font-size", "25px");
  wallMenu.style("font-family", "'Unica One");
  wallMenu.style("border", "4px solid crimson");
  wallMenu.style("border-radius", "4px");

  //Reset button
  reset = createButton('Reset');
  reset.mousePressed(initialValues);
  reset.position(975, 860);
  reset.style("background-color", "aliceblue");
  reset.style("color", "crimson");
  reset.style("padding", "8px 16px 8px 16px");
  reset.style("font-size", "25px");
  reset.style("font-family", "'Unica One");
  reset.style("border", "4px solid crimson");
  reset.style("border-radius", "4px");
}

//Selecting start/end/wall nodes
function mousePressed() {
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      //Selected grid spot
      if (grid[i][j].x * gridWidth <= mouseX && grid[i][j].x * gridWidth + gridWidth >= mouseX && 
          grid[i][j].y * gridHeight <= mouseY && grid[i][j].y * gridHeight + gridHeight >= mouseY) {

        //Based on node selection edit the selected grid space
        if (startSelect) {
          start = grid[i][j];
        } else if (endSelect) {
          end = grid[i][j];
        } else if (wallSelect) {
          grid[i][j].wall = !grid[i][j].wall;
        } else {
          drawNodes();
        }
      }
    }
  }
  //Draw the new nodes
  drawNodes();
}

//Node menu selection event
function nodeSelectEvent() {
  //Set all events to false first
  startSelect = false;
  endSelect = false;
  wallSelect = false;

  //Based on node selected give bool value
  if (nodeMenu.value() == 0) {
    startSelect = true;
  } else if (nodeMenu.value() == 1) {
    endSelect = true;
  } else {
    wallSelect = true;
  }
}

//Runs pathfinder
function runPathfinder() {
  canStart = true;
  //Adds first node to calculation queue
  openSet.push(start);
}

//Maze selection
function wallSelectEvent() {
  //Doesnt do anything if the menu was clicked
  //only if option is selected
  if (secondClick) {
    secondClick = false;

    //Clear walls initially
    clearWalls();

    //Generates walls based on wall generation selection
    if (wallMenu.value() == 0) {
      clearWalls();
    } else if (wallMenu.value() == 1) {
      maze();
    } else {
      randomWall();
    }

    //Draws the walls
    drawNodes();
  } else {
    secondClick = true;
  }
}

//Traces back the node to create a path
function reconstructPath(current) {
  //Adds the destination to path
  var childNode = current;
  path.push(childNode);

  //Traces back until node no longer has a parent node
  while (!(childNode.cameFrom === null)) {
    path.push(childNode.cameFrom);
    childNode = childNode.cameFrom;
  }
}

//Updates and draws the nodes onto canvas
function drawNodes() {
  //Draw every unchecked node
  for (i = 0; i < cols; i++){
    for (j = 0; j < rows; j++) {
      //Start and end nodes are yellow
      if (grid[i][j] == end || grid[i][j] == start) {
        grid[i][j].wall = false;
        grid[i][j].update(color(255, 251, 0))
      } else {
        //White untested grid spot
        grid[i][j].update(color(255, 255, 255));
      }
    }
  }
  
  //All nodes that have been processed
  for (var i = 0; i < closedSet.length; i++) {
    closedSet[i].update(color(3, 248, 252));
  }

  //All nodes that are to be checked
  for (var i = 0; i < openSet.length; i++) {
    openSet[i].update(color(209, 36, 108));
  }

  //Draws shortest path
  for (var i = 0; i < pathReverse.length; i++) {
    pathReverse[i].update(color(255, 251, 0));
  }
}

//Clears all walls
function clearWalls() {
  for (i = 0; i < cols; i++){
    for (j = 0; j < rows; j++) {
      grid[i][j].wall = false;
    }
  }
}

//Random wall generation
function randomWall() {
  for (i = 0; i < cols; i++){
    for (j = 0; j < rows; j++) {
      if (random(0, 1) > 1-wallPercentage) {
        grid[i][j].wall = true;
      }
    }
  }
}

//Recursive division maze wall generation
function maze() {
  //Creates border
  generateBorder();

  //Bisect, starts with bisection within the border
  bisect(horizontal, 1, cols - 2, 1, rows - 2);
}

//Creates a border of walls around grid
function generateBorder() {
  for (i = 0; i < cols; i++){
    for (j = 0; j < rows; j++) {
      //If they are a border piece, add wall
      if (i === 0 || i === cols - 1 || j === 0 || j === rows -1) {
        grid[i][j].wall = true;
      }
    }
  }
}

//Divides the grid by creating a wall and adding a entrance to it
function bisect(orientation, x1, x2, y1, y2) {
  //Can't bisect further
  if (abs(x1 - x2) <= 1 || abs(y1 - y2) <= 1) {
      return;
  }

  //Bisect horizontally
  if (orientation) {
    //Finds an odd coordinate to bisect between
    var bisectPt = floor(random(x1 + 1, x2) / 2) * 2;

    //Creates a wall at bisection point
    for (var j = y1; j < y2 + 1; j++) {
      grid[bisectPt][j].wall = true;
    }

    //Creates an even coordinate entrance on the wall
    var entrance = floor(random(y1, y2 + 1) / 2) * 2 + 1;
    grid[bisectPt][entrance].wall = false;

    //Recurse on both sides
    bisect(!orientation, x1, bisectPt - 1, y1, y2);
    bisect(!orientation, bisectPt + 1, x2, y1 , y2);

  } else {
    //Finds an odd coordinate to bisect between
    var bisectPt = floor(random(y1 + 1, y2) / 2) * 2;

    //Creates a wall at bisection point
    for (var i = x1; i < x2 + 1; i++) {
      grid[i][bisectPt].wall = true;
    }

    //Creates an even coordinate entrance on the wall
    var entrance = floor(random(x1, x2 + 1) / 2) * 2 + 1;
    grid[entrance][bisectPt].wall = false;

    //Recurse on both sides
    bisect(!orientation, x1, x2, y1, bisectPt - 1);
    bisect(!orientation, x1, x2, bisectPt + 1 , y2);
  }
}

//A* Search Algorithm
function aSearch() {
  //Finds node with lowest f value in openSet
  var lowIndex = 0;
  for (var i = 0; i < openSet.length; i++) {
    if (openSet[i].f <= openSet[lowIndex].f) {
      lowIndex = i;
    }
  }

  //Sets the node to process next as node with lowest f value
  var current = openSet[lowIndex];

  //Finished processing node, no need to recalculate
  openSet.splice(lowIndex, 1);
  closedSet.push(current);

  //Construct path if the end destination node has been reached
  if (current === end) {
    //Constructs the path
    reconstructPath(current);
    goalReached = true;
  }

  //Finds the lowest f value neighbour of current to process next
  for (var i = 0; i < current.neighbours.length; i++) {
    //Individual neighbour
    var neighbour = current.neighbours[i];

    //If neighbour has already been processed or doesnt not exist, skip neighbour
    if (closedSet.includes(neighbour) || neighbour.wall) {
      continue;
    }

    //Each move is distance of 1 cell, so set a temporary gScore of current add 1
    var gScore = current.g + 1;
    var bestgScore = false;

    //If the move also involves a change of direction (turn) add 1 g score
    if (current.directionChange(neighbour)) {
      gScore = gScore + 1;;
    }

    //Checks if we have processed the node before
    if (!openSet.includes(neighbour)) {
      //Add to process queue and calculates heuristics
      bestgScore = true;
      neighbour.h = heuristic(neighbour, end);
      openSet.push(neighbour);
    } 
    //If the g cost is better than last process
    else if (gScore < neighbour.g) {
      //Node now has better cost
      bestgScore = true;
    }

    //If the neighbour is new, or better than before than update values
    if (bestgScore) {
      //Updates cost of moving to node
      neighbour.g = gScore;
      neighbour.f = neighbour.g + neighbour.h;

      //Stores parent node of neighbour to trace back path later
      neighbour.cameFrom = current;
    }
  }
}

//Loop until shortest path is found
function draw() {
  //If run button pressed
  if (canStart) {
    background(0);

    //If we reached the goal, stop looping
    if (goalReached) {
      if (path.length > 0) {
          //Draws final shortest path one by one
          pathReverse.push(path[path.length - 1])
          path.splice(path.length - 1, 1);
      } else {
        canStart = false;
      }
    }

    //While there are still paths to be calculated
    else if (openSet.length > 0) {
      aSearch();

    } else {
      canStart = false;
    }

    //Update and draw the nodes
    drawNodes();
  }
}