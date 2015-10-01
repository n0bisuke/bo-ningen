var DIRECTION = {
  up: 0,
  right: 1,
  down: 2,
  left: 3
};

var Point = function(x,y){
  this.x = x;
  this.y = y;
};
Point.prototype.set = function(point){
  this.x = point.x;
  this.y = point.y;
  return this;
};

var Rect = function(top_left_x,top_left_y,width,height){
  this.x = top_left_x;
  this.y = top_left_y;
  this.width = width;
  this.height = height;
};
Rect.prototype.getRight = function(){
  return this.x + this.width - 1;
};
Rect.prototype.getBottom = function(){
  return this.y + this.height - 1;
};
Rect.prototype.clone = function(){
  return new Rect(this.x,this.y,this.width,this.height);
};
Rect.prototype.set = function(rect){
  this.x = rect.x;
  this.y = rect.y;
  this.width = rect.width;
  this.height = rect.height;
  return this;
};
Rect.prototype.hitTest = function(current_rect_body){
  if(this.x<=current_rect_body.getRight() &&
     current_rect_body.x<=this.getRight() &&
     this.y<=current_rect_body.getBottom() &&
     current_rect_body.y<=this.getBottom()){
    return true;
  }
  return false;
};
////debug
Rect.prototype.draw = function(ctx,color){
  color = color || "#000";
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.rect(this.x,this.y,this.width,this.height);
  ctx.fill();
  ctx.stroke();
  //ctx.fillRect(this.x,this.y,this.width,this.height);
  ctx.restore();
};

var Border = function(x1,y1,x2,y2,direction){
  this.p1 = new Point(x1,y1);
  this.p2 = new Point(x2,y2);
  this.setDirection(direction);
  if(this.p1.x>this.p2.x || this.p1.y>this.p2.y){// p1の方が右上ということでここは1つ
    var t = this.p1;
    this.p1 = this.p2;
    this.p2 = this.p1;
  }
};
Border.prototype.clone = function(){
  return new Border(this.p1.x,this.p1.y,this.p2.x,this.p2.y,this.direction);
};

Border.prototype.hitTest = function(current_rect_body,prev_rect_body){ throw new Error("hitTest:unreachable!!");};

var cross = function(v1x,v1y,v2x,v2y){
  return v1x*v2y - v2x*v1y;
};
var crossBetween = function(dx,dy,lower_dx,lower_dy,upper_dx,upper_dy){
  if(cross(dx,dy,upper_dx,upper_dy)>0 &&
     cross(dx,dy,lower_dx,lower_dy)<0){
    return true;
  }
  return false;
};
Border.prototype.hitSimple = function(rect){
  if(this.direction===DIRECTION.up ||
     this.direction===DIRECTION.down){
    var y = this.p1.y;
    if(rect.y<=y && y<=rect.getBottom() &&
       this.p1.x<=rect.getRight() &&
       rect.x<=this.p2.x){
      return true;
    }
  }else{
    var x = this.p1.x;
    if(rect.x<=x && x<=rect.getRight() &&
       this.p1.y<=rect.getBottom() &&
       rect.y<=this.p2.y){
      return true;
    }
  }
  return false;
};

