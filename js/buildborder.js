//Rectの集まりからBorderのあつまりを生成する

var collectX = function(rects){
  var xs = [];
  rects.forEach(function(v){
    xs.push({x:v.x,rect:v});
    xs.push({x:v.getRight(),rect:v});
  });
  xs.sort(function(x,y){
    return x.x - y.x;
  });
  return xs;
};
var collectY = function(rects){
  var ys = [];
  rects.forEach(function(v){
    ys.push({y:v.y,rect:v});
    ys.push({y:v.getBottom(),rect:v});
  });
  ys.sort(function(x,y){
    return x.y - y.y;
  });
  return ys;
};

var buildHorizontalBorders = function(rects){
  var xs = collectX(rects);
  var result_borders = [];
  var active_borders = [];
  var available_borders = [];
  var i=0;
  while(i<xs.length){
    var x = xs[i].x;
    var new_available_borders = [];
    available_borders.forEach(function(v){//今のXが終端のやつをさよなら
      if(v.p2.x!==x){
        new_available_borders.push(v);
      }
    });
    available_borders = new_available_borders;

    var new_active_borders = [];
    active_borders.forEach(function(v){//今のXが終端のやつを結果に積む
      if(v.p2.x!==x){
        new_active_borders.push(v);
      }else{
        result_borders.push(v.clone());
      }
    });
    active_borders = new_active_borders;

    while(i<xs.length && xs[i].x==x){//同じXから始まるボーダーが複数ある場合はまとめて処理
      var rect = xs[i].rect;
      if(rect.x === x){ //矩形の左端
        available_borders.push(new Border(rect.x,rect.y,rect.getRight(),rect.y,DIRECTION.up));
        available_borders.push(new Border(rect.x,rect.getBottom(),rect.getRight(),rect.getBottom(),DIRECTION.down));
      }
      i++;
    }

    available_borders.sort(function(v1,v2){
      return v1.p1.y - v2.p1.y;
    });
    var lower = 0;
    new_active_borders = [];
    available_borders.forEach(function(v){
      if(v.direction===DIRECTION.down){
        lower--;
      }
      if(lower===0){
        if(active_borders.indexOf(v)<0 && v.p1.x!==x){
          v = v.clone();
          v.p1.x = x;
        }
        new_active_borders.push(v);
      }
      if(v.direction===DIRECTION.up){
        lower++;
      }
    });
    //この時点でnew_active_bordersってソートされてますよね
    active_borders.forEach(function(v){
      var y = v.p1.y;
      for(var i=0;i<new_active_borders.length;i++){
        if(v===new_active_borders[i]){
          break;
        }
        if(y<=new_active_borders[i].p1.y){
          var b = v.clone();
          b.p2.x = x;
          result_borders.push(b);
          break;
        }
      }
    });
    active_borders = new_active_borders;
  }
  return result_borders;
};
var buildVerticalBorder = function(rects){
  var ys = collectY(rects);
  var result_borders = [];
  var active_borders = [];
  var available_borders = [];
  var i=0;
  while(i<ys.length){
    var y = ys[i].y;
    var new_available_borders = [];
    available_borders.forEach(function(v){//今のYが終端のやつをさよなら
      if(v.p2.y!==y){
        new_available_borders.push(v);
      }
    });
    available_borders = new_available_borders;

    var new_active_borders = [];
    active_borders.forEach(function(v){//今のYが終端のやつを結果に積む
      if(v.p2.y!==y){
        new_active_borders.push(v);
      }else{
        result_borders.push(v.clone());
      }
    });
    active_borders = new_active_borders;

    while(i<ys.length && ys[i].y==y){//同じYから始まるボーダーが複数ある場合はまとめて処理
      var rect = ys[i].rect;
      if(rect.y === y){ //矩形の上端
        available_borders.push(new Border(rect.x,rect.y,rect.x,rect.getBottom(),DIRECTION.left));
        available_borders.push(new Border(rect.getRight(),rect.y,rect.getRight(),rect.getBottom(),DIRECTION.right));
      }
      i++;
    }

    available_borders.sort(function(v1,v2){
      return v1.p1.x - v2.p1.x;
    });
    var lower = 0;
    new_active_borders = [];
    available_borders.forEach(function(v){
      if(v.direction===DIRECTION.right){
        lower--;
      }
      if(lower===0){
        if(active_borders.indexOf(v)<0 && v.p1.y!==y){
          v = v.clone();
          v.p1.y = y;
        }
        new_active_borders.push(v);
      }
      if(v.direction===DIRECTION.left){
        lower++;
      }
    });
    //この時点でnew_active_bordersってソートされてますよね
    active_borders.forEach(function(v){
      var x = v.p1.x;
      for(var i=0;i<new_active_borders.length;i++){
        if(v===new_active_borders[i]){
          break;
        }
        if(x<=new_active_borders[i].p1.x){
          var b = v.clone();
          b.p2.y = y;
          result_borders.push(b);
          break;
        }
      }
    });
    active_borders = new_active_borders;
  }
  return result_borders;
};

var buildBorders = function(rects){
  var horizontal_borders = buildHorizontalBorders(rects);
  var vertical_borders = buildVerticalBorder(rects);
  return vertical_borders.concat(horizontal_borders);
};
