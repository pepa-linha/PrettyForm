/**
 * Pretty Form
 *
 * Make your HTML forms prettier
 * Support for all browsers - IE5.5+, Opera, Firefox, Safari, Chrome :-)
 *
 * @namespace Pretty Form
 * @author Pepa Linha <pepa.linha@outlook.com>
 * @version 0.9 beta 3
 * @license BSD (http://creativecommons.org/licenses/BSD/)
 */
 var PrettyForm = {

 	/**
	 * {Boolean} animations Turn on/off animations
	 * @requires Effects library
	 */
	animations: false,
 
	/**
	 * {Boolean} checkMatchClass Check if the element has matchClass
	 */
	checkMatchClass: true,
 
	/**
	 * {String} matchClass Only elements with this class will be replaced
	 */
	matchClass: "graphic",
	
	/**
	 * {String} prefix ID and class name prefix (ui-selectbox; ui-checkbox; ...)
	 */
	prefix: "ui-",
	
	/**
	 * {Array}
	 * @private controls Array of created controls
	 */
	controls: [],
	
	/**
	 * {Array} keys Key codes for some keys
	 * @private
	 */
	keys: {
		ARROW_LEFT: 37,
		ARROW_UP: 38,
		ARROW_RIGHT: 39,
		ARROW_DOWN: 40,
		ESC: 27,
		SPACE: 32,
		ENTER: 13
	},
	
	/**
	 * {Number} zIndex Max z-index for created controls (it will been decrease)
	 */
	zIndex: 1000,
	
	/**
	 * {String} inputFileNo
	 */
	inputFileNo: '<font style="color:#b8b8b8">(no&nbsp;selected&nbsp;file)</font>',
	
	/**
	 * {String} inputFileButton
	 */
	inputFileButton: "Select&nbsp;file"

};


/**
 * Check if the element has specific class
 * 
 * @param {DOMElement} element
 * @param {String} className
 * @returns {Boolean}
 */
PrettyForm.hasClass = function(element, className) {
	try {
		var re = new RegExp("(\\s|^)" + className + "(\\s|$)");
		return re.test(element.className);
	} catch (error) {
		return false;
	}
};


/**
 * Add specific class to the element
 * 
 * @param {DOMElement} element
 * @param {String} className
 */
PrettyForm.addClass = function(element, className) {
	try {
		if (!PrettyForm.hasClass(element, className)) {
			element.className += " " + className;
			element.className = element.className.replace(/ {2,}/g, " ");
		}
	} catch (error) {}
};


/**
 * Remove specific class from the element
 * 
 * @param {DOMElement} element
 * @param {String} className
 */
PrettyForm.removeClass = function(element, className) {
	try {
		if(PrettyForm.hasClass(element, className)) {
			var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
			element.className = element.className.replace(reg, "");
		}
	} catch (error) {}
};


/**
 * Find the parent of element
 *
 * @param {DOMElement} element Find parent of this element
 * @param {String} [tagName] Parent tag name
 * @param {String} [className] Parent class
 */
PrettyForm.findParent = function(element, tagName, className) {
	var parent = element.parentNode;
	
	if(tagName === undefined) {
		return parent;
	}
	
	tagName = tagName.toLowerCase();
	
	while(parent
		&& ((tagName && parent.tagName.toLowerCase() !== tagName)
		|| (className && parent.className === className)))
	{
		parent = parent.parentNode;
	}
	
	return parent;
};


/**
 * Cancel default event
 * @private
 * 
 * @param {Event} event
 */
PrettyForm.cancelEvent = function (event) {
	if (event.stopPropagation) {
		event.stopPropagation();
		event.preventDefault();
	} else if (event.cancelBubble === false) {
		event.cancelBubble = true;
		event.returnValue = false;
	}
};


/**
 * Find the label for the input
 * @private
 * 
 * @param {DOMElement} input
 * @returns {Element|Null}
 */
PrettyForm.findLabel = function (input) {

	var label = null;
	
	// input is child of label
	if (input.parentNode.nodeName.toLowerCase() === "label") {
		
		label = input.parentNode;
	} else {
		
		var labels = document.getElementsByTagName("label");
		
		for (var i = 0, l = labels.length; i < l; i++) {
			if (labels[i].htmlFor === input.id) {
				label = labels[i];
				break;
			}
		}
	}
		
	return label;
};


/**
 * Replaces form controls
 *
 * @param {DOMElement} [container=document]
 */
