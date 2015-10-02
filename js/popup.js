var PopupManager = function(){
  this.pool = [];
  this.id = 0;
  if(++PopupManager.count>1){
    throw new Error("PopupManager must be only one instance");
  }
};
PopupManager.count = 0;
PopupManager.prototype.createPopup = function(x,y,width,height){
  var p = new Popup(++this.id,x,y,width,height);
  this.pool.push(p);
  console.log(this.pool);
  return p;
};
PopupManager.prototype.notify = function(type,ev,id){
  //console.log(type,ev,id);
  var target = null;
  id = id*1;
  for(var i=0;i<this.pool.length;i++){
    if(this.pool[i].id===id){
      var res = this.pool[i].notify(type,ev);
      if(!res){
        this.pool.splice(i,1);
      }
      break;
    }
  };
  this.onNotify(this);
};
PopupManager.prototype.closeAll = function(){
  this.pool.forEach(function(v){
    v.close();
  });
  this.pool = [];
};
PopupManager.prototype.onkeydown = function(ev){};
PopupManager.prototype.onkeyup = function(ev){};
PopupManager.prototype.draw = function(ctx,rect){
  this.pool.forEach(function(v){
    if(rect.hitTest(v.rect)){
      v.draw(ctx,rect);
    }else{
      v.clear();
    }
  });
};
PopupManager.prototype.count = function(){
  return this.pool.length;
};
PopupManager.prototype.getRandomPointInPopup = function(){
  if(this.count()<1){
    return null;
  }
  var r =  this.pool[Math.floor(Math.random()*this.pool.length)].rect;
  return {
    x: r.x+Math.random()*r.width,
    y: r.y+Math.random()*r.height
  };
};
PopupManager.prototype.showHelp = function(){
  this.pool.forEach(function(v){
    v.showHelp();
  });
};
PopupManager.prototype.hideHelp = function(){
  this.pool.forEach(function(v){
    v.hideHelp();
  });
};

/**
ポップアップ
*/
var Popup = function(id,x,y,width,height){
  this.window = null;
  this.rect = new Rect(x,y,width,height);
  this.id = id;
  this.is_dirty = false;
  this.dirty_rect = null;
};

Popup.prototype.open = function(){
  var s = "top="+this.rect.y+"left="+this.rect.y+",width="+this.rect.width+",height="+this.rect.height;
  s += ",menubar=no,toolbar=no,location=no,status=no,scrollbars=no";
  //キャッシュ対策
  this.window = window.open("child.html?id="+this.id+"&date="+(new Date()).getTime(),"child"+this.id,s);
};

Popup.prototype.close = function(){
  this.window.close();
};
Popup.prototype.setRectFromEventParameter = function(ev,ignore_size){
  ignore_size = ignore_size || false;
  if(!ignore_size){
    this.rect.width  = ev.width + 2;
    this.rect.height = ev.height + 2;
  }
  this.rect.x = ev.client_x - 1;
  this.rect.y = ev.client_y - 1;
};
Popup.prototype.notify = function(type,ev){
  //console.log(this,type,ev,ev.client_x+ev.width,ev.client_y+ev.height);
  switch(type){
    case "init":
    case "resize":
      this.setRectFromEventParameter(ev);
      break;
    case "move":
      this.setRectFromEventParameter(ev,true);
      break;
    case "unload":
      return false;
      break;
    default:
      throw new Error("unreachable");
  }
  return true;
};
Popup.prototype.draw = function(image_data,rect){
  //window.closedが真のときはcloseをnotifyしとく（Opera対策）
  if(this.window.opera && this.window.closed){
    popup_manager.notify("unload",{},this.id);
    return;
  }
  var canvas = this.window.document.getElementById("cv");
  if(canvas){
    this.clear();
    var x = rect.x - this.rect.x - 1;
    var y = rect.y - this.rect.y - 1;
    withCanvas(canvas,function(ctx){
      ctx.putImageData(image_data,x,y);
    });
    this.is_dirty = true;
    this.dirty_rect = new Rect(x,y,rect.width,rect.height);
  }
};
Popup.prototype.clear = function(ctx){
  if(this.is_dirty){
    var canvas = this.window.document.getElementById("cv");
    if(canvas){
      var self = this;
      withCanvas(canvas,function(ctx){
        ctx.clearRect(self.dirty_rect.x,self.dirty_rect.y,self.dirty_rect.width,self.dirty_rect.height);
      });
      this.is_dirty = false;
      this.dirty_rect = null;
    }
  }
};
Popup.prototype.showHelp = function(){
  var el = this.window.document.getElementById("show-help");
  if(el){
    el.style.display = "block";
  }
};
Popup.prototype.hideHelp = function(){
  var el = this.window.document.getElementById("show-help");
  if(el){
    el.style.display = "none";
  }
};

var popup_manager = new PopupManager();
