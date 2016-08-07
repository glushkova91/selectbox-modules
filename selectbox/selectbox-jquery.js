function selectBox(opts){

	var KEY_CODE_UP = 38;
	var KEY_CODE_DOWN = 40;
	var KEY_CODE_ENTER = 13;

	var objects = {
			boxObjects: [],
			$select: null
		},
		_private = {

			hideNativeSelect: function($elem){

				$elem.css('display','none');

			},
			createBox: function($elem, i){

				var $list = _private.createList(i);
				var $input = _private.createInput($elem, i);
				objects.boxObjects[i].$wrap = $('<div>', {class: 'selectBoxWrap'}).attr('data-index', i)
					.append($input)
					.append($list);

				$elem.after(objects.boxObjects[i].$wrap);

			},
			createList: function(i){

				var options = _private.createItems(i);

				objects.boxObjects[i].$list = $('<ul>', {class: 'selectBoxList'});
				$.each(options, function (index, option) {
					objects.boxObjects[i].$list.append(option);
				});

				return objects.boxObjects[i].$list;
			},
			createItems: function(i){

				var array = [];
				var val = objects.$select.eq(i).val();
				$('option',objects.$select.eq(i)).each(function(k, opt){

					if (!opt.getAttribute('value')) return;
					var $option = $('<li>', {
						class: 'selectBoxItem',
						text: opt.textContent})
						.attr('data-val', opt.value);

					if(opt.value == val) $option.addClass('selected');
					if(opt.getAttribute("disabled") !== null) $option.addClass('disabled');
					array.push($option);
				});

				return array;
			},
			createInput: function($elem, i){

				var $currentElem = $('option', $elem).eq($elem[0].selectedIndex);
				var currentText =  ($currentElem.attr('value')) ? $currentElem.text() : '';

				objects.boxObjects[i].$input = $('<div>', {class: 'selectBoxInput'});
				objects.boxObjects[i].$inputValue = $('<div>', {class: 'selectBoxValue'});
				objects.boxObjects[i].$toggler = $('<div>', {class: 'selectBoxToggler'});

				_private.changeValue($elem, currentText);

				return objects.boxObjects[i].$input
					.append(objects.boxObjects[i].$inputValue)
					.append(objects.boxObjects[i].$toggler);
			},
			changeValue: function($elem, text, value){

				var index = $elem.attr('data-selectbox-index');
				objects.boxObjects[index].$inputValue.text(text);

				$('.selectBoxItem', objects.boxObjects[index].$wrap).removeClass('selected');
				objects.boxObjects[index].$list.find('[data-val="'+value+'"]').addClass('selected');

				if(value) objects.$select.eq(index).val(value).trigger('change');
			},
			hideAllBoxes: function(){
				objects.boxObjects.forEach(function(object, index){
					_private.closeBox(index);
				});
			},
			updateData: function($elem, i){

				var options = _private.createItems(i);
				var $currentElem = $elem.find('option').eq($elem[0].selectedIndex);
				var currentText = ($currentElem.attr('value')) ? $('option', $elem).eq($elem[0].selectedIndex).text() : '';
				var liParent = objects.boxObjects[i].$list.find('.selectBoxItem').parent();

				objects.boxObjects[i].$list.find('.selectBoxItem').remove();

				options.forEach(function(option){

					liParent.append(option);
				});

				_private.changeValue($elem, currentText, $currentElem.val());
			},
			closeBox: function(index){
				if(!objects.boxObjects[index].$wrap.hasClass('isOpen')) return;

				objects.boxObjects[index].$wrap.removeClass('isOpen').removeClass('openToTop');
				$(document).off('keydown', _private.onKeyDown);

				if(typeof opts.onClose == 'function'){
					opts.onClose.bind(objects.$select.eq(index))();
				}
			},
			openBox: function(index){
				if(objects.boxObjects[index].$wrap.hasClass('isOpen')) return;

				var positionClass = _private.detectBoxPositionClass(index);
				objects.boxObjects[index].$wrap.addClass('isOpen').addClass(positionClass);
				$(document)
					.off('keydown', _private.onKeyDown)
					.on('keydown', _private.onKeyDown);

				if(typeof opts.onOpen == 'function'){
					opts.onOpen.bind(objects.$select.eq(index))();
				}
			},
			detectBoxPositionClass: function(index){
				var height = objects.boxObjects[index].$list.height(),
					bottomToTopBorder = objects.boxObjects[index].$input[0].getBoundingClientRect().bottom,
					windowHeight = $(window).height();

				return ((windowHeight - bottomToTopBorder) >= height) ? '' : 'openToTop'
			},
			onClickDocument: function(e){
				for(var i = 0; i < objects.boxObjects.length; i++){

					if ($(e.target).closest(objects.boxObjects[i].$wrap).length) return;
				}

				_private.hideAllBoxes();
			},
			onClickList: function(e){
				_private.chooseOption($(e.target));

				//var value = e.target.getAttribute('data-val');
				//var text = e.target.textContent;
                //
				//if(e.target.nodeName != 'LI' || $(e.target).hasClass('disabled')) return;
                //
				//_private.changeValue(i, text);
				//boxObjects[i].$wrap.removeClass('isOpen');
                //
				//$('.selectBoxItem').removeClass('selected');
				//$(e.target).addClass('selected');
			},
			chooseOption: function($option){
				var $wrap = $option.closest('.selectBoxWrap');
				var index = $wrap.attr('data-index');
				var text = $option.text();
				var $elem = $wrap.prev(objects.$select);

				_private.changeValue($elem, text, $option.attr('data-val'));
				_private.closeBox(index);
			},
			onHoverListIn: function(){
				$(this).siblings().removeClass('hover-in')
					.end().addClass('hover-in');
			},
			onHoverListOut: function(){
				$(this).removeClass('hover-in');
			},
			onClickInput: function(){
				var $wrap = $(this).closest('.selectBoxWrap');
				var index = $wrap.attr('data-index');

				if($wrap.hasClass('selectBoxDisable')) return;

				if(!$wrap.hasClass('isOpen')){
					_private.hideAllBoxes();
					_private.openBox(index);
					//boxObjects[i].$wrap.removeClass('isOpen');
				}else{
					_private.hideAllBoxes();
					//boxObjects[i].$wrap.addClass('isOpen');
				}
			},
			onKeyDown: function(e){

				var $hoverInItem = $('.selectBoxWrap.isOpen li.hover-in'),
					$hoverItem = $hoverInItem.length ?
						$hoverInItem.eq(0) : $('.selectBoxWrap.isOpen li').eq(0),
					index = $('.selectBoxWrap.isOpen').attr('data-index');

				switch (e.keyCode) {
					case KEY_CODE_UP:
						var $prev = $hoverItem.prevAll(':not(.disabled):not(.selected):visible').eq(0);
						if($prev.length){
							$hoverItem.removeClass('hover-in');
							$prev.addClass('hover-in');
						}
						break;
					case KEY_CODE_DOWN:
						var $next = $hoverItem.nextAll(':not(.disabled):not(.selected):visible').eq(0);
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
			defineProperties: function(){
				var $elem = $(opts.elem);

				objects.$select = $elem;

				objects.$select.each(function(i, elem){

					objects.boxObjects[i] = {};
					//objects.boxObjects[i].optionsNative = $(elem).children('option');

					$(elem).attr('data-selectbox-index', i);
					_private.hideNativeSelect($(elem));
					_private.createBox($(elem), i);
				});
			},
			bindEvents: function(){

				$(document).on("click", _private.onClickDocument);
				$(document).on('keydown', _private.onKeyDown);
				for(var i = 0; i < objects.boxObjects.length; i++){

					(function(i){
						objects.boxObjects[i].$input.on("click", _private.onClickInput);
						objects.boxObjects[i].$list.on("click", 'li:not(.disabled)', _private.onClickList);

						objects.boxObjects[i].$list.on("mouseenter", 'li:not(.disabled)',
							_private.onHoverListIn);
						objects.boxObjects[i].$list.on("mouseleave", 'li:not(.disabled)',
							_private.onHoverListOut);
					})(i);
				}
			},
			init: function () {
				if (!opts.elem) return;
				_private.defineProperties();
				_private.bindEvents();
			}
		},
		_public = {

			rebuild: function(){

				objects.$select.each(function(i, elem){

					//boxObjects[i].optionsNative = $(elem).children('option');
					_private.updateData($(elem), i);
				});

			},
			disable: function(){
				objects.boxObjects.forEach(function(object){

					object.$wrap.addClass('selectBoxDisable');
				});
			},
			enable: function(){
				objects.boxObjects.forEach(function(object){

					object.$wrap.removeClass('selectBoxDisable');
				});
			},
			setValue: function(value){
				var $select = objects.$select.eq(0);
				if (!value || !$select.find('[value="'+value+'"]').length) return;

				var text = $select.find('[value="'+value+'"]').text();
				_private.changeValue($select, text, value)
			}
		};

	_private.init();

	return _public;
}