PrettyForm.makePrettier = function (container) {
	
	container = container || document;
	
	// find inputs
	var inputs = container.getElementsByTagName("input");
	
	for (var i = 0, l = inputs.length; i < l; i++) {
		
		var input = inputs[i];
		
		// replace only element with matchClass if checkMatchClass is true
		if (this.checkMatchClass && !PrettyForm.hasClass(input, this.matchClass)) {
			continue;
		}
		
		switch (input.type) {

			case "text":
			case "password":
				
				PrettyForm.addClass(input, this.prefix + "text");
				break;
		
			case "checkbox":

				new this.Checkbox().setReference(input).render();
				break;
				
			case "radio":
				
				new this.Radio().setReference(input).render();
				break;
				
			case "file":
			
				new this.File().setReference(input).render();
				break;
			
			case "submit":
			case "reset":
			case "button":
			
				PrettyForm.addClass(input, this.prefix + "button");
				
				// @todo primarni tlacitko rozlisovat jestli je submit, je to potreba?
				if (input.type === "submit") {
					PrettyForm.addClass(input, this.prefix + "primary-button");
				}
				
				// reset button
				if (input.type === "reset") {
					
					var parentForm = PrettyForm.findParent(inputs[i], "form");

					if (parentForm) {
						
						// @todo tady to asi nebude uplne nejlepe resene
						var originalOnReset = parentForm.onreset;
						parentForm.onreset = function () {

							if (originalOnReset) {
								originalOnReset.apply(this, arguments);
							}

							for (var i = 0, len = parentForm.elements.length; i < len; i++) {
								if (parentForm.elements[i].prettier) {
									parentForm.elements[i].prettier.reset();
								}
							}

						};

					}
					
				}
				
				break;
				
			default:
				throw new Error("Input type '" + inputs[i].type + "' is not supported");
		}
		
	}
	
	
	// find textareas
	var textAreas = container.getElementsByTagName("textarea");
	
	for (var i = 0, l = textAreas.length; i < l; i++) {
		
		// replace only element with matchClass if checkMatchClass is true
		if (this.checkMatchClass && !PrettyForm.hasClass(textAreas[i], this.matchClass)) {
			continue;
		}
		
		PrettyForm.addClass(textAreas[i], this.prefix + "text");
		
	}
	
	
	// find select boxes
	var selects = container.getElementsByTagName("select");
	
	for (var i = 0, l = selects.length; i < l; i++) {
	
		// replace only element with matchClass if checkMatchClass is true
		if (this.checkMatchClass && !PrettyForm.hasClass(selects[i], this.matchClass)) {
			continue;
		}
		
		new this.SelectBox().setReference(selects[i]).render();

	}
	
};


/**********************************************************************/


/**
 * CheckBox control
 *
 * @constructor
 * @param {String} [label]
 * @returns {PrettyForm.Checkbox}
 */
PrettyForm.Checkbox = function (label) {

	/**
	 * @type {String} name Name of control
	 */
	this.name = PrettyForm.prefix + "checkbox-" + PrettyForm.controls.length;
	
	/**
	 * @type {HTMLInputElement} reference Reference to original control
	 */
	this.reference = null;
	
	/**
	 * @type {Boolean} isRendered Flag if the control is rendered
	 */
	this.isRendered = false;
	
	/**
	 * @type {Boolean} checked Is checkbox checked?
	 */
	this.checked = false;
	
	/**
	 * @type {Boolean} disabled Is checkbox disabled?
	 */
	this.disabled = false;
	
	/**
	 * @type {DOMElement} container Container/parent of this control
	 */
	this.container = null;
	
	/* default value */
	this.defaultChecked = null;
	
	/* this control element */
	this.element = document.createElement("span");
	this.element.id = this.name;
	this.element.className = PrettyForm.prefix + "checkbox" + (this.checked ? " checked" : "");
	this.element.tabIndex = 0;
	
	// i tag as a image
	this.element.appendChild(document.createElement("i"));

	/* this text control element */
	if (label) {
		this.setLabel(label);
	}

	var me = this;
	
	/*************** Events on this control ***************/

	// @todo tato funkce se pridava i na stisk klavesy, moc se mi to nelibi :)
	me.element.onmouseup = function (event) {
		
		if (me.disabled) {
			return;
		}
		
		event = event || window.event;

		if (!event.keyCode || event.keyCode === 0
			|| event.keyCode === PrettyForm.keys.ENTER
			|| event.keyCode === PrettyForm.keys.SPACE)
		{

			me.setChecked(me.checked ? false : true);
			
			// call the original control onclick event
			if (me.reference && me.reference.onclick) {
				me.reference.onclick.apply(me.reference, arguments);
			}
			
		}
	
	};
	
	/*
	// Old Opera browser need keypress event
	var eventName = navigator.userAgent.indexOf("Opera") === -1
						? "onkeydown" : "onkeypress";
	*/
   
	var eventName = "onkeydown";
	
	me.element[eventName] = me.element.onmouseup;
	
	PrettyForm.controls.push(me);
	return me;

};


/**
 * Set checked
 *
 * @param {Boolean} value
 * @returns {PrettyForm.Checkbox}
 */
PrettyForm.Checkbox.prototype.setChecked = function (value) {
	
	this.checked = value;
	
	if (this.defaultChecked === null) {
		this.defaultChecked = value;
	}
	
	if (value) {
		PrettyForm.addClass(this.element, "checked");
	} else {
		PrettyForm.removeClass(this.element, "checked");
	}
	
	if (this.reference) {
		this.reference.checked = value;
	}
	
	return this;
	
};


/**
 * Set disabled
 *
 * @param {Boolean} value
 * @returns {PrettyForm.Checkbox}
 */
PrettyForm.Checkbox.prototype.setDisabled = function (value) {
	
	this.disabled = value;
	
	if (value) {
		PrettyForm.addClass(this.element, "disabled");
	} else {
		PrettyForm.removeClass(this.element, "disabled");
	}
	
	if (this.reference) {
		this.reference.disabled = value;
	}
	
	return this;
	
};


/**
 * Set reference element
 *
 * @param {HTMLInputElement} reference
 * @returns {PrettyForm.Checkbox}
 */
PrettyForm.Checkbox.prototype.setReference = function (reference) {
	
	var me = this;
	
	me.reference = reference;
	me.reference.prettier = me;
	me.setChecked(reference.checked);
	me.element.tabIndex = reference.tabIndex;
	
	var oldOnClick = me.reference.onclick;
	me.reference.onclick = function () {
		if (oldOnClick) {
			oldOnClick.apply(me.reference, arguments);
		}
		me.setChecked(me.reference.checked);
	};
	
	return this;
	
};


