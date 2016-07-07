$(function () {
	$(document).ready(function () {
		var selects = $('.selectCustom');

		selects.on('change', function(){
			console.log($(this).val());
		});
		var select = new selectAutocomplete({elem:selects});


		//select.init({elem:selects});
		selects.eq(0).find('option').eq(1).html('change in code');
		select.rebuild();
	});
});
var selectAutocomplete = function(opts){

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

				hideNativeSelect: function ($elem) {

					$elem.css('display','none');

				},
				createBox: function ($elem) {
					var index = $elem.attr('data-autocomlete-index');
					var $list = _private.methods.createList(index);
					var $input = _private.methods.createInput($elem, index);
					_private.objects.boxObjects[index].wrap = $('<div>', {class: 'selectBoxWrap'}).attr('data-index', index)
						.append($input)
						.append($list);

					$elem.after(_private.objects.boxObjects[index].wrap);

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

						var $option = $('<li>', {
							class: 'selectBoxItem',
							text: opt.textContent
						}).attr('data-val', opt.value);

						if (opt.getAttribute("disabled") !== null) $option.addClass('disabled');

						array.push($option);

						_private.params.terms[i].push(opt.textContent);

					});

					return array;
				},
				createInput: function ($elem, i) {

					var $currentElem = $elem.find('option').eq($elem[0].selectedIndex);
					var currentText = ($currentElem.attr('value')) ? _private.objects.boxObjects[i].optionsNative.eq($elem[0].selectedIndex).text() : '';

					_private.objects.boxObjects[i].input = $('<input>', {class: 'fieldAutocomlete', type: 'text'}).attr('placeholder', $elem.attr('data-placeholder'));

					_private.methods.changeValue($elem, currentText);

					return _private.objects.boxObjects[i].input;
				},
				changeValue: function ($elem, value) {

					var index = $elem.attr('data-autocomlete-index');
					_private.objects.boxObjects[index].input.val(value)
						.attr('data-txt', value);
				},
				hideAllBoxes: function () {
					_private.objects.boxObjects.forEach(function (object) {

						object.wrap.removeClass('isOpen');
					});
				},
				updateData: function ($elem) {
					var i = $elem.attr('data-autocomlete-index');
					var options = _private.methods.createItems(i);
					var currentElem = $elem.find('option').eq($elem[0].selectedIndex);
					var currentText = (currentElem.attr('value')) ? _private.objects.boxObjects[i].optionsNative.eq($elem[0].selectedIndex).text() : '';
					var liparent = _private.objects.boxObjects[i].list.find('.selectBoxItem').parent();
					_private.objects.boxObjects[i].list.find('.selectBoxItem').remove();

					options.forEach(function (option) {

						liparent.append(option);
					});

					_private.methods.changeValue($elem, currentText);
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
						_private.methods.showResult(results, k, query);
					}
				},
				showResult: function (results, index, query) {

					if (!results.length) {

						_private.objects.boxObjects[index].wrap.removeClass('isOpen');
						return;
					} else {
						_private.objects.boxObjects[index].wrap.addClass('isOpen');
					}

					_private.methods.showSuggest(results, index, query);
				},
				showSuggest: function (array, a, query) {

					var $list = _private.objects.boxObjects[a].list.find('li');

					for (var k = 0; k < $list.length; k++) {
						for (var i = 0; i < array.length; i++) {
							if($list.eq(k).text() == array[i]){

								var index = array[i].toLowerCase().indexOf(query.toLowerCase());
								var newHtml = array[i].slice(0, index) + '<span class="match">' + array[i].slice(index, index + query.length) + '</span>' + array[i].slice(index + query.length);
								$list.eq(k).css('display', 'block').html(newHtml);

								break;
							}else{
								$list.eq(k).css('display', 'none');
							}
						}
					}
				},
				bindEvents: function(){

					for (var i = 0; i < _private.objects.boxObjects.length; i++) {

						_private.objects.boxObjects[i].list.on("click", _private.methods.onClickList);

						_private.objects.boxObjects[i].input
							.on('keyup', _private.methods.onKeyupInput)
							.on("focus", _private.methods.onFocusInput);
					}

					$(document).on("click", _private.methods.onClickDocument);
				},
				onClickDocument: function(e){
					for (var i = 0; i < _private.objects.boxObjects.length; i++) {

						if ($( e.target).closest(_private.objects.boxObjects[i].wrap).length) return;
					}

					_private.methods.hideAllBoxes();

					_private.objects.boxObjects.forEach(function (object, i) {
						if(object.input.val() === ''){
							_private.methods.changeValue(_private.objects.select.filter('[data-autocomlete-index="'+i+'"]'), '');
						}else{
							_private.methods.changeValue(_private.objects.select.filter('[data-autocomlete-index="'+i+'"]'), object.input.attr('data-txt'));
						}
					});
				},
				onClickList: function(e){
					var $wrap = $(e.target).closest('.selectBoxWrap');
					var index = $wrap.attr('data-index');
					var value = e.target.getAttribute('data-val');
					var text = e.target.textContent;
					var $elem = $wrap.prev(_private.objects.select);

					if (e.target.nodeName != 'LI' || $(e.target).hasClass('disabled')) return;

					_private.methods.changeValue($elem, text);
					_private.objects.select.eq(index).val(value).trigger('change');
					_private.objects.boxObjects[index].wrap.removeClass('isOpen');
					_private.methods.searchQuery(text, index);
				},
				onKeyupInput: function(e){
					var $wrap = $(e.target).closest('.selectBoxWrap');
					var index = $wrap.attr('data-index');

					_private.methods.searchQuery($(this).val(), index);
				},
				onFocusInput: function(e){
					var $wrap = $(e.target).closest('.selectBoxWrap');
					var index = $wrap.attr('data-index');

					if ($wrap.hasClass('selectBoxDisable')) return;

					if(_private.params.focusHide){

						_private.objects.boxObjects[index].input.val('');
					}

					_private.methods.hideAllBoxes();
					_private.methods.searchQuery($(this).val(), index);
				},
				defineProperties: function(){
					var $elem = $(opts.elem);
					var focusHide = opts.focusHide || false;

					_private.objects.select = $elem;
					_private.params.focusHide = focusHide;

					_private.objects.select.each(function (i, elem) {
						_private.params.terms[i] = [];
						_private.objects.boxObjects[i] = {};
						_private.objects.boxObjects[i].optionsNative = $(elem).children('option');

						_private.methods.hideNativeSelect($(elem));

						$(elem).attr('data-autocomlete-index', i);
						_private.methods.createBox($(elem));
					});
				},
				init: function () {
					if (!opts.elem) return;
					_private.methods.defineProperties();
					_private.methods.bindEvents();
				}
			}

		},
		_public = {

			rebuild: function () {

				_private.objects.select.each(function (i, elem) {
					var index = $(elem).attr('data-autocomlete-index');
					_private.objects.boxObjects[index].optionsNative = $(elem).children('option');
					_private.methods.updateData($(elem));
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
	_private.methods.init();
	return _public;

};
