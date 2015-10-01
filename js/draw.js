var withCanvas = function(canvas,proc,clear){
  var ctx = canvas.getContext("2d");
  if(clear){
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  return proc(ctx);
};
var Man = function(conf){
  this.x = conf.x;
  this.y = conf.y;
  this.rect = conf.rect.clone();
  this.head_rad = 10;
  this.arm1_length = 15;
  this.arm2_length = 15;
  this.leg1_length = 15;
  this.leg2_length = 15;
  this.tolso_length = 30;

  this.angle_arm1_right = conf.angle_arm1_right;
  this.angle_arm1_left  = conf.angle_arm1_left ;
  this.angle_arm2_right = conf.angle_arm2_right;
  this.angle_arm2_left  = conf.angle_arm2_left ;
  this.angle_leg1_right = conf.angle_leg1_right;
  this.angle_leg1_left  = conf.angle_leg1_left ;
  this.angle_leg2_right = conf.angle_leg2_right;
  this.angle_leg2_left  = conf.angle_leg2_left ;
};

Man.prototype.draw = function(ctx,mirror){
  mirror = mirror || false;
  var angle_arm1_right = mirror ? this.angle_arm1_left  : this.angle_arm1_right;
  var angle_arm1_left  = mirror ? this.angle_arm1_right : this.angle_arm1_left ;
  var angle_arm2_right = mirror ? this.angle_arm2_left  : this.angle_arm2_right;
  var angle_arm2_left  = mirror ? this.angle_arm2_right : this.angle_arm2_left ;
  var angle_leg1_right = mirror ? this.angle_leg1_left  : this.angle_leg1_right;
  var angle_leg1_left  = mirror ? this.angle_leg1_right : this.angle_leg1_left ;
  var angle_leg2_right = mirror ? this.angle_leg2_left  : this.angle_leg2_right;
  var angle_leg2_left  = mirror ? this.angle_leg2_right : this.angle_leg2_left ;
  var x = this.x,y = this.y;
  ctx.save();
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "rgba(255,255,255,1)";
  y+=this.head_rad
  ctx.moveTo(x,y);//右腕
  var arm1_x = Math.cos(angle_arm1_right)*this.arm1_length+x;
  var arm1_y = Math.sin(angle_arm1_right)*this.arm1_length+y;
  ctx.lineTo(arm1_x,arm1_y);
  var arm2_x = Math.cos(angle_arm2_right)*this.arm2_length+arm1_x;
  var arm2_y = Math.sin(angle_arm2_right)*this.arm2_length+arm1_y;
  ctx.lineTo(arm2_x,arm2_y);
  ctx.stroke();

  y = this.y;
  ctx.beginPath();
  ctx.arc(x,y,this.head_rad,0,2*Math.PI,0,0);//あたま
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  y+=this.head_rad
  ctx.beginPath();
  ctx.moveTo(x,y);
  ctx.lineTo(x,y+this.tolso_length);//胴
  ctx.moveTo(x,y);//左腕
  arm1_x = -Math.cos(angle_arm1_left)*this.arm1_length+x;
  arm1_y = Math.sin(angle_arm1_left)*this.arm1_length+y;
  ctx.lineTo(arm1_x,arm1_y);
  arm2_x = -Math.cos(angle_arm2_left)*this.arm2_length+arm1_x;
  arm2_y = Math.sin(angle_arm2_left)*this.arm2_length+arm1_y;
  ctx.lineTo(arm2_x,arm2_y);
  y+=this.tolso_length;
  ctx.moveTo(x,y);//右脚
  var leg1_x = Math.cos(angle_leg1_right)*this.leg1_length+x;
  var leg1_y = Math.sin(angle_leg1_right)*this.leg1_length+y;
  ctx.lineTo(leg1_x,leg1_y);
  var leg2_x = Math.cos(angle_leg2_right)*this.leg2_length+leg1_x;
  var leg2_y = Math.sin(angle_leg2_right)*this.leg2_length+leg1_y;
  ctx.lineTo(leg2_x,leg2_y);
  ctx.moveTo(x,y);//左脚
  var leg1_x = -Math.cos(angle_leg1_left)*this.leg1_length+x;
  var leg1_y = Math.sin(angle_leg1_left)*this.leg1_length+y;
  ctx.lineTo(leg1_x,leg1_y);
  var leg2_x = -Math.cos(angle_leg2_left)*this.leg2_length+leg1_x;
  var leg2_y = Math.sin(angle_leg2_left)*this.leg2_length+leg1_y;
  ctx.lineTo(leg2_x,leg2_y);
  ctx.stroke();
  ctx.restore();
};