/**
 * Set container
 *
 * @param {HTMLElement} container
 * @returns {PrettyForm.Checkbox}
 */
PrettyForm.Checkbox.prototype.setContainer = function (container) {
	this.container = container;
	return this;
};


/**
 * Set label
 * 
 * @param {String} label
 * @returns {PrettyForm.Checkbox}
 */
PrettyForm.Checkbox.prototype.setLabel = function (label) {
	
	if (!this.elementLabel) {
		this.elementLabel = document.createElement("span");
		this.element.appendChild(this.elementLabel);
	}
	
	this.elementLabel.innerHTML = label;	
	return this;
	
};


/**
 * Render checkbox control
 *
 * @returns {PrettyForm.Checkbox}
 * @throws {Error} If already rendered
 */
PrettyForm.Checkbox.prototype.render = function () {
	
	if (this.isRendered) {
		throw new Error("This control '" + this.name + "' is already rendered.");
	}
	
	// reference exists
	if (this.reference) {
		
		// hide the original label if exists
		var label = PrettyForm.findLabel(this.reference);
		if (label) {
			PrettyForm.addClass(label, "hide");
			this.setLabel(label.innerHTML);
		}
		
		PrettyForm.addClass(this.reference, "hide");
		
		// place checkbox to the original elements parent
		if (!this.container) {
			this.reference.parentNode.insertBefore(this.element, this.reference);
		
		// otherwise to the container
		} else {
			this.container.appendChild(this.element);
		}
		
	// control has not the reference
	} else {
		
		// place control to the container or document body
		if (!this.container) {
			document.body.appendChild(this.element);
		} else {
			this.container.appendChild(this.element);
		}
	}

	this.isRendered = true;
	
	return this;
	
};


/**
 * Reset control
 * 
 * @returns {PrettyForm.Checkbox}
 */
PrettyForm.Checkbox.prototype.reset = function () {
	this.checked = this.reference ? this.reference.defaultChecked : Boolean(this.defaultChecked);
	this.setChecked(this.checked);
	return this;
};


/**********************************************************************/


/**
 * Radio control
 *
 * @constructor
 * @param {String} [label]
 * @returns {PrettyForm.Radio}
 */
PrettyForm.Radio = function (label) {

	/**
	 * @type {String} name Name of control
	 */
	this.name = PrettyForm.prefix + "radio-" + PrettyForm.controls.length;
	
	/**
	 * @type {HTMLInputElement} reference Reference to original control
	 */
	this.reference = null;
	
	/**
	 * @type {Boolean} isRendered Flag if the control is rendered
	 */
	this.isRendered = false;
	
	/**
	 * @type {Boolean} checked Is checkbox checked?
	 */
	this.checked = false;
	
	/* group of radios */
	this.group = null;
	
	/**
	 * @type {Boolean} disabled Is checkbox disabled?
	 */
	this.disabled = false;
	
	/**
	 * @type {DOMElement} container Container/parent of this control
	 */
	this.container = null;
	
	/* default value */
	this.defaultChecked = null;
	
	/* this control element */
	this.element = document.createElement("span");
	this.element.id = this.name;
	this.element.className = PrettyForm.prefix + "radio" + (this.checked ? " selected" : "");
	this.element.tabIndex = 0;
	// i tag as a image
	this.element.appendChild(document.createElement("i"));
	
	/* this text control element */
	if (label) {
		this.setLabel(label);
	}

	var me = this;
	
	/*************** Events on this control ***************/

	me.element.onclick = function (event) {
		
		if (me.disabled) return;
		
		event = event || window.event;
		
		if (!event.keyCode || event.keyCode === 0
			|| event.keyCode === PrettyForm.keys.ENTER
			|| event.keyCode === PrettyForm.keys.SPACE)
		{
			me.setChecked(true);
			PrettyForm.cancelEvent(event);
		}
		
		if (event.keyCode && event.keyCode === PrettyForm.keys.ARROW_LEFT) {
		
			var previous = null;
			var previousIndex = -1;
			var index = -1;
			
			for (var i = 0, l = PrettyForm.controls.length; i < l; i++) {

				if (!(PrettyForm.controls[i] instanceof PrettyForm.Radio)) {
					continue;
				}
				
				if (PrettyForm.controls[i].group === me.group
					&& !PrettyForm.controls[i].disabled) {
					
					if (PrettyForm.controls[i] !== me) {
						previous = PrettyForm.controls[i];
						previousIndex = i;
					} else {
						index = i;
						break;
					}
				}
			}
			
			if (previous && previousIndex < index) {
				previous.setChecked(true);
				previous.element.focus();
			}
			
		} else if (event.keyCode && event.keyCode === PrettyForm.keys.ARROW_RIGHT) {

			var next = null;
			var nextIndex = -1;
			var index = -1;
			
			for (var i = 0, l = PrettyForm.controls.length; i < l; i++) {
				
				if (!(PrettyForm.controls[i] instanceof PrettyForm.Radio)) {
					continue;
				}
				
				if (PrettyForm.controls[i].group === me.group
					&& !PrettyForm.controls[i].disabled) {
					
					if (PrettyForm.controls[i] !== me) {
						next = PrettyForm.controls[i];
						nextIndex = i;
						if (index !== -1 && nextIndex > index) break;
					} else {
						index = i;
					}
				}
			}
			
			if (next && nextIndex > index) {
				next.setChecked(true);
				next.element.focus();
			}
		
		}
	
	};
	
	/*
	// Opera need keypress event
	var eventName = navigator.userAgent.indexOf("Opera") === -1
						? "onkeydown" : "onkeypress";
	*/
   
	var eventName = "onkeydown";

	me.element[eventName] = me.element.onclick;

	PrettyForm.controls.push(me);
	return me;

};


