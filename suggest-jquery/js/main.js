$(function () {
	$(document).ready(function () {
		var terms = [];

		for (var name in window) {
			terms.push(name);
		}
		var inputSug = new suggestInput();

		inputSug.init({

			field: $('#field'),
			//			data: terms,
			callback: function () {
				//				console.log(567);
			},
			index: 2,
			url: 'test.json'
			//			callbackThisArg: window // контекст для callback, если нужен
		});
	});
});
var suggestInput = function(){
	var _private = {
			params: {
				field: null,
				terms: [],
				callback: null,
				ajaxUrl: null,
				index: null,
				thisArg: null,
				timeout: null,
				delay: 100

			},
			objects: {
				suggestions: $('<div>', {class: 'suggestions'})
			},
			methods: {
				searchQuery: function (query) {

					var results = [];
					var terms = _private.params.terms;

					if (!query || query.length < _private.params.index) {
						_private.objects.suggestions.addClass('hidden');
						return;
					}

					if (terms && terms.length) {

						for (var i = 0; i < terms.length; i++) {
							var term;
							var index = terms[i].toLowerCase().indexOf(query.toLowerCase());

							if (index != -1 && terms[i].toLowerCase() != query.toLowerCase()) {

								term = terms[i].slice(0, index) + '<span class="match">' + terms[i].slice(index, index + query.length) + '</span>' + terms[i].slice(index + query.length);
								results.push(term)
							}
						}

						_private.methods.getResult(results);

					} else if (_private.params.ajaxUrl) {

						if (!_private.params.timeout) {
							_private.params.timeout = setTimeout(function () {
								proxyHttp();

							}, _private.params.delay);
						}
						function proxyHttp() {

							_private.params.timeout = null;

							$.ajax({
								type: "get",
								data: {query: query},
								url: _private.params.ajaxUrl
							}).done(function (response) {

								var array = response;

								for (var i = 0; i < array.length; i++) {
									var term;
									var index = array[i].toLowerCase().indexOf(query.toLowerCase());

									if (index != -1 && array[i].toLowerCase() != query.toLowerCase()) {

										term = array[i].slice(0, index) + '<span class="match">' + array[i].slice(index, index + query.length) + '</span>' + array[i].slice(index + query.length);
										results.push(term)
									}
								}
								_private.methods.getResult(results);
							});
						}
					}
				},
				getResult: function (results) {

					if (!results.length) {

						_private.objects.suggestions.addClass('hidden');
						return;
					} else {

						_private.objects.suggestions.removeClass('hidden');
					}

					_private.methods.showSuggest(results);
				},
				showSuggest: function (array) {

					var list = $('<ul>', {class: 'suggestionsList'});

					for (var i = 0; i < array.length; i++) {

						list.append($('<li>', {class: 'suggestionsItem', html: array[i]}));
					}
					_private.objects.suggestions.html('').append(list);

					_private.params.field.after(_private.objects.suggestions);
				}
			}
		},
		_public = {

			init: function (opts) {

				_private.params.field = opts.field;
				_private.params.terms = opts.data;
				_private.params.callback = opts.callback;
				_private.params.ajaxUrl = opts.url;
				_private.params.index = opts.index;
				_private.params.thisArg = (opts.callbackThisArg) ? opts.callbackThisArg : null;

				_private.params.field.on('keyup.suggestJquery', function () {

					_private.methods.searchQuery(_private.params.field.val());

				}).on("click.suggestJquery", function () {

					_private.methods.searchQuery(_private.params.field.val());

				});

				if ((!_private.params.terms || !_private.params.terms.length) && !_private.params.ajaxUrl) {

					var elements = [_private.params.field, _private.objects.suggestions, $(document)];

					elements.forEach(function (element) {

						element.off('.suggestJquery');

					});
				}
			}
		};

	_private.objects.suggestions.on('click.suggestJquery', function (e) {

		var target = e && e.target || event.srcElement;

		if (target.nodeName != 'LI') return;

		_private.params.field.val(target.textContent);

		_private.methods.searchQuery(_private.params.field.val());

		if (typeof _private.params.callback == "function") {
			_private.params.callback.apply(_private.params.thisArg);
		}

	});

	$(document).on("click.suggestJquery", function (e) {

		if ($(e.target).is(_private.params.field) || $(e.target).is(_private.objects.suggestions)) return;

		_private.objects.suggestions.addClass('hidden');

	});

	return _public;
};