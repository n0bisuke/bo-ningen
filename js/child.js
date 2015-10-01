onload = function(){
  var parseQuery = function(query){
    var res = {};
    if(query.charAt(0)!=="?"){
      throw new Error("1st char is not ?");
    }
    var s = query.substr(1).split("&");
    s.forEach(function(v){
      var r = v.split("=");
      if(r.length===2){
        res[r[0]] = r[1];
      }else{
        res[r[0]] = true;
      }
    });
    return res;
  };
  var getWindowInfo = (typeof window.innerWidth!=="undefined") ? function(){
    var width = window.innerWidth,
        height = window.innerHeight;
    var x = window.screenX,
        y = window.screenY;
    return {
      client_x:x,
      client_y:y,
      width: width,
      height: height
    };
  } : function(){
    //IE 対策
    var width = window.document.documentElement.clientWidth,
        height = window.document.documentElement.clientHeight;//互換モードだとまずいけど知るもんか
    var x = window.screenX,
        y = window.screenY;
    return {
      client_x:x,
      client_y:y,
      width: width,
      height: height
    };
  };
  var setCanvasSize = function(wi){
    var cv = document.getElementById("cv");
    cv.width = wi.width;
    cv.height = wi.height;
  };

  var queries = parseQuery(location.search);
  //console.log(queries);
  var id = queries.id;
  var prev_window_info = getWindowInfo();
  var prev_resize_at = (new Date()).getTime();

  //TODO: どうせインターバルで監視してるんだからresize時にノティファイなげる必要ないんじゃないかと思うのです。
  onresize = function(ev){
    //軸のマイナス方向にリサイズしたときに座標が狂う
    //・・・けど当たり判定と合わせればまぁごまかせるかな・・・(^^;
    var wi = getWindowInfo();
    setCanvasSize(wi);

    //初期化時にサイズと位置が全て0になっているケースがある。この場合は補正をしない方がよさげ。
    if(prev_window_info.height!==0 && prev_window_info.width!==0){
      //ブレによる誤差の修正
      if(prev_window_info.client_x!==wi.client_x){
        wi.width = prev_window_info.client_x+prev_window_info.width  - wi.client_x;
      }
      if(prev_window_info.client_y!==wi.client_y){
        wi.height = prev_window_info.client_y+prev_window_info.height  - wi.client_y;
      }
    }
    //console.log("resize",wi,prev_window_info);
    if(wi.width!==prev_window_info.width ||
       wi.height!==prev_window_info.height){
      window.opener.popup_manager.notify("resize",wi,id);
    }
    prev_window_info = wi;
    prev_resize_at = (new Date()).getTime();
  };
  onunload = function(ev){
    var wi = getWindowInfo();
    window.opener.popup_manager.notify("unload",wi,id);
    prev_window_info = wi;
  };
  setInterval(function(){
    var wi = getWindowInfo();
    var dx = wi.client_x - prev_window_info.client_x;
    var dy = wi.client_y - prev_window_info.client_y;
    if(dx!==0 || dy!==0){
      if(wi.width===prev_window_info.width &&
         wi.height===prev_window_info.height){
        after_resize = (new Date()).getTime() - prev_resize_at;
        if(after_resize>100){
          //console.log("move",after_resize,wi,prev_window_info);
          window.opener.popup_manager.notify("move",wi,id);
        }
      }
      prev_window_info = wi;
    }
  },100);
  //キーイベント
  onkeydown = function(ev){
    window.opener.popup_manager.onkeydown(ev);
  };
  onkeyup = function(ev){
    window.opener.popup_manager.onkeyup(ev);
  };

  (function(){
    var wi = getWindowInfo();
    prev_window_info = wi;
    setCanvasSize(wi);
    window.opener.popup_manager.notify("init",wi,id);
  })();
};
