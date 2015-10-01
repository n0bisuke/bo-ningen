var Player = function(config){
  this.body = new Rect(config.x,config.y,config.width,config.height);
  this.prev_body = this.body.clone();
  this.vx = config.vx || 0;
  this.vy = config.vy || 0;

  this.jump_initial_speed = config.jump_initial_speed || 10;
  this.run_speed = config.run_speed || 10;

  this.enable_to_jump = false;
  this.enable_to_run_right = false;
  this.enable_to_run_left = false;
  this.is_on_ground = false;

  this.start_jump = false;
  this.run_right = false;
  this.run_left = false;

  this.DIRECTION = {right: 0, left: 1};
  this.direction = this.vx >= 0 ? this.DIRECTION.right : this.DIRECTION.left;

  this.STATES = {
    stand: 0,
    run: 1,
    jump: 2,
    fly: 3,
    fall: 4
  };
  this.state_to_str = [];
  this.state_to_str[this.STATES.stand] = "stand";
  this.state_to_str[this.STATES.run] = "run";
  this.state_to_str[this.STATES.jump] = "jump";
  this.state_to_str[this.STATES.fly] = "fly";
  this.state_to_str[this.STATES.fall] = "fall";
  this.state = this.STATES.stand;

  this.animate_frame = 0;

  this.man = {run: [], stand: [], jump: [], fly: [], fall: []};
  this.man.run.push( new Man({
    x:25,
    y:12,
    rect: new Rect(-10,1,50,75),
    angle_arm1_right:Math.PI/4,
    angle_arm2_right:-Math.PI/6,
    angle_arm1_left: Math.PI/4,
    angle_arm2_left: Math.PI*2/3,
    angle_leg1_right:Math.PI/6,
    angle_leg2_right:Math.PI/2,
    angle_leg1_left: Math.PI/3,
    angle_leg2_left: 0
  }));
  this.man.run.push(this.man.run[this.man.run.length-1]);
  this.man.run.push( new Man({
    x:15,
    y:10,
    rect: new Rect(0,-3,30,79),
    angle_arm1_right:Math.PI/2,
    angle_arm2_right:0,
    angle_arm1_left: Math.PI/3,
    angle_arm2_left: Math.PI*5/6,
    angle_leg1_right:Math.PI/2,
    angle_leg2_right:Math.PI*2/3,
    angle_leg1_left: Math.PI*2/3,
    angle_leg2_left: 0
  }));
  this.man.run.push(this.man.run[this.man.run.length-1]);
  this.man.run.push( new Man({
    x:22,
    y:11,
    rect: new Rect(-7,0,44,76),
    angle_arm1_right:Math.PI*5/6,
    angle_arm2_right:Math.PI/3,
    angle_arm1_left: Math.PI*2/3,
    angle_arm2_left: -Math.PI*5/6,
    angle_leg1_right:Math.PI*2/3,
    angle_leg2_right:Math.PI*2/3,
    angle_leg1_left: Math.PI*5/6,
    angle_leg2_left: Math.PI/6
  }));
  this.man.run.push(this.man.run[this.man.run.length-1]);
  this.man.jump.push( new Man({
    x:15,
    y:11,
    rect: new Rect(0,3,30,75),
    angle_arm1_right:Math.PI*5/6,
    angle_arm2_right:Math.PI/3,
    angle_arm1_left: Math.PI/3,
    angle_arm2_left: Math.PI*2/3,
    angle_leg1_right:Math.PI/6,
    angle_leg2_right:Math.PI*2/3,
    angle_leg1_left: Math.PI*2/3,
    angle_leg2_left: Math.PI/6
  }));
  this.man.fly.push( new Man({
    x:22,
    y:17,
    rect: new Rect(-7,-7,44,85),
    angle_arm1_right:-Math.PI/6,
    angle_arm2_right:-Math.PI/3,
    angle_arm1_left: -Math.PI*2/3,
    angle_arm2_left: -Math.PI*2/3,
    angle_leg1_right:Math.PI/6,
    angle_leg2_right:Math.PI*5/6,
    angle_leg1_left: Math.PI/3,
    angle_leg2_left: Math.PI/3
  }));
  this.man.fall.push( new Man({
    x:15,
    y:18,
    rect: new Rect(0,-8,30,88),
    angle_arm1_right:-Math.PI/3,
    angle_arm2_right:-Math.PI*5/12,
    angle_arm1_left: -Math.PI/3,
    angle_arm2_left: -Math.PI*5/12,
    angle_leg1_right:Math.PI/6,
    angle_leg2_right:Math.PI*2/3,
    angle_leg1_left: Math.PI*7/12,
    angle_leg2_left: Math.PI*5/12
  }));
  this.man.stand.push( new Man({
    x:15,
    y:10,
    rect: new Rect(0,0,30,76),
    angle_arm1_right:Math.PI/3,
    angle_arm2_right:Math.PI/3,
    angle_arm1_left: Math.PI/3,
    angle_arm2_left: Math.PI/3,
    angle_leg1_right:Math.PI/3,
    angle_leg2_right:Math.PI/3,
    angle_leg1_left: Math.PI/3,
    angle_leg2_left: Math.PI/3
  }));
};
Player.prototype.set = function(player){
  this.body = player.body.clone();
  this.vx = player.vx;
  this.vy = player.vy;
  this.jump_initial_speed = player.jump_initial_speed;
  this.run_speed = player.run_speed;
  this.enable_to_jump = player.enable_to_jump;
  this.enable_to_run_right = player.enable_to_run_right;
  this.enable_to_run_left = player.enable_to_run_left;
  this.is_on_ground = player.is_on_ground;
  this.start_jump = player.start_jump;
  this.run_right = player.run_right;
  this.run_left = player.run_left;
  this.state = player.state;
  this.direction = player.direction;
  this.animate_frame = player.animate_frame;
  return this;
};