/**
 * Set checked
 *
 * @param {Boolean} value
 * @returns {PrettyForm.Radio}
 */
PrettyForm.Radio.prototype.setChecked = function (value) {
	
	this.checked = value;
	
	if (this.defaultChecked === null) {
		this.defaultChecked = value;
	}
	
	if (value) {
		PrettyForm.addClass(this.element, "selected");
	}
	
	if (this.reference) {
		this.reference.checked = value;
	}
	
	
	if (value) {

		var me = this;

		for (var i = 0, l = PrettyForm.controls.length; i < l; i++) {
			
			var control = PrettyForm.controls[i];
			
			if (control instanceof PrettyForm.Radio && control !== me) {
				
				if (control.reference) {
				
					control.checked = control.reference.checked;

					if (control.defaultChecked === null) {
						control.defaultChecked = control.checked;
					}
					
					if (!control.checked) {
						PrettyForm.removeClass(control.element, "selected");
					}
		
				} else if (control.group === me.group) {

					control.checked = false;
					PrettyForm.removeClass(control.element, "selected");
				}
			}
		}

	}
	
	return this;
	
};

/**
 * Set group
 * 
 * @param {String} group
 * @returns {PrettyForm.Radio}
 */
PrettyForm.Radio.prototype.setGroup = function (group) {
	this.group = group;
	return this;
};

/**
 * Set disabled
 *
 * @param {Boolean} value
 * @returns {PrettyForm.Radio}
 */
PrettyForm.Radio.prototype.setDisabled = function (value) {
	
	this.disabled = value;
	
	if (value) {
		PrettyForm.addClass(this.element, "disabled");
	} else {
		PrettyForm.removeClass(this.element, "disabled");
	}
	
	if (this.reference) {
		this.reference.disabled = value;
	}
	
	return this;
	
};


/**
 * Set reference element
 *
 * @param {HTMLInputElement} reference
 * @returns {PrettyForm.Radio}
 */
PrettyForm.Radio.prototype.setReference = function (reference) {
	
	this.reference = reference;
	this.reference.prettier = this;
	this.setChecked(reference.checked);
	this.element.tabIndex = reference.tabIndex;
	
	var me = this;
	var oldOnClick = me.reference.onclick;
	me.reference.onclick = function () {
		if (oldOnClick) {
			oldOnClick.apply(me.reference, arguments);
		}
		me.setChecked(me.reference.checked);
	};
	
	return me;
	
};


/**
 * Set container
 *
 * @param {HTMLElement} container
 * @returns {PrettyForm.Radio}
 */
PrettyForm.Radio.prototype.setContainer = function (container) {
	this.container = container;
	return this;
};


/**
 * Set label
 * 
 * @param {String} label
 * @returns {PrettyForm.Radio}
 */
PrettyForm.Radio.prototype.setLabel = function (label) {
	
	if (!this.elementLabel) {
		this.elementLabel = document.createElement("span");
		this.element.appendChild(this.elementLabel);
	}
	
	this.elementLabel.innerHTML = label;	
	return this;
	
};


/**
 * Render control
 *
 * @returns {PrettyForm.Radio}
 * @throws {Error} If already rendered
 */
PrettyForm.Radio.prototype.render = function () {
	
	if (this.isRendered) {
		throw new Error("This control '" + this.name + "' is already rendered.");
	}

	if (this.reference) {

		var label = PrettyForm.findLabel(this.reference);
		if (label) {
			PrettyForm.addClass(label, "hide");
			this.setLabel(label.innerHTML);
		}
		
		PrettyForm.addClass(this.reference, "hide");
		
		if (!this.container) {
			this.reference.parentNode.insertBefore(this.element, this.reference);
		} else {
			this.container.appendChild(this.element);
		}
	} else {
		if (!this.container) {
			document.body.appendChild(this.element);
		} else {
			this.container.appendChild(this.element);
		}
	}

	this.isRendered = true;
	
	return this;
	
};


/**
 * Reset control
 * 
 * @returns {PrettyForm.Radio}
 */
PrettyForm.Radio.prototype.reset = function () {
	this.checked = this.reference ? this.reference.defaultChecked : Boolean(this.defaultChecked);
	this.setChecked(this.checked);
	return this;
	
};


/**********************************************************************/


/**
 * SelectBox control
 * 
 * @constructor
 * @param {Number} [size] @TODO not implemented
 * @returns {PrettyForm.SelectBox}
 */
