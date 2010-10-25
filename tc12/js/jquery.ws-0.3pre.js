
(function($){

$.ws = {

//==========================================================
// jQuery plugin jquery.ws.js
// for Web Sockets
// need Browser Chrome4.0.249.0+
// Demo http://bloga.jp/ws/jq/
// serverside sample @see http://blog.livedoor.jp/kotesaki/archives/1355651.html

	name     : "ws",
	version  : "0.3-noenc-pre",
	demo     : "http://bloga.jp/ws/jq/conn/b1.htm",
	author   : "Toshiro Takahashi",
	lisence  : "same as jQuery @see http://docs.jquery.com/Licensing",
	update   : 'http://jsgt.org/lib/jquery/plugin/ws/update.txt',
	ver      : '<span class="wsVersion" style="color:#aaa"></span><script>'
	         + 'jQuery(function($){ $(".wsVersion").html("version:ws-"+$.ws.version) })'
	         + '</script>',

	//Default settings
	wsSettings: {
		url        : "ws://"+location.host,
		data       : null,//The data which transmit a message
		onopen     : function(e){},//callback on opened.  
		onmessage  : function(msg,wsObject){},//callback on received 
		onclose    : function(){},//callback on cloased 
		hbStr      : "Heartbeat",//if null then no Heartbeat
		hbinterval : 60000,//dafault 60sec, min=5000 
		onheartbeat: function(){}//callback on heartbeatsended 
	},
	wsSetup: function( settings ) {
		jQuery.extend( jQuery.ws.wsSettings, settings );
	}
	
	//Note: if you want to stop no-support alert dialog,
	//$.ws.wsSetup({nonosupportmsg:true});
};

  /*
  //==========================================================
  // Method 
  //  Basic Method of this pulgin for Web Sockets
  
    $.conn( settings )
  
  */  
  $.extend($.ws ,{

    conn : function( s ){

      s = $.extend(true, s, $.extend(true, {}, $.ws.wsSettings, s));

      if ("WebSocket" in window) { 
  
        var url=s.url ,
            //WS Object
            wsoj   = new WebSocket( url ) ,
            data   = s.data ,
            //Heartbeat
            _MIN_HBINTERVAL=5000,
            _INI_HBINTERVAL=60000,
            hbtimer=null,
            hbStr  = (s.hbStr===null)?null:(typeof s.hbStr==='string')?s.hbStr:'Heartbeat',
            hbinterval = (typeof s.hbinterval==='number')?
                (s.hbinterval>=_MIN_HBINTERVAL)?s.hbinterval:_INI_HBINTERVAL 
                :_INI_HBINTERVAL;

        //WS Events bind
        $(wsoj)
            .bind("open",function(e){ 
              if(s.onopen){ s.onopen(e); } ;
              if(s.hbStr!==null){
                hbtimer = setInterval(function(){
                  $(wsoj).wssend(hbStr);
                  if(wsoj.onheartbeat){wsoj.onheartbeat(wsoj)}
                }, hbinterval);
              }
            })
            .bind("message",function(e){
              if(s.onmessage){
                s.onmessage(
                  e.originalEvent.data
                   .replace(/<script(.|\s)*?\/script>/g, ""),
                  wsoj
                );
              }
            })
            .bind("close",function(){
              if(s.onclose){
                s.onclose();
              }
              if(hbtimer) {
                clearInterval(hbtimer);
                hbtimer = null;
              }
              wsoj=null;
            });
  
        //Add Event to only Instance for on after Hertbeat
        if(s.hbStr!==null){
          wsoj.onheartbeat=function(woj){
            s.onheartbeat(woj);
          }
        }
  
        //WS send
        $(wsoj).wssend(data);
        
        //WS auto cloase
        $(window)
            .bind("unload",function(e){
               wsoj.close();wsoj=null;
            });
  
        return wsoj;
  
      } else { 
        //no support, message once.
        if(!$.ws.nosupport){
          if(!s.nonosupportmsg)
            alert("no support, please use Chrome4 (v 4.0.238.0 +) or \n Safari nightly");
          $.ws.nosupport=true;
        } 
      }
    } 
      
  });
  
  /*
  //==========================================================
  // Method 
  //  Sub Methods for Web Sockets
  
    $(Selectors).wsload( url, data, fn )
    $(Selectors).wssend(data)
    $(Selectors).wsclose()
  
  */
  $.fn.extend({
  
    //like $(Selectors).load() Some codes from jQuery1.3.2
    wsload : function( url, data, fn ){
    
      var off = url.indexOf(" ");
      if ( off >= 0 ) {
        var selector = url.slice(off, url.length);
        url = url.slice(0, off);
      }
    
      if ( data )
        if ( $.isFunction( data ) ) {
          fn = data;
          data = null;
        } else if( typeof data === "object" ) {
          data = $.param( data );
        }
      var self = this;
      
      $.ws.conn({
        url       : url,
        data      : data,
        onmessage :  function(msg, wsoj){
          if ( wsoj.readyState == wsoj.OPEN )
            self.html( selector ?
              $("<div/>")
                .append(msg)
                .find(selector) :
              msg );
  
          if( fn )
            self.each( fn, [msg, wsoj.readyState, wsoj] );
        }
      });
      
      return this;
    },
    
    //Send to WS Server $(webSocketOj).wssend(data)
    wssend : function(data){
      var oj=this[0];
      if(typeof oj!=="object" && oj.toString()!=="[object WebSocket]"){return this;}
      if(data){ 
         oj.send(data);
      }
      return this;
    },
    
    //Close Web Sockets 
    wsclose : function(){
      var oj=this[0]; 
      if(typeof oj!=="object" && oj.toString()!=="[object WebSocket]"){return this;}
      oj.close();
      oj=null; 
      return this;
    }
  });
  
})(jQuery)