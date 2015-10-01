if(typeof Array.prototype.forEach !== "function"){
  Array.prototype.forEach = function(proc){
    var i,len = this.length;
    for(i=0;i<len;i++){
      proc(this[i],i);
    }
    return this;
  };
}
if(typeof Array.prototype.indexOf !== "function" ){
  Array.prototype.indexOf = function(val){
    var i,len = this.length;
    for(i=0;i<len;i++){
      if(this[i]===val){
        return i;
      }
    }
    return -1;
  };
}
