//Cell Nodes
class Node {
    //Constructor
    constructor(x, y) {
        //Fields
        this.x = x;
        this.y = y;
        this.f = null;
        this.g = 0;
        this.h = null;
        this.neighbours = [];
        this.cameFrom = null;
        this.wall = false;
    }

    //Generates the neighbours of node
    //If neighbour is not on the grid don't add to neighbours
    generateNeighbours(grid) {
        //Right neighbour
        if (this.x < cols - 1) {
            this.neighbours.push(grid[this.x + 1][this.y]);
        }
        //Left neighbour
        if (this.x > 0) {
            this.neighbours.push(grid[this.x - 1][this.y]);
        }
        //Bottom neighbour
        if (this.y < rows - 1) {
            this.neighbours.push(grid[this.x][this.y + 1]);
        }
        //Top neighbour
        if (this.y > 0) {
            this.neighbours.push(grid[this.x][this.y - 1]);
        }
    }

    //Checks if there was a direction change
    directionChange(neighbour) {
        //It can only change direction if it had a parent node before
        if (this.cameFrom === null) {
            return false; 
        } else {
            //If it's x or y value is not consistent, there is a change in direction
            if (!(this.cameFrom.x === neighbour.x) && !(this.cameFrom.y === neighbour.y)) {
                return true;
            } else {
                return false;
            }
        }
    }

    //Draws the nodes
    update(colour) {
        //Nodes are drawn as cells, rectangles
        fill(colour);

        //If node is a wall fill black
        if (this.wall) {
            fill(0, 30, 50);
        }
        stroke(0);
        strokeWeight(0.1);
        rect(this.x * gridWidth, this.y * gridHeight, gridWidth, gridHeight);
    }
}