PrettyForm.SelectBox = function (size) {

	/**
	 * @type {String} name Name of control
	 */
	this.name = PrettyForm.prefix + "selectbox-" + PrettyForm.controls.length;
	
	/**
	 * @type {HTMLInputElement} reference Reference to original control
	 */
	this.reference = null;
	
	/**
	 * @type {Boolean} isRendered Flag if the control is rendered
	 */
	this.isRendered = false;
	
	/**
	 * @type {Boolean} disabled Is checkbox disabled?
	 */
	this.disabled = false;
	
	/**
	 * @type {DOMElement} container Container/parent of this control
	 */
	this.container = null;
	
	/**
	 * @type {number} countOptions Count of select options
	 */
	this.countOptions = 0;
	
	/**
	 * @type {Number} selectedIndex Selected index
	 */
	this.selectedIndex = 0;
	
	/**
	 * @type {@TODO} Selected
	 */
	this.selected = null;
	
	/* options */
	this.options = {};
	
	this.defaultSelectedIndex = null;


	/* this control element */
	this.element = document.createElement("span");
	this.element.id = this.name;
	this.element.className = PrettyForm.prefix + "selectbox";
	this.element.style.zIndex = PrettyForm.zIndex - PrettyForm.controls.length;
	this.element.tabIndex = 0;
	
	/* current option */
	this.elementCurrent = document.createElement("span");
	this.elementCurrent.className = "current";
	this.element.appendChild(this.elementCurrent);

	// i tag as a image
	this.elementImage = document.createElement("i");
	this.elementImage.className = "button";
	this.element.appendChild(this.elementImage);
	
	var elementArrow = document.createElement("i");
	elementArrow.className = "arrow";
	this.elementImage.appendChild(elementArrow);
	
	/* list of options */
	this.elementOptions = document.createElement("dl");
	
	/* key press filtering */
	this.filter = "";
	this.filterInterval = null;


	var me = this,
		lastHoverItem;
	
	/*************** Events on this control ***************/
	
	this.element.onclick = function () {
		if (!PrettyForm.hasClass(me.element, "open")) {

			me.element.focus();
			me.open();

		} else {

			me.close();
		}
	};

	this.element.onblur = function () {
		me.close();
	};

	this.elementOptions.onmousemove = function (event) {
		
		event = event || window.event;
		
		if (!event) {
			return;
		}
		
		var target = event.target || window.event.srcElement;
		
		if (!target || target.nodeName.toLowerCase() !== "dt" || target.disabled) {
			return;
		}
		
		//me.setSelected(target.id.substr(target.id.indexOf("_") + 1));
		// @todo barva do css
		
		if (lastHoverItem) {
			PrettyForm.removeClass(lastHoverItem, "hover");
		}
		
		if (!PrettyForm.hasClass(target, "group") || (PrettyForm.hasClass(target, "group") && PrettyForm.hasClass(target, "selectable"))) {
			PrettyForm.addClass(target, "hover");
			lastHoverItem = target;
		}
	};

	this.elementOptions.onclick = function (event) {
		
		if (me.disabled) {
			return false;
		}
		
		event = event || window.event;
		
		if (!event) {
			return false;
		}
		
		var target;
		target = event.target || window.event.srcElement;
		
		if (!target) {
			return false;
		}

		// stop when clicked on the group item (not target with class "selectable")
		if (target.nodeName.toLowerCase() === "dt" && PrettyForm.hasClass(target, "group")
			&& !PrettyForm.hasClass(target, "selectable") || target.disabled) {
			
			if (event.stopPropagation) {
				event.stopPropagation();
			} else if (!event.cancelBubble) {
				event.cancelBubble = true;
			}

			event.returnValue = false;
			return false;
		}
		
		me.elementCurrent.innerHTML = target.innerHTML;
		me.close();
		
		if (me.reference) {
			me.setSelected(target.id.substr(target.id.indexOf("_") + 1), false, true);
		}
				
		if (event.stopPropagation) {
			event.stopPropagation();
		} else if (!event.cancelBubble) {
			event.cancelBubble = true;
		}
		
		event.returnValue = false;
		return false;
	};
	
	/*
	// Opera need keypress event
	var eventName = navigator.userAgent.indexOf("Opera") === -1
						? "onkeydown" : "onkeypress";
	*/
   
	var eventName = "onkeydown";

	this.element[eventName] = function (event) {
	
		if (me.disabled) {
			return;
		}
	
		// option item
		var selectedItem;
		
		event = event || window.event;
		
		// go to previous item
		if (event.keyCode === PrettyForm.keys.ARROW_UP
			|| event.keyCode === PrettyForm.keys.ARROW_LEFT) {
		
			selectedItem = me.setSelected(me.selectedIndex - 1, false, true);
			
			// previous item exists and list is close
			if (selectedItem && !PrettyForm.hasClass(me.element, "open")) {
				me.elementCurrent.innerHTML = selectedItem.innerHTML;
				
			// previous item exists and list is open
			} else if (selectedItem) {
				me.updateScroll();
				
			// previous item does not exist, select the first one
			} else {
				me.setSelected(0);
			}
			
			PrettyForm.cancelEvent(event);
			
		// go to next item
		} else if (event.keyCode === PrettyForm.keys.ARROW_DOWN
			|| event.keyCode === PrettyForm.keys.ARROW_RIGHT) {
		
			selectedItem = me.setSelected(me.selectedIndex + 1, false, true);
			
			// next item exists and list is close
			if (selectedItem && !PrettyForm.hasClass(me.element, "open")) {
				me.elementCurrent.innerHTML = selectedItem.innerHTML;
				
			// next item exists and list is open
			} else if (selectedItem) {
				me.updateScroll();
				
			// next item does not exist, select the last one
			} else {
				me.setSelected(me.countOptions - 1);
			}
			
			PrettyForm.cancelEvent(event);
		
		// close the list
		} else if (event.keyCode === PrettyForm.keys.ESC) {
			me.close();
			
		// open / close the list
		} else if (event.keyCode === PrettyForm.keys.SPACE) {
			if (!PrettyForm.hasClass(me.element, "open")) {
				me.open();
			} else {
				me.close();
			}
			
			PrettyForm.cancelEvent(event);

		} else if (event.keyCode === PrettyForm.keys.ENTER) {
			
			if (!PrettyForm.hasClass(me.element, "open")) {
				return;
			}
			
			me.elementCurrent.innerHTML = document.getElementById(me.element.id + "_" + me.selectedIndex).innerHTML;
			me.close();
			me.element.focus();
			
			PrettyForm.cancelEvent(event);
			
		} else {
		
			clearInterval(me.filterInterval);
			me.filter += String.fromCharCode(event.keyCode);
		
			me.filterInterval = setTimeout(function () {
				me.filter = "";
				me.filterInterval = null;
			}, 4000);
		

			var pattern = new RegExp(me.filter, "i");
			
			var options = me.elementOptions.getElementsByTagName("dt");
			
			for (var i = 0; i < options.length; i++) {
				if (options[i].innerHTML.match(pattern)) {
					me.setSelected(parseInt(options[i].id.substr(options[i].id.indexOf("_") + 1)), true);
					break;
				}
			}
			
		}
		
	};
	
	PrettyForm.controls.push(this);
	return this;
	
};


