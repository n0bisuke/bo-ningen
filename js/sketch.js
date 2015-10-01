var borders = [];
onload = function(){
  popup_manager.onNotify = function(manager){
    var rects = [];
    for(var i=0;i<manager.pool.length;i++){
      rects.push(manager.pool[i].rect);
    }
    borders = buildBorders(rects);
  };
  var openPopup = function(){
    var p = popup_manager.createPopup(100*(Math.random() - 0.2),100*(Math.random() - 0.2),200+Math.random()*400,200+Math.random()*200);
    p.open();
  };
  document.getElementById("btn").addEventListener("click",function(){
    openPopup();
  },false);

  var player = null;
  var player_controller = null
  var manal_player_controller = new ManualPlayerController();
  var auto_player_controller = new AutoPlayerController();

  var is_help_shown = false;

  //とりあえず初期状態では手動操作に
  //player_controller = auto_player_controller;
  player_controller = manal_player_controller;

  onunload = function(){
    popup_manager.closeAll();
  };

  popup_manager.onkeydown = function(e){
    manal_player_controller.updateKeyState(e.keyCode,true);
  };
  popup_manager.onkeyup = function(e){
    manal_player_controller.updateKeyState(e.keyCode,false);
    //console.log(e.keyCode);
    switch(e.keyCode){
      case 65:// 'A'
        player_controller = auto_player_controller;
        break;
      case 72:// 'H'
        // hキーでヘルプ表示
        if(is_help_shown){
          popup_manager.hideHelp();
        }else{
          popup_manager.showHelp();
        }
        is_help_shown = ! is_help_shown;
        break;
      case 77:// 'M'
        player_controller = manal_player_controller;
        break;
      case 78:// 'N'
        openPopup();
        break;
        break;
    }
  };

  var  gravity = 1;
  var canvas = document.getElementById("cv")
  var tid = setInterval(function(){
    if(player!==null){
      player_controller.control(player,borders,gravity);
      player.update(gravity);
      borders.forEach(function(v){
        player.hitTestWithAdjust(v);
      });
      withCanvas(canvas,function(ctx){
        var img = player.getImageData(ctx);
        popup_manager.draw(img,player.getImageRect());
      },true);

      if(!player.inScreen()){
        if(popup_manager.count()>0){ //playerを既存のウィンドウに表示
          var move_to = popup_manager.getRandomPointInPopup();
          player.moveTo(move_to.x,move_to.y);
        }else{
          player = null;
        }
      }
    }else if(popup_manager.count()>0){
      var move_to = popup_manager.getRandomPointInPopup();
      player = new Player({
        x: move_to.x,
        y: move_to.y,
        width: 30,
        height: 76,
        vx: 0,
        vy: 0,
        jump_initial_speed: 20,
        run_speed: 10
      });
    }
  },50);
};
