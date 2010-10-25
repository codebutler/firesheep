// Make CORE.out() write to showoff 'result' global variable http://github.com/scottbale/showoff
(function(CORE){

    CORE.require = function(toImport){
        //nothing to do
    };
    CORE.out = function(output){
        result = result || '';
        result = result + '<p>' + output + '</p>';
    };

    return CORE;
}(CORE));