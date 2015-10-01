var ManualPlayerController = function(){
  this.key_state = {up:false,right:false,left: false};
};
ManualPlayerController.prototype.updateKeyState = function(key_code,press){
  switch(key_code){
    case 38: this.key_state.up = press; break;
    case 39: this.key_state.right = press; break;
    case 37: this.key_state.left = press; break;
  }
};
ManualPlayerController.prototype.control = function(player,borders,gravity){
  if(this.key_state.up){
    player.jump();
  }
  if(this.key_state.right){
    player.runRight();
  }
  if(this.key_state.left){
    player.runLeft();
  }
  return this;
};

var AutoPlayerController = function(){
  this.clone_player = new Player({//どうせパラメータは後で設定するのでこの辺は適当に
    x: 0,
    y: 0,
    width: 30,
    height: 76,
    vx: 0,
    vy: 0,
    jump_initial_speed: 20,
    run_speed: 10
  });
  this.rate_jump_while_running = 0.01;
  this.rate_jump_if_reach_higher = 0.19;
  this.rate_jump_if_kick_wall_chain = 0.21;
  this.rate_jump_if_will_fall = 0.2;
  this.rate_kick_wall = 0.7;
  this.rate_kick_but_not_jump = 0.25;
};
AutoPlayerController.config_keys = [
  "rate_jump_while_running",
  "rate_jump_if_reach_higher",
  "rate_jump_if_kick_wall_chain",
  "rate_jump_if_will_fall",
  "rate_kick_wall",
  "rate_kick_but_not_jump"
];
AutoPlayerController.prototype.control = function(player,borders,gravity){
  var self = this;
  this.clone_player.set(player);//同期
  var reset_and_check_hit = function(action,dir){
    self.clone_player.set(player);
    action(self.clone_player);
    self.clone_player.update(gravity);
    var hit = false;
    borders.forEach(function(v){
      if(v.direction===dir){
        hit = hit || self.clone_player.hitTestWithAdjust(v);
      }
    });
    return hit;
  };
  var dir;
  var act;
  var opp_act;
  //今の方向に進んだり反対いったりの処理を用意しておこう。
  if(this.clone_player.direction===this.clone_player.DIRECTION.right){
    dir = DIRECTION.right;
    act = function(p){p.runRight();};
    opp_act = function(p){p.runLeft();};
  }else{
    dir = DIRECTION.left;
    act = function(p){p.runLeft();};
    opp_act = function(p){p.runRight();};
  }
  if(this.clone_player.is_on_ground){
    //とりあえず直進
    var res = reset_and_check_hit(act,dir);
    if(!res){
      //突き当りじゃなければ直進
      act(player);
      var res = reset_and_check_hit(act,DIRECTION.down);//次の一歩で踏み外す？
      if(!res && Math.random()<this.rate_jump_if_will_fall){
        player.jump();
      }else{
        //ジャンプしたときにより高いところに着地するか？
        this.clone_player.set(player);//同期
        act(this.clone_player);
        this.clone_player.jump();
        do{
          this.clone_player.update(gravity);
          borders.forEach(function(v){
            self.clone_player.hitTestWithAdjust(v);
          });
          this.clone_player.updateDirection();
        }while(!this.clone_player.is_on_ground && this.clone_player.inScreen());
        if(this.clone_player.is_on_ground && this.clone_player.body.y < player.body.y && Math.random() < this.rate_jump_if_reach_higher){
          player.jump();
        }else{
          //今ジャンプしたら2回以上壁蹴りできるか？
          this.clone_player.set(player);//同期
          this.clone_player.jump();
          var jump_times = 0;
          do{
            this.clone_player.update(gravity);
            borders.forEach(function(v){
              self.clone_player.hitTestWithAdjust(v);
            });
            this.clone_player.updateDirection();
            if(this.clone_player.enable_to_jump && !this.clone_player.is_on_ground){//壁蹴りの位置
              jump_times++;
              if(this.clone_player.enable_to_run_right){
                  this.clone_player.runRight();
              }else{
                  this.clone_player.runLeft();
              }
              this.clone_player.jump();
            }
          }while(jump_times<2 && (!this.clone_player.is_on_ground && this.clone_player.inScreen()));
          if(jump_times>1 && Math.random() < this.rate_jump_if_kick_wall_chain){
            player.jump();
          }else{
            //たまに気まぐれでジャンプ
            // if(Math.random()<this.rate_jump_while_running){
            //   player.jump();
            // }
          }
        }
      }
    }else{
      //とりあえず反対向かせる
      opp_act(player);
    }
  }else if(this.clone_player.enable_to_jump){
    if(Math.random()<this.rate_kick_wall){//壁蹴りジャンプ
      opp_act(player);
      if(Math.random()>this.rate_kick_but_not_jump){
        player.jump();
      }
    }
  }
  return this;
};