/**
 * Add group to select box
 *
 * @param {String} key
 * @param {Boolean} selectable
 * @param {String} value
 * 
 * @throws {Error} if key exists
 * @returns {PrettyForm.SelectBox}
 */
PrettyForm.SelectBox.prototype.addGroup = function (key, selectable, value) {

	if (selectable && this.options[key] !== undefined) {
		throw new Error("Group key '" + key + "' exists in SelectBox control '" + this.name + "'");
	}

	var group = document.createElement("dt");
	group.className = "group";
	if (selectable) {
		group.id =  this.name + "_" + this.countOptions;
		group.className += " selectable";
	}
	
	if (this.countOptions === this.selectedIndex
		|| (this.reference && this.countOptions === this.reference.selectedIndex))
	{
		this.elementCurrent.innerHTML = value;
		PrettyForm.addClass(group, "selected");
		this.selectedIndex = this.countOptions;
		
		if (this.defaultSelectedIndex === null) {
			this.defaultSelectedIndex = this.countOptions;
		}
		
	}

	group.innerHTML = value;
	group.key = key;
	
	this.elementOptions.appendChild(group);
	
	if (selectable && this.isRendered && this.reference) {
		var option = document.createElement("option");
		option.value = key;
		option.appendChild(document.createTextNode(value));
		this.reference.appendChild(option);
	}
	
	if (selectable) {
		this.options[key] = value;
		this.countOptions++;
	}

	return this;

};


/**
 * Add option to select box
 * 
 * @param {String} key
 * @param {String} value
 * @param {String} icon
 * @param {Boolean} disabled
 * 
 * @throws {Error} If key exists
 * @returns {PrettyForm.SelectBox}
 */
PrettyForm.SelectBox.prototype.addOption = function (key, value, icon, disabled) {
	
	if (this.options[key] !== undefined) {
		throw new Error("Option key '" + key + "' exists in SelectBox control '" + this.name + "'");
	}
	
	var option = document.createElement("dt");
	option.id =  this.name + "_" + this.countOptions;
	option.innerHTML = value;
	
	option.key = key;
	
	this.elementOptions.appendChild(option);

	if (this.countOptions === this.selectedIndex
		|| (this.reference && this.countOptions === this.reference.selectedIndex))
	{
		this.elementCurrent.innerHTML = value;
		PrettyForm.addClass(option, "selected");
		this.selectedIndex = this.countOptions;
		
		if (this.defaultSelectedIndex === null) {
			this.defaultSelectedIndex = this.countOptions;
		}
	}
	
	if (this.isRendered && this.reference) {
		option = document.createElement("option");
		option.value = key;
		option.appendChild(document.createTextNode(value));
		this.reference.appendChild(option);
	}
	

	this.countOptions++;
	this.options[key] = value;
	return this;
};


/**
 * Reset control
 * 
 * @returns {PrettyForm.SelectBox}
 */
PrettyForm.SelectBox.prototype.reset = function () {
	
	if (this.defaultSelectedIndex) {
		PrettyForm.removeClass(document.getElementById(this.name + "_" + this.selectedIndex), "selected");

		var e = document.getElementById(this.name + "_" + this.defaultSelectedIndex);
		this.elementCurrent.innerHTML = e.innerHTML;
		PrettyForm.addClass(e, "selected");
		this.selectedIndex = this.defaultSelectedIndex;
		this.selected = e;
		
	}

	return this;
};


/**
 * Render control
 *
 * @returns {PrettyForm.SelectBox}
 * @throws {Error} If already rendered
 */
