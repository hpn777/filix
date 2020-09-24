/**
 * @class Ext.app.PortalColumn
 * @extends Ext.container.Container
 * A layout column class used internally be {@link Ext.app.PortalPanel}.
 */
Ext.define('ExtModules.Layouts.Portal.PortalColumn', {
    extend: 'Ext.container.Container',
    alias: 'widget.portalcolumn',

    requires: [
        'Ext.layout.container.Anchor',
        'ExtModules.Layouts.Portal.Portlet'
    ],
	//flex: 1,
    layout: 'anchor',
    defaultType: 'portlet',
    cls: 'x-portal-column',
	stateful: true
    // This is a class so that it could be easily extended
    // if necessary to provide additional behavior.
});