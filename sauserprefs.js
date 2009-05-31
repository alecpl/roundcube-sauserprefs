/* Show sauserprefs plugin script */

if (window.rcmail) {
	rcmail.addEventListener('init', function(evt) {
		var tab = $('<span>').attr('id', 'settingstabpluginsauserprefs').addClass('tablink');

		var button = $('<a>').attr('href', rcmail.env.comm_path+'&_action=plugin.sauserprefs').html(rcmail.gettext('sauserprefs','sauserprefs')).appendTo(tab);
		button.bind('click', function(e){ return rcmail.command('plugin.sauserprefs', this) });

		// add button and register command
		rcmail.add_element(tab, 'tabs');
		rcmail.register_command('plugin.sauserprefs', function(){ rcmail.goto_url('plugin.sauserprefs') }, true);

		if (rcmail.env.action == 'plugin.sauserprefs') {
			rcmail.register_command('plugin.sauserprefs.select_all_langs', function(){
				var langlist = document.getElementsByName('_spamlang[]');
				var obj;

				for (var i = 0; i < langlist.length; i++) {
					langlist[i].checked = true;
					obj = rcube_find_object('spam_lang_'+ i);
					obj.title = rcmail.gettext('enabled','sauserprefs');
					obj.innerHTML = rcube_find_object('enable_button').innerHTML;
				}

				return false;
			}, true);

			rcmail.register_command('plugin.sauserprefs.select_invert_langs', function(){
				var langlist = document.getElementsByName('_spamlang[]');
				var obj;

				for (var i = 0; i < langlist.length; i++) {
					if (langlist[i].checked) {
						langlist[i].checked = false;
						obj = rcube_find_object('spam_lang_'+ i);
						obj.title = rcmail.gettext('disabled','sauserprefs');
						obj.innerHTML = rcube_find_object('disable_button').innerHTML;
					}
					else {
						langlist[i].checked = true;
						obj = rcube_find_object('spam_lang_'+ i);
						obj.title = rcmail.gettext('enabled','sauserprefs');
						obj.innerHTML = rcube_find_object('enable_button').innerHTML;
					}
				}

				return false;
			}, true);

			rcmail.register_command('plugin.sauserprefs.select_no_langs', function(){
				var langlist = document.getElementsByName('_spamlang[]');
				var obj;

				for (var i = 0; i < langlist.length; i++) {
					langlist[i].checked = false;
					obj = rcube_find_object('spam_lang_'+ i);
					obj.title = rcmail.gettext('disabled','sauserprefs');
					obj.innerHTML = rcube_find_object('disable_button').innerHTML;
				}

				return false;
			}, true);

			rcmail.register_command('plugin.sauserprefs.message_lang', function(lang_code, obj){
				var langlist = document.getElementsByName('_spamlang[]');
				var i = obj.parentNode.parentNode.rowIndex - 2;

				if (langlist[i].checked) {
					langlist[i].checked = false;
					obj.title = rcmail.gettext('disabled','sauserprefs');
					obj.innerHTML = rcube_find_object('disable_button').innerHTML;
				}
				else {
					langlist[i].checked = true;
					obj.title = rcmail.gettext('enabled','sauserprefs');
					obj.innerHTML = rcube_find_object('enable_button').innerHTML;
				}

				return false;
			}, true);

			rcmail.register_command('plugin.sauserprefs.addressrule_del', function(props, obj){
				var adrTable = rcube_find_object('address-rules-table').tBodies[0];
				var rowidx = obj.parentNode.parentNode.rowIndex - 1;
				var fieldidx = rowidx - 1;

				if (!confirm(rcmail.gettext('spamaddressdelete','sauserprefs')))
					return false;

				if (document.getElementsByName('_address_rule_act[]')[fieldidx].value == "INSERT") {
					adrTable.deleteRow(rowidx);
				}
				else {
					adrTable.rows[rowidx].style.display = 'none';
					document.getElementsByName('_address_rule_act[]')[fieldidx].value = "DELETE";
				}

				rcmail.env.address_rule_count--;
				if (rcmail.env.address_rule_count < 1)
					adrTable.rows[1].style.display = '';

				return false;
			}, true);

			rcmail.register_command('plugin.sauserprefs.addressrule_add', function(){
				var adrTable = rcube_find_object('address-rules-table').tBodies[0];
				var input_spamaddressrule = rcube_find_object('_spamaddressrule');
				var selrule = input_spamaddressrule.selectedIndex;
				var input_spamaddress = rcube_find_object('_spamaddress');

				if (input_spamaddress.value.replace(/^\s+|\s+$/g, '') == '') {
					alert(rcmail.gettext('spamenteraddress','sauserprefs'));
					input_spamaddress.focus();
					return false;
				}
				else if (!rcube_check_email(input_spamaddress.value.replace(/^\s+/, '').replace(/[\s,;]+$/, ''), true)) {
					alert(rcmail.gettext('spamaddresserror','sauserprefs'));
					input_spamaddress.focus();
					return false;
				}
				else {
					var actions = document.getElementsByName('_address_rule_act[]');
					var prefs = document.getElementsByName('_address_rule_field[]');
					var addresses = document.getElementsByName('_address_rule_value[]');
					var insHere;

					for (var i = 1; i < addresses.length; i++){
						if (addresses[i].value == input_spamaddress.value && actions[i].value != "DELETE") {
							alert(rcmail.gettext('spamaddressexists','sauserprefs'));
							input_spamaddress.focus();
							return false;
						}
						else if (addresses[i].value > input_spamaddress.value) {
							insHere = adrTable.rows[i + 1];
							break;
						}
					}

					var newNode = adrTable.rows[0].cloneNode(true);
					adrTable.rows[1].style.display = 'none';

					if (insHere)
						adrTable.insertBefore(newNode, insHere);
					else
						adrTable.appendChild(newNode);

					newNode.style.display = "";
					newNode.cells[0].className = input_spamaddressrule.options[selrule].value;
					newNode.cells[0].innerHTML = input_spamaddressrule.options[selrule].text;
					newNode.cells[1].innerHTML = input_spamaddress.value;
					actions[newNode.rowIndex - 2].value = "INSERT";
					prefs[newNode.rowIndex - 2].value = input_spamaddressrule.options[selrule].value;
					addresses[newNode.rowIndex - 2].value = input_spamaddress.value;

					input_spamaddressrule.selectedIndex = 0;
					input_spamaddress.value = '';

					rcmail.env.address_rule_count++;
				}
			}, true);

			rcmail.register_command('plugin.sauserprefs.whitelist_delete_all', function(props, obj){
				var adrTable = rcube_find_object('address-rules-table').tBodies[0];

				if (!confirm(rcmail.gettext('spamaddressdeleteall','sauserprefs')))
					return false;

				for (var i = adrTable.rows.length - 1; i > 1; i--) {
					if (document.getElementsByName('_address_rule_act[]')[i-1].value == "INSERT") {
						adrTable.deleteRow(i);
						rcmail.env.address_rule_count--;
					}
					else if (document.getElementsByName('_address_rule_act[]')[i-1].value != "DELETE") {
						adrTable.rows[i].style.display = 'none';
						document.getElementsByName('_address_rule_act[]')[i-1].value = "DELETE";
						rcmail.env.address_rule_count--;
					}
				}

				adrTable.rows[1].style.display = '';
				return false;
			}, true);

			rcmail.register_command('plugin.sauserprefs.import_whitelist', function(props, obj){
				rcmail.set_busy(true, 'sauserprefs.importingaddresses');
		    	rcmail.http_request('plugin.sauserprefs.whitelist_import', '', true);
				return false;
			}, true);

			rcmail.register_command('plugin.sauserprefs.save', function(){ rcmail.gui_objects.editform.submit(); }, true);

			rcmail.enable_command('plugin.sauserprefs.save', true);
		}
	})
}

