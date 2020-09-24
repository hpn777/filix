/**
 * @class Ext.ux.aceeditor.Editor
 * @extends Ext.AbstractComponent
 * 
 * @author Harald Hanek (c) 2011
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 */

Ext.define('Ext.ux.aceeditor.Editor', {
	//extend: 'Ext.form.FieldContainer',

    path: '',
    sourceCode: '',
    fontSize: '12px',
	parser: 'csharp',
    theme: 'github',
    printMargin: false,
    highlightActiveLine: true,
    tabSize: 4,
    useSoftTabs: false,
    showInvisible: false,
    useWrapMode: true,
    wrapMin: 60,
    wrapMax: 100,
    HScrollBarAlwaysVisible: false,
    showGutter: true,

    initEditor: function () {

    	var me = this;
    	me.setLoading(true);
        require([
            "ace/ace",
            //"ace/mode/ruby",
			//"ace/mode/" + me.parser,
			//"ace/theme/" + me.theme
            //"ace/theme/twilight"
        ], function (ace) {
            me.editor = ace.edit(me.editorId);
            me.setMode(me.parser);
            me.setTheme(me.theme);
            me.editor.$blockScrolling = Infinity;
            me.editor.getSession().setUseWrapMode(me.useWrapMode);
            me.editor.getSession().setWrapLimitRange(me.wrapMin, me.wrapMax)
            me.editor.setShowInvisibles(me.showInvisible);
            me.setFontSize(me.fontSize);
            me.editor.setShowPrintMargin(me.printMargin);
            me.editor.setHighlightActiveLine(me.highlightActiveLine);
            me.editor.renderer.setHScrollBarAlwaysVisible(me.HScrollBarAlwaysVisible);
            me.editor.renderer.setShowGutter(me.showGutter);
            me.getSession().setTabSize(me.tabSize);
            me.getSession().setUseSoftTabs(me.useSoftTabs);
            me.setValue(me.sourceCode);
            me.editor.getSession().on('change', function () {
                //console.log('change', me);
                me.fireEvent('change', me);
            }, me);
            me.editor.focus();
            me.setLoading(false);
        });
    },

    getEditor: function () {
        return this.editor;
    },

    getSession: function () {
        return this.editor.getSession();
    },

    getTheme: function () {
        this.editor.getTheme();
    },

    setTheme: function (name) {
        // require("theme-" + name + ".js");
        this.editor.setTheme("ace/theme/" + name);
    },

    setMode: function (mode) {
        //var Mode = require("ace/mode/" + mode).Mode;
        this.getSession().setMode("ace/mode/" + mode);
    },

    getValue: function () {
        this.editor.getSession().getValue();
    },

    setValue: function (value) {
    	console.log(value);
    	var self = this;
    	if (this.editor)
    		this.editor.getSession().setValue(value);
    	else{
    		setTimeout(function () {
    			self.setValue(value);
    		}, 200);
		}
    },

    setFontSize: function (value) {
        this.editor.setFontSize(value);
    },

    undo: function () {
        this.editor.undo();
    },

    redo: function () {
        this.editor.redo();
    }
});
