function suggestInput(opts){

	var field = opts.field,
		terms = opts.data,
		callback = opts.callback,
		ajaxUrl = opts.url,
		index = opts.index,
		thisArg = (opts.callbackThisArg) ? opts.thisArg : null,
		timeout = null,
		delay = 100;

	if((!terms || !terms.length) && !ajaxUrl) return;

	var suggestions = document.createElement("div"),
		_private = {

		searchQuery: function(query){

			var results = [];

			if(!query || query.length < index) {
				suggestions.style.display = 'none';
				return;
			}

			if (terms && terms.length){

				for (var i = 0; i < terms.length; i++){
					var term;
					var index = terms[i].toLowerCase().indexOf(query.toLowerCase());

					if(index != -1 && terms[i].toLowerCase() != query.toLowerCase()){

						term = terms[i].slice(0,index) + '<span class="match">' + terms[i].slice(index,index + query.length) + '</span>' + terms[i].slice(index + query.length);
						results.push(term)
					}
				}

				_private.getResult(results);

			}else if(ajaxUrl){

				var req = new getXmlHttp();

				if (!timeout) {
					timeout = setTimeout(function () {
						proxyHttp();

					}, delay);
				}
				function proxyHttp(){

					timeout = null;
					req.open("POST", ajaxUrl, true);

					if(req instanceof XMLHttpRequest){

						req.onload = loadReqBody;
					}else {
						req.onreadystatechange = function(){
							try{
								loadReqBody();
							}catch (e){
								//console.log(e);
							}
						}
					}
					req.send('query='+query);
				}

				function loadReqBody(){

					var array = JSON.parse(req.responseText);

					for (var i = 0; i < array.length; i++){
						var term;
						var index = array[i].toLowerCase().indexOf(query.toLowerCase());

						if(index != -1 && array[i].toLowerCase() != query.toLowerCase()){

							term = array[i].slice(0,index) + '<span class="match">' + array[i].slice(index,index + query.length) + '</span>' + array[i].slice(index + query.length);
							results.push(term)
						}
					}
					_private.getResult(results);
				}

			}
		},
		getResult: function(results){
			if(!results.length) {

				suggestions.style.display = 'none';

				return;
			}else{
				suggestions.style.display = 'block';
			}

			_private.showSuggest(results);
		},
		showSuggest: function(array){
			var list = document.createElement("ul");
			list.className = 'suggestionsList';

			for(var i = 0; i < array.length; i++){
				var option = document.createElement("li");
				option.className = 'suggestionsItem';

				option.innerHTML = array[i];
				list.appendChild(option);

			}
			suggestions.innerHTML = '';
			suggestions.appendChild(list);
			field.parentNode.appendChild(suggestions);
		}
	};

	suggestions.className = 'suggestions';

	addEvent(field, "keyup", function() {

		_private.searchQuery(field.value);
	});

	addEvent(suggestions, "click", function(e) {

		var target = e && e.target || event.srcElement;

		if (target.nodeName != 'LI') return;

		field.value = target.textContent;
		_private.searchQuery(field.value);

		if(typeof callback == "function"){
			callback.apply(thisArg);
		}

		stopPropagat(e);
	});

	addEvent(field, "click", function(e) {

		_private.searchQuery(field.value);

		stopPropagat(e);
	});

	addEvent(document, "click", function(e) {

		var target = e && e.target || event.srcElement;

		if (target == field) return;

		suggestions.style.display = 'none';
	});

}
function addEvent(elem, type, handler){

	if (elem.addEventListener) {

		elem.addEventListener(type, handler);

	} else if (elem.attachEvent)  {

		elem.attachEvent('on'+type, handler);
	}
}

function stopPropagat(event){

	if(event.stopPropagation) {

		event.stopPropagation();

	} else {
		event.returnValue = false;
	}
}
function getXmlHttp(){
	var xmlhttp;
	try {

		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		try {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (E) {
			xmlhttp = false;
		}
	}
	if (!xmlhttp && typeof XMLHttpRequest!='undefined') {

		xmlhttp = new XMLHttpRequest();
	}

	return xmlhttp;
}