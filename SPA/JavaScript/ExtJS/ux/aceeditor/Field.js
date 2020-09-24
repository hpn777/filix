/**
 * @class Ext.ux.aceeditor.Panel
 * @extends Ext.Panel Converts a panel into a ACE editor
 * 
 * @author Harald Hanek (c) 2011
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define('Ext.ux.aceeditor.Field', {
	extend: 'Ext.form.FieldContainer',

	mixins: {
		bindable: 'Ext.util.Bindable',
		field: 'Ext.form.field.Field',
		editor: 'Ext.ux.aceeditor.Editor'
	},

	stateful: true,
	layout: 'fit',
	border: false,

	listeners: {

		resize: function()
		{
			if(this.editor)
			{
				this.editor.resize();
			}
		},

		activate: function()
		{
			if(this.editor)
			{
				this.editor.focus();
			}
		}
	},

	initComponent: function()
	{
		var me = this,
			items = {
				xtype: 'component',
				autoEl: 'pre'
			};

		me.addEvents(
		/**
		 * @event change Fires after a change.
		 * @param {Ext.ux.aceeditor.Editor} this
		 */
		'change');

		if(me.contentEl != null)
		{
			me.sourceCode = Ext.get(me.contentEl).dom.innerHTML;
		}

		Ext.apply(me, {
			items: items
		});

		me.callParent(arguments);
	},

	onRender: function()
	{
		var me = this;

		if(me.contentEl != null)
		{
			me.sourceCode = Ext.get(me.contentEl).dom.innerHTML;
		}

		me.editorId = me.items.keys[0];
		me.oldSourceCode = me.sourceCode;
		me.callParent(arguments);

		// init editor on afterlayout
		me.on('afterlayout', function()
		{

			if(me.url)
			{
				Ext.Ajax.request({
					url: me.url,
					success: function(response)
					{
						me.sourceCode = response.responseText;
						me.initEditor();
					}
				});
			}
			else
			{
				me.initEditor();
			}
		}, me, {
			single: true
		});
	},

	getValue: function () {
		return this.editor.getSession().getValue();
	},

	setValue: function (value) {
		var self = this;
		if (this.editor)
			this.editor.getSession().setValue(value);
		else {
			setTimeout(function () {
				self.setValue(value);
			}, 200);
		}
	},
});