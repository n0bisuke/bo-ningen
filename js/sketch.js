var borders = [];
onload = function(){
  var player = null;
  var player_controller = null
  var auto_player_controller = new AutoPlayerController();
  var is_help_shown = false;

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
    console.log(11);
  },false);

  //とりあえず初期状態では手動操作に
  player_controller = auto_player_controller;

  onunload = function(){
    popup_manager.closeAll();
  };

  var gravity = 1;
  var canvas = document.getElementById("cv")
  //Milkcocoa
  ds.on('send',function(data){
    console.log('じゃんぷ');
    player.jump();
    // openPopup();
    var p = popup_manager.createPopup(100*(Math.random() - 0.2),100*(Math.random() - 0.2),200+Math.random()*400,200+Math.random()*200);
    p.open();
  });

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
