$(function () {
	$(document).ready(function () {
		var selects = $('.selectCustom');

		selects.on('change', function(){
			console.log($(this).val());
		});
		var select = new selectAutocomplete();


		select.init({elem:selects});
		selects.eq(0).find('option').eq(1).html('change in code');
		select.rebuild();
	});
});
var selectAutocomplete = function(){

	var _private = {
			params: {
				terms: [],
				focusHide: false
			},
			objects: {
				suggestions: $('<div>', {class: 'suggestions'}),
				boxObjects: [],
				select: null
			},
			methods: {
				hideNativeSelect: function (elem) {

					elem.style.display = 'none';

				},
				createBox: function (elem, i) {

					var list = _private.methods.createList(i);
					var input = _private.methods.createInput(elem, i);
					_private.objects.boxObjects[i].wrap = $('<div>', {class: 'selectBoxWrap'}).attr('data-index', i).append(input).append(list);

					elem.after(_private.objects.boxObjects[i].wrap);

				},
				createList: function (i) {

					var options = _private.methods.createItems(i);

					_private.objects.boxObjects[i].list = $('<ul>', {class: 'selectBoxList'});

					options.forEach(function (option) {

						_private.objects.boxObjects[i].list.append(option);
					});

					return _private.objects.boxObjects[i].list;
				},
				createItems: function (i) {

					var array = [];

					_private.objects.boxObjects[i].optionsNative.each(function (k, opt) {

						var option = $('<li>', {
							class: 'selectBoxItem',
							text: opt.textContent
						}).attr('data-val', opt.value);

						if (opt.getAttribute("disabled") !== null) option.addClass('disabled');

						array.push(option);

						_private.params.terms[i].push(opt.textContent);

					});

					return array;
				},
				createInput: function (elem, i) {

					var currentElem = elem.find('option').eq(elem[0].selectedIndex);
					var currentText = (currentElem.attr('value')) ? _private.objects.boxObjects[i].optionsNative.eq(elem[0].selectedIndex).text() : '';

					_private.objects.boxObjects[i].input = $('<input>', {class: 'fieldAutocomlete', type: 'text'}).attr('placeholder', elem.attr('data-placeholder')).attr('data-txt', currentText);

					_private.methods.changeValueCustom(currentText, i);

					return _private.objects.boxObjects[i].input;
				},
				changeValueCustom: function (text, i) {

					_private.objects.boxObjects[i].input.val(text);
				},
				hideAllBoxes: function () {
					_private.objects.boxObjects.forEach(function (object) {

						object.wrap.removeClass('isOpen');
					});
				},
				updateData: function (elem, i) {

					var options = _private.methods.createItems(i);
					var currentElem = $(elem).find('option').eq(elem.selectedIndex);
					var currentText = (currentElem.attr('value')) ? _private.objects.boxObjects[i].optionsNative.eq(elem.selectedIndex).text() : '';
					var liparent = _private.objects.boxObjects[i].list.find('.selectBoxItem').parent();
					_private.objects.boxObjects[i].list.find('.selectBoxItem').remove();

					options.forEach(function (option) {

						liparent.append(option);
					});

					_private.methods.changeValueCustom(currentText, i);
					_private.objects.boxObjects[i].input.attr('data-txt', currentText);
				},
				searchQuery: function (query, k) {

					var results = [];
					var terms = _private.params.terms[k];

					if (terms && terms.length) {

						for (var i = 0; i < terms.length; i++) {

							var index = terms[i].toLowerCase().indexOf(query.toLowerCase());

							if (index != -1 && terms[i].toLowerCase() != query.toLowerCase()) {

								results.push(terms[i])
							}
						}
						_private.methods.getResult(results, k, query);
					}
				},
				getResult: function (results, index, query) {

					if (!results.length) {

						_private.objects.boxObjects[index].wrap.removeClass('isOpen');
						return;
					} else {

						_private.objects.boxObjects[index].wrap.addClass('isOpen');
					}

					_private.methods.showSuggest(results, index, query);
				},
				showSuggest: function (array, a, query) {

					var list = _private.objects.boxObjects[a].list.find('li');

					for (var k = 0; k < list.length; k++) {

						for (var i = 0; i < array.length; i++) {

							if(list.eq(k).text() == array[i]){

								var index = array[i].toLowerCase().indexOf(query.toLowerCase());
								var newHtml = array[i].slice(0, index) + '<span class="match">' + array[i].slice(index, index + query.length) + '</span>' + array[i].slice(index + query.length);
								list.eq(k).css('display', 'block').html(newHtml);

								break;
							}else{
								list.eq(k).css('display', 'none');
							}
						}
					}
				},
				createEvents: function(){

					for (var i = 0; i < _private.objects.boxObjects.length; i++) {

						_private.objects.boxObjects[i].list.on("click", onClickList);

						_private.objects.boxObjects[i].input.on('keyup', onKeyupInput).on("focus", onFocusInput);
					}
					function onClickList(e){

						var wrap = $(e.target).closest('.selectBoxWrap');
						var index = wrap.attr('data-index');
						var value = e.target.getAttribute('data-val');
						var text = e.target.textContent;

						if (e.target.nodeName != 'LI' || $(e.target).hasClass('disabled')) return;

						_private.methods.changeValueCustom(text, index);
						_private.objects.select.eq(index).val(value).trigger('change');
						_private.objects.boxObjects[index].wrap.removeClass('isOpen');
						_private.methods.searchQuery(text, index);

						_private.objects.boxObjects[index].input.attr('data-txt', text);
					}
					function onKeyupInput(e){
						var wrap = $(e.target).closest('.selectBoxWrap');
						var index = wrap.attr('data-index');

						_private.methods.searchQuery($(this).val(), index);
					}
					function onFocusInput(e){
						var wrap = $(e.target).closest('.selectBoxWrap');
						var index = wrap.attr('data-index');

						if (wrap.hasClass('selectBoxDisable')) return;

						if(_private.params.focusHide){

							_private.objects.boxObjects[index].input.val('');
						}

						_private.methods.hideAllBoxes();
						_private.methods.searchQuery($(this).val(), index);

					}
				}
			}
		},
		_public = {

			init: function (opts) {

				var elem = opts.elem;
				var focusHide = opts.focusHide || false;

				_private.objects.select = elem;
				_private.params.focusHide = focusHide;

				_private.objects.select.each(function (i, elem) {
					_private.params.terms[i] = [];
					_private.objects.boxObjects[i] = {};
					_private.objects.boxObjects[i].optionsNative = $(elem).children('option');

					_private.methods.hideNativeSelect(elem);
					_private.methods.createBox($(elem), i);
				});
				_private.methods.createEvents();


			},
			rebuild: function () {

				_private.objects.select.each(function (i, elem) {

					_private.objects.boxObjects[i].optionsNative = $(elem).children('option');
					_private.methods.updateData(elem, i);
				});

			},
			disable: function () {
				_private.objects.boxObjects.forEach(function (object) {

					object.wrap.addClass('selectBoxDisable');
					object.input.attr('disabled', true);
				});
			},
			enable: function () {
				_private.objects.boxObjects.forEach(function (object) {

					object.wrap.removeClass('selectBoxDisable');
					object.input.attr('disabled', false);
				});
			}
		};

	$(document).on("click", function (e) {

		for (var i = 0; i < _private.objects.boxObjects.length; i++) {

			if ($( e.target).closest(_private.objects.boxObjects[i].wrap).length) return;
		}

		_private.methods.hideAllBoxes();

		_private.objects.boxObjects.forEach(function (object) {

			object.input.val(object.input.attr('data-txt'));
		});
	});

	return _public;

};