Player.prototype.update = function(gravity){
  var prev_state = this.state;
  this.state = this.STATES.stand;
  if(this.start_jump){//ジャンプの瞬間は重力を無視しちゃいます＞＜
    this.vy = - this.jump_initial_speed;
    this.start_jump = false;
    this.state = this.STATES.jump;
  }else{
    this.vy += gravity;
  }
  if(!this.is_on_ground){
    this.state = this.vy < 0 ? this.STATES.fly : this.STATES.fall;
  }
  if(this.run_right){
    this.vx = this.run_speed;
    this.run_right = false;
    this.state = this.STATES.run;
  }else if(this.run_left){
    this.vx = - this.run_speed;
    this.run_left = false;
    this.state = this.STATES.run;
  }else if(this.enable_to_run_right || this.enable_to_run_left){
    this.vx = 0;
  }
  this.prev_body.set(this.body);
  this.body.x += this.vx;
  this.body.y += this.vy;
  this.enable_to_jump = false;//この辺のフラグは当たり判定時に更新
  this.enable_to_run_right = false;
  this.enable_to_run_left = false;
  this.is_on_ground = false;
  if(this.state !== prev_state){
    this.animate_frame = 0;
  }else{
    this.animate_frame += 1;
  }
};

//updateの後に呼んでくだしあ＞＜
Player.prototype.hitTestWithAdjust = function(border){
  var hit = border.hitTest(this.body,this.prev_body);
  if(hit){
    var x = border.adjustX(this.body),
        y = border.adjustY(this.body),
        vx = border.adjustVx(this.vx),
        vy = border.adjustVy(this.vy);
    //console.log(border.direction,x,y,vx,vy);
    this.body.x = x;
    this.body.y = y;
    this.vx = vx;
    this.vy = vy;
    if(border.direction===DIRECTION.down){
      this.enable_to_run_left= true;
      this.enable_to_run_right = true;
      this.enable_to_jump = true;
      this.is_on_ground = true;
    }
    if(border.direction===DIRECTION.right){//二段ジャンプしたいので壁でも可にした
      this.enable_to_run_left= true;
      this.enable_to_jump = true;
    }
    if(border.direction===DIRECTION.left){//二段ジャンプしたいので壁でも可にした
      this.enable_to_run_right = true;
      this.enable_to_jump = true;
    }
  }
  return hit;
};

Player.prototype.jump = function(){
  if(this.enable_to_jump){
    this.start_jump = true;
  }
};
Player.prototype.runRight = function(){
  if(this.enable_to_run_right){
    this.run_right = true;
  }
};
Player.prototype.runLeft = function(){
  if(this.enable_to_run_left){
    this.run_left = true;
  }
};

Player.prototype.updateDirection =function(){
  if(this.vx > 0){
    this.direction = this.DIRECTION.right;
  }else if(this.vx < 0){
    this.direction = this.DIRECTION.left;
  }
  return this;
};
Player.prototype.draw = function(ctx){
  this.updateDirection();
  var mans = this.man[this.state_to_str[this.state]];
  return mans[this.animate_frame % mans.length].draw(ctx,this.direction===this.DIRECTION.left);
};
Player.prototype.getImageData = function(ctx){
  var r = this.getImageRect().clone();
  r.x = 0;
  r.y = 0;
  this.draw(ctx);
  return ctx.getImageData(r.x,r.y,r.width,r.height);
};
Player.prototype.getImageRect = function(){
  var mans = this.man[this.state_to_str[this.state]];
  var r = mans[this.animate_frame % mans.length].rect.clone();
  r.x += this.body.x;
  r.y += this.body.y;
  r.x = Math.floor(r.x);
  r.y = Math.floor(r.y);
  return r;
};
var screen_width = window.screen.width;
var screen_height= window.screen.height;
Player.prototype.inScreen = function(){
  if(this.body.getRight()<0 || screen_width<this.body.x ||
     this.body.getBottom()<0 || screen_height<this.body.y){
    return false;
  }
  return true;
};
Player.prototype.moveTo = function(x,y){
  this.body.x = x;
  this.body.y = y;
  this.vx = 0;
  this.vy = 0;
  return this;
};