PrettyForm.SelectBox.prototype.render = function () {
	
	if (this.isRendered) {
		throw new Error("This control '" + this.name + "' is already rendered.");
	}

	
	// Add options from reference if sets
	if (this.reference) {
		
		PrettyForm.addClass(this.reference, "hide");

		// Add options from reference select box
		var lastGroup = null;
		
		var l = this.reference.options.length;
		for (var j = 0; j < l; j++) {

			if (this.reference.options[j].parentNode.nodeName.toLowerCase() === "optgroup"
				&& lastGroup !== this.reference.options[j].parentNode) {
				
				this.addGroup(null,
					false,
					this.reference.options[j].parentNode.label);
					
				lastGroup = this.reference.options[j].parentNode;
				
				this.addOption(this.reference.options[j].value !== "" ? this.reference.options[j].value : this.reference.options[j].innerHTML, this.reference.options[j].innerHTML, null, null);
				
			} else {

				if (!PrettyForm.hasClass(this.reference.options[j], "group")) {
					this.addOption(this.reference.options[j].value !== "" ? this.reference.options[j].value : this.reference.options[j].innerHTML, this.reference.options[j].innerHTML, null, null);
				} else {
					this.addGroup(null, true, this.reference.options[j].innerHTML);
				}

			}

		}
		
	}

	// apend items
	this.element.appendChild(this.elementOptions);

	// append to document / container
	if (this.reference) {
		if (!this.container)
			this.reference.parentNode.insertBefore(this.element, this.reference);
		else
			this.container.appendChild(this.element);
	} else {
		if (!this.container)
			document.body.appendChild(this.element);
		else
			this.container.appendChild(this.element);
	}

	this.element.style.width = this.elementOptions.clientWidth + 3 + "px"; // FIXME 6 - padding (left & right)  span.current

	// FIX IE5 WIDTH
	if (PrettyForm.hasClass(document.documentElement, "ie5")) {
		// border (2) + .uiSelectBox.initialized (2 + 20)
		this.element.style.width = this.elementOptions.clientWidth + 2 + 22 + "px";
	}

	// FIXME
	if (this.countOptions > 6) {
		this.elementOptions.style.height = "170px";
	} else {
		this.elementOptions.style.height = "auto";
	}

	PrettyForm.addClass(this.element, "initialized");
	
	this.elementImage.style.height = this.element.clientHeight + "px";
	this.elementImage.childNodes[0].style.height = this.elementImage.style.height;
	
	this.isRendered = true;
	
	return this;
	
};


/**
 * Update scroll top to the selected item
 *
 * @returns {Number} Return top position.
 */
PrettyForm.SelectBox.prototype.updateScroll = function () {
	
	var top = document.getElementById(this.name + "_" + this.selectedIndex).offsetTop;

	var h = document.getElementById(this.name + "_" + this.selectedIndex).offsetHeight;

	//if (top + h < me.options.clientHeight && me.options.scrollTop < top + h) return;

	if (PrettyForm.animations) {
		if (Effects === undefined) throw new Error("Effects library not found.");

		Effects.transition(this.elementOptions,
			{ 
				"@scrollTop": top
			}, 700, "custom2", null, 100
		);

	} else {
		this.elementOptions.scrollTop = top;
	}

	return top;
};


/**
 * Open the select box
 * 
 * @returns {PrettyForm.SelectBox}
 */
PrettyForm.SelectBox.prototype.open = function () {

	if (this.disabled) {
		return this;
	}

	clearInterval(this.filterInterval);
	this.filter = "";

	PrettyForm.addClass(this.element, "open");

	this.elementOptions.scrollTop = 0;

	if (PrettyForm.animations) {
		if (Effects === undefined) throw new Error("Effects library not found.");

		Effects.fadeIn(this.elementOptions, 400, null, function () {
			this.updateScroll();
		});

	} else {
		this.updateScroll();
	}
	
	return this;
	
};


/**
 * Close the select box
 * 
 * @returns {PrettyForm.SelectBox}
 */
PrettyForm.SelectBox.prototype.close = function () {

	clearInterval(this.filterInterval);
	this.filter = "";

	PrettyForm.removeClass(this.element, "open");

	if (PrettyForm.animations) {
		if (Effects === undefined) throw new Error("Effects library not found.");
		this.elementOptions.opacity = 0;
		Effects.setOpacity(this.elementOptions, 0);
	}
	
	return this;

};


/**
 * Set selected item
 *
 * @param {Number} index
 * @param {Boolean} scrollToItem
 * @param {Boolean} triggerChange Trigger change event on the original referenced element?
 * @returns {HTMLElement} item
 */
PrettyForm.SelectBox.prototype.setSelected = function (index, scrollToItem, triggerChange) {

	index = parseInt(index, 10);
	if (index === this.selectedIndex) {
		return this.selected;
	}
	
	// limit index
	index = index < 0 ? 0 : (index > this.countOptions - 1 ? this.countOptions - 1 : index);
	
	// remove class from the last selected item
	PrettyForm.removeClass(document.getElementById(this.name + "_" + this.selectedIndex), "selected");

	var item = document.getElementById(this.name + "_" + index);
	
	
	
	if (!item || item.disabled) {
		return null;
	}
	
	PrettyForm.addClass(item, "selected");
	this.selectedIndex = index;
	
	if (scrollToItem) {
		this.updateScroll();
	}
	
	if (triggerChange && this.reference) {
		this.reference.options[this.selectedIndex].selected = true;
		this.reference.onchange();
	}
	
	this.selected = item;
	
	return item;
};


/**
 * Set reference element
 *
 * @param {HTMLElement} reference
 * @returns {PrettyForm.SelectBox}
 */
PrettyForm.SelectBox.prototype.setReference = function (reference) {
	
	var me = this;
	
	me.reference = reference;
	me.element.tabIndex = reference.tabIndex;
	reference.prettier = me;
	me.selectedIndex = reference.selectedIndex;
	
	var oldOnChange = me.reference.onchange;
	me.reference.onchange = function () {
		if (oldOnChange) {
			oldOnChange.apply(me.reference, arguments);
		}
		me.setSelected(me.reference.selectedIndex);
	};
	
	return this;
	
};


/**
 * Set disabled
 *
 * @param {Boolean} value
 * @returns {PrettyForm.SelectBox}
 */
