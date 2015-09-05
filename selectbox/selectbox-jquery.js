function selectBox(elem){

	var boxObjects = [];

	var select = elem,

		_private = {

			hideNativeSelect: function(elem){

				elem.style.display = 'none';

			},
			createBox: function(elem, i){

				var list = _private.createList(i);
				var input = _private.createInput(elem, i);
				boxObjects[i].wrap = $('<div>', {class: 'selectBoxWrap'}).attr('data-index', i).append(input).append(list);

				elem.after(boxObjects[i].wrap);

			},
			createList: function(i){

				var options = _private.createItems(i);

				boxObjects[i].list = $('<ul>', {class: 'selectBoxList'});

				options.forEach(function(option){

					boxObjects[i].list.append(option);
				});

				return boxObjects[i].list;
			},
			createItems: function(i){

				var array = [];

				boxObjects[i].optionsNative.each(function(k, opt){

					var option = $('<li>', {class: 'selectBoxItem', text: opt.textContent}).attr('data-val', opt.value);

					if(opt.getAttribute("disabled") !== null) option.addClass('disabled');

					array.push(option);
				});

				return array;
			},
			createInput: function(elem, i){

				var currentText = boxObjects[i].optionsNative.eq(elem[0].selectedIndex).text();

				boxObjects[i].input = $('<div>', {class: 'selectBoxInput'});
				boxObjects[i].inputValue = $('<div>', {class: 'selectBoxValue'});
				boxObjects[i].toggler = $('<div>', {class: 'selectBoxToggler'});

				_private.changeValueCustom(currentText, i);

				return boxObjects[i].input.append(boxObjects[i].inputValue).append(boxObjects[i].toggler);
			},
			changeValueCustom: function(text, i){

				boxObjects[i].inputValue.text(text);
			},
			hideAllBoxes: function(){
				boxObjects.forEach(function(object){

					object.wrap.removeClass('isOpen');
				});
			},
			updateData: function(elem, i){

				var options = _private.createItems(i);
				var currentText = boxObjects[i].optionsNative.eq(elem.selectedIndex).text();
				var liparent = boxObjects[i].list.find('.selectBoxItem').parent();

				boxObjects[i].list.find('.selectBoxItem').remove();

				options.forEach(function(option){

					liparent.append(option);
				});

				_private.changeValueCustom(currentText, i);
			}
		},
		_public = {

			init: function(){

				select.each(function(i, elem){

					boxObjects[i] = {};
					boxObjects[i].optionsNative = $(elem).children('option');

					_private.hideNativeSelect(elem);
					_private.createBox($(elem), i);
				});
			},

			rebuild: function(){

				select.each(function(i, elem){

					boxObjects[i].optionsNative = $(elem).children('option');
					_private.updateData(elem, i);
				});

			},
			disable: function(){
				boxObjects.forEach(function(object){

					object.wrap.addClass('selectBoxDisable');
				});
			},
			enable: function(){
				boxObjects.forEach(function(object){

					object.wrap.removeClass('selectBoxDisable');
				});
			}
		};

	_public.init();

	$(document).on("click", function(e) {

		for(var i = 0; i < boxObjects.length; i++){

			if ($(e.target).closest(boxObjects[i].wrap).length) return;
		}

		_private.hideAllBoxes();

	});
	for(var i = 0; i < boxObjects.length; i++){

		boxObjects[i].input.on("click", function(e) {

			var wrap = $(this).closest('.selectBoxWrap');
			var index = wrap.attr('data-index');

			if(wrap.hasClass('selectBoxDisable')) return;

			if(boxObjects[index].wrap.hasClass('isOpen')){

				boxObjects[index].wrap.removeClass('isOpen');
			}else{
				_private.hideAllBoxes();
				boxObjects[index].wrap.addClass('isOpen');
			}
		});
		boxObjects[i].list.on("click", function(e) {

			var wrap = $(this).closest('.selectBoxWrap');
			var index = wrap.attr('data-index');
			var value = e.target.getAttribute('data-val');
			var text = e.target.textContent;

			if(e.target.nodeName != 'LI' || $(e.target).hasClass('disabled')) return;

			_private.changeValueCustom(text, index);
			select.eq(index).val(value).trigger('change');
			boxObjects[index].wrap.removeClass('isOpen');

		});
	}

	return _public;
}