rcmail.sauserprefs_toggle_level_char = function(checkbox) {
	var level_char;

	if (level_char = rcube_find_object('rcmfd_spamlevelchar'))
		level_char.disabled = !checkbox.checked;
}

rcmail.sauserprefs_addressrule_import = function(address){
	var adrTable = rcube_find_object('address-rules-table').tBodies[0];

	var actions = document.getElementsByName('_address_rule_act[]');
	var prefs = document.getElementsByName('_address_rule_field[]');
	var addresses = document.getElementsByName('_address_rule_value[]');
	var insHere;

	for (var i = 1; i < addresses.length; i++){
		if (addresses[i].value == address && actions[i].value != "DELETE")
			return false;
		else if (addresses[i].value > address) {
			insHere = adrTable.rows[i + 1];
			break;
		}
	}

	var newNode = adrTable.rows[0].cloneNode(true);
	adrTable.rows[1].style.display = 'none';

	if (insHere)
		adrTable.insertBefore(newNode, insHere);
	else
		adrTable.appendChild(newNode);

	newNode.style.display = "";
	newNode.cells[0].className = "whitelist_from";
	newNode.cells[0].innerHTML = "Accept Mail From";
	newNode.cells[1].innerHTML = address;
	actions[newNode.rowIndex - 2].value = "INSERT";
	prefs[newNode.rowIndex - 2].value = "whitelist_from";
	addresses[newNode.rowIndex - 2].value = address;

	rcmail.env.address_rule_count++;
}