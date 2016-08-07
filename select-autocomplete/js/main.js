var selectAutocomplete = function(opts){
	var KEY_CODE_UP = 38;
	var KEY_CODE_DOWN = 40;
	var KEY_CODE_ENTER = 13;

	var _private = {
			params: {
				terms: [],
				focusHide: false
			},
			objects: {
				suggestions: $('<div>', {class: 'suggestions'}),
				boxObjects: [],
				$select: null
			},

			methods: {

				hideNativeSelect: function ($elem) {

					$elem.css('display','none');

				},
				createBox: function ($elem, index) {

					var $list = _private.methods.createList(index);
					var $input = _private.methods.createInput($elem, index);
					_private.objects.boxObjects[index].$wrap = $('<div>', {class: 'selectBoxWrap'}).attr('data-index', index)
						.append($input)
						.append($list);

					$elem.after(_private.objects.boxObjects[index].$wrap);
				},
				createList: function (i) {

					var options = _private.methods.createItems(i);

					var $list = _private.objects.boxObjects[i].$list = $('<ul>', {class: 'selectBoxList'});
					$.each(options, function (index, option) {
						$list.append(option);
					});

					return $list;
				},
				createItems: function (i) {

					var array = [];
					$('option', _private.objects.$select.eq(i)).each(function (k, opt) {
						if (!opt.getAttribute('value')) return;
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

					var $currentElem = $('option', $elem).eq($elem[0].selectedIndex);
					var currentText = ($currentElem.attr('value')) ? $currentElem.text() : '';

					_private.objects.boxObjects[i].$input = $('<input>', {class: 'fieldAutocomlete', type: 'text'})
															.attr('placeholder', $elem.attr('data-placeholder'));

					_private.methods.changeValue($elem, currentText);

					return _private.objects.boxObjects[i].$input;
				},
				changeValue: function ($elem, text, value) {

					var index = $elem.attr('data-autocomplete-index');
					_private.objects.boxObjects[index].$input.val(text)
						.attr('data-txt', text);
					if(value) _private.objects.$select.eq(index).val(value).trigger('change');
				},
				hideAllBoxes: function () {
					_private.objects.boxObjects.forEach(function (object, index) {
						_private.methods.closeBox(index);
					});
				},
				updateData: function ($elem) {
					var i = $elem.attr('data-autocomplete-index');
					var options = _private.methods.createItems(i);
					var $currentElem = $elem.find('option').eq($elem[0].selectedIndex);
					var currentText = ($currentElem.attr('value')) ? $('option', $elem).eq($elem[0].selectedIndex).text() : '';
					var liParent = _private.objects.boxObjects[i].$list.find('.selectBoxItem').parent();
					_private.objects.boxObjects[i].$list.find('.selectBoxItem').remove();

					options.forEach(function (option) {

						liParent.append(option);
					});

					_private.methods.changeValue($elem, currentText, $currentElem.val());
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
						_private.methods.closeBox(index);

						return;
					} else {
						_private.methods.openBox(index);
					}

					_private.methods.showSuggest(results, index, query);
				},
				showSuggest: function (array, a, query) {

					var $list = _private.objects.boxObjects[a].$list.find('li');

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
				closeBox: function(index){
					if(!_private.objects.boxObjects[index].$wrap.hasClass('isOpen')) return;

					_private.objects.boxObjects[index].$wrap.removeClass('isOpen').removeClass('openToTop');
					$(document).off('keydown', _private.methods.onKeyDown);

					if(typeof opts.onClose == 'function'){
						opts.onClose.bind(_private.objects.$select.eq(index))();
					}
				},
				openBox: function(index){
					if(_private.objects.boxObjects[index].$wrap.hasClass('isOpen')) return;

					var positionClass =_private.methods.detectBoxPositionClass(index);
					_private.objects.boxObjects[index].$wrap.addClass('isOpen').addClass(positionClass);
					$(document)
						.off('keydown', _private.methods.onKeyDown)
						.on('keydown', _private.methods.onKeyDown);

					if(typeof opts.onOpen == 'function'){
						opts.onOpen.bind(_private.objects.$select.eq(index))();
					}
				},
				detectBoxPositionClass: function(index){
					var height = _private.objects.boxObjects[index].$list.height(),
						bottomToTopBorder = _private.objects.boxObjects[index].$input[0].getBoundingClientRect().bottom,
						windowHeight = $(window).height();

					return ((windowHeight - bottomToTopBorder) >= height) ? '' : 'openToTop'
				},
				onKeyDown: function(e){
					var $hoverInItem = $('.selectBoxWrap.isOpen li.hover-in'),
						$hoverItem = $hoverInItem.length ?
							$hoverInItem.eq(0) : $('.selectBoxWrap.isOpen li').eq(0),
						index = $('.selectBoxWrap.isOpen').attr('data-index');

						switch (e.keyCode) {
						case KEY_CODE_UP:
							var $prev = $hoverItem.prevAll(':not(.disabled):visible').eq(0);
							if($prev.length){
								$hoverItem.removeClass('hover-in');
								$prev.addClass('hover-in');
							}
							break;
						case KEY_CODE_DOWN:
							var $next = $hoverItem.nextAll(':not(.disabled):visible').eq(0);
							if($next.length){
								$hoverItem.removeClass('hover-in');
								$next.addClass('hover-in');
							}
							break;
						case KEY_CODE_ENTER:
							_private.methods.chooseOption($hoverItem);
							//_private.methods.closeBox(index);
							break;
						}
				},
				bindEvents: function(){

					for (var i = 0; i < _private.objects.boxObjects.length; i++) {

						_private.objects.boxObjects[i].$list.on("click", 'li:not(.disabled)',_private.methods.onClickList);

						_private.objects.boxObjects[i].$list.on("mouseenter", 'li:not(.disabled)',
							_private.methods.onHoverListIn);
						_private.objects.boxObjects[i].$list.on("mouseleave", 'li:not(.disabled)',
							_private.methods.onHoverListOut);
						_private.objects.boxObjects[i].$input
							.on('input', _private.methods.onInput)
							.on("focus", _private.methods.onFocusInput);
					}

					$(document).on("click", _private.methods.onClickDocument);
					$(document).on('keydown', _private.methods.onKeyDown);
				},
				onClickDocument: function(e){
					for (var i = 0; i < _private.objects.boxObjects.length; i++) {

						if ($( e.target).closest(_private.objects.boxObjects[i].$wrap).length) return;
					}

					_private.methods.hideAllBoxes();

					_private.objects.boxObjects.forEach(function (object, i) {
						if(object.$input.val() === ''){
							_private.methods.changeValue(_private.objects.$select.filter('[data-autocomplete-index="'+i+'"]'), '', '');
						}else{
							_private.methods.changeValue(_private.objects.$select.filter('[data-autocomplete-index="'+i+'"]'), object.$input.attr('data-txt'));
						}
					});
				},
				onClickList: function(e){
					_private.methods.chooseOption($(e.target));
				},
				chooseOption: function($option){
					var $wrap = $option.closest('.selectBoxWrap');
					var index = $wrap.attr('data-index');
					var text = $option.text();
					var $elem = $wrap.prev(_private.objects.$select);

					_private.methods.changeValue($elem, text, $option.val());
					_private.methods.closeBox(index);
					_private.methods.searchQuery(text, index);
				},
				onHoverListIn: function(){
					$(this).siblings().removeClass('hover-in')
						.end().addClass('hover-in');
				},
				onHoverListOut: function(){
					$(this).removeClass('hover-in');
				},
				onInput: function(e){
					var $wrap = $(e.target).closest('.selectBoxWrap');
					var index = $wrap.attr('data-index');

					_private.methods.searchQuery($(this).val(), index);
				},
				onFocusInput: function(e){
					var $wrap = $(e.target).closest('.selectBoxWrap');
					var index = $wrap.attr('data-index');

					if ($wrap.hasClass('selectBoxDisable')) return;

					if(_private.params.focusHide){

						_private.objects.boxObjects[index].$input.val('');
					}

					_private.methods.hideAllBoxes();
					_private.methods.searchQuery($(this).val(), index);
				},
				defineProperties: function(){
					var $elem = $(opts.elem);
					var focusHide = opts.focusHide || false;

					_private.objects.$select = $elem;
					_private.params.focusHide = focusHide;

					_private.objects.$select.each(function (i, elem) {
						_private.params.terms[i] = [];
						_private.objects.boxObjects[i] = {};

						$(elem).attr('data-autocomplete-index', i);
						_private.methods.hideNativeSelect($(elem));
						_private.methods.createBox($(elem), i);
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

				_private.objects.$select.each(function (i, elem) {
					var index = $(elem).attr('data-autocomplete-index');
					_private.methods.updateData($(elem));
				});

			},
			disable: function () {
				_private.objects.boxObjects.forEach(function (object) {

					object.$wrap.addClass('selectBoxDisable');
					object.$input.attr('disabled', true);
				});
			},
			enable: function () {
				_private.objects.boxObjects.forEach(function (object) {

					object.$wrap.removeClass('selectBoxDisable');
					object.$input.attr('disabled', false);
				});
			}
		};
	_private.methods.init();
	return _public;

};