PrettyForm.SelectBox.prototype.setDisabled = function (value) {
	
	this.disabled = value;
	
	if (value) {
		PrettyForm.addClass(this.element, "disabled");
	}else {
		PrettyForm.removeClass(this.element, "disabled");
	}
	
	if (this.reference) {
		this.reference.disabled = value;
	}
	
	return this;
	
};


PrettyForm.SelectBox.prototype.getSelectedKey = function () {
	if (this.selected) {
		return this.selected.key;
	}
	return null;
};


PrettyForm.SelectBox.prototype.setDisabledOption = function (index, value) {
	var e = document.getElementById(this.name + "_" + index);
	if (!e) {
		throw new Error("Option with index " + index + " not exists in SelectBox control '" + this.name + "'");
	}
	
	if (value) {
		PrettyForm.addClass(e, "disabled");
		e.disabled = true;
	} else {
		PrettyForm.removeClass(e, "disabled");
		e.disabled = false;
	}
	
	return this;
	
};

























/****************************************************************************
 *
 *
 * FILE control
 *
 *
 ****************************************************************************/


/**
 * File control
 *
 * @constructor
 * @returns this
 */
PrettyForm.File = function () {

	/* name */
	this.name = PrettyForm.prefix + "file-" + PrettyForm.controls.length;
	
	/* reference element */
	this.reference = null;
	
	/* is rendered? */
	this.isRendered = false;
		
	/* is disabled? */
	this.disabled = false;
	
	/* parent of this control */
	this.container = null;
	
	this.value = null;
	
	this.textNoFile = PrettyForm.inputFileNo;
	
	/* this control element */
	this.element = document.createElement("span");
	this.element.id = this.name;
	this.element.className = PrettyForm.prefix + "file";
	this.element.tabIndex = 0;
	
	// value input
	this.elementValue = document.createElement("span");
	this.elementValue.innerHTML = this.textNoFile;
	
	// b as button
	this.elementButton = document.createElement("b");
	this.elementButton.className = PrettyForm.prefix + "button";
	this.elementButton.innerHTML = PrettyForm.inputFileButton;

	var me = this;
	
	/*************** Events on this control ***************/
	
	this.element.onmousemove = function () {
		PrettyForm.addClass(me.elementButton, "hover");
	};
	
	this.element.onmouseout = function () {
		PrettyForm.removeClass(me.elementButton, "hover");
	};
	
	/*
	// Opera need keypress event
	var eventName = navigator.userAgent.indexOf("Opera") === -1
						? "onkeydown" : "onkeypress";
	*/
   
	var eventName = "onkeydown";
   
	this.element[eventName] = function (event) {
	
		if (me.disabled) {
			return;
		}

		event = event || window.event;

		if (event.keyCode
			&& (event.keyCode === PrettyForm.keys.ENTER
			|| event.keyCode === PrettyForm.keys.SPACE))
		{
			try {
				// not all browsers support
				me.reference.click();
			} catch(error) {}
		}
	
	};
	
	PrettyForm.controls.push(this);
	return this;

};


/**
 * Set disabled
 *
 * @param {Boolean} value
 * @returns this
 */
PrettyForm.File.prototype.setDisabled = function (value) {
	
	this.disabled = value;
	
	if (value) {
		PrettyForm.addClass(this.element, "disabled");
	} else {
		PrettyForm.removeClass(this.element, "disabled");
	}
	
	if (this.reference) {
		this.reference.disabled = value;
	}
	
	return this;
	
};


/**
 * Set reference element
 *
 * @param {HTMLInputElement} reference
 * @returns this
 */
PrettyForm.File.prototype.setReference = function (reference) {
	
	this.reference = reference;
	this.reference.prettier = this;
	this.element.tabIndex = reference.tabIndex;
	reference.tabIndex = null;
	
	return this;
};


/**
 * Set container
 *
 * @param {HTMLElement} container
 * @returns this
 */
PrettyForm.File.prototype.setContainer = function (container) {
	
	this.container = container;
	return this;
	
};


/**
 * Set button label
 * 
 * @param {String} label
 * @returns this
 */
PrettyForm.File.prototype.setButtonLabel = function (label) {
	
	this.elementButton.innerHTML = label;	
	return this;
	
};


/**
 * Render control
 *
 * @returns this
 * @throws {Error} If already rendered
 */
PrettyForm.File.prototype.render = function () {
	
	if (this.isRendered) {
		throw new Error("This control '" + this.name + "' is already rendered.");
	}


	if (!this.reference) {
		this.reference = document.createElement("input");
		this.reference.type = "file";
		this.reference.className = "graphic " + PrettyForm.prefix + "file";
		this.element.appendChild(this.reference);

	} else {
			
		this.reference.parentNode.insertBefore(this.element, this.reference);
		this.element.appendChild(this.reference);

	}

	var me = this;
	
	this.reference.onchange = function () {
		var position = me.reference.value.lastIndexOf("\\");
		var filename = me.reference.value.substring(position + 1);
		me.elementValue.innerHTML = filename !== "" ? filename : me.textNoFile;
		me.value = filename !== "" ? filename : null;
	};

	this.element.appendChild(this.elementButton);
	this.element.appendChild(this.elementValue);
	
	this.isRendered = true;
	
	return this;
	
};


/**
 * Reset control
 * 
 * @returns this
 */
PrettyForm.File.prototype.reset = function () {
	
	this.reference.value = "";
	this.value = null;
	this.elementValue.innerHTML = this.textNoFile;
	return this;
	
};