Border.prototype.hitTestUp = function(current_rect_body,prev_rect_body){
  var cy = current_rect_body.y,
      py = prev_rect_body.y,
      y = this.p1.y;
  if(py>y && cy<=y){ //線を下から上へまたぐとき
    var dx = prev_rect_body.x - current_rect_body.x;
    var dy = py - cy ,dcy = y - cy;
    return crossBetween(
      dx,dy,
      this.p2.x-current_rect_body.x,dcy,
      this.p1.x-current_rect_body.getRight(),dcy);
  }else if(this.hitSimple(current_rect_body) && this.hitSimple(prev_rect_body)){
    return true;
  }
  return false;
};
Border.prototype.hitTestDown = function(current_rect_body,prev_rect_body){
  var cy = current_rect_body.getBottom(),
      py = prev_rect_body.getBottom(),
      y = this.p1.y;
  if(py<y && cy>=y){ //線を上から下へまたぐとき
    var dx = prev_rect_body.x - current_rect_body.x;
    var dy = py - cy ,dcy = y - cy;
    return crossBetween(
      dx,dy,
      this.p1.x-current_rect_body.getRight(),dcy,
      this.p2.x-current_rect_body.x,dcy);
  }else if(this.hitSimple(current_rect_body) && this.hitSimple(prev_rect_body)){
    return true;
  }
  return false;
};
Border.prototype.hitTestRight = function(current_rect_body,prev_rect_body){
  var cx = current_rect_body.getRight(),
      px = prev_rect_body.getRight(),
      x = this.p1.x;
  if(px<x && cx>=x){ //線を左から右へまたぐとき
    var dx = px - cx, dcx = x - cx;
    var dy = prev_rect_body.y - current_rect_body.y;
    return crossBetween(
      dx,dy,
      dcx,this.p2.y-current_rect_body.y,
      dcx,this.p1.y-current_rect_body.getBottom());
  }else if(this.hitSimple(current_rect_body) && this.hitSimple(prev_rect_body)){
    return true;
  }
  return false;
};
Border.prototype.hitTestLeft = function(current_rect_body,prev_rect_body){
  var cx = current_rect_body.x,
      px = prev_rect_body.x,
      x = this.p1.x;
  if(px>x && cx<=x){ //線を右から左へまたぐとき
    var dx = px - cx, dcx = x - cx;
    var dy = prev_rect_body.y - current_rect_body.y;
    return crossBetween(
      dx,dy,
      dcx,this.p1.y-current_rect_body.getBottom(),
      dcx,this.p2.y-current_rect_body.y);
  }else if(this.hitSimple(current_rect_body) && this.hitSimple(prev_rect_body)){
    return true;
  }
  return false;
};

//hit時のX方向補正
Border.prototype.adjustX = function(current_rect_body){
  return current_rect_body.x;
};
//hit時のY方向補正
Border.prototype.adjustY = function(current_rect_body){
  return current_rect_body.y;
};
Border.prototype.adjustXRight = function(current_rect_body){
  return this.p1.x - current_rect_body.width;
};
Border.prototype.adjustXLeft = function(current_rect_body){
  return this.p1.x + 1;
};
Border.prototype.adjustYUp = function(current_rect_body){
  return this.p1.y + 1;
};
Border.prototype.adjustYDown = function(current_rect_body){
  return this.p1.y - current_rect_body.height;
};

Border.prototype.adjustVx = function(vx){
  return (this.direction===DIRECTION.right || this.direction===DIRECTION.left) ? 0 : vx;
};
Border.prototype.adjustVy = function(vy){
  return (this.direction===DIRECTION.up || this.direction===DIRECTION.down) ? 0 : vy;
};

Border.prototype.setDirection = function(direction){
  this.direction = direction;
  switch(direction){
    case DIRECTION.up:
      this.hitTest = this.hitTestUp;
      this.adjustY = this.adjustYUp;
      break;
    case DIRECTION.down:
      this.hitTest = this.hitTestDown;
      this.adjustY = this.adjustYDown;
      break;
    case DIRECTION.right:
      this.hitTest = this.hitTestRight;
      this.adjustX = this.adjustXRight;
      break;
    case DIRECTION.left:
      this.hitTest = this.hitTestLeft;
      this.adjustX = this.adjustXLeft;
      break;
    default:
      throw new Error("unreachable");
  };
  return this;
};

////debug
Border.prototype.draw = function(ctx,color){
  color = color || "rgba(0,0,0,1)";
  ctx.save();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(this.p1.x,this.p1.y);
  ctx.lineTo(this.p2.x,this.p2.y);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
};
